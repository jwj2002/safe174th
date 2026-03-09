// GET /api/feedback — approved feedback only (public)
// POST /api/feedback — submit new feedback (goes to pending)
export async function onRequestGet(context) {
  const db = context.env.DB;
  const results = await db.prepare(
    "SELECT id, name, content, created_at FROM feedback WHERE status = 'approved' ORDER BY created_at DESC LIMIT 50"
  ).all();

  return Response.json({ feedback: results.results });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { name, street, content } = body;

    if (!content || content.trim().length < 10) {
      return Response.json({ error: 'Please share at least a few sentences.' }, { status: 400 });
    }

    if (content.length > 5000) {
      return Response.json({ error: 'Please keep your story under 5,000 characters.' }, { status: 400 });
    }

    const ip = context.request.headers.get('cf-connecting-ip') || '';
    const ipHash = await hashIP(ip);

    await context.env.DB.prepare(
      'INSERT INTO feedback (name, street, content, ip_hash) VALUES (?, ?, ?, ?)'
    ).bind(
      name ? name.trim() : null,
      street ? street.trim() : null,
      content.trim(),
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
