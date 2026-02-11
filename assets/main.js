const DATA = {
  profile: "./data/profile.json",
  courses: "./data/courses.json",
  certs: "./data/certs.json",
  projects: "./data/projects.json",
  publications: "./data/publications.json"
};

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return await res.json();
}

function initTheme() {
  document.documentElement.dataset.theme = "dark";
}

function initNavHighlight() {
  const links = qsa(".site-nav a");
  const idToLink = new Map();
  for (const a of links) {
    const href = a.getAttribute("href") || "";
    if (href.startsWith("#")) idToLink.set(href.slice(1), a);
  }

  const sections = qsa("main section[id]");
  const obs = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      for (const a of links) a.dataset.active = "false";
      const active = idToLink.get(id);
      if (active) active.dataset.active = "true";
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: [0.1, 0.2, 0.35, 0.5] }
  );
  for (const s of sections) obs.observe(s);
}

function initTouchCardGlow() {
  const prefersTouch =
    (globalThis.matchMedia && (matchMedia("(hover: none)").matches || matchMedia("(pointer: coarse)").matches)) || false;
  if (!prefersTouch) return;

  let activeCard = null;
  let clearTimer = null;

  function setActive(next) {
    if (activeCard && activeCard !== next) activeCard.classList.remove("is-active");
    activeCard = next;
    if (activeCard) activeCard.classList.add("is-active");
  }

  function scheduleClear() {
    if (clearTimer) clearTimeout(clearTimer);
    clearTimer = setTimeout(() => setActive(null), 280);
  }

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType !== "touch") return;
      const card = e.target?.closest?.(".card-module");
      if (card) setActive(card);
      else setActive(null);
    },
    { passive: true, capture: true }
  );
  document.addEventListener(
    "pointerup",
    (e) => {
      if (e.pointerType !== "touch") return;
      scheduleClear();
    },
    { passive: true, capture: true }
  );
  document.addEventListener(
    "pointercancel",
    (e) => {
      if (e.pointerType !== "touch") return;
      scheduleClear();
    },
    { passive: true, capture: true }
  );

  document.addEventListener(
    "touchstart",
    (e) => {
      const card = e.target?.closest?.(".card-module");
      if (card) setActive(card);
    },
    { passive: true, capture: true }
  );
  document.addEventListener(
    "touchend",
    () => {
      scheduleClear();
    },
    { passive: true, capture: true }
  );
  document.addEventListener(
    "touchcancel",
    () => {
      scheduleClear();
    },
    { passive: true, capture: true }
  );
}

function setPageIdentity(profile) {
  const name = profile?.name || "HuanxueL";
  document.title = name;
  const footerLeft = qs("#footerLeft");
  if (footerLeft) footerLeft.innerHTML = `© <span id="yearSlot"></span> ${escapeHtml(name)}`;
  const yearSlot = qs("#yearSlot");
  if (yearSlot) yearSlot.textContent = String(new Date().getFullYear());
}

function renderAbout(profile) {
  const avatarEl = qs("#avatarSlot");
  const avatarUrl = String(profile?.avatar || "").trim();
  if (avatarEl) {
    if (avatarUrl) {
      avatarEl.style.backgroundImage = `url("${avatarUrl.replaceAll('"', "%22")}")`;
      avatarEl.dataset.hasAvatar = "true";
    } else {
      avatarEl.style.backgroundImage = "";
      avatarEl.dataset.hasAvatar = "false";
    }
  }

  qs("#nameSlot").textContent = profile.name || "—";
  qs("#headlineSlot").textContent = profile.headline || "";
  qs("#locationSlot").textContent = profile.location || "";

  const email = (Array.isArray(profile.contact) ? profile.contact : []).find((c) => String(c?.type || "").toLowerCase() === "email")?.value || "";
  const emailSlot = qs("#emailSlot");
  if (emailSlot) {
    emailSlot.innerHTML = email ? `<a class="link" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : "";
  }

  const tags = Array.isArray(profile.tags) ? profile.tags : [];
  qs("#tagsSlot").innerHTML = tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");

  const summary = Array.isArray(profile.summary) ? profile.summary : [];
  qs("#summarySlot").innerHTML = summary.map((p) => `<div>${escapeHtml(p)}</div>`).join("");

  const links = Array.isArray(profile.links) ? profile.links : [];
  qs("#quickLinksSlot").innerHTML = links
    .map((l) => `<a class="link" href="${escapeHtml(l.url || "#")}" target="_blank" rel="noreferrer">${escapeHtml(l.label || "Link")}</a>`)
    .join("");
}

function renderEducation(profile) {
  const items = Array.isArray(profile.education) ? profile.education : [];
  const root = qs("#educationList");
  root.innerHTML = items
    .map((e) => {
      const titleParts = [e.school, e.degree, e.field].filter(Boolean);
      const timeParts = [e.start, e.end].filter(Boolean);
      const metaParts = [timeParts.join(" – "), e.location].filter(Boolean);
      const details = Array.isArray(e.details) ? e.details : [];
      const links = Array.isArray(e.links) ? e.links : [];
      return `
        <div class="row-item">
          <div class="row">
            <div>
              <div class="item-title">${escapeHtml(titleParts.join(" · "))}</div>
              <div class="item-meta">${escapeHtml(metaParts.join(" · "))}</div>
            </div>
            <div class="project-links">
              ${links
                .map((l) => `<a class="link" href="${escapeHtml(l.url || "#")}" target="_blank" rel="noreferrer">${escapeHtml(l.label || "Link")}</a>`)
                .join("")}
            </div>
          </div>
          ${details.length ? `<div class="item-desc">${details.map((d) => `<div>• ${escapeHtml(d)}</div>`).join("")}</div>` : ""}
        </div>
      `;
    })
    .join("");
}

function collectTags(items, pick) {
  const set = new Set();
  for (const it of items) {
    const tags = pick(it);
    if (!Array.isArray(tags)) continue;
    for (const t of tags) {
      const s = String(t || "").trim();
      if (s) set.add(s);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function renderChips(rootEl, tags, state, onToggle) {
  rootEl.innerHTML = [`<button class="chip" data-tag="__all" data-active="${state.size === 0}">All</button>`]
    .concat(tags.map((t) => `<button class="chip" data-tag="${escapeHtml(t)}" data-active="${state.has(t)}">${escapeHtml(t)}</button>`))
    .join("");
  rootEl.addEventListener("click", (e) => {
    const btn = e.target?.closest?.("button[data-tag]");
    if (!btn) return;
    const tag = btn.dataset.tag;
    if (tag === "__all") {
      state.clear();
    } else if (state.has(tag)) {
      state.delete(tag);
    } else {
      state.add(tag);
    }
    onToggle();
  });
}

function makeFilterFn(tagState, query, pickText, pickTags) {
  const q = String(query || "").trim().toLowerCase();
  return (it) => {
    if (q) {
      const t = pickText(it).toLowerCase();
      if (!t.includes(q)) return false;
    }
    if (tagState.size === 0) return true;
    const tags = pickTags(it);
    if (!Array.isArray(tags) || tags.length === 0) return false;
    return tags.some((t) => tagState.has(String(t)));
  };
}

function renderCourses(data) {
  const items = Array.isArray(data.items) ? data.items : [];
  const tags = collectTags(items, (c) => c.tags);
  const tagState = new Set();
  const chipsRoot = qs("#coursesChips");
  const listRoot = qs("#coursesList");
  const search = qs("#coursesSearch");

  const render = () => {
    const filterFn = makeFilterFn(
      tagState,
      search.value,
      (c) => `${c.title || ""} ${c.provider || ""} ${(c.tags || []).join(" ")}`,
      (c) => c.tags
    );
    const filtered = items.filter(filterFn);
    listRoot.innerHTML = filtered
      .map((c) => {
        const meta = [c.provider, c.term].filter(Boolean).join(" · ");
        const url = c.url || "";
        const title = escapeHtml(c.title || "Course");
        return `
          <div class="row-item">
            <div class="row">
              <div>
                <div class="item-title">${url ? `<a class="link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${title}</a>` : title}</div>
                <div class="item-meta">${escapeHtml(meta)}</div>
              </div>
              <div class="about-tags">${(Array.isArray(c.tags) ? c.tags : []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
            </div>
          </div>
        `;
      })
      .join("");
    for (const btn of qsa("#coursesChips .chip")) {
      const t = btn.dataset.tag;
      btn.dataset.active = t === "__all" ? String(tagState.size === 0) : String(tagState.has(t));
    }
  };

  renderChips(chipsRoot, tags, tagState, render);
  search.addEventListener("input", render);
  render();
}

function renderCerts(data) {
  const items = Array.isArray(data.items) ? data.items : [];
  const root = qs("#certsList");
  root.innerHTML = items
    .map((c) => {
      const meta = [c.issuer, c.date].filter(Boolean).join(" · ");
      const title = escapeHtml(c.title || "Certificate");
      const url = c.url || "";
      return `
        <div class="row-item">
          <div class="row">
            <div>
              <div class="item-title">${url ? `<a class="link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${title}</a>` : title}</div>
              <div class="item-meta">${escapeHtml(meta)}</div>
            </div>
            <div class="about-tags">${(Array.isArray(c.tags) ? c.tags : []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderProjects(data) {
  const items = Array.isArray(data.items) ? data.items : [];
  const tags = collectTags(items, (p) => p.tags);
  const tagState = new Set();
  const chipsRoot = qs("#projectsChips");
  const listRoot = qs("#projectsGrid");
  const search = qs("#projectsSearch");

  const render = () => {
    const filterFn = makeFilterFn(
      tagState,
      search.value,
      (p) => `${p.title || ""} ${p.subtitle || ""} ${p.description || ""} ${(p.tags || []).join(" ")}`,
      (p) => p.tags
    );
    const filtered = items.filter(filterFn);
    listRoot.innerHTML = filtered
      .map((p) => {
        const title = escapeHtml(p.title || "Project");
        const subtitle = escapeHtml(p.subtitle || "");
        const desc = escapeHtml(p.description || "");
        const tagsHtml = (Array.isArray(p.tags) ? p.tags : []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
        const linksHtml = (Array.isArray(p.links) ? p.links : [])
          .map((l) => `<a class="link" href="${escapeHtml(l.url || "#")}" target="_blank" rel="noreferrer">${escapeHtml(l.label || "Link")}</a>`)
          .join("");
        return `
          <article class="row-item">
            <div class="row">
              <div>
                <div class="item-title">${title}</div>
                ${subtitle ? `<div class="item-meta">${subtitle}</div>` : ""}
              </div>
              <div class="project-links">${linksHtml}</div>
            </div>
            ${desc ? `<div class="item-desc">${desc}</div>` : ""}
            <div class="project-tags">${tagsHtml}</div>
          </article>
        `;
      })
      .join("");
    for (const btn of qsa("#projectsChips .chip")) {
      const t = btn.dataset.tag;
      btn.dataset.active = t === "__all" ? String(tagState.size === 0) : String(tagState.has(t));
    }
  };

  renderChips(chipsRoot, tags, tagState, render);
  search.addEventListener("input", render);
  render();
}

function formatAuthors(authors) {
  const arr = Array.isArray(authors) ? authors : [];
  return arr.filter(Boolean).join(", ");
}

function renderPublications(data) {
  const items = Array.isArray(data.items) ? data.items : [];
  const tags = collectTags(items, (p) => p.tags);
  const tagState = new Set();
  const chipsRoot = qs("#pubsChips");
  const listRoot = qs("#pubsList");
  const search = qs("#pubsSearch");

  const render = () => {
    const filterFn = makeFilterFn(
      tagState,
      search.value,
      (p) => `${p.title || ""} ${formatAuthors(p.authors)} ${p.venue || ""} ${(p.tags || []).join(" ")}`,
      (p) => p.tags
    );
    const filtered = items.filter(filterFn).sort((a, b) => (b.year || 0) - (a.year || 0));
    listRoot.innerHTML = filtered
      .map((p) => {
        const title = escapeHtml(p.title || "Publication");
        const authors = escapeHtml(formatAuthors(p.authors));
        const meta = [p.venue, p.year].filter(Boolean).join(" · ");
        const linksHtml = (Array.isArray(p.links) ? p.links : [])
          .map((l) => `<a class="link" href="${escapeHtml(l.url || "#")}" target="_blank" rel="noreferrer">${escapeHtml(l.label || "Link")}</a>`)
          .join(" ");
        return `
          <div class="row-item">
            <div class="row">
              <div>
                <div class="item-title">${title}</div>
                <div class="item-meta">${authors}</div>
                <div class="item-meta">${escapeHtml(meta)}</div>
              </div>
              <div class="project-links">${linksHtml}</div>
            </div>
            <div class="project-tags">${(Array.isArray(p.tags) ? p.tags : []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
          </div>
        `;
      })
      .join("");
    for (const btn of qsa("#pubsChips .chip")) {
      const t = btn.dataset.tag;
      btn.dataset.active = t === "__all" ? String(tagState.size === 0) : String(tagState.has(t));
    }
  };

  renderChips(chipsRoot, tags, tagState, render);
  search.addEventListener("input", render);
  render();
}

function renderReading(data) {
  const items = Array.isArray(data.items) ? data.items : [];
  const tags = collectTags(items, (r) => [r.category, r.status].filter(Boolean).concat(r.tags || []));
  const tagState = new Set();
  const chipsRoot = qs("#readingChips");
  const listRoot = qs("#readingList");
  const search = qs("#readingSearch");

  const render = () => {
    const filterFn = makeFilterFn(
      tagState,
      search.value,
      (r) => `${r.title || ""} ${(r.authors || []).join(" ")} ${r.category || ""} ${r.status || ""} ${(r.tags || []).join(" ")}`,
      (r) => [r.category, r.status].filter(Boolean).concat(r.tags || [])
    );
    const filtered = items.filter(filterFn).sort((a, b) => (b.year || 0) - (a.year || 0));
    listRoot.innerHTML = filtered
      .map((r) => {
        const title = escapeHtml(r.title || "Item");
        const meta = [r.type, r.category, r.status, r.year].filter(Boolean).join(" · ");
        const authors = escapeHtml((Array.isArray(r.authors) ? r.authors : []).filter(Boolean).join(", "));
        const links = [
          r.url ? { label: "Link", url: r.url } : null,
          r.notes ? { label: "Notes", url: r.notes } : null
        ].filter(Boolean);
        return `
          <div class="row-item">
            <div class="row">
              <div>
                <div class="item-title">${title}</div>
                ${authors ? `<div class="item-meta">${authors}</div>` : ""}
                <div class="item-meta">${escapeHtml(meta)}</div>
              </div>
              <div class="project-links">
                ${links
                  .map((l) => `<a class="link" href="${escapeHtml(l.url || "#")}" target="_blank" rel="noreferrer">${escapeHtml(l.label || "Link")}</a>`)
                  .join(" ")}
              </div>
            </div>
            <div class="project-tags">${(Array.isArray(r.tags) ? r.tags : []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
          </div>
        `;
      })
      .join("");
    for (const btn of qsa("#readingChips .chip")) {
      const t = btn.dataset.tag;
      btn.dataset.active = t === "__all" ? String(tagState.size === 0) : String(tagState.has(t));
    }
  };

  renderChips(chipsRoot, tags, tagState, render);
  search.addEventListener("input", render);
  render();
}

function renderContact(profile) {
  const items = Array.isArray(profile.contact) ? profile.contact : [];
  const root = qs("#contactGrid");
  root.innerHTML = items
    .map((c) => {
      const title = escapeHtml(c.label || c.type || "Contact");
      const value = escapeHtml(c.value || "");
      const url = c.url || "";
      const type = escapeHtml(c.type || "");
      return `
        <div class="contact-item" data-contact-type="${type}">
          <div class="item-title">${title}</div>
          <div class="item-meta">${url ? `<a class="link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${value || escapeHtml(url)}</a>` : value}</div>
        </div>
      `;
    })
    .join("");
}

async function main() {
  initTheme();
  initNavHighlight();
  initTouchCardGlow();

  const [rawProfile, courses, certs, projects, publications] = await Promise.all([
    fetchJson(DATA.profile),
    fetchJson(DATA.courses),
    fetchJson(DATA.certs),
    fetchJson(DATA.projects),
    fetchJson(DATA.publications)
  ]);
  const profile = rawProfile;
  setPageIdentity(profile);

  renderAbout(profile);
  renderEducation(profile);
  renderCourses(courses);
  renderCerts(certs);
  renderProjects(projects);
  renderPublications(publications);
  renderContact(profile);
}

main().catch((err) => {
  const msg = escapeHtml(err?.message || String(err));
  const target = qs("#contactGrid") || qs("#pubsList") || qs("#projectsGrid") || qs("#coursesList") || qs("#educationList");
  if (target) target.insertAdjacentHTML("afterbegin", `<div class="muted">${msg}</div>`);
});
