import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import 'katex/dist/katex.min.css';

const initBlogPost = async () => {
    const container = document.getElementById('post-content');
    if (!container) return;

    let id;
    const params = new URLSearchParams(window.location.search);
    if (params.has('id')) {
        id = params.get('id');
        // Clean up the URL for GitHub Pages fallback
        window.history.replaceState({}, '', '/blog/' + id);
    } else {
        // Handle Vite dev server clean URL
        let path = window.location.pathname;
        if (path.endsWith('/')) path = path.slice(0, -1);
        id = path.split('/').pop();
    }

    if (!id || id === 'blog') {
        container.innerHTML = '<h1>Post not found</h1><p>No post ID specified.</p>';
        return;
    }

    try {
        // Fetch the metadata to set page title dynamically
        const blogDataRes = await fetch('/blog/blog.json');
        if (blogDataRes.ok) {
            const blogs = await blogDataRes.json();
            const postMeta = blogs.find(b => b.id === id);
            if (postMeta) {
                document.title = `${postMeta.title} - Sidharth Padmanabhan`;
            }
        }

        // Fetch the markdown file from the new blogmd directory
        const mdRes = await fetch(`/blog/blogmd/${id}.md`);
        if (!mdRes.ok) {
            if (mdRes.status === 404) {
                container.innerHTML = '<h1>Post not found</h1><p>The requested blog post does not exist.</p>';
            } else {
                container.innerHTML = '<h1>Error</h1><p>Failed to load the post content.</p>';
            }
            return;
        }

        const mdText = await mdRes.text();
        
        // Parse markdown and inject with KaTeX support
        marked.use(markedKatex({ throwOnError: false, nonStandard: true }));
        container.innerHTML = marked.parse(mdText);

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
