const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status=200) {
  return new Response(JSON.stringify(data), {status,headers:{...HEADERS,"Content-Type":"application/json; charset=utf-8"}});
}
function esc(value="") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function validHttp(value) {
  try { const u = new URL(value); return ["http:","https:"].includes(u.protocol) ? u.href : null; }
  catch { return null; }
}
function makeId() {
  const bytes = new Uint8Array(9); crypto.getRandomValues(bytes);
  return Array.from(bytes,b => b.toString(36).padStart(2,"0")).join("").slice(0,12);
}
function page(item, url) {
  const title = esc(item.title), description = esc(item.description), image = esc(item.image), destination = esc(item.destination), canonical = esc(url);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="description" content="${description}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Enlaces de productos">
<meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
<meta property="og:image" content="${image}"><meta property="og:image:secure_url" content="${image}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary_large_image">
<style>body{font-family:system-ui,sans-serif;background:#f3f6fa;color:#17243b;margin:0;padding:24px}.card{max-width:560px;margin:30px auto;background:white;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px #10213d18}.card img{width:100%;aspect-ratio:16/9;object-fit:cover}.copy{padding:22px}.copy p{color:#64748b;line-height:1.5}.button{display:inline-block;background:#10213d;color:white;text-decoration:none;padding:13px 20px;border-radius:10px;font-weight:700}.domain{font-size:12px;color:#64748b;overflow-wrap:anywhere}</style></head>
<body><main class="card"><img src="${image}" alt="${title}"><div class="copy"><h1>${title}</h1><p>${description}</p><p class="domain">Destino original: ${esc(new URL(item.destination).hostname)}</p><a class="button" href="${destination}" rel="nofollow noopener">Ver producto o archivo</a></div></main></body></html>`;
}
export default {
 async fetch(request, env) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null,{headers:HEADERS});
  if (!env.ENLACES) return json({error:"Falta configurar el espacio KV ENLACES en Cloudflare."},500);
  if (url.pathname === "/api/links" && request.method === "POST") {
   let body; try { body = await request.json(); } catch { return json({error:"El contenido enviado no es válido."},400); }
   const title = String(body.title || "").trim().slice(0,90);
   const description = String(body.description || "").trim().slice(0,220);
   const destination = validHttp(body.destination), image = validHttp(body.image);
   if (!title || !description || !destination || !image) return json({error:"Completa nombre, descripción y enlaces válidos."},400);
   const id = makeId(), item = {title,description,destination,image,createdAt:new Date().toISOString()};
   await env.ENLACES.put(id,JSON.stringify(item));
   return json({id,url:`${url.origin}/p/${id}`},201);
  }
  const match = url.pathname.match(/^\/p\/([a-z0-9]+)$/i);
  if (match && request.method === "GET") {
   const raw = await env.ENLACES.get(match[1]);
   if (!raw) return new Response("Este enlace no existe o fue eliminado.",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8"}});
   const item = JSON.parse(raw);
   return new Response(page(item,url.href),{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"public, max-age=300"}});
  }
  if (url.pathname === "/") return new Response("Servicio de enlaces para WhatsApp activo.",{headers:{"Content-Type":"text/plain; charset=utf-8"}});
  return json({error:"Ruta no encontrada."},404);
 }
};