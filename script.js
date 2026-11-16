document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mouse = { x: -9999, y: -9999 };

  /* ---------- Hero typing ---------- */
  const lines = ["Hi, I'm Nathan", 'A Computer & Audio/Visual Engineer', 'Based in Manchester, UK'];
  const targets = ['line1', 'line2', 'line3'].map(id => document.getElementById(id));
  const arrow = $('.scroll-down'), heroNow = $('#heroNow'), nav = $('.nav');
  let arrowGone = false;
  targets.forEach(t => (t.textContent = ''));

  function typeLine(i) {
    const el = targets[i], text = lines[i];
    let c = 0;
    el.classList.add('typing');
    (function tick() {
      if (c < text.length) {
        el.textContent += text[c++];
        setTimeout(tick, rm ? 0 : 28 + Math.random() * 70);
        return;
      }
      el.classList.remove('typing');
      if (i === 0) el.innerHTML = el.textContent.replace('Nathan', '<span class="grad">Nathan</span>');
      if (i < lines.length - 1) return setTimeout(() => typeLine(i + 1), rm ? 0 : 300);
      setTimeout(() => {
        $('#nowText').textContent = 'currently developing: PowerShell Business Alerting Solution';
        heroNow.classList.add('show');
        nav.classList.add('show');
        if (!arrowGone) arrow.classList.add('show');
      }, rm ? 0 : 400);
    })();
  }
  setTimeout(() => typeLine(0), rm ? 0 : 500);

  /* ---------- Scramble-decode for section titles ---------- */
  const glyphs = '!<>-_\\/[]{}=+*^?#01';
  function scramble(el) {
    const final = el.dataset.text || (el.dataset.text = el.textContent);
    if (rm) return;
    let f = 0;
    const total = final.length * 3;
    (function step() {
      const done = Math.floor(f / 3);
      el.textContent = final.split('').map((ch, i) => i < done || ch === ' ' ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
      if (++f <= total) requestAnimationFrame(step); else el.textContent = final;
    })();
  }

  /* ---------- Staggered scroll reveals ---------- */
  $$('[data-stagger]').forEach(p => [...p.children].forEach((c, i) => c.style.setProperty('--d', i * 0.09 + 's')));
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('show');
      if (e.target.hasAttribute('data-scramble')) scramble(e.target);
      io.unobserve(e.target);
    }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else revealEls.forEach(el => el.classList.add('show'));

  /* ---------- Nav highlighting ---------- */
  const links = $$('.nav a');
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section').forEach(s => so.observe(s));

  /* ---------- Scroll progress + timeline fill ---------- */
  const bar = $('#sbProgress'), tl = $('#timeline'), fill = $('#tlFill');
  function onScroll() {
    const max = document.body.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? Math.min(100, (scrollY / max) * 100) : 0) + '%';
    if (!arrowGone && max > 0 && scrollY / max >= 0.05) { arrow.style.opacity = '0'; arrowGone = true; }
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    fill.style.height = p * 100 + '%';
  }
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------- Spotlight, 3D tilt, magnetic pills ---------- */
  if (fine) {
    document.addEventListener('pointermove', e => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      const t = e.target.closest ? e.target : null;
      const s = t && t.closest('.spot, .card');
      if (s) {
        const r = s.getBoundingClientRect();
        s.style.setProperty('--mx', e.clientX - r.left + 'px');
        s.style.setProperty('--my', e.clientY - r.top + 'px');
      }
    }, { passive: true });

    if (!rm) {
      $$('[data-tilt]').forEach(el => {
        el.addEventListener('pointermove', e => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 7}deg) translateY(-4px)`;
        });
        el.addEventListener('pointerleave', () => (el.style.transform = ''));
      });
      $$('[data-magnetic]').forEach(el => {
        el.addEventListener('pointermove', e => {
          const r = el.getBoundingClientRect();
          el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
        });
        el.addEventListener('pointerleave', () => (el.style.transform = ''));
      });
    }

    const glow = $('#glow');
    let gx = innerWidth / 2, gy = innerHeight / 2;
    (function follow() {
      gx += (mouse.x - gx) * 0.12; gy += (mouse.y - gy) * 0.12;
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      requestAnimationFrame(follow);
    })();
    document.addEventListener('pointermove', () => glow.classList.add('on'), { once: true });
  }

  /* ---------- Interactive particle constellation ---------- */
  const cv = $('#bg'), ctx = cv.getContext('2d');
  let W, H, dpr, pts = [];
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    const n = Math.min(90, Math.floor(innerWidth / 16));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.35 * dpr, vy: (Math.random() - 0.5) * 0.35 * dpr }));
  }
  size();
  addEventListener('resize', size);
  const reach = () => 140 * dpr;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const R = reach(), mx = mouse.x * dpr, my = mouse.y * dpr;
    for (const p of pts) {
      if (!rm) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
        if (d < R * 1.3 && d > 0) { p.x += (dx / d) * 1.2 * dpr; p.y += (dy / d) * 1.2 * dpr; }
      }
      ctx.fillStyle = 'rgba(200,210,255,0.55)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.4 * dpr, 0, 6.283); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < R) {
          ctx.strokeStyle = `rgba(140,160,255,${(1 - d / R) * 0.22})`;
          ctx.lineWidth = dpr;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
    }
    if (!rm) requestAnimationFrame(draw);
  }
  draw();

  /* ---------- Footer year ---------- */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
});
