// Standalone Confetti Physics Engine (offline, no external network needed)
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.confetti = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let animationId = null;
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
  }
  window.addEventListener('resize', resize);
  resize();

  const DEFAULT_COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#84cc16', '#eab308', '#f97316'];

  class Particle {
    constructor(x, y, options) {
      this.x = x * window.devicePixelRatio;
      this.y = y * window.devicePixelRatio;
      this.size = (Math.random() * 8 + 6) * window.devicePixelRatio;
      this.color = options.colors[Math.floor(Math.random() * options.colors.length)];
      
      const angle = (Math.random() * (options.angleMax - options.angleMin) + options.angleMin) * Math.PI / 180;
      const speed = (Math.random() * (options.velocityMax - options.velocityMin) + options.velocityMin) * window.devicePixelRatio;
      
      this.vx = Math.cos(angle) * speed;
      this.vy = -Math.sin(angle) * speed;
      this.gravity = 0.4 * window.devicePixelRatio;
      this.drag = 0.96;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 12;
      this.wobble = Math.random() * 10;
      this.wobbleSpeed = 0.1;
      this.opacity = 1;
      this.decay = Math.random() * 0.015 + 0.008;
      this.shape = Math.random() > 0.4 ? 'rect' : 'circle';
    }

    update() {
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.wobble += this.wobbleSpeed;
      this.opacity -= this.decay;
      return this.opacity > 0 && this.y < canvas.height + 50;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.scale(Math.sin(this.wobble), 1);
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;

      if (this.shape === 'rect') {
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => {
      const alive = p.update();
      if (alive) p.draw(ctx);
      return alive;
    });

    if (particles.length > 0) {
      animationId = requestAnimationFrame(loop);
    } else {
      animationId = null;
    }
  }

  return function fire(opts = {}) {
    resize();
    const count = opts.particleCount || 100;
    const origin = opts.origin || { x: 0.5, y: 0.6 };
    const options = {
      colors: opts.colors || DEFAULT_COLORS,
      angleMin: opts.angleMin !== undefined ? opts.angleMin : 45,
      angleMax: opts.angleMax !== undefined ? opts.angleMax : 135,
      velocityMin: opts.velocityMin !== undefined ? opts.velocityMin : 12,
      velocityMax: opts.velocityMax !== undefined ? opts.velocityMax : 28
    };

    const startX = window.innerWidth * origin.x;
    const startY = window.innerHeight * origin.y;

    for (let i = 0; i < count; i++) {
      particles.push(new Particle(startX, startY, options));
    }

    if (!animationId) {
      loop();
    }
  };
}));

