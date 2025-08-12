document.addEventListener('DOMContentLoaded', () => {
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

    let arrowHiddenForever = false; // track if arrow has been hidden

    targets.forEach(t => { t.textContent = ''; t.classList.remove('typing'); });

    document.querySelectorAll('.fade-in').forEach((el, i) => {
    setTimeout(() => el.classList.add('show'), 150 * i);
    });

    let lineIndex = 0;
    function typeLine(lineIdx) {
    const text = lines[lineIdx];
    const el = targets[lineIdx];
    el.classList.add('typing');
    let charIndex = 0;

    function typeChar() {
        if (charIndex < text.length) {
        el.textContent += text.charAt(charIndex);
        charIndex++;
        const delay = 30 + Math.random() * 100;
        setTimeout(typeChar, delay);
        } else {
        el.classList.remove('typing');
        lineIndex++;
        if (lineIndex < lines.length) {
            setTimeout(() => typeLine(lineIndex), 350);
        } else {
            setTimeout(() => {
            if (!arrowHiddenForever) arrow.classList.add('show');
            }, 500);
        }
        }
    }
    typeChar();
    }

    setTimeout(() => typeLine(lineIndex), 450);

    // Hide arrow after scrolling 10% down (forever)
    window.addEventListener('scroll', () => {
    if (!arrowHiddenForever) {
        const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        if (scrollPercent >= 0.12) {
        arrow.style.opacity = '0';
        arrowHiddenForever = true; // never show again
        }
    }
    });
});