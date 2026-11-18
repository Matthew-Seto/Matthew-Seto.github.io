(() => {
  "use strict";

  const SITE = window.SITE || {};
  const FEED = window.FEED || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ------------------------------------------------------------------ *
   * Fill simple site fields
   * ------------------------------------------------------------------ */
  $$("[data-site]").forEach((el) => {
    const v = SITE[el.dataset.site];
    if (v != null) el.textContent = v;
  });
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  const bio = $("[data-bio]");
  if (bio && SITE.bio) {
    bio.innerHTML = SITE.bio.join(" ").split(/(\*[^*]+\*)/).map((part) =>
      part.startsWith("*") ? `<strong>${esc(part.slice(1, -1))}</strong>` : esc(part)
    ).join("");
  }

  /* ------------------------------------------------------------------ *
   * Live clock
   * ------------------------------------------------------------------ */
  const clock = $("[data-clock]");
  const fmtOpts = { hour: "2-digit", minute: "2-digit", hourCycle: "h23" };
  let fmt;
  try { fmt = new Intl.DateTimeFormat("en-GB", { ...fmtOpts, timeZone: SITE.timeZone || undefined }); }
  catch { console.warn(`Unknown timeZone "${SITE.timeZone}" — using visitor's local time.`); fmt = new Intl.DateTimeFormat("en-GB", fmtOpts); }
  const tick = () => {
    const [h, m] = fmt.format(new Date()).split(":");
    clock.innerHTML = `${h}<span class="sep">:</span>${m}`;
  };
  if (clock) { tick(); setInterval(tick, 10_000); }

  /* ------------------------------------------------------------------ *
   * Hero headline: split into words for intro + scroll scrub
   * ------------------------------------------------------------------ */
  const hero = $("[data-scrub]");
  const heroWords = [];
  if (hero) {
    let i = 0;
    [...hero.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(" ")); return; }
          const s = document.createElement("span");
          s.className = "w";
          s.textContent = tok;
          s.style.setProperty("--i", i++);
          heroWords.push(s);
          frag.appendChild(s);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.style.setProperty("--i", i++);
      }
    });
  }

  const scrubHero = () => {
    if (!hero || !heroWords.length) return;
    if (reduced) { heroWords.forEach((w) => w.classList.add("on")); return; }
    const vh = innerHeight;
    const rect = hero.getBoundingClientRect();
    const absBottom = rect.bottom + scrollY;
    const span = Math.max(vh * 0.6, absBottom - vh * 0.3);
    const p = Math.min(1, Math.max(0, 0.22 + 0.78 * (scrollY / span)));
    const lit = Math.round(p * heroWords.length);
    heroWords.forEach((w, idx) => w.classList.toggle("on", idx < lit));
  };

  /* ------------------------------------------------------------------ *
   * Feed: filters + cards
   * ------------------------------------------------------------------ */
  const grid = $("[data-grid]");
  const filtersEl = $("[data-filters]");

  const icons = {
    play: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M6 4l14 8-14 8z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 21s-8-5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 6-8 11-8 11z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M14 4l7 7-7 7v-4c-6 0-9 2-11 6 1-7 4-11 11-12z"/></svg>',
  };

  const igURL = (item) => `https://www.instagram.com/reel/${encodeURIComponent(item.instagram)}/`;

  const mediaHTML = (item, { controls = false } = {}) => {
    // In the popup, Instagram reels play through Instagram's official embed player.
    if (controls && item.instagram) {
      return `<iframe src="${igURL(item)}embed/" title="${esc(item.title)} on Instagram" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; clipboard-write" allowfullscreen scrolling="no"></iframe>`;
    }
    if (item.video) {
      return `<video src="${esc(item.video)}" ${item.poster ? `poster="${esc(item.poster)}"` : ""} muted loop playsinline preload="metadata" ${controls ? "controls autoplay" : ""}></video>`;
    }
    if (item.poster) {
      return `<img src="${esc(item.poster)}" alt="${esc(item.title)}" loading="lazy" decoding="async" />
        <span class="ui__play ui__play--poster">${icons.play}</span>`;
    }
    const [t1, t2] = item.tones || ["#ddd", "#999"];
    return `
      <div class="ph" style="--t1:${esc(t1)};--t2:${esc(t2)}">
        <span class="ph__blob"></span><span class="ph__blob ph__blob--2"></span><span class="ph__grain"></span>
      </div>
      <div class="ui">
        <span class="ui__play">${icons.play}</span>
        <div class="ui__rail"><span>${icons.heart}</span><span>${icons.chat}</span><span>${icons.share}</span></div>
        <div class="ui__caption"><i></i><i></i><i></i></div>
        <div class="ui__progress"><b></b></div>
      </div>`;
  };

  if (grid) {
    grid.innerHTML = FEED.map((item, idx) => `
      <button class="card" data-idx="${idx}" data-cat="${esc(item.category)}" data-aspect="${esc(item.aspect || "9/16")}" style="--ar:${esc(item.aspect || "9/16")}" aria-label="${esc(item.title)} for ${esc(item.brand)}">
        <span class="card__tag">${esc(item.handle ? "@" + item.handle : item.platform || item.category)}</span>
        ${item.views ? `<span class="card__views">${icons.play}${esc(item.views)}</span>` : ""}
        <div class="card__media">${mediaHTML(item)}</div>
        <div class="card__meta"><span class="card__title">${esc(item.title)}</span><time>${esc(item.date)}</time></div>
      </button>`).join("");

    // hover-to-play for real videos
    $$(".card", grid).forEach((card) => {
      const v = $("video", card);
      if (!v) return;
      card.addEventListener("mouseenter", () => v.play().catch(() => {}));
      card.addEventListener("mouseleave", () => v.pause());
    });
  }

  if (filtersEl) {
    const cats = ["All", ...new Set(FEED.map((f) => f.category))];
    const count = (c) => (c === "All" ? FEED.length : FEED.filter((f) => f.category === c).length);
    filtersEl.innerHTML = cats.map((c, i) =>
      `<button class="filter${i === 0 ? " is-active" : ""}" role="tab" aria-selected="${i === 0}" data-filter="${esc(c)}">${esc(c)}<sup>${count(c)}</sup></button>`
    ).join("");

    filtersEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn || btn.classList.contains("is-active")) return;
      $$(".filter", filtersEl).forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", b === btn); });
      applyFilter(btn.dataset.filter);
    });
  }

  function applyFilter(cat) {
    const cards = $$(".card", grid);
    cards.forEach((c) => c.classList.add("is-out"));
    setTimeout(() => {
      let n = 0;
      cards.forEach((c) => {
        const show = cat === "All" || c.dataset.cat === cat;
        c.classList.toggle("is-hidden", !show);
        c.classList.remove("in", "is-out");
        if (show) {
          c.style.setProperty("--d", `${Math.min(n++, 8) * 70}ms`);
        }
      });
      void grid.offsetHeight; // reflow so transitions replay
      cards.forEach((c) => { if (!c.classList.contains("is-hidden")) c.classList.add("in"); });
    }, reduced ? 0 : 320);
  }

  /* ------------------------------------------------------------------ *
   * Stats, brands, services, socials
   * ------------------------------------------------------------------ */
  const statsEl = $("[data-stats]");
  if (statsEl && SITE.stats) {
    statsEl.innerHTML = SITE.stats.map((s) => `
      <div class="stat" data-reveal>
        <span class="stat__num" data-count="${s.value}" data-dec="${s.decimals || 0}" data-suffix="${esc(s.suffix || "")}">0${esc(s.suffix || "")}</span>
        <span class="stat__label">${esc(s.label)}</span>
      </div>`).join("");
  }

  $$("[data-marquee]").forEach((m, mi) => {
    const list = SITE.brands || [];
    const ordered = mi % 2 ? [...list].reverse() : list;
    const html = ordered.map((b) => `<span class="brand">${esc(b)}</span>`).join("");
    $(".marquee__track", m).innerHTML = html + html; // duplicated for seamless loop
  });

  const svcEl = $("[data-services]");
  if (svcEl && SITE.services) {
    svcEl.innerHTML = SITE.services.map((s) => `
      <li class="svc__item" data-reveal>
        <button class="svc__head" aria-expanded="false">
          <span class="svc__num"></span>
          <span class="svc__title">${esc(s.title)}<span class="svc__plus" aria-hidden="true"></span></span>
        </button>
        <div class="svc__body"><div><div class="svc__inner"><span></span><div>
          <p>${esc(s.body)}</p>
          <div class="svc__tags">${(s.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        </div></div></div></div>
      </li>`).join("");
    svcEl.addEventListener("click", (e) => {
      const head = e.target.closest(".svc__head");
      if (!head) return;
      const item = head.parentElement;
      const open = !item.classList.contains("is-open");
      $$(".svc__item", svcEl).forEach((it) => { it.classList.remove("is-open"); $(".svc__head", it).setAttribute("aria-expanded", "false"); });
      item.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", String(open));
    });
  }

  const socialsEl = $("[data-socials]");
  if (socialsEl && SITE.socials) {
    socialsEl.innerHTML = SITE.socials.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join("");
  }

  /* ------------------------------------------------------------------ *
   * Reveal on scroll
   * ------------------------------------------------------------------ */
  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec, 10) || 0;
    const suffix = el.dataset.suffix || "";
    if (reduced) { el.textContent = target.toFixed(dec) + suffix; return; }
    const dur = 1800, t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k); // easeOutExpo
      el.textContent = (target * e).toFixed(dec) + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    let n = 0;
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      if (!el.classList.contains("card")) el.style.setProperty("--d", `${n * 90}ms`);
      else el.style.setProperty("--d", `${(n % 6) * 80}ms`);
      n++;
      el.classList.add("in");
      const num = $("[data-count]", el);
      if (num) setTimeout(() => countUp(num), n * 90);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  const startReveals = () => $$("[data-reveal], .card").forEach((el) => io.observe(el));

  /* ------------------------------------------------------------------ *
   * Nav: sticky state + active section indicator
   * ------------------------------------------------------------------ */
  const nav = $(".nav");
  const navInner = $(".nav__inner");
  const indicator = $(".nav__indicator");
  const links = $$(".nav__link");
  const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
  let activeLink = links[0];

  const moveIndicator = (link) => {
    if (!indicator || !link) return;
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
  };

  const updateNav = () => {
    if (!nav) return;
    nav.classList.toggle("is-stuck", nav.getBoundingClientRect().top <= 0 && scrollY > 10);
    const line = innerHeight * 0.4;
    let current = sections[0];
    sections.forEach((s) => { if (s.getBoundingClientRect().top < line) current = s; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1];
    const link = links.find((l) => l.getAttribute("href") === `#${current.id}`);
    if (link && link !== activeLink) {
      activeLink.classList.remove("is-active");
      link.classList.add("is-active");
      activeLink = link;
      moveIndicator(link);
      if (navInner.scrollWidth > navInner.clientWidth) {
        navInner.scrollTo({ left: link.offsetLeft - 40, behavior: "smooth" });
      }
    }
  };

  /* ------------------------------------------------------------------ *
   * Footer big-name parallax
   * ------------------------------------------------------------------ */
  const bigname = $(".bigname");
  const contact = $(".contact");
  const parallax = () => {
    if (!bigname || reduced) return;
    const r = contact.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, 1 - (r.bottom - innerHeight) / (r.height * 0.6)));
    bigname.style.setProperty("--py", `${(1 - p) * 40}%`);
  };

  /* ------------------------------------------------------------------ *
   * Scroll loop
   * ------------------------------------------------------------------ */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      scrubHero(); updateNav(); parallax();
      ticking = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { moveIndicator(activeLink); onScroll(); });

  /* ------------------------------------------------------------------ *
   * Custom cursor
   * ------------------------------------------------------------------ */
  const cursor = $(".cursor");
  if (cursor && finePointer && !reduced) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      cursor.classList.add("is-visible");
      const t = e.target;
      const onCard = t.closest && t.closest(".card");
      const onLink = !onCard && t.closest && t.closest("a, button");
      cursor.classList.toggle("is-play", !!onCard);
      cursor.classList.toggle("is-link", !!onLink);
    });
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));
    const loop = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ------------------------------------------------------------------ *
   * Modal
   * ------------------------------------------------------------------ */
  const modal = $("[data-modal]");
  let lastFocus = null;
  const openModal = (item) => {
    lastFocus = document.activeElement;
    const media = $("[data-modal-media]", modal);
    media.style.setProperty("--ar", item.aspect || "9/16");
    media.classList.toggle("modal__media--ig", !!item.instagram);
    media.innerHTML = mediaHTML(item, { controls: true });
    $("[data-modal-title]", modal).textContent = item.title;
    $("[data-modal-meta]", modal).textContent = [item.platform, item.date].filter(Boolean).join(" · ");
    $("[data-modal-brand]", modal).textContent = item.handle ? `@${item.handle} — ${item.category}` : `For ${item.brand} — ${item.category}`;
    const metrics = { ...(item.views ? { Views: item.views } : {}), ...(item.metrics || {}) };
    $("[data-modal-metrics]", modal).innerHTML = Object.entries(metrics).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
    const ext = $("[data-modal-link]", modal);
    if (ext) { ext.hidden = !item.instagram; if (item.instagram) ext.href = igURL(item); }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".modal__close", modal).focus({ preventScroll: true });
  };
  const closeModal = () => {
    if (!modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    const v = $("video", modal); if (v) v.pause();
    // remove embeds after the close animation so Instagram audio stops
    setTimeout(() => { if (!modal.classList.contains("is-open")) $("[data-modal-media]", modal).innerHTML = ""; }, 500);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
  grid && grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) openModal(FEED[+card.dataset.idx]);
  });
  modal && modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  /* ------------------------------------------------------------------ *
   * Copy email
   * ------------------------------------------------------------------ */
  const toast = $("[data-toast]");
  $$("[data-copy-email]").forEach((btn) => btn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(SITE.email); toast.textContent = "Email copied ✓"; }
    catch { location.href = `mailto:${SITE.email}`; return; }
    toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove("show"), 2200);
  }));

  /* ------------------------------------------------------------------ *
   * Boot: loader → page
   * ------------------------------------------------------------------ */
  const minDelay = reduced ? 0 : 1300;
  const t0 = performance.now();
  let booted = false;
  const boot = () => {
    if (booted) return; booted = true;
    window.__booted = true;
    const wait = Math.max(0, minDelay - (performance.now() - t0));
    setTimeout(() => {
      
      document.body.classList.add("is-loaded");
      moveIndicator(activeLink);
      onScroll();
      setTimeout(startReveals, reduced ? 0 : 450);
    }, wait);
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(boot);
  setTimeout(boot, 2500); // safety net
})();
