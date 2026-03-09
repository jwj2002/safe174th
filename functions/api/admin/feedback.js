// Admin feedback moderation
// GET /api/admin/feedback — all feedback with status
// POST /api/admin/feedback — approve/reject by id

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

  const status = new URL(context.request.url).searchParams.get('status') || 'pending';
  const results = await context.env.DB.prepare(
    'SELECT * FROM feedback WHERE status = ? ORDER BY created_at DESC LIMIT 100'
  ).bind(status).all();

  return Response.json({ feedback: results.results });
}

export async function onRequestPost(context) {
  const denied = checkAuth(context.request, context.env);
  if (denied) return denied;

  try {
    const body = await context.request.json();
    const { id, action } = body;

    if (!id || !['approve', 'reject'].includes(action)) {
      return Response.json({ error: 'id and action (approve|reject) required' }, { status: 400 });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    await context.env.DB.prepare(
      "UPDATE feedback SET status = ?, reviewed_at = datetime('now') WHERE id = ?"
    ).bind(status, id).run();

    return Response.json({ success: true, status });
  } catch (e) {
    return Response.json({ error: 'Failed to update' }, { status: 500 });
  }
}
