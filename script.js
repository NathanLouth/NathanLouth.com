document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Hero typing ---------------- */
  const lines = [
    "Hi, I'm Nathan",
    "A Computer & Audio/Visual Engineer",
    "Based in Manchester, UK"
  ];
  const targets = [
    document.getElementById('line1'),
    document.getElementById('line2'),
    document.getElementById('line3')
  ];
  const arrow = document.querySelector('.scroll-down');
  const heroNow = document.getElementById('heroNow');
  let arrowHiddenForever = false;

  targets.forEach(t => { t.textContent = ''; t.classList.remove('typing'); });

  let lineIndex = 0;
  function typeLine(idx) {
    const text = lines[idx];
    const el = targets[idx];
    el.classList.add('typing');
    let charIndex = 0;

    function typeChar() {
      if (charIndex < text.length) {
        el.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(typeChar, reduceMotion ? 0 : 30 + Math.random() * 90);
      } else {
        el.classList.remove('typing');
        lineIndex++;
        if (lineIndex < lines.length) {
          setTimeout(() => typeLine(lineIndex), reduceMotion ? 0 : 340);
        } else {
          setTimeout(() => {
            heroNow.textContent = 'currently exploring: Wine\u2019s Win32 translation layer & Linux traffic shaping';
            requestAnimationFrame(() => heroNow.classList.add('show'));
            if (!arrowHiddenForever) arrow.classList.add('show');
          }, reduceMotion ? 0 : 450);
        }
      }
    }
    typeChar();
  }
  setTimeout(() => typeLine(lineIndex), reduceMotion ? 0 : 450);

  /* Hide the scroll arrow permanently after the visitor starts scrolling */
  window.addEventListener('scroll', () => {
    if (!arrowHiddenForever) {
      const max = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = max > 0 ? window.scrollY / max : 0;
      if (scrollPercent >= 0.12) {
        arrow.style.opacity = '0';
        arrowHiddenForever = true;
      }
    }
  }, { passive: true });

  /* ---------------- Scroll-triggered reveals ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('show'));
  }

  /* ---------------- Top scroll-progress strip ---------------- */
  const progressEl = document.getElementById('sbProgress');
  function updateProgress() {
    const max = document.body.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    progressEl.style.width = pct + '%';
  }
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
