(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("productForm");
  const fields = ["title","description","destination","image"];
  const historyKey = "enlaces_productos_whatsapp_v1";
  const apiBase = (window.APP_CONFIG?.API_BASE || "").replace(/\/$/,"");
  const placeholder = "https://placehold.co/640x360/eaf0f8/53627a?text=Foto+del+producto";

  function safeUrl(value) {
    try { const u = new URL(value); return ["http:","https:"].includes(u.protocol) ? u.href : ""; }
    catch { return ""; }
  }
  function updatePreview() {
    $("previewTitle").textContent = $("title").value.trim() || "Nombre del producto";
    $("previewDescription").textContent = $("description").value.trim() || "Aquí aparecerá la descripción del producto.";
    $("previewImage").src = safeUrl($("image").value) || placeholder;
  }
  fields.forEach(id => $(id).addEventListener("input", updatePreview));
  $("previewImage").addEventListener("error", () => { $("previewImage").src = placeholder; });

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(historyKey) || "[]"); } catch { return []; }
  }
  function saveHistory(items) { localStorage.setItem(historyKey, JSON.stringify(items.slice(0,30))); }
  function renderHistory() {
    const root = $("history"), items = getHistory();
    root.innerHTML = "";
    if (!items.length) { root.innerHTML = '<p class="empty">Todavía no has creado enlaces.</p>'; return; }
    items.forEach(item => {
      const row = document.createElement("div"); row.className = "history-item";
      const img = document.createElement("img"); img.src = item.image || placeholder; img.alt = "";
      img.onerror = () => { img.src = placeholder; };
      const info = document.createElement("div"), title = document.createElement("strong"), link = document.createElement("a");
      title.textContent = item.title; link.href = item.url; link.textContent = item.url; link.target = "_blank"; link.rel = "noopener";
      info.append(title,link); row.append(img,info); root.append(row);
    });
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    $("status").textContent = "";
    const data = Object.fromEntries(fields.map(id => [id,$(id).value.trim()]));
    data.destination = safeUrl(data.destination); data.image = safeUrl(data.image);
    if (!data.destination || !data.image) { $("status").textContent = "Revisa que los dos enlaces sean direcciones http o https válidas."; return; }
    if (!apiBase || apiBase.includes("PENDIENTE")) {
      $("status").textContent = "La interfaz está lista, pero falta conectar el servicio gratuito de Cloudflare para generar enlaces reales.";
      return;
    }
    const button = $("createButton"); button.disabled = true; button.firstChild.textContent = "Creando enlace… ";
    try {
      const response = await fetch(apiBase + "/api/links", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo crear el enlace.");
      const item = {title:data.title,image:data.image,url:result.url,id:result.id,createdAt:Date.now()};
      saveHistory([item,...getHistory()]); renderHistory();
      $("shareUrl").href = result.url; $("shareUrl").textContent = result.url;
      $("openShare").href = "https://wa.me/?text=" + encodeURIComponent(data.title + " — " + result.url);
      $("result").hidden = false; $("result").scrollIntoView({behavior:"smooth",block:"center"});
    } catch (error) { $("status").textContent = error.message || "Error de conexión. Intenta de nuevo."; }
    finally { button.disabled = false; button.firstChild.textContent = "Crear enlace para WhatsApp "; }
  });
  $("copyButton").addEventListener("click", async () => {
    const value = $("shareUrl").textContent;
    try { await navigator.clipboard.writeText(value); $("copyButton").textContent = "¡Copiado!"; }
    catch { $("copyButton").textContent = "Mantén pulsado el enlace"; }
  });
  updatePreview(); renderHistory();
})();