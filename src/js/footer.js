/* Dynamic Footer */
(function () {
  const SITE_OWNER = "Sidharth Padmanabhan";
  const COPYRIGHT_YEAR = new Date().getFullYear();
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const now = new Date();
  const LAST_UPDATED = `${months[now.getMonth()]} ${now.getFullYear()}`;
  const footerHtml = `
    <div class="footer-top">
        <div class="footer-pill">
            ${COPYRIGHT_YEAR} ${SITE_OWNER}
        </div>
        <div class="footer-updated">
            Last updated: ${LAST_UPDATED}
        </div>
    </div>
    <div class="footer-disclaimer">
        Feel free to use this website's source code <a href="https://github.com/Sid-WC121/Sid-WC121.github.io" target="_blank">@Sid-WC121</a>.
    </div>
    `;
  let footerEl = document.querySelector('footer');
  if (!footerEl) {
    footerEl = document.createElement('footer');
    document.body.appendChild(footerEl);
  }
  footerEl.innerHTML = footerHtml;

})();
