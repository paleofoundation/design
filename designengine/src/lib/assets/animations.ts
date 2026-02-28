import type { PaletteColors } from '@/lib/svg/utils';
import { resolvePalette, adjustOpacity } from '@/lib/svg/utils';

export interface AnimationResult {
  name: string;
  description: string;
  files: Record<string, { content: string; type: 'css' | 'js' }>;
}

export function generateAllAnimations(colors: PaletteColors): AnimationResult[] {
  return [
    generateCursorFollower(colors),
    generateButtonStates(colors),
    generateScrollReveal(colors),
    generateLoadingSpinner(colors),
    generateGlowPulse(colors),
  ];
}

export function generateCursorFollower(colors: PaletteColors): AnimationResult {
  const p = resolvePalette(colors);

  const css = `/* Cursor Follower — dzyn generated */
.dzyn-cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--color-orange, ${p.accent});
  pointer-events: none;
  z-index: 9999;
  will-change: transform;
  transition-property: width, height, border-color, opacity;
  transition-duration: var(--duration-slow, 400ms);
  transition-timing-function: var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1));
  mix-blend-mode: difference;
}

.dzyn-cursor--hover {
  width: 44px;
  height: 44px;
  border-color: var(--color-green-deep, ${p.primary});
}

@media (pointer: coarse) {
  .dzyn-cursor { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .dzyn-cursor { display: none; }
}`;

  const js = `/* Cursor Follower — dzyn generated */
(function initDzynCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var el = document.createElement('div');
  el.className = 'dzyn-cursor';
  document.body.appendChild(el);

  var x = 0, y = 0, tx = 0, ty = 0;
  var speed = 0.15;
  var halfW = 10;

  document.addEventListener('mousemove', function(e) {
    tx = e.clientX;
    ty = e.clientY;
  });

  var interactiveSelector = 'a, button, [role="button"], input, textarea, select, label, [data-cursor]';

  document.addEventListener('mouseover', function(e) {
    if (e.target.closest && e.target.closest(interactiveSelector)) {
      el.classList.add('dzyn-cursor--hover');
      halfW = 22;
    }
  });

  document.addEventListener('mouseout', function(e) {
    if (e.target.closest && e.target.closest(interactiveSelector)) {
      el.classList.remove('dzyn-cursor--hover');
      halfW = 10;
    }
  });

  function tick() {
    x += (tx - x) * speed;
    y += (ty - y) * speed;
    el.style.transform = 'translate3d(' + (x - halfW) + 'px,' + (y - halfW) + 'px,0)';
    requestAnimationFrame(tick);
  }
  tick();
})();`;

  return {
    name: 'cursor-follower',
    description: 'Smooth cursor-following ring that grows on interactive elements',
    files: {
      'cursor-follower.css': { content: css, type: 'css' },
      'cursor-follower.js': { content: js, type: 'js' },
    },
  };
}

export function generateButtonStates(colors: PaletteColors): AnimationResult {
  const p = resolvePalette(colors);
  const warmShadowLight = adjustOpacity(p.primary, 0.08);
  const warmShadowMed = adjustOpacity(p.primary, 0.2);

  const css = `/* Button Micro-Interactions — dzyn generated */

.dzyn-btn {
  position: relative;
  overflow: hidden;
  transition-property: transform, box-shadow;
  transition-duration: var(--duration-base, 200ms);
  transition-timing-function: var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.dzyn-btn:hover {
  transform: translateY(-1px);
}

.dzyn-btn:active {
  transform: translateY(0);
}

/* Glow hover — warm-tinted shadows */
.dzyn-btn--glow:hover {
  box-shadow:
    0 4px 15px ${warmShadowMed},
    0 1px 3px ${warmShadowLight};
}

/* Shine sweep on hover */
.dzyn-btn--shine::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -60%;
  width: 40%;
  height: 200%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.15),
    transparent
  );
  transform: skewX(-20deg);
  transition-property: left;
  transition-duration: var(--duration-reveal, 600ms);
  transition-timing-function: var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1));
  pointer-events: none;
}

.dzyn-btn--shine:hover::after {
  left: 120%;
}

/* Pulse for primary CTA */
.dzyn-btn--pulse {
  animation: dzyn-pulse 2.5s ease-in-out infinite;
}

@keyframes dzyn-pulse {
  0%, 100% { box-shadow: 0 0 0 0 ${adjustOpacity(p.accent, 0.25)}; }
  50% { box-shadow: 0 0 0 8px ${adjustOpacity(p.accent, 0)}; }
}

/* Scale on hover */
.dzyn-btn--scale:hover {
  transform: scale(1.03);
}

.dzyn-btn--scale:active {
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .dzyn-btn,
  .dzyn-btn--glow,
  .dzyn-btn--shine::after,
  .dzyn-btn--pulse,
  .dzyn-btn--scale {
    animation: none;
    transition: none;
  }
  .dzyn-btn--shine::after { display: none; }
}`;

  return {
    name: 'button-states',
    description: 'Button hover effects: glow, shine sweep, pulse, and scale',
    files: {
      'button-states.css': { content: css, type: 'css' },
    },
  };
}

export function generateScrollReveal(colors: PaletteColors): AnimationResult {
  const css = `/* Scroll Reveal Animations — dzyn generated */

.dzyn-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition-property: opacity, transform;
  transition-duration: var(--duration-reveal, 600ms);
  transition-timing-function: var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.dzyn-reveal--left {
  opacity: 0;
  transform: translateX(-32px);
  transition-property: opacity, transform;
  transition-duration: var(--duration-reveal, 600ms);
  transition-timing-function: var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.dzyn-reveal--right {
  opacity: 0;
  transform: translateX(32px);
  transition-property: opacity, transform;
  transition-duration: var(--duration-reveal, 600ms);
  transition-timing-function: var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.dzyn-reveal--scale {
  opacity: 0;
  transform: scale(0.92);
  transition-property: opacity, transform;
  transition-duration: var(--duration-reveal, 600ms);
  transition-timing-function: var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.dzyn-reveal.is-visible,
.dzyn-reveal--left.is-visible,
.dzyn-reveal--right.is-visible,
.dzyn-reveal--scale.is-visible {
  opacity: 1;
  transform: none;
}

/* Stagger children */
.dzyn-stagger > .dzyn-reveal:nth-child(1) { transition-delay: 0ms; }
.dzyn-stagger > .dzyn-reveal:nth-child(2) { transition-delay: 80ms; }
.dzyn-stagger > .dzyn-reveal:nth-child(3) { transition-delay: 160ms; }
.dzyn-stagger > .dzyn-reveal:nth-child(4) { transition-delay: 240ms; }
.dzyn-stagger > .dzyn-reveal:nth-child(5) { transition-delay: 320ms; }
.dzyn-stagger > .dzyn-reveal:nth-child(6) { transition-delay: 400ms; }

@media (prefers-reduced-motion: reduce) {
  .dzyn-reveal,
  .dzyn-reveal--left,
  .dzyn-reveal--right,
  .dzyn-reveal--scale {
    opacity: 1;
    transform: none;
    transition: none;
  }
}`;

  const js = `/* Scroll Reveal Observer — dzyn generated */
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
})();`;

  return {
    name: 'scroll-reveal',
    description: 'Scroll-triggered fade/slide/scale animations with stagger support',
    files: {
      'scroll-reveal.css': { content: css, type: 'css' },
      'scroll-reveal.js': { content: js, type: 'js' },
    },
  };
}

export function generateLoadingSpinner(colors: PaletteColors): AnimationResult {
  const p = resolvePalette(colors);

  const css = `/* Loading Spinner — dzyn generated */

.dzyn-spinner {
  display: inline-block;
  width: 36px;
  height: 36px;
  position: relative;
}

.dzyn-spinner::before,
.dzyn-spinner::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
}

.dzyn-spinner::before {
  border-top-color: var(--color-green-deep, ${p.primary});
  animation: dzyn-spin 0.8s linear infinite;
}

.dzyn-spinner::after {
  border-bottom-color: var(--color-orange, ${p.accent});
  animation: dzyn-spin 1.2s linear infinite reverse;
}

@keyframes dzyn-spin {
  to { transform: rotate(360deg); }
}

/* Full-page overlay variant */
.dzyn-spinner-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface, ${p.surface});
  z-index: 10000;
  transition-property: opacity;
  transition-duration: var(--duration-slow, 400ms);
  transition-timing-function: var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.dzyn-spinner-overlay.is-hidden {
  opacity: 0;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .dzyn-spinner::before,
  .dzyn-spinner::after {
    animation-duration: 1.5s;
  }
}`;

  return {
    name: 'loading-spinner',
    description: 'Dual-ring loading spinner with brand colors and overlay variant',
    files: {
      'loading-spinner.css': { content: css, type: 'css' },
    },
  };
}

export function generateGlowPulse(colors: PaletteColors): AnimationResult {
  const p = resolvePalette(colors);

  const css = `/* Glow Pulse — dzyn generated */

.dzyn-glow {
  position: relative;
}

.dzyn-glow::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    var(--color-green-deep, ${p.primary}),
    var(--color-orange, ${p.accent})
  );
  opacity: 0;
  z-index: -1;
  transition-property: opacity, filter;
  transition-duration: var(--duration-slow, 400ms);
  transition-timing-function: var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1));
  filter: blur(12px);
}

.dzyn-glow:hover::before {
  opacity: 0.5;
}

/* Animated glow for primary CTAs */
.dzyn-glow--animate::before {
  animation: dzyn-glow-pulse 3s ease-in-out infinite;
}

@keyframes dzyn-glow-pulse {
  0%, 100% { opacity: 0.15; filter: blur(12px); }
  50% { opacity: 0.4; filter: blur(18px); }
}

/* Gradient border effect */
.dzyn-glow-border {
  position: relative;
  background: var(--color-surface, ${p.surface});
}

.dzyn-glow-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(
    135deg,
    var(--color-green-deep, ${p.primary}),
    var(--color-orange, ${p.accent}),
    var(--color-amber, ${p.amber})
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .dzyn-glow--animate::before {
    animation: none;
    opacity: 0.2;
  }
}`;

  return {
    name: 'glow-pulse',
    description: 'Glow effect with gradient border and animated pulse for CTAs',
    files: {
      'glow-pulse.css': { content: css, type: 'css' },
    },
  };
}
