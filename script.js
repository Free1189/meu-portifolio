// Ano no rodapé
document.getElementById("ano").textContent = new Date().getFullYear();

// Borda da navegação ao rolar
const nav = document.querySelector(".nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Menu mobile
const toggle = document.querySelector(".nav__toggle");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
document.querySelectorAll(".nav__links a").forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", false);
  })
);

// Animação de entrada ao rolar
const targets = document.querySelectorAll(
  ".section__title, .about__text, .about__facts li, .timeline__item, .skill, .project, .contact__inner > *"
);
targets.forEach((el) => el.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
targets.forEach((el) => observer.observe(el));

// Fundo do topo: nuvens, servidores ligados por um pipeline e pacotes de dados (CI/CD)
(() => {
  const canvas = document.querySelector(".hero__canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GREEN = "52, 211, 153";
  const TERMS = [
    "git push", "docker build", "kubectl apply", "terraform plan", "CI/CD",
    "deploy ✓", "tests passed", "pipeline", "cloud", "build #42", "rollback", "monitoring",
  ];

  let w, h, dpr, clouds, nodes, edges, packets, labels;
  const rand = (a, b) => a + Math.random() * (b - a);

  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const small = w < 720;

    clouds = Array.from({ length: small ? 4 : 7 }, () => ({
      x: rand(-200, w), y: rand(h * 0.05, h * 0.9), s: rand(0.6, 1.5), v: rand(0.08, 0.25),
    }));

    // Servidores em grade solta
    const cols = small ? 3 : 6, rows = small ? 5 : 4;
    nodes = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.2) continue;
        nodes.push({
          x: ((c + 0.5) / cols) * w + rand(-40, 40),
          y: ((r + 0.5) / rows) * h + rand(-30, 30),
          phase: rand(0, Math.PI * 2),
        });
      }
    }

    // Liga cada servidor aos dois vizinhos mais próximos
    edges = [];
    nodes.forEach((a, i) => {
      nodes
        .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
        .filter((o) => o.j !== i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          if (!edges.some((e) => (e.a === j && e.b === i) || (e.a === i && e.b === j))) edges.push({ a: i, b: j });
        });
    });

    packets = Array.from({ length: small ? 8 : 16 }, newPacket);

    labels = Array.from({ length: small ? 5 : 10 }, () => newLabel(true));
  }

  function newPacket() {
    return { e: Math.floor(Math.random() * edges.length), t: Math.random(), v: rand(0.002, 0.006), dir: Math.random() < 0.5 ? 1 : -1 };
  }

  function newLabel(anywhere) {
    return {
      text: TERMS[Math.floor(Math.random() * TERMS.length)],
      x: rand(20, w - 120), y: anywhere ? rand(0, h) : h + 20,
      v: rand(0.15, 0.35), a: rand(0.12, 0.28),
    };
  }

  function drawCloud(x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(10, 40);
    ctx.bezierCurveTo(-25, 40, -25, 0, 8, 2);
    ctx.bezierCurveTo(12, -32, 58, -38, 68, -8);
    ctx.bezierCurveTo(78, -30, 122, -24, 118, 8);
    ctx.bezierCurveTo(148, 8, 150, 40, 118, 40);
    ctx.closePath();
    ctx.fillStyle = `rgba(${GREEN}, 0.04)`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${GREEN}, 0.09)`;
    ctx.lineWidth = 1.2 / s;
    ctx.stroke();
    ctx.restore();
  }

  function drawServer(n, time) {
    const glow = 0.5 + 0.5 * Math.sin(time * 0.002 + n.phase);
    ctx.fillStyle = "rgba(15, 26, 22, 0.9)";
    ctx.strokeStyle = `rgba(${GREEN}, 0.25)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(n.x - 14, n.y - 10, 28, 20, 4);
    ctx.fill();
    ctx.stroke();
    // "luzes" do servidor
    ctx.fillStyle = `rgba(${GREEN}, ${0.25 + glow * 0.6})`;
    ctx.fillRect(n.x - 9, n.y - 4, 3, 3);
    ctx.fillStyle = `rgba(${GREEN}, 0.25)`;
    ctx.fillRect(n.x - 3, n.y - 4, 12, 1.5);
    ctx.fillRect(n.x - 3, n.y + 1, 9, 1.5);
  }

  function frame(time = 0) {
    ctx.clearRect(0, 0, w, h);

    // brilho atrás da foto
    const gx = w < 900 ? w / 2 : w * 0.75;
    const grad = ctx.createRadialGradient(gx, h * 0.45, 0, gx, h * 0.45, Math.max(w, h) * 0.5);
    grad.addColorStop(0, `rgba(${GREEN}, 0.10)`);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    clouds.forEach((c) => {
      drawCloud(c.x, c.y, c.s);
      c.x += c.v;
      if (c.x > w + 50) { c.x = -200 * c.s; c.y = rand(h * 0.05, h * 0.9); }
    });

    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = `rgba(${GREEN}, 0.12)`;
    ctx.lineWidth = 1;
    edges.forEach(({ a, b }) => {
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    packets.forEach((p, i) => {
      const e = edges[p.e];
      const [from, to] = p.dir > 0 ? [nodes[e.a], nodes[e.b]] : [nodes[e.b], nodes[e.a]];
      const x = from.x + (to.x - from.x) * p.t;
      const y = from.y + (to.y - from.y) * p.t;
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${GREEN}, 0.9)`;
      ctx.shadowColor = `rgb(${GREEN})`;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      p.t += p.v;
      if (p.t >= 1) packets[i] = newPacket();
    });

    nodes.forEach((n) => drawServer(n, time));

    ctx.font = '12px "JetBrains Mono", monospace';
    labels.forEach((l, i) => {
      ctx.fillStyle = `rgba(${GREEN}, ${l.a})`;
      ctx.fillText(l.text, l.x, l.y);
      l.y -= l.v;
      if (l.y < -20) labels[i] = newLabel(false);
    });

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  setup();
  frame();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setup();
      if (reduceMotion) frame();
    }, 150);
  });
})();
