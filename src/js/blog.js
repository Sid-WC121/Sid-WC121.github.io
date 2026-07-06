const renderBlog = (blog, navUp) => {
    const linkUrl = blog.url || `/blog/${blog.id}`;
    return `
    <a href="${linkUrl}" target="_self" rel="noopener" class="project-item" style="text-decoration: none; color: inherit; display: flex; border-bottom: none; margin-bottom: 12px; padding-bottom: 0; ">
        ${blog.image ? `<div class="proj-image"><img src="${blog.image}" alt="${blog.title}" loading="lazy"></div>` : ''}
        <div class="proj-content">
            <div class="proj-title">
                ${blog.title}
                ${blog.date ? `<span class="proj-year">(${blog.date})</span>` : ''}
            </div>
            <div class="proj-desc">${blog.description}</div>
        </div>
    </a>`;
};

const initBlog = () => {
    const container = document.getElementById('blog-container');
    if (!container) return;

    const path = window.location.pathname;

    const slashes = (path.match(/\//g) || []).length;
    let depth = slashes - 1;
    if (path === '/') depth = 0;

    const navUp = depth > 0 ? '../'.repeat(depth) : '';
    const jsonPath = navUp + 'blog/blog.json';

    fetch(jsonPath)
        .then(r => r.ok ? r.json() : [])
        .then(data => {
            if (!data.length) {
                container.innerHTML = '<p>No blog posts found.</p>';
                return;
            }
            container.innerHTML = `
                <div class="section-header">
                    <h2>Blog</h2>
                </div>
                <div class="projects-list">
                    ${data.map(b => renderBlog(b, navUp)).join('')}
                </div>
            `;
        })
        .catch(err => {
            console.error('Failed to load blog:', err);
            container.innerHTML = '<p>Error loading blog posts.</p>';
        });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlog);
} else {
    initBlog();
}
