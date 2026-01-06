const renderProject = (proj) => {
    const links = Object.entries(proj.links || {}).map(([k, url]) =>
        `<a href="${url}" target="_blank" rel="noopener">${k.charAt(0).toUpperCase() + k.slice(1)}</a>`
    ).join(' / ');

    return `
    <div class="project-item">
        ${proj.image ? `<div class="proj-image"><img src="${proj.image}" alt="${proj.title}" loading="lazy"></div>` : ''}
        <div class="proj-content">
            <div class="proj-title">
                ${proj.title}
                ${proj.year ? `<span class="proj-year">(${proj.year})</span>` : ''}
            </div>
            <div class="proj-desc">${proj.description}</div>
            <div class="proj-links">${links}</div>
        </div>
    </div>`;
};

const initProjects = () => {
    const container = document.getElementById('projects-container');
    if (!container) return;

    const path = window.location.pathname;

    const slashes = (path.match(/\//g) || []).length;
    let depth = slashes - 1;
    if (path === '/') depth = 0;

    const navUp = depth > 0 ? '../'.repeat(depth) : '';
    const jsonPath = navUp + 'projects/projects.json';

    fetch(jsonPath)
        .then(r => r.ok ? r.json() : [])
        .then(data => {
            if (!data.length) {
                container.innerHTML = '<p>No projects found.</p>';
                return;
            }
            container.innerHTML = `
                <div class="section-header">
                    <h2>Projects</h2>
                </div>
                <div class="projects-list">
                    ${data.map(renderProject).join('')}
                </div>
            `;
        })
        .catch(err => {
            console.error('Failed to load projects:', err);
            container.innerHTML = '<p>Error loading projects.</p>';
        });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjects);
} else {
    initProjects();
}
