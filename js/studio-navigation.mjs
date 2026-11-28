const presets = new Map([
  ["#studio/led", "examples/001-led-current-limiter.adigun.json"],
  ["#studio/rc-low-pass", "examples/012-rc-low-pass.adigun.json"]
]);

export function studioRoute(hash) {
  const preset = presets.get(hash);
  return { studio: hash === "#studio" || hash === "#workspace" || Boolean(preset), preset };
}

function drawOverview(canvas, motion, visible) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  function frame(time) {
    if (visible()) {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "#33506c70";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 36) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 0; y < height; y += 35) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();
      const phase = motion.matches ? 0 : time / 880;
      for (const [color, offset, amplitude, shift] of [["#68f3ff", -48, 68, 0], ["#b695ff", 51, 36, -0.72]]) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const y = height / 2 + offset + Math.sin(x / 46 - phase + shift) * amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#81cbe8";
      for (let i = 0; i < 24; i++) {
        const x = (i * 127 + phase * 9) % width;
        ctx.fillRect(x, (i * 67) % height, 2, 2);
      }
    }
    if (!motion.matches && visible()) requestAnimationFrame(frame);
  }
  return () => requestAnimationFrame(frame);
}

export function mountStudioNavigation(loadPreset) {
  const overview = document.querySelector("#studio-overview");
  const shell = document.querySelector("#studio-shell");
  const back = document.querySelector("#back-to-overview");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const animate = drawOverview(document.querySelector("#overview-traces"), motion, () => !overview.hidden);
  let previous;
  let priorPreset;
  const observer = "IntersectionObserver" in window && new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("overview-reveal");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  if (observer) overview.querySelectorAll(".overview-grid > *").forEach(card => observer.observe(card));

  function update() {
    const { studio, preset } = studioRoute(location.hash);
    overview.hidden = studio;
    shell.hidden = !studio;
    document.documentElement.dataset.adigunView = studio ? "studio" : "overview";
    if (studio !== previous) {
      if (!studio) animate?.();
      if (previous !== undefined) (studio ? back : overview.querySelector("h1")).focus({ preventScroll: true });
    }
    if (studio && preset && preset !== priorPreset) void loadPreset(preset);
    previous = studio;
    priorPreset = preset;
  }

  back.addEventListener("click", event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState(null, "", location.pathname + location.search);
    update();
  });
  addEventListener("hashchange", update);
  motion.addEventListener("change", () => { if (!overview.hidden) animate?.(); });
  update();
}
