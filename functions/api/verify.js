// GET /api/verify?token=xxx — confirm email and mark signature as verified
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response(redirectHtml('Invalid Link', 'This verification link is not valid.', false), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const db = context.env.DB;
  const signature = await db.prepare(
    'SELECT id, verified, first_name FROM signatures WHERE verify_token = ?'
  ).bind(token).first();

  if (!signature) {
    return new Response(redirectHtml('Invalid Link', 'This verification link is not valid or has expired.', false), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  if (signature.verified) {
    return new Response(redirectHtml('Already Confirmed', 'Your signature was already confirmed. Thank you!', true), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Mark as verified and clear the token
  await db.prepare(
    'UPDATE signatures SET verified = 1, verify_token = NULL WHERE id = ?'
  ).bind(signature.id).run();

  return new Response(
    redirectHtml('Signature Confirmed!', `Thank you, ${signature.first_name}! Your signature has been confirmed and added to the petition.`, true),
    { headers: { 'Content-Type': 'text/html' } }
  );
}

function redirectHtml(title, message, success) {
  const color = success ? '#16a34a' : '#dc2626';
  const icon = success ? '&#10003;' : '&#10007;';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
}
