// GET /api/signatures — public count + optional signer list (verified only)
// POST /api/signatures — submit a signature (sends verification email)
export async function onRequestGet(context) {
  const db = context.env.DB;
  const count = await db.prepare('SELECT COUNT(*) as count FROM signatures WHERE verified = 1').first();
  const signers = await db.prepare(
    'SELECT first_name, street FROM signatures WHERE verified = 1 AND show_public = 1 ORDER BY created_at DESC LIMIT 100'
  ).all();

  return Response.json({
    count: count.count,
    signers: signers.results,
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { first_name, last_name, street, email, show_public } = body;

    if (!first_name || !last_name || !street || !email) {
      return Response.json({ error: 'Name, street address, and email are required.' }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Check for duplicate email
    const existingEmail = await context.env.DB.prepare(
      'SELECT id, verified FROM signatures WHERE email = ?'
    ).bind(email.trim().toLowerCase()).first();

    if (existingEmail && existingEmail.verified) {
      return Response.json({ error: 'This email has already signed. Thank you!' }, { status: 409 });
    }

    // If they submitted before but didn't verify, delete the old one and let them retry
    if (existingEmail && !existingEmail.verified) {
      await context.env.DB.prepare('DELETE FROM signatures WHERE id = ?').bind(existingEmail.id).run();
    }

    // Simple IP hash for rate limiting
    const ip = context.request.headers.get('cf-connecting-ip') || '';
    const ipHash = await hashIP(ip);

    // Generate verification token
    const token = generateToken();

    await context.env.DB.prepare(
      'INSERT INTO signatures (first_name, last_name, street, email, show_public, ip_hash, verified, verify_token) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
    ).bind(
      first_name.trim(),
      last_name.trim(),
      street.trim(),
      email.trim().toLowerCase(),
      show_public ? 1 : 0,
      ipHash,
      token
    ).run();

    // Send verification email
    await sendVerificationEmail(context.env.RESEND_API_KEY, email.trim(), first_name.trim(), token);

    return Response.json({ success: true, needsVerification: true });
  } catch (e) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

async function sendVerificationEmail(apiKey, email, firstName, token) {
  const verifyUrl = `https://safe174th.com/api/verify?token=${token}`;

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1e293b; margin: 0 0 16px;">Confirm Your Signature</h2>
      <p style="color: #475569; line-height: 1.7;">
        Hi ${firstName},<br><br>
        Thank you for signing the petition for safe infrastructure on NE 174th Street.
        Please confirm your signature by clicking the button below:
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${verifyUrl}" style="background: #dc2626; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
          Confirm My Signature
        </a>
      </div>
      <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
        If you did not sign this petition, you can ignore this email.<br>
        <a href="https://safe174th.com" style="color: #2563eb;">safe174th.com</a> &mdash; Know Before You Buy
      </p>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Safe 174th <noreply@safe174th.com>',
      to: [email],
      subject: 'Confirm your signature — safe174th.com',
      html: html,
    }),
  });
}

function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashIP(ip) {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + '-safe174th-salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  const arr = Array.from(new Uint8Array(hash));
  return arr.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}
