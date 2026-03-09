// Admin signature export
// GET /api/admin/signatures — full list with emails

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

  const format = new URL(context.request.url).searchParams.get('format');

  const results = await context.env.DB.prepare(
    'SELECT first_name, last_name, street, email, created_at FROM signatures ORDER BY created_at DESC'
  ).all();

  if (format === 'csv') {
    const header = 'First Name,Last Name,Street,Email,Signed At\n';
    const rows = results.results.map(r =>
      [r.first_name, r.last_name, r.street, r.email || '', r.created_at].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')
    ).join('\n');

    return new Response(header + rows, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="signatures.csv"',
      },
    });
  }

  return Response.json({ count: results.results.length, signatures: results.results });
}
