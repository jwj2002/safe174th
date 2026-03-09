// GET /api/signatures — public count + optional signer list
// POST /api/signatures — submit a signature
export async function onRequestGet(context) {
  const db = context.env.DB;
  const count = await db.prepare('SELECT COUNT(*) as count FROM signatures').first();
  const signers = await db.prepare(
    'SELECT first_name, street FROM signatures WHERE show_public = 1 ORDER BY created_at DESC LIMIT 100'
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

    if (!first_name || !last_name || !street) {
      return Response.json({ error: 'Name and street address are required.' }, { status: 400 });
    }

    // Simple IP hash for duplicate detection
    const ip = context.request.headers.get('cf-connecting-ip') || '';
    const ipHash = await hashIP(ip);

    // Check for duplicate from same IP
    const existing = await context.env.DB.prepare(
      'SELECT id FROM signatures WHERE ip_hash = ?'
    ).bind(ipHash).first();

    if (existing) {
      return Response.json({ error: 'You have already signed. Thank you!' }, { status: 409 });
    }

    await context.env.DB.prepare(
      'INSERT INTO signatures (first_name, last_name, street, email, show_public, ip_hash) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      first_name.trim(),
      last_name.trim(),
      street.trim(),
      email ? email.trim() : null,
      show_public ? 1 : 0,
      ipHash
    ).run();

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

async function hashIP(ip) {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + '-safe174th-salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  const arr = Array.from(new Uint8Array(hash));
  return arr.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}
