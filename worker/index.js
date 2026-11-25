// Sert l'app (dossier web/) sur Cloudflare, avec les en-têtes de sécurité.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let res = await env.ASSETS.fetch(request);
    if (res.status === 404 && !/\.[a-z0-9]+$/i.test(url.pathname)) {
      res = await env.ASSETS.fetch(new Request(new URL("/index.html", url.origin), request));
    }
    const h = new Headers(res.headers);
    h.set("X-Content-Type-Options", "nosniff");
    h.set("Referrer-Policy", "strict-origin-when-cross-origin");
    h.set("X-Frame-Options", "DENY");
    if (url.pathname === "/sw.js" || url.pathname === "/config.js" || url.pathname === "/" || url.pathname === "/index.html") h.set("Cache-Control", "no-cache");
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
  },
};
