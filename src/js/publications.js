const query = {
    json: (url) => fetch(url).then(r => r.ok ? r.json() : null).catch(() => null),
    text: (url) => fetch(url).then(r => r.ok ? r.text() : '').catch(() => '')
};
const dataQuery = Promise.all([
    query.json('publications.json'),
    query.text('publications.bib')
]);

const parseBib = (bib) => Object.fromEntries(
    [...bib.matchAll(/@(\w+)\s*\{\s*([^,]+)\s*,([^@]*)/gs)].map(([, type, key, body]) => {
        const content = body.trim().replace(/\}$/, '').trim();
        return [key.trim(), `@${type}{${key.trim()},\n${content}\n}`];
    })
);

const mergeBibtex = (pubs, bibEntries) => pubs.map(p =>
    p.bibtex_key && bibEntries[p.bibtex_key]
        ? { ...p, bibtex: bibEntries[p.bibtex_key] }
        : p
);

const groupBy = (arr, keyFn) => arr.reduce((acc, item) => {
    const key = keyFn(item) ?? 'Unknown';
    (acc[key] ??= []).push(item);
    return acc;
}, {});

const sortedGroups = (obj) => Object.entries(obj).sort(([a], [b]) => b - a);
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const toId = (title) => title.replace(/[^a-zA-Z0-9]/g, '');
const maybeHtml = (cond, html) => cond ? html : '';
const icons = {
    copy: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>`,
    external: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
};

const renderSection = (title, groups, extra = '') => `
    <div class="section-header ${title === 'REPORTS' ? 'reports-header' : ''}">
        <h2>${title}</h2>${extra}
    </div>
    ${groups.map(([year, items]) => `
        <div class="year-group">
            <h3 class="year-header">${year}</h3>
            <div class="publications-list">${items.map(renderPub).join('')}</div>
        </div>
    `).join('')}`;

const renderPub = (pub) => {
    const id = toId(pub.title);
    const authorHtml = pub.authors.map(a => a === 'Sidharth P' ? `<strong>${a}</strong>` : a).join(', ');

    const links = [
        maybeHtml(pub.abstract, `<a href="#" class="toggle-tab" id="tab-abs-${id}" onclick="toggle(event,'abs','${id}')">Abstract</a>`),
        ...Object.entries(pub.links || {}).filter(([, url]) => url).map(([k, url]) =>
            `<a href="${url}" target="_blank" rel="noopener">${capitalize(k)}</a>`
        ),
        maybeHtml(pub.bibtex, `<a href="#" class="toggle-tab" id="tab-bib-${id}" onclick="toggle(event,'bib','${id}')">BibTeX</a>`)
    ].join('');

    return `
    <div class="publication-item">
        ${maybeHtml(pub.image, `<div class="pub-image"><img src="${pub.image}" alt="${pub.title}" loading="lazy" decoding="async"></div>`)}
        <div class="pub-content">
            <div class="pub-title">${pub.title}</div>
            <div class="pub-authors">${authorHtml}</div>
            <div class="pub-venue">
                ${maybeHtml(pub.venue, `<span class="venue-name">${pub.venue}</span>`)}
                ${maybeHtml(pub.status, `<span class="status">${pub.status}</span>`)}
                ${maybeHtml(pub.award, `<span class="award">${pub.award}</span>`)}
            </div>
            ${maybeHtml(pub.short_explanation, `<div class="pub-desc">${pub.short_explanation}</div>`)}
            <div class="pub-links">${links}</div>
            ${maybeHtml(pub.abstract, `<div class="folder-box abstract-box" id="abs-${id}"><div class="folder-content">${pub.abstract}</div></div>`)}
            ${maybeHtml(pub.bibtex, `
                <div class="folder-box bibtex-box" id="bib-${id}">
                    <div class="folder-header"><button class="copy-btn" onclick="copyBib('${id}')">${icons.copy}</button></div>
                    <pre id="pre-${id}">${pub.bibtex}</pre>
                </div>`)}
        </div>
    </div>`;
};

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('publications-container');
    if (!container) return;

    dataQuery.then(([pubs, bib]) => {
        if (!pubs) return container.innerHTML = '<p>Error loading publications.</p>';

        const data = mergeBibtex(pubs, parseBib(bib));
        const papers = data.filter(p => !p.type || p.type === 'paper');
        const reports = data.filter(p => p.type === 'report');

        const scholarBtn = `<a href="https://scholar.google.com/citations?user=8hTpX6MAAAAJ&hl=en" target="_blank" class="scholar-btn-inline">Check on Scholar ${icons.external}</a>`;

        container.innerHTML = [
            papers.length && renderSection('PUBLICATIONS', sortedGroups(groupBy(papers, p => p.year)), scholarBtn),
            reports.length && renderSection('REPORTS', sortedGroups(groupBy(reports, p => p.year)))
        ].filter(Boolean).join('');
    });
});

window.toggle = (e, type, id) => {
    e.preventDefault();
    const el = document.getElementById(`${type}-${id}`);
    const tab = document.getElementById(`tab-${type}-${id}`);
    if (el) {
        const show = el.style.display !== 'block';
        el.style.display = show ? 'block' : 'none';
        tab?.classList.toggle('active', show);
    }
};
window.toggleAbstract = (e, id) => toggle(e, 'abs', id);
window.toggleBibtex = (e, id) => toggle(e, 'bib', id);

window.copyBib = (id) => {
    const pre = document.getElementById('pre-' + id);
    if (!pre) return;

    navigator.clipboard.writeText(pre.textContent).then(() => {
        const btn = document.querySelector(`#bib-${id} .copy-btn`);
        btn.innerHTML = icons.check;
        btn.style.color = '#28a745';
        setTimeout(() => { btn.innerHTML = icons.copy; btn.style.color = ''; }, 2000);
    });
};
