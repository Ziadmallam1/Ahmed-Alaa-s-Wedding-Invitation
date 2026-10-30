const $ = (s) => document.querySelector(s);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;
const intro = $("#intro"), musicBtn = $("#musicBtn"), bgMusic = $("#bgMusic");

/* stars */
function stars(el, n) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement("i");
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${Math.random() * 3}s;animation-duration:${2 + Math.random() * 3}s`;
    if (Math.random() > 0.8) s.style.width = s.style.height = "5px";
    el.appendChild(s);
  }
}
stars($("#sky"), 55);
stars($("#introStars"), 60);

/* music: try autoplay, else start on the first tap anywhere */
let wanted = true, opened = false, wasPlaying = false;
async function playMusic() {
  if (!wanted || !bgMusic.paused) return;
  try {
    bgMusic.volume = 0;
    await bgMusic.play();
    musicBtn.classList.add("playing");
    let v = 0;
    const t = setInterval(() => { v = Math.min(0.6, v + 0.03); bgMusic.volume = v; if (v >= 0.6) clearInterval(t); }, 120);
    ["pointerdown", "touchend", "click", "keydown"].forEach((e) => removeEventListener(e, firstTap));
  } catch (_) {}
}
function firstTap() { playMusic(); }
["pointerdown", "touchend", "click", "keydown"].forEach((e) => addEventListener(e, firstTap));
playMusic();
musicBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (bgMusic.paused) { wanted = true; playMusic(); }
  else { wanted = false; bgMusic.pause(); musicBtn.classList.remove("playing"); }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { wasPlaying = !bgMusic.paused; bgMusic.pause(); musicBtn.classList.remove("playing"); }
  else if (wasPlaying && wanted) { bgMusic.play().then(() => musicBtn.classList.add("playing")).catch(() => {}); }
});

/* petals */
const cv = $("#fx"), cx = cv.getContext("2d");
const cols = ["#F9DDE3", "#E0678C", "#FFC9A8", "#FDF6F8", "#C94B7B"];
let W, H, P = [];
function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
addEventListener("resize", size); size();
function petal(b, x, y) {
  return { x: b ? x : Math.random() * W, y: b ? y : -20 - Math.random() * H * 0.5, s: 6 + Math.random() * 8, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.06, sw: Math.random() * 6.28, c: cols[(Math.random() * cols.length) | 0], a: 0.5 + Math.random() * 0.35, b, life: 1,
    vx: b ? (Math.random() - 0.5) * 14 : 0, vy: b ? -Math.random() * 10 - 2 : 0.6 + Math.random() };
}
function burst(x, y, n) { if (!reduce) for (let i = 0; i < n; i++) P.push(petal(true, x, y)); }
function tick() {
  cx.clearRect(0, 0, W, H);
  for (let i = P.length - 1; i >= 0; i--) {
    const p = P[i];
    p.sw += 0.025; p.r += p.vr;
    if (p.b) { p.vy += 0.25; p.vx *= 0.985; p.life -= 0.012; if (p.life <= 0) { P.splice(i, 1); continue; } }
    else { p.x += Math.sin(p.sw) * 0.8; if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; } }
    p.x += p.vx; p.y += p.vy;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r);
    cx.globalAlpha = p.a * (p.b ? p.life : 1); cx.fillStyle = p.c;
    cx.beginPath(); cx.ellipse(0, 0, p.s, p.s * (0.3 + 0.3 * Math.abs(Math.cos(p.sw))), 0, 0, 6.283); cx.fill(); cx.restore();
  }
  requestAnimationFrame(tick);
}
if (!reduce) tick();

/* reveals */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }), { threshold: 0.2 });
function startReveals() { document.querySelectorAll("[data-anim],[data-words]").forEach((el) => io.observe(el)); }

/* words of the statement */
(function () {
  const h = $("[data-words]"); let i = 0;
  const walk = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [];
  while (walk.nextNode()) nodes.push(walk.currentNode);
  nodes.forEach((n) => {
    const f = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach((t) => {
      if (!t.trim()) { f.appendChild(document.createTextNode(t)); return; }
      const s = document.createElement("span"); s.className = "w"; s.style.setProperty("--i", i++); s.textContent = t; f.appendChild(s);
    });
    n.replaceWith(f);
  });
})();

/* open the invitation */
$("#enterBtn").addEventListener("click", () => {
  if (opened) return; opened = true;
  intro.classList.add("open");
  document.body.classList.remove("locked");
  playMusic();
  burst(innerWidth / 2, innerHeight / 2, 80);
  if (!reduce) for (let i = 0; i < (innerWidth < 600 ? 14 : 28); i++) P.push(petal(false));
  setTimeout(startReveals, 500);
  setTimeout(() => intro.remove(), 2000);
});
addEventListener("pointerdown", (e) => { if (opened) burst(e.clientX, e.clientY, 10); });

/* countdown */
const target = new Date("2026-11-22T19:00:00+02:00").getTime();
const pad = (v) => String(v).padStart(2, "0");
function setNum(id, v) { const el = document.getElementById(id), t = pad(v); if (el.textContent !== t) { el.textContent = t; el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); } }
function update() {
  const d = target - Date.now();
  if (d <= 0) { $("#countdown").innerHTML = '<div style="font-family:\'Aref Ruqaa\',serif;font-size:clamp(36px,7vw,70px);width:100%;text-align:center;direction:rtl">الليلة ليلتنا ✨</div>'; clearInterval(timer); return; }
  setNum("days", Math.floor(d / 864e5)); setNum("hours", Math.floor(d / 36e5) % 24);
  setNum("minutes", Math.floor(d / 6e4) % 60); setNum("seconds", Math.floor(d / 1000) % 60);
}
const timer = setInterval(update, 1000); update();

/* scroll progress, cursor glow, card tilt */
addEventListener("scroll", () => { const m = document.documentElement.scrollHeight - innerHeight; $("#progress").style.transform = `scaleX(${m > 0 ? scrollY / m : 0})`; }, { passive: true });
if (fine) {
  const g = $("#cursorGlow");
  addEventListener("mousemove", (e) => { g.style.opacity = 1; g.style.left = e.clientX + "px"; g.style.top = e.clientY + "px"; });
  document.querySelectorAll(".tilt").forEach((c) => {
    c.addEventListener("mousemove", (e) => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.transform = `rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg)`;
      c.style.setProperty("--mx", x * 100 + "%"); c.style.setProperty("--my", y * 100 + "%");
    });
    c.addEventListener("mouseleave", () => { c.style.transform = ""; });
  });
}
