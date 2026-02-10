/* Dynamic Header */
const SITE_BRAND = '<span class="brand-first">Sidharth</span> Padmanabhan';
const NAV_ITEMS = [
    { name: 'Home', path: '' },
    //{ name: 'Projects', path: 'projects/' },
    { name: 'Publications', path: 'publications/' }
];

(function () {
    const currentPath = window.location.pathname;

    const depth = (currentPath.match(/\//g) || []).length - 1;
    const relativeRoot = depth > 0 ? '../'.repeat(depth) : './';

    const isActive = (itemPath) => {
        if (itemPath === '' || itemPath === './') {
            return relativeRoot === './' && (currentPath.endsWith('/') || currentPath.endsWith('index.html'));
        }
        if (itemPath.startsWith('#')) return false;
        const cleanItemPath = itemPath.replace('./', '').replace('/', '');
        return currentPath.includes(cleanItemPath);
    };

    const navLinksHtml = NAV_ITEMS.map(item => {
        let href = '';
        if (item.path.startsWith('#')) {
            href = relativeRoot === './' ? item.path : relativeRoot + 'index.html' + item.path;
        } else {
            href = relativeRoot + item.path;
        }
        const activeClass = isActive(item.path) ? ' class="active"' : '';
        return `<a href="${href}"${activeClass}>${item.name}</a>`;
    }).join('\n');

    const headerHtml = `
    <div class="header-container">
      <a href="${relativeRoot}" class="brand">${SITE_BRAND}</a>
      <nav>${navLinksHtml}</nav>
    </div>
    <progress id="progress" value="0" max="1"></progress>
    `;

    let headerEl = document.querySelector('header');
    if (!headerEl) {
        headerEl = document.createElement('header');
        document.body.prepend(headerEl);
    }
    headerEl.innerHTML = headerHtml;

    // Favicon
    const faviconPath = relativeRoot + 'favicon.png';
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = faviconPath;
        link.type = 'image/png';
        document.head.appendChild(link);
    } else {
        favicon.href = faviconPath;
    }
})();
