/* Scroll Progress & Back to Top */
document.addEventListener('DOMContentLoaded', function () {
    const progressBar = document.getElementById('progress');
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'back-to-top';
    backToTopBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg>';
    backToTopBtn.setAttribute('aria-label', 'Back to Top');
    document.body.appendChild(backToTopBtn);

    let ticking = false;
    let docHeight = 0;

    function calcDimensions() {
        docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    }

    window.addEventListener('resize', calcDimensions, { passive: true });
    calcDimensions();

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateUI();
                ticking = false;
            });
            ticking = true;
        }
    }

    function updateUI() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        if (progressBar) {
            if (docHeight === 0) calcDimensions();
            const scrollPercent = (docHeight > 0) ? (scrollTop / docHeight) : 0;
            progressBar.value = scrollPercent;
        }
        if (scrollTop > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.requestAnimationFrame(updateUI);

    backToTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
