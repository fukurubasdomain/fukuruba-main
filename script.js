/* ================================================================
   script.js
   Shared behaviour used by socials.html and watchly.html.

   Page-specific logic (the socials.html handle "scramble" text
   effect, watchly.html's Discord/Lanyard live-status fetching)
   stays in a <script> block inside its own page — it only matters
   there. This file only holds the two things every sub-page needs.
   ================================================================ */

// Sends the visitor back to the chooser screen.
function returnToChoice(){
  window.location.href = 'index.html';
}

// Fades/slides each tracked element into view as it nears the
// viewport. The selector list below covers elements from every page
// that includes this script; a selector simply matches nothing on
// pages that don't have that element, so it's safe to keep them all
// in one shared list.
(() => {
  const revealSelectors = [
    '.card > .avatar',
    '.card > h1',
    '.card > .tagline',
    '.links .link',
    '.card > footer',
    '.mast > h1',
    '.mast > .sub',
    '.frame > .frame-body > .who',
    '#activityBlock',
    '.favorites > .favorite-title',
    '.favorite-game',
    '.favorite-song'
  ];

  const revealItems = [...new Set(
    revealSelectors.flatMap(selector => [...document.querySelectorAll(selector)])
  )];

  revealItems.forEach(el => el.classList.add('scroll-reveal'));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealItems.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        entry.target.classList.remove('is-visible');
      }
    });
  }, {
    threshold: 0.01,
    rootMargin: '0px 0px 18% 0px'
  });

  revealItems.forEach(el => observer.observe(el));
})();
