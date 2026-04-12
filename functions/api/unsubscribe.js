// Unsubscribe a signer from broadcast emails.
//
// GET  /api/unsubscribe?token=<unsubscribe_token>  → confirmation page (HTML)
// POST /api/unsubscribe?token=<unsubscribe_token>  → one-click (returns 200)
//
// The POST handler exists because Gmail / Apple Mail send List-Unsubscribe-Post
// requests when the header is set. See RFC 8058.
//
// Note: we deliberately do NOT delete the signature row — unsubscribe just means
// "don't email me"; the petition signature itself remains.

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return htmlResponse('Invalid Link', 'This unsubscribe link is not valid.', false);
  }

  const db = context.env.DB;
  const row = await db.prepare(
    'SELECT id, first_name, email, unsubscribed FROM signatures WHERE unsubscribe_token = ?'
  ).bind(token).first();

  if (!row) {
    return htmlResponse('Invalid Link', 'This unsubscribe link is not valid or has expired.', false);
  }

  if (row.unsubscribed) {
    return htmlResponse(
      'Already Unsubscribed',
      `The address ${row.email} is already unsubscribed from safe174th.com broadcast emails. Your petition signature remains on file.`,
      true
    );
  }

  await db.prepare(
    "UPDATE signatures SET unsubscribed = 1, unsubscribed_at = datetime('now') WHERE id = ?"
  ).bind(row.id).run();

  return htmlResponse(
    'Unsubscribed',
    `You've been unsubscribed from safe174th.com broadcast emails. Your petition signature remains on file. If this was a mistake, contact <a href="mailto:info@safe174th.com" style="color:#2563eb;">info@safe174th.com</a>.`,
    true
  );
}

// Gmail / Apple Mail one-click unsubscribe (RFC 8058).
// Expects List-Unsubscribe-Post: List-Unsubscribe=One-Click header to have been set.
export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('invalid token', { status: 400 });
  }

  const db = context.env.DB;
  const row = await db.prepare(
    'SELECT id FROM signatures WHERE unsubscribe_token = ?'
  ).bind(token).first();

  if (!row) {
    return new Response('invalid token', { status: 400 });
  }

  await db.prepare(
    "UPDATE signatures SET unsubscribed = 1, unsubscribed_at = datetime('now') WHERE id = ?"
  ).bind(row.id).run();

  return new Response('ok', { status: 200 });
}

function htmlResponse(title, message, success) {
  const color = success ? '#16a34a' : '#dc2626';
  const icon = success ? '&#10003;' : '&#10007;';
  const body = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>${title} — safe174th.com</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
<nav class="site-nav"></nav>
<header class="site-header" style="padding: 32px 24px;">
  <h1>${title}</h1>
</header>
<section>
  <div class="container" style="max-width: 560px; text-align: center;">
    <div style="font-size: 64px; color: ${color}; margin-bottom: 16px;">${icon}</div>
    <p style="font-size: 17px; color: var(--slate-700); line-height: 1.7;">${message}</p>
    <div style="margin-top: 24px;">
      <a href="/" class="cta-btn cta-btn-primary">Back to Home</a>
    </div>
  </div>
</section>
<script src="/js/nav.js"></script>
</body>
</html>`;
  return new Response(body, { headers: { 'Content-Type': 'text/html' } });
}
