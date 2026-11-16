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
      if (i === 0) buildName(el);
      if (i < lines.length - 1) return setTimeout(() => typeLine(i + 1), rm ? 0 : 300);
      setTimeout(() => {
        $('#nowText').textContent = 'currently developing: PowerShell Business Alerting Solution';
        heroNow.classList.add('show');
        nav.classList.add('show');
        if (!arrowGone) arrow.classList.add('show');
      }, rm ? 0 : 400);
    })();
  }

  /* ---------- Name that reacts to the cursor ---------- */
  const letters = [];
  function measure() {
    letters.forEach(l => {
      l.el.style.transform = 'none';
      const r = l.el.getBoundingClientRect();
      l.cx = r.left + r.width / 2 + scrollX; l.cy = r.top + r.height / 2 + scrollY;
    });
  }
  function buildName(el) {
    const text = el.textContent, n = text.indexOf('Nathan');
    el.setAttribute('aria-label', text); el.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'ch'; s.textContent = ch; s.setAttribute('aria-hidden', 'true');
      el.appendChild(s);
      letters.push({ el: s, i, name: i >= n, x: 0, y: 0, r: 0, s: 1, g: 0 });
    });
    measure(); tickName(0);
  }
  addEventListener('resize', () => letters.length && measure());
  function tickName(t) {
    if (scrollY < innerHeight) {
      const mx = mouse.x + scrollX, my = mouse.y + scrollY, R = 190;
      for (const l of letters) {
        const dx = mx - l.cx, dy = my - l.cy, d = Math.hypot(dx, dy) || 1;
        const k = Math.max(0, 1 - d / R), e = k * k * (3 - 2 * k);
        const w = rm ? 0 : Math.sin(t / 600 + l.i * 0.55);
        const tx = -(dx / d) * e * 26, ty = -e * 30 + w * 3, tr = -(dx / R) * e * 28 + w * 1.5, ts = 1 + e * 0.35;
        l.x += (tx - l.x) * 0.14; l.y += (ty - l.y) * 0.14; l.r += (tr - l.r) * 0.14; l.s += (ts - l.s) * 0.14; l.g += (e - l.g) * 0.14;
        const h = 225 + 110 * (0.5 + 0.5 * Math.sin(t / 900 + l.i * 0.5));
        const st = l.el.style;
        st.transform = `translate(${l.x}px,${l.y}px) rotate(${l.r}deg) scale(${l.s})`;
        st.fontWeight = Math.round(400 + l.g * 400);
        if (l.name) {
          st.color = `hsl(${h} 95% 68%)`;
          st.textShadow = `0 0 ${10 + l.g * 32}px hsla(${h},100%,65%,${0.35 + l.g * 0.65})`;
        } else {
          st.color = `hsl(${h} ${l.g * 85}% ${96 - l.g * 26}%)`;
          st.textShadow = `0 0 ${l.g * 28}px hsla(${h},100%,70%,${l.g})`;
        }
      }
    }
    if (!rm) requestAnimationFrame(tickName);
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

  /* ---------- Terminal block cursor ---------- */
  if (fine) {
    document.documentElement.classList.add('has-cursor');
    const c = document.createElement('div');
    c.className = 't-cursor'; c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    let cx = 0, cy = 0, seen = false;
    addEventListener('pointermove', e => {
      if (!seen) { cx = e.clientX; cy = e.clientY; seen = true; }
      c.classList.add('on');
      c.classList.toggle('link', !!e.target.closest('a, button, .chip'));
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => c.classList.remove('on'));
    addEventListener('pointerdown', () => c.classList.add('down'));
    addEventListener('pointerup', () => c.classList.remove('down'));
    (function loop() {
      cx += (mouse.x - cx) * 0.4; cy += (mouse.y - cy) * 0.4;
      c.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Footer year ---------- */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
});
