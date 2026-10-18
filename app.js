
    /* ===== Contenido de muestra: solo se ve si aún no has publicado nada ===== */
    const SHOW_SAMPLES = true;
    const SAMPLE_WALLPAPERS = [
      { title: "Cumbres al anochecer", category: "Naturaleza", quality: "4K", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&h=1600&q=90", description: "Montañas bajo un cielo cinematográfico." },
      { title: "Neón nocturno", category: "Cyberpunk", quality: "4K", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&h=1600&q=90", description: "Una atmósfera nocturna de alto contraste." },
      { title: "Planeta distante", category: "Espacio", quality: "4K", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&h=1600&q=90", description: "El universo como fondo para tu móvil." },
      { title: "Lago estelar", category: "Naturaleza", quality: "4K", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&h=1600&q=90", description: "Cielo y montaña reflejados en el agua." },
      { title: "Cielo de otro mundo", category: "Espacio", quality: "4K", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&h=1600&q=90", description: "Nebulosas y estrellas para tu teléfono." },
      { title: "Bosque profundo", category: "Naturaleza", quality: "4K", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&h=1600&q=90", description: "Un bosque envuelto en misterio." }
    ];
    const SAMPLE_MUSIC = [
      { title: "Épica sin límites", genre: "Cinemática", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=500&h=500&q=85", audio: "" },
      { title: "Neon Mind", genre: "Electrónica", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=500&h=500&q=85", audio: "" },
      { title: "Calma interior", genre: "Ambiental", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&h=500&q=85", audio: "" }
    ];
    const CAT_ORDER = ["Cyberpunk", "Anime", "Naturaleza", "Espacio", "Terror", "Minimalista", "Otros"];

    /* ===== Estado ===== */
    let localWallpapers = [];
    let localMusic = [];
    let catalogLoaded = false;
    let catalogSig = "";
    let activeCategory = "Todos";
    let visibleCount = 8;
    let currentView = "wallpapers";
    let currentWallpaper = null;
    let mpIndex = -1;
    let mpKey = null;
    let mpSeeking = false;
    let toastTimer = null;

    const $ = id => document.getElementById(id);
    const mpAudio = $("mpAudio");
    const mpSeek = $("mpSeek");
    const modal = $("wallpaperModal");

    function allWallpapers() { return localWallpapers.length ? localWallpapers : (SHOW_SAMPLES ? SAMPLE_WALLPAPERS : []); }
    function allMusic() { return localMusic.length ? localMusic : (SHOW_SAMPLES ? SAMPLE_MUSIC : []); }
    function wpCategory(w) { return w.category || "Otros"; }
    function trackKey(t) { return t.id || t.title; }
    function trackCover(t) { return t.cover || t.image || ""; }
    function toast(msg) {
      const t = $("toast");
      t.textContent = msg; t.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
    }

    /* ===== Iconos ===== */
    const I = {
      download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v12"/><path d="m6.5 10.5 5.5 5.5 5.5-5.5"/><path d="M5 20.5h14"/></svg>',
      play: '<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
      pause: '<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
      prev: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>',
      next: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>',
      back10: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><text x="12" y="15.4" font-size="7" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="Outfit,Inter,sans-serif">10</text></svg>',
      fwd10: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><text x="12" y="15.4" font-size="7" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="Outfit,Inter,sans-serif">10</text></svg>',
      heart: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
      heartSm: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>'
    };
    $("modalDownload").innerHTML = I.download;
    $("mpPrev").innerHTML = I.prev;
    $("mpNext").innerHTML = I.next;
    $("mpBack10").innerHTML = I.back10;
    $("mpFwd10").innerHTML = I.fwd10;
    $("mpLike").innerHTML = I.heart;

    /* ===== Iconos extra ===== */
    const SV = (d, w, extra) => '<svg viewBox="0 0 24 24" width="' + w + '" height="' + w + '" fill="none" stroke="currentColor" stroke-width="' + (extra || 1.8) + '" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
    Object.assign(I, {
      shuffle: SV('<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>', 22),
      repeat: SV('<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>', 22),
      menu: SV('<path d="M4 7h16M4 12h16M4 17h16"/>', 26),
      ext: SV('<path d="M7 17 17 7"/><path d="M7 7h10v10"/>', 18, 2),
      copy: SV('<rect width="13" height="13" x="9" y="9" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>', 16, 2),
      tag: SV('<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".6" fill="currentColor"/>', 28, 1.6),
      playSm: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
      pauseSm: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'
    });
    $("menuBtn").innerHTML = I.menu;
    $("mpShuffle").innerHTML = I.shuffle;
    $("mpRepeat").innerHTML = I.repeat;

    /* ===== Capas (visor y categorías) con botón "atrás" del celular ===== */
    const openSet = new Set();
    const OV_ORDER = ["viewer", "sheet"];
    function applyOv(name, open) {
      if (name === "viewer") modal.classList.toggle("open", open);
      else if (name === "sheet") { $("catSheet").classList.toggle("open", open); $("sheetBackdrop").classList.toggle("open", open); }
      document.body.classList.toggle("no-scroll", openSet.has("viewer"));
      updateNav();
    }
    function openOv(name) {
      if (openSet.has(name)) return;
      openSet.add(name);
      try { history.pushState({ ov: name }, ""); } catch (e) {}
      applyOv(name, true);
    }
    function closeOv(name, fromPop) {
      if (!openSet.has(name)) return;
      openSet.delete(name);
      applyOv(name, false);
      if (!fromPop) { try { history.back(); } catch (e) {} }
    }
    window.addEventListener("popstate", () => {
      for (const n of OV_ORDER) { if (openSet.has(n)) { closeOv(n, true); return; } }
    });
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      for (const n of OV_ORDER) { if (openSet.has(n)) { closeOv(n, false); break; } }
    });

    /* ===== Navegación ===== */
    const VIEWS = { wallpapers: "navWall", music: "navMusic", deals: "navDeals" };
    function updateNav() {
      const sheet = openSet.has("sheet");
      Object.keys(VIEWS).forEach(v => $(VIEWS[v]).classList.toggle("active", currentView === v && !sheet));
      $("navCats").classList.toggle("active", sheet);
      updateMusicUI();
    }
    function showView(name) {
      currentView = name;
      Object.keys(VIEWS).forEach(v => $("view-" + v).classList.toggle("active", v === name));
      updateNav();
    }
    function goView(name) {
      closeOv("sheet");
      if (currentView === name) window.scrollTo({ top: 0, behavior: "smooth" });
      else { showView(name); window.scrollTo(0, 0); }
    }
    $("navWall").addEventListener("click", () => goView("wallpapers"));
    $("navMusic").addEventListener("click", () => goView("music"));
    $("navDeals").addEventListener("click", () => goView("deals"));
    const toggleSheet = () => { openSet.has("sheet") ? closeOv("sheet") : openOv("sheet"); };
    $("navCats").addEventListener("click", toggleSheet);
    $("menuBtn").addEventListener("click", toggleSheet);
    $("sheetBackdrop").addEventListener("click", () => closeOv("sheet"));

    /* ===== Wallpapers ===== */
    function filteredWallpapers() {
      const all = allWallpapers();
      return activeCategory === "Todos" ? all : all.filter(w => wpCategory(w) === activeCategory);
    }
    function categoryNames() {
      const set = {};
      allWallpapers().forEach(w => { set[wpCategory(w)] = 1; });
      return Object.keys(set).sort((a, b) => {
        const ia = CAT_ORDER.indexOf(a), ib = CAT_ORDER.indexOf(b);
        return ((ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)) || a.localeCompare(b);
      });
    }
    const heroImg = $("heroImg");
    heroImg.addEventListener("load", () => heroImg.classList.add("ready"));
    heroImg.addEventListener("error", () => heroImg.classList.remove("ready"));
    function renderHero() {
      const w = allWallpapers()[0];
      if (!w) { heroImg.removeAttribute("src"); heroImg.classList.remove("ready"); return; }
      const src = w.thumb || w.image;
      if (heroImg.getAttribute("src") !== src) { heroImg.classList.remove("ready"); heroImg.src = src; }
      if (heroImg.complete && heroImg.naturalWidth) heroImg.classList.add("ready");
    }
    function renderChips() {
      const box = $("chips");
      box.innerHTML = "";
      if (!catalogLoaded) return;
      const names = categoryNames();
      box.hidden = names.length < 2;
      ["Todos"].concat(names).forEach(n => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "chip" + (n === activeCategory ? " active" : ""); b.textContent = n;
        b.addEventListener("click", () => chooseCategory(n, true));
        box.appendChild(b);
      });
    }
    function renderWallpapers() {
      const grid = $("wallpaperGrid");
      grid.innerHTML = "";
      if (!catalogLoaded) {
        for (let i = 0; i < 6; i++) { const s = document.createElement("div"); s.className = "wp skeleton"; grid.appendChild(s); }
        $("showMore").hidden = true;
        return;
      }
      if (activeCategory !== "Todos" && !allWallpapers().some(w => wpCategory(w) === activeCategory)) activeCategory = "Todos";
      const items = filteredWallpapers();
      if (!items.length) {
        const e = document.createElement("div"); e.className = "empty"; e.textContent = "Aún no hay wallpapers publicados.";
        grid.appendChild(e);
      }
      items.slice(0, visibleCount).forEach(w => {
        const card = document.createElement("article");
        card.className = "wp";
        const open = document.createElement("button");
        open.className = "wp-open"; open.type = "button";
        open.setAttribute("aria-label", "Ver " + (w.title || "wallpaper"));
        const img = document.createElement("img");
        img.alt = w.title || ""; img.decoding = "async"; img.loading = "lazy";
        img.addEventListener("load", () => img.classList.add("ready"));
        img.addEventListener("error", () => img.classList.add("ready"));
        img.src = w.thumb || w.image;
        if (img.complete && img.naturalWidth) img.classList.add("ready");
        open.appendChild(img);
        open.addEventListener("click", () => openPreview(w));
        const dl = document.createElement("button");
        dl.className = "wp-dl"; dl.type = "button"; dl.innerHTML = I.download;
        dl.setAttribute("aria-label", "Descargar " + (w.title || "wallpaper"));
        dl.addEventListener("click", () => downloadWallpaper(w));
        card.append(open);
        if (w.quality) { const q = document.createElement("span"); q.className = "wp-q"; q.textContent = w.quality; card.appendChild(q); }
        card.append(dl);
        grid.appendChild(card);
      });
      $("showMore").hidden = items.length <= visibleCount;
    }
    $("showMore").addEventListener("click", () => { visibleCount += 8; renderWallpapers(); });

    /* ===== Categorías ===== */
    function renderCatSheet() {
      const list = $("catList");
      list.innerHTML = "";
      if (!catalogLoaded) return;
      const all = allWallpapers();
      const groups = {};
      all.forEach(w => { const c = wpCategory(w); (groups[c] = groups[c] || []).push(w); });
      const rows = [{ name: "Todos", items: all }].concat(categoryNames().map(n => ({ name: n, items: groups[n] })));
      rows.forEach(r => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "cat-row" + (r.name === activeCategory ? " active" : "");
        b.innerHTML = '<img alt=""><span class="name"></span><span class="count"></span>';
        const first = r.items[0];
        if (first) b.querySelector("img").src = first.thumb || first.image;
        b.querySelector(".name").textContent = r.name;
        b.querySelector(".count").textContent = r.items.length;
        b.addEventListener("click", () => chooseCategory(r.name));
        list.appendChild(b);
      });
    }
    function chooseCategory(name, keepScroll) {
      activeCategory = name;
      visibleCount = 8;
      closeOv("sheet");
      showView("wallpapers");
      renderWallpapers(); renderChips(); renderCatSheet();
      if (!keepScroll) window.scrollTo(0, 0);
    }

    /* ===== Visor de wallpaper ===== */
    function openPreview(w) {
      currentWallpaper = w;
      $("modalImage").src = w.image;
      $("modalImage").alt = w.title || "";
      $("viewerBg").style.backgroundImage = "url(" + JSON.stringify(w.image) + ")";
      $("modalTitle").textContent = w.title || "Wallpaper";
      $("modalMeta").textContent = [wpCategory(w), w.quality].filter(Boolean).join(" · ");
      const d = $("modalDescription");
      d.textContent = w.description || ""; d.style.display = w.description ? "block" : "none";
      modal.classList.remove("hide-ui");
      openOv("viewer");
    }
    function closePreview() { closeOv("viewer"); }
    async function downloadWallpaper(w) {
      const url = w.download || w.image;
      const m = /\.(jpe?g|png|webp|gif)(?:$|\?)/i.exec(url);
      const name = (w.title || "wallpaper").replace(/[^\w\-]+/g, "_") + "." + (m ? m[1].toLowerCase() : "jpg");
      toast("Descargando…");
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      } catch (e) {
        window.open(url, "_blank", "noopener");
      }
    }
    $("closeModal").addEventListener("click", closePreview);
    $("modalImage").addEventListener("click", () => modal.classList.toggle("hide-ui"));
    $("modalDownload").addEventListener("click", () => { if (currentWallpaper) downloadWallpaper(currentWallpaper); });

    /* ===== Me gusta (se guarda en el navegador de cada persona) ===== */
    let likes = {};
    try { likes = JSON.parse(localStorage.getItem("vincelsLikes") || "{}") || {}; } catch (e) { likes = {}; }
    function isLiked(k) { return !!likes[k]; }
    function toggleLike() {
      const t = allMusic()[mpIndex];
      if (!t) return;
      const k = trackKey(t);
      if (likes[k]) delete likes[k]; else likes[k] = 1;
      try { localStorage.setItem("vincelsLikes", JSON.stringify(likes)); } catch (e) {}
      const b = $("mpLike");
      b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
      renderMusicList();
    }
    $("mpLike").addEventListener("click", toggleLike);

    /* ===== Música: lista ===== */
    let shuffleOn = false, repeatOn = false, mpStarted = false;
    const GENRE_TAIL = " · IA";
    function genreLabel(t) { return (t.genre || "Música") + GENRE_TAIL; }
    function renderMusicList() {
      const list = $("trackList");
      list.innerHTML = "";
      if (!catalogLoaded) return;
      const items = allMusic();
      mpIndex = mpKey ? items.findIndex(t => trackKey(t) === mpKey) : -1;
      $("nowPlaying").hidden = !items.length;
      if (!items.length) { list.innerHTML = '<div class="empty">Aún no hay música publicada.</div>'; return; }
      if (mpIndex < 0) { const f = items.findIndex(t => t.audio); selectTrack(f >= 0 ? f : 0, false); }
      items.forEach((t, i) => {
        const row = document.createElement("button");
        row.type = "button"; row.className = "track";
        row.innerHTML = '<img alt="" loading="lazy"><span class="track-copy"><strong></strong><small></small></span><span class="track-end"><span class="ring"></span></span>';
        row.querySelector("img").src = trackCover(t);
        row.querySelector("strong").textContent = t.title;
        row.querySelector("small").textContent = genreLabel(t);
        const end = row.querySelector(".track-end");
        if (isLiked(trackKey(t))) { const h = document.createElement("span"); h.className = "liked"; h.innerHTML = I.heartSm; end.insertBefore(h, end.firstChild); }
        if (!t.audio) { const g = document.createElement("span"); g.className = "tag"; g.textContent = "Muestra"; end.insertBefore(g, end.firstChild); }
        row.addEventListener("click", () => {
          if (i === mpIndex && mpAudio.getAttribute("src")) togglePlay(); else selectTrack(i, true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
        list.appendChild(row);
      });
      updateMusicUI();
    }

    /* ===== Música: reproductor ===== */
    function fmtTime(s) {
      if (!isFinite(s) || s < 0) return "0:00";
      return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
    }
    function setMpStatus(t) { $("mpStatus").textContent = t || ""; }

    function updateMusicUI() {
      const items = allMusic();
      const t = items[mpIndex];
      const playing = !mpAudio.paused && !mpAudio.ended;
      $("mpPlay").innerHTML = playing ? I.pause : I.play;
      $("miniPlay").innerHTML = playing ? I.pause : I.play;
      document.querySelectorAll("#trackList .track").forEach((r, i) => {
        r.classList.toggle("current", i === mpIndex);
        const ring = r.querySelector(".ring");
        if (ring) ring.innerHTML = (i === mpIndex && playing) ? I.pauseSm : I.playSm;
      });
      const showMini = !!(t && t.audio && mpStarted && currentView !== "music");
      $("miniPlayer").classList.toggle("show", showMini);
      document.body.classList.toggle("has-mini", showMini);
      $("mpLike").setAttribute("aria-pressed", String(!!(t && isLiked(trackKey(t)))));
      $("mpShuffle").classList.toggle("on", shuffleOn); $("mpShuffle").setAttribute("aria-pressed", String(shuffleOn));
      $("mpRepeat").classList.toggle("on", repeatOn); $("mpRepeat").setAttribute("aria-pressed", String(repeatOn));
    }

    function selectTrack(i, autoplay) {
      const items = allMusic();
      if (!items.length) return;
      i = (i + items.length) % items.length;
      const t = items[i];
      mpIndex = i; mpKey = trackKey(t);
      const cover = trackCover(t);
      $("mpCover").src = cover; $("miniCover").src = cover;
      $("mpTitle").textContent = t.title; $("miniTitle").textContent = t.title;
      $("mpGenre").textContent = genreLabel(t); $("miniGenre").textContent = genreLabel(t);
      mpAudio.pause();
      mpSeek.value = 0; mpSeek.style.setProperty("--p", "0%");
      $("mpCur").textContent = "0:00"; $("mpDur").textContent = "0:00";
      if (t.audio) {
        setMpStatus("");
        mpAudio.src = t.audio;
        if (autoplay) mpAudio.play().catch(() => setMpStatus("Toca ▶ para reproducir."));
      } else {
        mpAudio.removeAttribute("src"); mpAudio.load();
        setMpStatus("Esta pista es de muestra y aún no tiene audio.");
      }
      try {
        if ("mediaSession" in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: t.title, artist: "VINCELS.", album: t.genre || "Música con IA",
            artwork: cover ? [{ src: new URL(cover, location.href).href }] : []
          });
          const h = navigator.mediaSession.setActionHandler.bind(navigator.mediaSession);
          h("play", () => mpAudio.play()); h("pause", () => mpAudio.pause());
          h("previoustrack", () => goPrev()); h("nexttrack", () => stepTrack(1));
          h("seekbackward", () => skip(-10)); h("seekforward", () => skip(10));
        }
      } catch (e) { /* sin control en pantalla de bloqueo */ }
      updateMusicUI();
    }
    function nextPlayable(from, dir) {
      const items = allMusic(), n = items.length;
      let i = from;
      for (let k = 0; k < n; k++) { i = (i + dir + n) % n; if (items[i].audio) return i; }
      return -1;
    }
    function randomPlayable() {
      const c = [];
      allMusic().forEach((t, i) => { if (t.audio && i !== mpIndex) c.push(i); });
      return c.length ? c[Math.floor(Math.random() * c.length)] : -1;
    }
    function stepTrack(dir) {
      if (shuffleOn) { const r = randomPlayable(); if (r >= 0) { selectTrack(r, true); return; } }
      const from = mpIndex < 0 ? (dir > 0 ? -1 : 0) : mpIndex;
      const i = nextPlayable(from, dir);
      if (i >= 0) selectTrack(i, true);
    }
    function goPrev() { if (mpAudio.currentTime > 3) mpAudio.currentTime = 0; else stepTrack(-1); }
    function skip(sec) {
      if (!mpAudio.getAttribute("src")) return;
      const d = isFinite(mpAudio.duration) ? mpAudio.duration : Infinity;
      mpAudio.currentTime = Math.max(0, Math.min(d - 0.1, mpAudio.currentTime + sec));
    }
    function togglePlay() {
      const items = allMusic();
      if (!items.length) return;
      if (mpIndex < 0) { const f = items.findIndex(t => t.audio); selectTrack(f >= 0 ? f : 0, true); return; }
      if (!items[mpIndex].audio) { setMpStatus("Esta pista es de muestra y aún no tiene audio."); return; }
      if (mpAudio.paused) mpAudio.play().catch(() => setMpStatus("No se pudo reproducir este audio."));
      else mpAudio.pause();
    }
    $("mpPlay").addEventListener("click", togglePlay);
    $("miniPlay").addEventListener("click", e => { e.stopPropagation(); togglePlay(); });
    $("miniPlayer").addEventListener("click", () => goView("music"));
    $("miniPlayer").addEventListener("keydown", e => { if (e.key === "Enter") goView("music"); });
    $("mpPrev").addEventListener("click", goPrev);
    $("mpNext").addEventListener("click", () => stepTrack(1));
    $("mpBack10").addEventListener("click", () => skip(-10));
    $("mpFwd10").addEventListener("click", () => skip(10));
    $("mpShuffle").addEventListener("click", () => { shuffleOn = !shuffleOn; updateMusicUI(); });
    $("mpRepeat").addEventListener("click", () => { repeatOn = !repeatOn; mpAudio.loop = repeatOn; updateMusicUI(); });
    mpAudio.addEventListener("play", () => { mpStarted = true; updateMusicUI(); });
    mpAudio.addEventListener("pause", updateMusicUI);
    mpAudio.addEventListener("ended", () => {
      const i = shuffleOn ? randomPlayable() : nextPlayable(mpIndex, 1);
      if (i >= 0 && i !== mpIndex) selectTrack(i, true); else updateMusicUI();
    });
    mpAudio.addEventListener("error", () => { if (mpAudio.getAttribute("src")) setMpStatus("No se pudo cargar el audio. Si lo acabas de subir, espera 1–2 minutos y vuelve a intentar."); });
    mpAudio.addEventListener("loadedmetadata", () => { $("mpDur").textContent = fmtTime(mpAudio.duration); });
    mpAudio.addEventListener("timeupdate", () => {
      const d = mpAudio.duration, c = mpAudio.currentTime;
      $("mpCur").textContent = fmtTime(c);
      if (isFinite(d) && d > 0 && !mpSeeking) {
        const pct = (c / d) * 100;
        mpSeek.value = pct; mpSeek.style.setProperty("--p", pct + "%");
      }
    });
    mpSeek.addEventListener("input", () => {
      mpSeeking = true;
      mpSeek.style.setProperty("--p", mpSeek.value + "%");
      if (isFinite(mpAudio.duration)) mpAudio.currentTime = (mpSeek.value / 100) * mpAudio.duration;
    });
    mpSeek.addEventListener("change", () => { mpSeeking = false; });

    /* ===== Ofertas y enlaces de afiliado ===== */
    let localDeals = [];
    const SAMPLE_DEALS = [
      { id: "demo", title: "Tu primer enlace de afiliado", badge: "Muestra", description: "Aquí aparecerán tus códigos y enlaces: un mes gratis, cupones, ofertas de TikTok Shop y más.", code: "", url: "", image: "" }
    ];
    function allDeals() { return localDeals.length ? localDeals : (SHOW_SAMPLES ? SAMPLE_DEALS : []); }
    function safeUrl(u) { return /^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : ""; }
    async function copyText(txt) {
      try { await navigator.clipboard.writeText(txt); return true; } catch (e) {}
      try {
        const ta = document.createElement("textarea");
        ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand("copy"); ta.remove(); return ok;
      } catch (e) { return false; }
    }
    function renderDeals() {
      const box = $("dealList");
      box.innerHTML = "";
      if (!catalogLoaded) return;
      const items = allDeals();
      if (!items.length) { box.innerHTML = '<div class="empty">Pronto habrá ofertas por aquí.</div>'; return; }
      items.forEach(d => {
        const card = document.createElement("article");
        card.className = "deal";
        const top = document.createElement("div"); top.className = "deal-top";
        let pic;
        if (d.image) { pic = document.createElement("img"); pic.className = "deal-img"; pic.alt = ""; pic.loading = "lazy"; pic.src = d.image; }
        else { pic = document.createElement("div"); pic.className = "deal-img"; pic.innerHTML = I.tag; }
        const copy = document.createElement("div"); copy.className = "deal-copy";
        if (d.badge) { const b = document.createElement("span"); b.className = "deal-badge"; b.textContent = d.badge; copy.appendChild(b); }
        const h = document.createElement("h3"); h.textContent = d.title || "Oferta"; copy.appendChild(h);
        if (d.description) { const p = document.createElement("p"); p.textContent = d.description; copy.appendChild(p); }
        top.append(pic, copy);
        const actions = document.createElement("div"); actions.className = "deal-actions";
        if (d.code) {
          const c = document.createElement("button");
          c.type = "button"; c.className = "deal-code"; c.setAttribute("aria-label", "Copiar código " + d.code);
          c.innerHTML = '<span><small>Código</small><br></span>' + I.copy;
          c.firstChild.appendChild(document.createTextNode(d.code));
          c.addEventListener("click", async () => { toast(await copyText(d.code) ? "Código copiado" : "Copia el código: " + d.code); });
          actions.appendChild(c);
        }
        const url = safeUrl(d.url);
        const go = document.createElement(url ? "a" : "span");
        go.className = "deal-go" + (url ? "" : " off");
        if (url) { go.href = url; go.target = "_blank"; go.rel = "noopener noreferrer sponsored nofollow"; }
        go.innerHTML = (url ? "Ver oferta " : "Sin enlace ") + (url ? I.ext : "");
        actions.appendChild(go);
        card.append(top, actions);
        box.appendChild(card);
      });
    }

    // ===== Administrador: publica en GitHub (la autorización real es el token) =====
    const ADMIN_PASSWORD = "2549";
    const GH = { owner: "thevincels", repo: "Vincels", catalogPath: "catalog.json" };
    const TOKEN_KEY = "vincelsGhToken";
    let ghBranch = null;
    let adminCatalog = { wallpapers: [], music: [] };
    let logoTapCount = 0;
    let logoTapTimer = null;

    function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }
    function setToken(v) { try { if (v) localStorage.setItem(TOKEN_KEY, v); else localStorage.removeItem(TOKEN_KEY); } catch (e) {} }
    function utf8Encode(str) { return btoa(unescape(encodeURIComponent(str))); }
    function utf8Decode(b64) { return decodeURIComponent(escape(atob(b64.replace(/\s/g, "")))); }
    function blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(",")[1]);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
      });
    }
    function slugify(s) {
      return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30) || "archivo";
    }
    function fileExt(file, fallback) {
      const e = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return e && e.length <= 5 ? e : fallback;
    }
    function makeThumb(file, maxW) {
      return new Promise(resolve => {
        const url = URL.createObjectURL(file), img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxW / img.width), c = document.createElement("canvas");
          c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(url);
          c.toBlob(b => resolve(b), "image/jpeg", 0.82);
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
        img.src = url;
      });
    }

    function ghFetch(path, options) {
      options = options || {};
      return fetch(`https://api.github.com/repos/${GH.owner}/${GH.repo}${path}`, {
        ...options,
        headers: { "Accept": "application/vnd.github+json", "Authorization": "Bearer " + getToken(), "Content-Type": "application/json" }
      });
    }
    async function ghError(res) {
      let m = ""; try { m = (await res.json()).message; } catch (e) {}
      if (res.status === 401) return "Token inválido o vencido. Genera uno nuevo en la pestaña Conexión.";
      if (res.status === 403) return "Sin permiso. Revisa que el token tenga Contents: Read and write. " + m;
      return `GitHub respondió ${res.status}${m ? ": " + m : ""}`;
    }
    const encPath = p => p.split("/").map(encodeURIComponent).join("/");
    async function getBranch() {
      if (ghBranch) return ghBranch;
      const res = await ghFetch("");
      if (!res.ok) throw new Error(await ghError(res));
      ghBranch = (await res.json()).default_branch;
      return ghBranch;
    }
    async function getFile(path) {
      const branch = await getBranch();
      const res = await ghFetch(`/contents/${encPath(path)}?ref=${encodeURIComponent(branch)}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(await ghError(res));
      return res.json();
    }
    async function putFile(path, b64, message, sha) {
      const branch = await getBranch();
      const body = { message, content: b64, branch };
      if (sha) body.sha = sha;
      const res = await ghFetch(`/contents/${encPath(path)}`, { method: "PUT", body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await ghError(res));
      return res.json();
    }
    async function deleteFile(path, message) {
      const f = await getFile(path);
      if (!f) return;
      const branch = await getBranch();
      await ghFetch(`/contents/${encPath(path)}`, { method: "DELETE", body: JSON.stringify({ message, sha: f.sha, branch }) });
    }
    async function loadAdminCatalog() {
      const f = await getFile(GH.catalogPath);
      if (!f) { adminCatalog = { wallpapers: [], music: [], deals: [] }; return null; }
      const data = JSON.parse(utf8Decode(f.content));
      adminCatalog = { wallpapers: data.wallpapers || [], music: data.music || [], deals: data.deals || [] };
      return f.sha;
    }
    async function saveCatalog(mutator, message) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const sha = await loadAdminCatalog();
        mutator(adminCatalog);
        try {
          await putFile(GH.catalogPath, utf8Encode(JSON.stringify(adminCatalog, null, 2)), message, sha);
          return;
        } catch (e) {
          if (attempt === 1 || !/409|does not match/i.test(e.message)) throw e;
        }
      }
    }

    function setAdminStatus(m) { document.getElementById("adminStatus").textContent = m; }
    function openOverlay(id) { document.getElementById(id).classList.add("open"); }
    function closeOverlays() { document.querySelectorAll(".admin-overlay").forEach(el => el.classList.remove("open")); }
    function switchTab(name) {
      document.querySelectorAll("[data-admin-tab]").forEach(b => b.classList.toggle("active", b.dataset.adminTab === name));
      document.getElementById("adminWallpapersSection").classList.toggle("admin-hidden", name !== "wallpapers");
      document.getElementById("adminMusicSection").classList.toggle("admin-hidden", name !== "music");
      document.getElementById("adminSettingsSection").classList.toggle("admin-hidden", name !== "settings");
      document.getElementById("adminDealsSection").classList.toggle("admin-hidden", name !== "deals");
    }

    function renderAdminLists() {
      const build = (listId, items, kind) => {
        const list = document.getElementById(listId);
        list.innerHTML = "";
        if (!items.length) { list.innerHTML = '<div class="admin-notice">Aún no hay elementos publicados.</div>'; return; }
        items.forEach(item => {
          const row = document.createElement("div"); row.className = "admin-list-item";
          row.innerHTML = '<div class="admin-list-copy"><strong></strong><small></small></div><button type="button">Eliminar</button>';
          row.querySelector("strong").textContent = item.title;
          row.querySelector("small").textContent = kind === "deal" ? ((item.badge || "Oferta") + (item.code ? " · " + item.code : "")) : kind === "wallpaper" ? `${item.category || "Otros"} · ${item.quality || "HD"}` : (item.genre || "Música con IA");
          row.querySelector("button").addEventListener("click", () => removeItem(kind, item));
          list.appendChild(row);
        });
      };
      build("adminWallpaperList", adminCatalog.wallpapers, "wallpaper");
      build("adminMusicList", adminCatalog.music, "music");
      build("adminDealList", adminCatalog.deals || [], "deal");
    }

    async function removeItem(kind, item) {
      if (!confirm(`¿Eliminar "${item.title}" de la página?`)) return;
      try {
        setAdminStatus("Eliminando…");
        await saveCatalog(c => {
          const key = kind === "wallpaper" ? "wallpapers" : kind === "deal" ? "deals" : "music"; c[key] = c[key] || [];
          c[key] = c[key].filter(x => x.id !== item.id);
        }, `Eliminar ${item.title}`);
        const files = kind === "wallpaper" ? [item.image, item.thumb] : kind === "deal" ? [item.image] : [item.audio, item.cover];
        for (const f of files) { if (f && f.startsWith("assets/")) { try { await deleteFile(f, `Eliminar ${item.title}`); } catch (e) {} } }
        renderAdminLists();
        setAdminStatus("Eliminado. Desaparecerá de la página en 1–2 minutos.");
      } catch (e) { setAdminStatus("No se pudo eliminar: " + e.message); }
    }

    async function refreshAdmin() {
      if (!getToken()) { switchTab("settings"); setAdminStatus("Primero conecta tu token de GitHub (solo una vez en este dispositivo)."); return; }
      try { setAdminStatus("Leyendo catálogo…"); await loadAdminCatalog(); renderAdminLists(); setAdminStatus("Panel listo."); }
      catch (e) { switchTab("settings"); setAdminStatus(e.message); }
    }

    // Cinco toques en el logotipo abren el acceso privado
    document.querySelectorAll(".admin-logo").forEach(logo => {
      logo.addEventListener("click", event => {
        event.preventDefault();
        logoTapCount++;
        clearTimeout(logoTapTimer);
        logoTapTimer = setTimeout(() => { logoTapCount = 0; }, 1800);
        if (logoTapCount >= 5) {
          logoTapCount = 0;
          document.getElementById("adminPassword").value = "";
          document.getElementById("adminLoginError").style.display = "none";
          openOverlay("adminLogin");
          setTimeout(() => document.getElementById("adminPassword").focus(), 50);
        } else if (logoTapCount === 1) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
    document.querySelectorAll("[data-close-admin]").forEach(b => b.addEventListener("click", closeOverlays));
    document.querySelectorAll(".admin-overlay").forEach(o => o.addEventListener("click", e => { if (e.target === o) closeOverlays(); }));
    document.addEventListener("keydown", e => { if (e.key === "Escape") { closeOverlays(); closePreview(); } });

    document.getElementById("adminLoginForm").addEventListener("submit", async e => {
      e.preventDefault();
      const errorEl = document.getElementById("adminLoginError");
      if (document.getElementById("adminPassword").value !== ADMIN_PASSWORD) {
        errorEl.textContent = "Contraseña incorrecta."; errorEl.style.display = "block"; return;
      }
      closeOverlays(); openOverlay("adminPanel"); switchTab("wallpapers");
      checkLegacy();
      await refreshAdmin();
    });

    document.querySelectorAll("[data-admin-tab]").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.adminTab)));

    document.getElementById("saveToken").addEventListener("click", async () => {
      const v = document.getElementById("ghToken").value.trim();
      if (!v) { setAdminStatus("Pega primero tu token."); return; }
      setToken(v); ghBranch = null;
      try {
        setAdminStatus("Probando conexión…");
        await getBranch(); await loadAdminCatalog(); renderAdminLists();
        document.getElementById("ghToken").value = "";
        switchTab("wallpapers"); setAdminStatus("Conectado correctamente. Ya puedes publicar.");
      } catch (e) { setToken(""); setAdminStatus("No se pudo conectar: " + e.message); }
    });
    document.getElementById("clearToken").addEventListener("click", () => { setToken(""); ghBranch = null; setAdminStatus("Token eliminado de este dispositivo."); });

    document.getElementById("wallpaperForm").addEventListener("submit", async e => {
      e.preventDefault();
      const form = e.currentTarget, btn = form.querySelector("button[type=submit]");
      const data = new FormData(form), file = data.get("image");
      if (!getToken()) { switchTab("settings"); setAdminStatus("Conecta primero tu token de GitHub."); return; }
      if (!file || !file.type.startsWith("image/")) { setAdminStatus("Selecciona una imagen válida."); return; }
      if (file.size > 20 * 1024 * 1024) { setAdminStatus("La imagen supera 20 MB."); return; }
      btn.disabled = true;
      try {
        const title = String(data.get("title")).trim();
        const id = Date.now().toString(36), base = `assets/wallpapers/${id}-${slugify(title)}`;
        const imgPath = `${base}.${fileExt(file, "jpg")}`;
        setAdminStatus("Preparando imagen…");
        const thumbBlob = await makeThumb(file, 600);
        setAdminStatus("Subiendo imagen (1/3)…");
        await putFile(imgPath, await blobToBase64(file), `Agregar wallpaper ${title}`);
        let thumbPath = imgPath;
        if (thumbBlob) {
          setAdminStatus("Subiendo miniatura (2/3)…");
          thumbPath = `${base}-thumb.jpg`;
          await putFile(thumbPath, await blobToBase64(thumbBlob), `Miniatura ${title}`);
        }
        setAdminStatus("Actualizando catálogo (3/3)…");
        await saveCatalog(c => c.wallpapers.unshift({
          id, title, category: data.get("category"), quality: data.get("quality"),
          description: String(data.get("description") || "").trim(), image: imgPath, thumb: thumbPath
        }), `Catálogo: ${title}`);
        form.reset(); renderAdminLists();
        setAdminStatus("¡Publicado! Aparecerá en la página en 1–2 minutos (recarga para verlo).");
      } catch (err) { setAdminStatus("No se pudo publicar: " + err.message); }
      btn.disabled = false;
    });

    document.getElementById("musicForm").addEventListener("submit", async e => {
      e.preventDefault();
      const form = e.currentTarget, btn = form.querySelector("button[type=submit]");
      const data = new FormData(form), audioFile = data.get("audio"), coverFile = data.get("cover");
      if (!getToken()) { switchTab("settings"); setAdminStatus("Conecta primero tu token de GitHub."); return; }
      if (!audioFile || !audioFile.type.startsWith("audio/")) { setAdminStatus("Selecciona un audio válido."); return; }
      if (!coverFile || !coverFile.type.startsWith("image/")) { setAdminStatus("Selecciona una portada válida."); return; }
      if (audioFile.size > 30 * 1024 * 1024) { setAdminStatus("El audio supera 30 MB."); return; }
      btn.disabled = true;
      try {
        const title = String(data.get("title")).trim();
        const id = Date.now().toString(36), base = `assets/music/${id}-${slugify(title)}`;
        const audioPath = `${base}.${fileExt(audioFile, "mp3")}`, coverPath = `${base}-cover.jpg`;
        setAdminStatus("Preparando portada…");
        const coverBlob = (await makeThumb(coverFile, 700)) || coverFile;
        setAdminStatus("Subiendo audio (1/3)…");
        await putFile(audioPath, await blobToBase64(audioFile), `Agregar pista ${title}`);
        setAdminStatus("Subiendo portada (2/3)…");
        await putFile(coverPath, await blobToBase64(coverBlob), `Portada ${title}`);
        setAdminStatus("Actualizando catálogo (3/3)…");
        await saveCatalog(c => c.music.unshift({ id, title, genre: String(data.get("genre")).trim(), audio: audioPath, cover: coverPath }), `Catálogo: ${title}`);
        form.reset(); renderAdminLists();
        setAdminStatus("¡Publicada! Aparecerá en la página en 1–2 minutos (recarga para verla).");
      } catch (err) { setAdminStatus("No se pudo publicar: " + err.message); }
      btn.disabled = false;
    });

    document.getElementById("dealForm").addEventListener("submit", async e => {
      e.preventDefault();
      const form = e.currentTarget, btn = form.querySelector("button[type=submit]");
      const data = new FormData(form), file = data.get("image");
      if (!getToken()) { switchTab("settings"); setAdminStatus("Conecta primero tu token de GitHub."); return; }
      const url = String(data.get("url")).trim();
      if (!/^https?:\/\//i.test(url)) { setAdminStatus("El enlace debe empezar con https://"); return; }
      btn.disabled = true;
      try {
        const title = String(data.get("title")).trim();
        const id = Date.now().toString(36);
        let imgPath = "";
        if (file && file.size && file.type.startsWith("image/")) {
          setAdminStatus("Subiendo imagen (1/2)…");
          const blob = (await makeThumb(file, 400)) || file;
          imgPath = "assets/deals/" + id + "-" + slugify(title) + ".jpg";
          await putFile(imgPath, await blobToBase64(blob), "Imagen oferta " + title);
        }
        setAdminStatus("Actualizando catálogo…");
        await saveCatalog(c => { c.deals = c.deals || []; c.deals.unshift({ id, title, badge: String(data.get("badge") || "").trim(), description: String(data.get("description") || "").trim(), code: String(data.get("code") || "").trim(), url, image: imgPath }); }, "Oferta: " + title);
        form.reset(); renderAdminLists();
        setAdminStatus("¡Publicada! Aparecerá en la sección Ofertas en 1–2 minutos.");
      } catch (err) { setAdminStatus("No se pudo publicar: " + err.message); }
      btn.disabled = false;
    });

    // ===== Rescate: lo que se guardó solo en este navegador (versión local anterior) =====
    function openLegacyDB() {
      return new Promise(resolve => {
        if (!("indexedDB" in window)) { resolve(null); return; }
        const req = indexedDB.open("vincelsLocalAdmin");
        req.onerror = () => resolve(null);
        req.onsuccess = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains("media")) { db.close(); try { indexedDB.deleteDatabase("vincelsLocalAdmin"); } catch (e) {} resolve(null); return; }
          resolve(db);
        };
      });
    }
    function legacyAll(db) {
      return new Promise((res, rej) => {
        const r = db.transaction("media", "readonly").objectStore("media").getAll();
        r.onsuccess = () => res(r.result || []);
        r.onerror = () => rej(r.error);
      });
    }
    function legacyDelete(db, id) {
      return new Promise(res => {
        const tx = db.transaction("media", "readwrite");
        tx.objectStore("media").delete(id);
        tx.oncomplete = () => res();
        tx.onerror = () => res();
      });
    }
    async function checkLegacy() {
      const box = document.getElementById("legacyBox");
      try {
        const db = await openLegacyDB();
        if (!db) { box.style.display = "none"; return; }
        const rows = await legacyAll(db);
        db.close();
        const w = rows.filter(r => r.kind === "wallpaper").length, m = rows.filter(r => r.kind === "music").length;
        if (!w && !m) { box.style.display = "none"; return; }
        document.getElementById("legacyText").textContent = "Encontré " + w + " wallpaper(s) y " + m + " pista(s) guardados solo en este navegador (versión anterior). Publícalos para que los vea todo el mundo.";
        box.style.display = "block";
      } catch (e) { box.style.display = "none"; }
    }
    async function dataUrlToBlob(u) { const r = await fetch(u); return r.blob(); }
    function extFromType(t, fb) {
      const map = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/wav": "wav", "audio/x-wav": "wav", "audio/ogg": "ogg", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/aac": "aac", "audio/webm": "webm" };
      return map[t] || fb;
    }
    document.getElementById("legacyPublish").addEventListener("click", async e => {
      const btn = e.currentTarget;
      if (!getToken()) { switchTab("settings"); setAdminStatus("Conecta primero tu token de GitHub y luego toca «Publicar guardados en la página»."); return; }
      btn.disabled = true;
      let done = 0, failed = 0, lastErr = "";
      let db = null;
      try {
        db = await openLegacyDB();
        const rows = db ? await legacyAll(db) : [];
        const total = rows.length;
        for (let n = 0; n < total; n++) {
          const item = rows[n];
          setAdminStatus("Publicando " + (n + 1) + " de " + total + ": " + item.title + "…");
          try {
            const id = Date.now().toString(36) + n;
            if (item.kind === "wallpaper") {
              const blob = await dataUrlToBlob(item.image);
              const base = "assets/wallpapers/" + id + "-" + slugify(item.title);
              const imgPath = base + "." + extFromType(blob.type, "jpg");
              const thumbBlob = await makeThumb(blob, 600);
              await putFile(imgPath, await blobToBase64(blob), "Agregar wallpaper " + item.title);
              let thumbPath = imgPath;
              if (thumbBlob) { thumbPath = base + "-thumb.jpg"; await putFile(thumbPath, await blobToBase64(thumbBlob), "Miniatura " + item.title); }
              await saveCatalog(c => c.wallpapers.unshift({ id, title: item.title, category: item.category, quality: item.quality, description: item.description || "", image: imgPath, thumb: thumbPath }), "Catálogo: " + item.title);
            } else if (item.kind === "music") {
              const audioBlob = await dataUrlToBlob(item.audio);
              const coverRaw = await dataUrlToBlob(item.cover);
              const base = "assets/music/" + id + "-" + slugify(item.title);
              const audioPath = base + "." + extFromType(audioBlob.type, "mp3"), coverPath = base + "-cover.jpg";
              const coverBlob = (await makeThumb(coverRaw, 700)) || coverRaw;
              await putFile(audioPath, await blobToBase64(audioBlob), "Agregar pista " + item.title);
              await putFile(coverPath, await blobToBase64(coverBlob), "Portada " + item.title);
              await saveCatalog(c => c.music.unshift({ id, title: item.title, genre: item.genre || "", audio: audioPath, cover: coverPath }), "Catálogo: " + item.title);
            } else { continue; }
            await legacyDelete(db, item.id);
            done++;
          } catch (err) { failed++; lastErr = err.message; }
        }
      } catch (err) { failed++; lastErr = err.message; }
      if (db) db.close();
      renderAdminLists();
      await checkLegacy();
      setAdminStatus(failed ? ("Se publicaron " + done + ". Fallaron " + failed + ": " + lastErr + " (lo que falló sigue guardado, puedes reintentar).") : ("¡Listo! Se publicaron " + done + ". Aparecerán en la página en 1–2 minutos."));
      btn.disabled = false;
    });


    /* ===== Catálogo público: lo leen todos los visitantes ===== */
    function renderAll() { renderWallpapers(); renderChips(); renderHero(); renderCatSheet(); renderMusicList(); renderDeals(); updateMusicUI(); }
    async function loadPublicCatalog() {
      try {
        const res = await fetch("catalog.json?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const d = await res.json();
        const sig = JSON.stringify([d.wallpapers || [], d.music || [], d.deals || []]);
        if (!catalogLoaded || sig !== catalogSig) {
          catalogSig = sig;
          localWallpapers = Array.isArray(d.wallpapers) ? d.wallpapers : [];
          localMusic = Array.isArray(d.music) ? d.music : [];
          localDeals = Array.isArray(d.deals) ? d.deals : [];
          catalogLoaded = true;
          renderAll();
        }
        return true;
      } catch (e) {
        if (!catalogLoaded) { catalogLoaded = true; renderAll(); }
        return false;
      }
    }
    document.addEventListener("visibilitychange", () => { if (!document.hidden) loadPublicCatalog(); });
    $("musicRefresh").addEventListener("click", async e => {
      const btn = e.currentTarget;
      btn.classList.remove("spin"); void btn.offsetWidth; btn.classList.add("spin");
      const ok = await loadPublicCatalog();
      const s = $("listStatus");
      s.textContent = ok ? "Lista actualizada." : "No se pudo actualizar. Revisa tu conexión.";
      setTimeout(() => { s.textContent = ""; }, 2500);
    });

    /* Acceso privado alternativo: agrega #admin al final de la dirección */
    function openAdminFromHash() {
      if (location.hash !== "#admin") return;
      document.getElementById("adminPassword").value = "";
      document.getElementById("adminLoginError").style.display = "none";
      openOverlay("adminLogin");
      setTimeout(() => document.getElementById("adminPassword").focus(), 50);
    }
    window.addEventListener("hashchange", openAdminFromHash);

    $("year").textContent = new Date().getFullYear();
    renderAll();
    loadPublicCatalog();
    openAdminFromHash();
;window.__vincelsOK = true;
