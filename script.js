const intro = document.getElementById("intro");
const enterBtn = document.getElementById("enterBtn");
const musicBtn = document.getElementById("musicBtn");
const bgMusic = document.getElementById("bgMusic");
const cursorGlow = document.getElementById("cursorGlow");
let musicWanted = true;
enterBtn.addEventListener("click", async () => {
  intro.classList.add("hide");
  document.body.classList.remove("locked");
  musicBtn.classList.add("show");
  if (musicWanted) {
    try { bgMusic.volume = 0.55; await bgMusic.play(); musicBtn.classList.add("playing"); } catch (_) { musicBtn.classList.remove("playing"); }
  }
  setTimeout(() => intro.remove(), 1200);
});
musicBtn.addEventListener("click", async () => {
  if (bgMusic.paused) { try { await bgMusic.play(); musicBtn.classList.add("playing"); musicWanted = true; } catch (_) {} }
  else { bgMusic.pause(); musicBtn.classList.remove("playing"); musicWanted = false; }
});
const revealObserver = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.16 });
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
const eventDate = new Date("2026-11-22T19:00:00+02:00").getTime();
function pad(value) { return String(value).padStart(2, "0"); }
function updateCountdown() {
  const diff = eventDate - Date.now();
  if (diff <= 0) {
    document.getElementById("countdown").innerHTML = '<div style="font-family:Marhey,cursive;font-size:clamp(36px,6vw,70px);text-align:center;direction:rtl;">الليلة ليلتنا ✨</div>';
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  document.getElementById("days").textContent = pad(days);
  document.getElementById("hours").textContent = pad(hours);
  document.getElementById("minutes").textContent = pad(minutes);
  document.getElementById("seconds").textContent = pad(seconds);
}
updateCountdown();
setInterval(updateCountdown, 1000);
if (window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("mousemove", (e) => {
    cursorGlow.style.opacity = "1";
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  });
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    const s1 = document.querySelector(".bg-shape-1");
    const s2 = document.querySelector(".bg-shape-2");
    if (s1) s1.style.transform = `translateY(${y * 0.045}px)`;
    if (s2) s2.style.transform = `translateY(${-y * 0.035}px)`;
  });
}
document.querySelectorAll(".magnetic").forEach((el) => {
  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
  });
  el.addEventListener("mouseleave", () => { el.style.transform = ""; });
});
