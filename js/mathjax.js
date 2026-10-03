/* Single source of truth for MathJax across the site.
   Pages that contain math load this one file; it configures MathJax and then
   pulls in the CDN build, so there is no per-page config to drift out of sync.

   Delimiters: \( ... \) or $ ... $ inline, $$ ... $$ or \[ ... \] display.
   A literal dollar sign in prose must be written \$ (processEscapes is on by
   default), otherwise MathJax will read everything up to the next $ as math. */

window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']]
    }
};

(function () {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js';
    s.async = true;
    document.head.appendChild(s);
})();
