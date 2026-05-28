const loginHTML = (redirectTo, error = '') => `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Acceso restringido</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f3f4f6;
      }
      .card {
        background: white;
        border-radius: 12px;
        padding: 40px;
        width: 100%;
        max-width: 360px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        text-align: center;
      }
      h1 { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #111; }
      .sub { font-size: 14px; color: #6b7280; margin-bottom: 28px; }
      input {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 15px;
        outline: none;
        margin-bottom: 12px;
        text-align: left;
      }
      input:focus { border-color: #111; }
      button {
        width: 100%;
        padding: 11px;
        background: #111;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
      }
      button:hover { background: #333; }
      .error { color: #ef4444; font-size: 13px; margin-bottom: 12px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Balanza Energética</h1>
      <p class="sub">Ingresá la contraseña para continuar.</p>
      ${error ? `<p class="error">${error}</p>` : ''}
      <form method="POST" action="/_auth">
        <input type="hidden" name="redirect" value="${redirectTo}" />
        <input type="password" name="password" placeholder="Contraseña" autofocus autocomplete="current-password" />
        <button type="submit">Entrar</button>
      </form>
    </div>
  </body>
</html>`;

export const config = {
  matcher: ['/((?!_vercel|.*\\..*).*)', '/_auth'],
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) return; // No password set → open access (local dev)

  // Handle login form submission
  if (request.method === 'POST' && url.pathname === '/_auth') {
    const formData = await request.formData();
    const submitted = formData.get('password');
    const redirectTo = formData.get('redirect') || '/';

    if (submitted === sitePassword) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectTo,
          'Set-Cookie': `site_auth=${btoa(sitePassword)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,
        },
      });
    }

    return new Response(loginHTML(redirectTo, 'Contraseña incorrecta.'), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Validate auth cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/site_auth=([^;]+)/);
  if (match && match[1] === btoa(sitePassword)) return; // Authenticated

  // Not authenticated → show login
  return new Response(loginHTML(url.pathname + url.search), {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
