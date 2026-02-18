import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

const mpaPages = ['/', '/publications'];

const isServablePath = (url) => {
    const ext = path.extname(url).toLowerCase();
    const staticExts = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.css', '.js', '.json', '.woff', '.woff2', '.ttf', '.eot'];
    if (staticExts.includes(ext)) return true;

    if (url === '/') return true;

    const localPath = path.join(process.cwd(), url);
    const publicPath = path.join(process.cwd(), 'public', url);

    if (fs.existsSync(localPath)) {
        const stat = fs.statSync(localPath);
        if (stat.isFile()) return true;
        if (stat.isDirectory()) {
            return mpaPages.includes(url.replace(/\/$/, '') || '/');
        }
    }

    if (fs.existsSync(publicPath)) {
        const stat = fs.statSync(publicPath);
        if (stat.isFile()) return true;
    }

    if (!ext) {
        if (fs.existsSync(localPath + '.html')) return true;
    }

    return false;
};

const custom404Plugin = () => {
    return {
        name: 'custom-404',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.headers.accept?.includes('text/html')) {
                    const url = req.url.split('?')[0];
                    if (!isServablePath(url) && url !== '/404.html') {
                        req.url = '/404.html';
                    }
                }
                next();
            });
        },
        configurePreviewServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.headers.accept?.includes('text/html')) {
                    const url = req.url.split('?')[0];
                    const distPath = path.join(process.cwd(), 'dist', url);

                    let exists = fs.existsSync(distPath);
                    if (!exists && !path.extname(url)) {
                        if (fs.existsSync(distPath + '.html')) exists = true;
                        if (fs.existsSync(path.join(distPath, 'index.html'))) exists = true;
                    }

                    if (!exists && url !== '/404.html') {
                        req.url = '/404.html';
                    }
                }
                next();
            });
        }
    };
};

// Copy data files (JSON, BibTeX) to build output
const copyDataFilesPlugin = () => ({
    name: 'copy-data-files',
    writeBundle(options) {
        const outDir = options.dir || 'dist';
        const filesToCopy = [
            { src: 'projects/projects.json', dest: 'projects/projects.json' },
            { src: 'publications/publications.json', dest: 'publications/publications.json' },
            { src: 'publications/publications.bib', dest: 'publications/publications.bib' }
        ];

        filesToCopy.forEach(({ src, dest }) => {
            const srcPath = resolve(__dirname, src);
            const destPath = resolve(__dirname, outDir, dest);

            if (fs.existsSync(srcPath)) {
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                fs.copyFileSync(srcPath, destPath);
                console.log(`Copied: ${src} → ${dest}`);
            }
        });
    }
});

export default defineConfig({
    appType: 'mpa',
    plugins: [custom404Plugin(), copyDataFilesPlugin()],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                publications: resolve(__dirname, 'publications/index.html'),
                notFound: resolve(__dirname, '404.html')
            }
        }
    }
});
