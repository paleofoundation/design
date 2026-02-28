/* Scroll Reveal Observer — dzyn generated */
(function initDzynReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var selector = '.dzyn-reveal, .dzyn-reveal--left, .dzyn-reveal--right, .dzyn-reveal--scale';

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  function observe() {
    document.querySelectorAll(selector).forEach(function(el) {
      if (!el.classList.contains('is-visible')) {
        observer.observe(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observe);
  } else {
    observe();
  }

  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(function() { observe(); })
      .observe(document.body, { childList: true, subtree: true });
  }
})();