import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import renderMathInElement from 'katex/contrib/auto-render';
import 'katex/dist/katex.min.css';

/* ─────────────────────────────────────────────
   BibTeX parser — extracts fields from a single
   @type{key, field = {value}, ...} entry string
   ───────────────────────────────────────────── */
function parseBibtex(raw) {
    const entry = {};
    // Match entry type and key  (@ARTICLE{key, or @misc{key,)
    const header = raw.match(/@(\w+)\s*\{\s*([\w:.\-/]+)\s*,/);
    if (header) {
        entry.type = header[1].toLowerCase();
        entry.key  = header[2];
    }
    // Match field = {value}, field = "value", or field = number
    // Uses a character-level scan to handle nested/double braces
    const fieldNameRe = /(\w+)\s*=\s*/g;
    let m;
    while ((m = fieldNameRe.exec(raw)) !== null) {
        const fieldName = m[1].toLowerCase();
        let rest = raw.slice(m.index + m[0].length);
        let value = '';
        if (rest[0] === '{') {
            // Scan for matching closing brace (depth 1)
            let depth = 0, i = 0;
            for (; i < rest.length; i++) {
                if (rest[i] === '{') depth++;
                else if (rest[i] === '}') { depth--; if (depth === 0) break; }
            }
            value = rest.slice(1, i).replace(/[{}]/g, '').trim();
        } else if (rest[0] === '"') {
            const end = rest.indexOf('"', 1);
            value = end > -1 ? rest.slice(1, end) : '';
        } else {
            const numM = rest.match(/^(\d+)/);
            value = numM ? numM[1] : '';
        }
        if (fieldName !== 'keywords') entry[fieldName] = value; // skip keywords
    }
    return entry;
}

/* Build a readable reference card HTML from a parsed BibTeX entry */
function buildRefCard(entry, index) {
    const authors = entry.author
        ? entry.author.replace(/ and /gi, ', ')
        : 'Unknown Author';
    const year    = entry.year  || '';
    const title   = entry.title || 'Untitled';
    const venue   = entry.journal || entry.booktitle || entry.publisher || '';
    const volume  = entry.volume ? `, ${entry.volume}` : '';
    const number  = entry.number ? `(${entry.number})` : '';
    const pages   = entry.pages  ? `, pp. ${entry.pages}` : '';
    const doi     = entry.doi    || '';
    const url     = entry.url    || (doi ? `https://doi.org/${doi}` : '');

    const venueStr = venue ? `<div class="ref-venue">${venue}${volume}${number}${pages}. ${year}</div>` : (year ? `<div class="ref-venue">${year}</div>` : '');
    const links = [];
    if (doi) links.push(`<a href="https://doi.org/${doi}" target="_blank" rel="noopener">DOI</a>`);
    else if (url) links.push(`<a href="${url}" target="_blank" rel="noopener">Link</a>`);

    return `<li class="ref-card">
  <span class="ref-num">[${index}]</span>
  <div class="ref-body">
    <div class="ref-authors">${authors}</div>
    <div class="ref-title">${title}</div>
    ${venueStr}
    ${links.length ? `<div class="ref-links">${links.join('')}</div>` : ''}
  </div>
</li>`;
}

/* Pre-process Markdown: extract :::bibtex blocks and replace with
   a placeholder that marked won't mangle, then post-process.      */
function preprocessBibtex(mdText) {
    const blocks  = [];
    const replaced = mdText.replace(/:::bibtex\r?\n([\s\S]*?)\r?\n:::/g, (_, inner) => {
        const idx = blocks.length;
        blocks.push(inner.trim());
        // HTML block comment — marked passes these through verbatim
        return `\n<!-- BIBTEX:${idx} -->\n`;
    });
    return { replaced, blocks };
}

/* After marked renders HTML, swap comment sentinels with ref cards */
function postprocessBibtex(html, blocks) {
    if (!blocks.length) return html;

    // Group consecutive sentinels into one <ul class="ref-list">
    return html.replace(
        /(?:<!-- BIBTEX:(\d+) -->\s*)+/g,
        (group) => {
            const indices = [...group.matchAll(/BIBTEX:(\d+)/g)].map(m => +m[1]);
            const items = indices.map((idx, i) => {
                const entry = parseBibtex(blocks[idx]);
                return buildRefCard(entry, i + 1);
            });
            return `<ul class="ref-list">${items.join('\n')}</ul>`;
        }
    );
}

/* ─────────────────────────────────────────────
   "Cite This Post" section
   ───────────────────────────────────────────── */
function buildCiteSection(meta) {
    const yearMatch = (meta.date || '').match(/\d{4}/);
    const year    = yearMatch ? yearMatch[0] : new Date().getFullYear();
    // Create a citekey like padmanabhan2026barronconstant (uses the unique post id)
    const lastName = (meta.author || 'Author').split(' ').pop().toLowerCase();
    const postSlug = (meta.id || 'post').replace(/[^a-z0-9]/gi, '').toLowerCase();
    const citeKey = `${lastName}${year}${postSlug}`;

    const url    = `https://sid-wc121.github.io/blog/${meta.id}`;
    const doi    = meta.doi || '';

    const bibtex = `@misc{${citeKey},
  author    = {${meta.author || 'Sidharth Padmanabhan'}},
  title     = {{${meta.title || 'Blog Post'}}},
  year      = {${year}},
  url       = {${url}},${doi ? `\n  doi       = {${doi}},` : ''}
  note      = {Blog post}
}`;

    return `<div class="cite-section">
  <h3>Cite This Post</h3>
  <div class="cite-code-wrap">
    <pre id="bibtex-code">${bibtex}</pre>
    <button class="cite-copy-btn" onclick="copyCite('bibtex-code', this)">Copy</button>
  </div>
</div>`;
}



window.copyCite = (codeId, btn) => {
    const text = document.getElementById(codeId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    });
};

/* ─────────────────────────────────────────────
   Main init
   ───────────────────────────────────────────── */
const initBlogPost = async () => {
    const container = document.getElementById('post-content');
    if (!container) return;

    let id;
    const params = new URLSearchParams(window.location.search);
    if (params.has('id')) {
        id = params.get('id');
        window.history.replaceState({}, '', '/blog/' + id);
    } else {
        let path = window.location.pathname;
        if (path.endsWith('/')) path = path.slice(0, -1);
        id = path.split('/').pop();
    }

    if (!id || id === 'blog') {
        container.innerHTML = '<h1>Post not found</h1><p>No post ID specified.</p>';
        return;
    }

    try {
        // Fetch metadata
        let postMeta = null;
        const blogDataRes = await fetch('/blog/blog.json');
        if (blogDataRes.ok) {
            const blogs = await blogDataRes.json();
            postMeta = blogs.find(b => b.id === id) || null;
            if (postMeta) document.title = `${postMeta.title} - Sidharth Padmanabhan`;
        }

        // Fetch markdown
        const mdRes = await fetch(`/blog/blogmd/${id}.md`);
        if (!mdRes.ok) {
            container.innerHTML = mdRes.status === 404
                ? '<h1>Post not found</h1><p>The requested blog post does not exist.</p>'
                : '<h1>Error</h1><p>Failed to load the post content.</p>';
            return;
        }

        const mdText = await mdRes.text();

        // Pre-process :::bibtex blocks before marked touches them
        const { replaced, blocks } = preprocessBibtex(mdText);

        // Parse markdown with KaTeX
        marked.use(markedKatex({ throwOnError: false, nonStandard: true }));
        let html = marked.parse(replaced);

        // Swap bibtex placeholders with rendered ref cards
        html = postprocessBibtex(html, blocks);

        container.innerHTML = html;

        // Re-render any math inside raw HTML blocks (e.g. <figcaption>) that
        // marked-katex-extension skips because it only processes text nodes.
        renderMathInElement(container, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$',  right: '$',  display: false },
            ],
            throwOnError: false,
        });

        // Wrap tables for mobile horizontal scroll
        container.querySelectorAll('table').forEach(table => {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-wrapper';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });

        // Append "Cite This Post" section
        if (postMeta) {
            const citeDiv = document.createElement('div');
            citeDiv.innerHTML = buildCiteSection(postMeta);
            container.appendChild(citeDiv.firstElementChild);
        }

    } catch (err) {
        console.error('Failed to load blog post:', err);
        container.innerHTML = '<h1>Error</h1><p>An unexpected error occurred while loading the post.</p>';
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogPost);
} else {
    initBlogPost();
}
