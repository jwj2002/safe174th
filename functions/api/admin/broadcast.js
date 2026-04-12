// Broadcast email to all verified, non-unsubscribed signers.
//
// GET  /api/admin/broadcast           → preview counts + recent broadcasts
// POST /api/admin/broadcast           → send (modes: dry_run | test | send)
//
// Auth: Bearer ADMIN_TOKEN
//
// POST body:
//   {
//     subject: string,                 // required
//     html: string,                    // required, must include {{UNSUBSCRIBE_URL}}
//     mode: 'dry_run' | 'test' | 'send', // default: 'dry_run'
//     test_email: string,              // required when mode === 'test'
//     confirm: boolean                 // required true when mode === 'send'
//   }
//
// Notes:
// - {{UNSUBSCRIBE_URL}} and {{FIRST_NAME}} placeholders are replaced per recipient.
// - Sets List-Unsubscribe and List-Unsubscribe-Post headers for Gmail one-click.
// - Cloudflare Pages Functions allow up to 50 subrequests per invocation on the
//   free plan, so we cap a single POST at 45 sends. The admin page handles
//   chunking via the `offset` parameter for larger lists.

const BATCH_LIMIT = 45;
const RESEND_FROM = 'Safe 174th <noreply@safe174th.com>';
const RESEND_REPLY_TO = 'jasonwadejob@gmail.com';

function checkAuth(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || auth !== 'Bearer ' + env.ADMIN_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function onRequestGet(context) {
  const denied = checkAuth(context.request, context.env);
  if (denied) return denied;

  const counts = await context.env.DB.prepare(
    `SELECT
       SUM(CASE WHEN verified = 1 AND unsubscribed = 0 THEN 1 ELSE 0 END) as eligible,
       SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as verified,
       SUM(CASE WHEN unsubscribed = 1 THEN 1 ELSE 0 END) as unsubscribed
     FROM signatures`
  ).first();

  const recent = await context.env.DB.prepare(
    'SELECT id, subject, sent_count, failed_count, recipient_count, sent_at FROM broadcasts ORDER BY sent_at DESC LIMIT 10'
  ).all();

  return Response.json({
    eligible_recipients: counts?.eligible || 0,
    verified_total: counts?.verified || 0,
    unsubscribed_total: counts?.unsubscribed || 0,
    batch_limit: BATCH_LIMIT,
    recent_broadcasts: recent.results || [],
  });
}

export async function onRequestPost(context) {
  const denied = checkAuth(context.request, context.env);
  if (denied) return denied;

  let body;
  try {
    body = await context.request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { subject, html } = body;
  const mode = body.mode || 'dry_run';
  const offset = Number.isInteger(body.offset) ? body.offset : 0;

  if (!subject || !html) {
    return Response.json({ error: 'subject and html are required' }, { status: 400 });
  }

  if (!html.includes('{{UNSUBSCRIBE_URL}}')) {
    return Response.json({
      error: 'html must include {{UNSUBSCRIBE_URL}} placeholder so recipients can unsubscribe.'
    }, { status: 400 });
  }

  // Mode: dry_run — count only, no sends
  if (mode === 'dry_run') {
    const list = await context.env.DB.prepare(
      'SELECT first_name, email FROM signatures WHERE verified = 1 AND unsubscribed = 0 ORDER BY id LIMIT 5'
    ).all();

    const count = await context.env.DB.prepare(
      'SELECT COUNT(*) as n FROM signatures WHERE verified = 1 AND unsubscribed = 0'
    ).first();

    return Response.json({
      mode: 'dry_run',
      would_send_to: count?.n || 0,
      sample: (list.results || []).map(r => ({ name: r.first_name, email: r.email })),
      message: `Dry run — no emails sent. ${count?.n || 0} eligible recipients.`,
    });
  }

  // Mode: test — send to a single test address only
  if (mode === 'test') {
    const testEmail = body.test_email;
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      return Response.json({ error: 'Valid test_email required for test mode' }, { status: 400 });
    }

    const unsubUrl = 'https://safe174th.com/api/unsubscribe?token=TEST_TOKEN';
    const personalized = html
      .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubUrl)
      .replace(/\{\{FIRST_NAME\}\}/g, 'Test');

    const result = await sendOne(context.env.RESEND_API_KEY, testEmail, subject + ' [TEST]', personalized, unsubUrl);

    if (result.ok) {
      return Response.json({ mode: 'test', sent_to: testEmail, ok: true });
    }
    return Response.json({ mode: 'test', sent_to: testEmail, ok: false, error: result.error }, { status: 502 });
  }

  // Mode: send — actually deliver to recipients
  if (mode !== 'send') {
    return Response.json({ error: `Unknown mode: ${mode}` }, { status: 400 });
  }

  if (body.confirm !== true) {
    return Response.json({ error: 'confirm: true is required for send mode' }, { status: 400 });
  }

  // Pull one batch of recipients starting at offset
  const batch = await context.env.DB.prepare(
    `SELECT id, first_name, email, unsubscribe_token
       FROM signatures
       WHERE verified = 1 AND unsubscribed = 0
       ORDER BY id
       LIMIT ? OFFSET ?`
  ).bind(BATCH_LIMIT, offset).all();

  const recipients = batch.results || [];

  // Total count so caller knows when to stop
  const total = await context.env.DB.prepare(
    'SELECT COUNT(*) as n FROM signatures WHERE verified = 1 AND unsubscribed = 0'
  ).first();

  let sent = 0;
  let failed = 0;
  const errors = [];

  for (const r of recipients) {
    const unsubUrl = `https://safe174th.com/api/unsubscribe?token=${r.unsubscribe_token}`;
    const personalized = html
      .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubUrl)
      .replace(/\{\{FIRST_NAME\}\}/g, r.first_name || 'neighbor');

    const result = await sendOne(context.env.RESEND_API_KEY, r.email, subject, personalized, unsubUrl);

    if (result.ok) {
      sent++;
    } else {
      failed++;
      errors.push({ email: r.email, error: result.error });
    }
  }

  // Log the broadcast (one row per batch)
  await context.env.DB.prepare(
    'INSERT INTO broadcasts (subject, html, sent_count, failed_count, recipient_count) VALUES (?, ?, ?, ?, ?)'
  ).bind(subject, html, sent, failed, recipients.length).run();

  const nextOffset = offset + recipients.length;
  const done = nextOffset >= (total?.n || 0);

  return Response.json({
    mode: 'send',
    batch_size: recipients.length,
    sent,
    failed,
    errors: errors.slice(0, 10),
    offset,
    next_offset: done ? null : nextOffset,
    total_eligible: total?.n || 0,
    done,
  });
}

async function sendOne(apiKey, to, subject, html, unsubUrl) {
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        reply_to: RESEND_REPLY_TO,
        to: [to],
        subject,
        html,
        headers: {
          'List-Unsubscribe': `<${unsubUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }),
    });

    if (resp.ok) return { ok: true };

    const text = await resp.text();
    return { ok: false, error: text.slice(0, 300) };
  } catch (e) {
    return { ok: false, error: String(e).slice(0, 300) };
  }
}
