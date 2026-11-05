/**
 * Randise Casino - Interactive Roulette Wheel with Casino Slot Lever
 * 
 * Features:
 * - Mechanical Casino Slot Machine Lever on the left
 * - 3D Continuous Quantum Atom / Randomizer Core Background (via Three.js)
 * - Interactive Movable Panels on Hover (3D Perspective Tilt)
 * - Clean Winner Screen: "Выпал(а) [Имя]! [N] место" without extra panels
 * - Progressive Places: 1-е -> 2-е -> 3-е место...
 * - Clean Participants Table without extra bottom panels
 * - "Обновить все" (reset/restore all) and "Удалить все" (clear all)
 * - Web Audio API procedural sound synthesizer
 */

(function () {
  'use strict';

  // Canvas roundRect Polyfill
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      if (typeof r === 'undefined') r = 0;
      if (typeof r === 'number') r = [r, r, r, r];
      const radius = r[0] || 0;
      this.beginPath();
      this.moveTo(x + radius, y);
      this.lineTo(x + w - radius, y);
      this.quadraticCurveTo(x + w, y, x + w, y + radius);
      this.lineTo(x + w, y + h - radius);
      this.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      this.lineTo(x + radius, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - radius);
      this.lineTo(x, y + radius);
      this.quadraticCurveTo(x, y, x + radius, y);
      this.closePath();
      return this;
    };
  }

  // --- PALETTE (Vibrant, high contrast, smooth colors) ---
  const PALETTE = [
    { bg: '#ec4899', text: '#ffffff' }, // Pink / Magenta
    { bg: '#8b5cf6', text: '#ffffff' }, // Violet
    { bg: '#06b6d4', text: '#ffffff' }, // Cyan
    { bg: '#f59e0b', text: '#000000' }, // Amber / Gold
    { bg: '#10b981', text: '#ffffff' }, // Emerald
    { bg: '#f43f5e', text: '#ffffff' }, // Rose
    { bg: '#3b82f6', text: '#ffffff' }, // Blue
    { bg: '#a855f7', text: '#ffffff' }, // Purple
    { bg: '#f97316', text: '#ffffff' }, // Orange
    { bg: '#14b8a6', text: '#ffffff' }, // Teal
    { bg: '#d946ef', text: '#ffffff' }, // Fuchsia
    { bg: '#84cc16', text: '#000000' }, // Lime
    { bg: '#6366f1', text: '#ffffff' }, // Indigo
    { bg: '#e11d48', text: '#ffffff' }, // Crimson
    { bg: '#0284c7', text: '#ffffff' }, // Sky
    { bg: '#22c55e', text: '#ffffff' }, // Green
  ];

  function getColorForIndex(index) {
    if (index < PALETTE.length) {
      return PALETTE[index];
    }
    const hue = Math.round((index * 137.508) % 360);
    const bg = `hsl(${hue}, 85%, 54%)`;
    const text = hue > 45 && hue < 185 ? '#000000' : '#ffffff';
    return { bg, text };
  }

  // --- AUDIO SYNTHESIZER ---
  class SoundEffects {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // Casino Slot Mechanical Lever Pull Sound
    playLeverPull() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;

        // 1. Heavy mechanical clunk / ratchet
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);

        // 2. High metallic spring ratchet tick
        setTimeout(() => {
          if (!this.ctx) return;
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(880, this.ctx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.08);

          gain2.gain.setValueAtTime(0.28, this.ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);
          osc2.start();
          osc2.stop(this.ctx.currentTime + 0.08);
        }, 90);
      } catch (e) {}
    }

    playTick(pitchOffset = 0) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const freq = Math.max(120, 660 + pitchOffset + (Math.random() * 40 - 20));
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.035);

        gain.gain.setValueAtTime(0.24, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.035);
      } catch (e) {}
    }

    playWhoosh() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.45);
      } catch (e) {}
    }

    playWinFanfare() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          const startTime = now + idx * 0.12;
          const duration = idx === notes.length - 1 ? 0.9 : 0.28;

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(0.3, startTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      } catch (e) {}
    }
  }

  const sfx = new SoundEffects();

  // --- APP STATE ---
  const DEFAULT_USERS = [
    'Айя',
    'Алексей Морозов',
    'Екатерина Смирнова',
    'Артур Пирожков',
    'Мария Иванова',
    'Дмитрий Волков',
    'Анастасия Павлова',
    'Кирилл Соколов'
  ];

  let users = [];
  let winners = [];
  let initialPool = [];
  let isSpinning = false;
  let activeTab = 'wheel';
  let needleDeflection = 0;

  function loadState() {
    try {
      const storedUsers = localStorage.getItem('randise_v3_users');
      const storedWinners = localStorage.getItem('randise_v3_winners');
      const storedPool = localStorage.getItem('randise_v3_pool');

      users = storedUsers !== null ? JSON.parse(storedUsers) : [...DEFAULT_USERS];
      winners = storedWinners !== null ? JSON.parse(storedWinners) : [];
      initialPool = storedPool !== null ? JSON.parse(storedPool) : [...DEFAULT_USERS];
    } catch (e) {
      users = [...DEFAULT_USERS];
      winners = [];
      initialPool = [...DEFAULT_USERS];
    }
  }

  function saveState() {
    try {
      localStorage.setItem('randise_v3_users', JSON.stringify(users));
      localStorage.setItem('randise_v3_winners', JSON.stringify(winners));
      localStorage.setItem('randise_v3_pool', JSON.stringify(initialPool));
    } catch (e) {}
  }

  // --- DOM CACHE ---
  const el = {};

  function cacheDom() {
    el.wheelCanvas = document.getElementById('wheelCanvas');
    el.tapeContainer = document.getElementById('tapeContainer');
    el.tapeTrack = document.getElementById('tapeTrack');

    // Casino Lever elements
    el.casinoLeverContainer = document.getElementById('casinoLeverContainer');
    el.casinoLever = document.getElementById('casinoLever');
    el.spinStatusText = document.getElementById('spinStatusText');
    el.leverStatusPill = document.getElementById('leverStatusPill');

    el.viewWheelTab = document.getElementById('viewWheelTab');
    el.viewTapeTab = document.getElementById('viewTapeTab');
    el.wheelWrapper = document.getElementById('wheelWrapper');
    el.tapeWrapper = document.getElementById('tapeWrapper');
    el.currentTickerName = document.getElementById('currentTickerName');
    el.tickerBadge = document.getElementById('tickerBadge');

    el.topUsernameInput = document.getElementById('usernameInput');
    el.addUserBtn = document.getElementById('addUserBtn');
    el.usersTableBody = document.getElementById('usersTableBody');
    el.userCountBadge = document.getElementById('userCountBadge');

    el.resetAllBtn = document.getElementById('resetAllBtn');
    el.deleteAllBtn = document.getElementById('deleteAllBtn');
    el.shuffleUsersBtn = document.getElementById('shuffleUsersBtn');
    el.demoUsersBtn = document.getElementById('demoUsersBtn');

    el.winnersList = document.getElementById('winnersList');
    el.winnerCountBadge = document.getElementById('winnerCountBadge');
    el.clearWinnersBtn = document.getElementById('clearWinnersBtn');
    el.firstPlaceCard = document.getElementById('firstPlaceCard');
    el.firstPlaceName = document.getElementById('firstPlaceName');
    el.firstPlaceDetails = document.getElementById('firstPlaceDetails');

    el.audioToggleBtn = document.getElementById('audioToggleBtn');
    el.fullscreenToggleBtn = document.getElementById('fullscreenToggleBtn');

    // Clean Winner Modal
    el.winnerModal = document.getElementById('winnerModal');
    el.cleanWinnerTitle = document.getElementById('cleanWinnerTitle');
    el.cleanWinnerName = document.getElementById('cleanWinnerName');
    el.cleanWinnerPlace = document.getElementById('cleanWinnerPlace');
    el.continueSpinBtn = document.getElementById('continueSpinBtn');
  }

  // --- CANVAS WHEEL ---
  let ctx = null;
  let wheelRotation = 0;
  let lastPassedIndex = -1;

  function resizeCanvas() {
    if (!el.wheelCanvas) return;
    const canvas = el.wheelCanvas;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    drawWheel();
  }

  function getPointerAngle() {
    return -Math.PI / 2; // 12 o'clock pointer
  }

  function getHoveredUserIndex(currentAngle) {
    if (users.length === 0) return -1;
    const sliceAngle = (2 * Math.PI) / users.length;
    let normalized = (getPointerAngle() - currentAngle) % (2 * Math.PI);
    if (normalized < 0) normalized += 2 * Math.PI;
    return Math.floor(normalized / sliceAngle) % users.length;
  }

  function drawWheel() {
    if (!el.wheelCanvas || !ctx) return;
    const rect = el.wheelCanvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, width, height);

    if (users.length === 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#140523';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.stroke();

      ctx.fillStyle = '#c4b5fd';
      ctx.font = '600 15px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Добавьте участников справа ➔', centerX, centerY);
      ctx.restore();
      return;
    }

    const numSlices = users.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.save();
    ctx.translate(centerX, centerY);

    // Outer glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius + 8, 0, 2 * Math.PI);
    ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
    ctx.shadowBlur = 26;
    ctx.strokeStyle = 'rgba(216, 70, 239, 0.4)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // Outer rim ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius + 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#120421';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#270c43';
    ctx.stroke();

    // Rim studs
    const numStuds = Math.max(16, Math.min(64, numSlices * 2));
    for (let i = 0; i < numStuds; i++) {
      const studAngle = (i * 2 * Math.PI) / numStuds;
      const sx = (radius + 4) * Math.cos(studAngle);
      const sy = (radius + 4) * Math.sin(studAngle);
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? '#ec4899' : '#fbcfe8';
      ctx.fill();
    }
    ctx.restore();

    // Rotate and draw slices
    ctx.save();
    ctx.rotate(wheelRotation);

    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const color = getColorForIndex(i);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color.bg;
      ctx.fill();

      ctx.save();
      ctx.clip();
      const grad = ctx.createRadialGradient(0, 0, radius * 0.15, 0, 0, radius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = numSlices > 30 ? 1 : 2;
      ctx.stroke();

      // Username Text
      ctx.save();
      const midAngle = startAngle + sliceAngle / 2;
      ctx.rotate(midAngle);

      const textX = radius * 0.58;
      const textY = 0;
      const maxTextWidth = radius * 0.52;

      let fontSize = Math.floor(Math.min(21, Math.max(11, ((2 * Math.PI * radius) / numSlices) * 0.32)));
      if (numSlices <= 6) fontSize = 22;
      else if (numSlices <= 12) fontSize = 18;
      else if (numSlices <= 20) fontSize = 14;
      else if (numSlices <= 35) fontSize = 12;
      else fontSize = 10;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `800 ${fontSize}px 'Outfit', 'Inter', system-ui, sans-serif`;

      let displayName = users[i];
      if (ctx.measureText(displayName).width > maxTextWidth) {
        while (displayName.length > 2 && ctx.measureText(displayName + '…').width > maxTextWidth) {
          displayName = displayName.slice(0, -1);
        }
        displayName += '…';
      }

      const metrics = ctx.measureText(displayName);
      const pillWidth = metrics.width + 14;
      const pillHeight = fontSize + 7;

      ctx.fillStyle = 'rgba(10, 3, 18, 0.75)';
      if (ctx.roundRect) {
        ctx.roundRect(textX - pillWidth / 2, textY - pillHeight / 2, pillWidth, pillHeight, 5);
        ctx.fill();
      } else {
        ctx.fillRect(textX - pillWidth / 2, textY - pillHeight / 2, pillWidth, pillHeight);
      }

      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 5;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(displayName, textX, textY);

      ctx.restore();
    }
    ctx.restore(); // end rotate

    // Center Hub
    const hubRadius = Math.max(38, radius * 0.18);
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius, 0, 2 * Math.PI);
    const hubGrad = ctx.createLinearGradient(-hubRadius, -hubRadius, hubRadius, hubRadius);
    hubGrad.addColorStop(0, '#4c1d95');
    hubGrad.addColorStop(0.5, '#1e0836');
    hubGrad.addColorStop(1, '#2e1065');
    ctx.fillStyle = hubGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 14;
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#c026d3';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#f472b6';
    ctx.fill();
    ctx.restore();

    // Flapper Pointer Needle (12 o'clock)
    ctx.save();
    const pointerY = -radius + 4;
    ctx.translate(0, pointerY);
    ctx.rotate(needleDeflection);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    ctx.moveTo(-14, -20);
    ctx.lineTo(14, -20);
    ctx.lineTo(0, 18);
    ctx.closePath();

    const pointerGrad = ctx.createLinearGradient(-14, -20, 14, 18);
    pointerGrad.addColorStop(0, '#f43f5e');
    pointerGrad.addColorStop(0.5, '#fb7185');
    pointerGrad.addColorStop(1, '#e11d48');
    ctx.fillStyle = pointerGrad;
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -18, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();

    ctx.restore(); // end translate
  }

  // --- TAPE CS:GO REEL MODE ---
  let tapeItems = [];

  function setupTapeTrack() {
    if (!el.tapeTrack) return;
    el.tapeTrack.innerHTML = '';
    if (users.length === 0) {
      el.tapeTrack.innerHTML = `<div class="tape-empty">Добавьте участников для запуска рулетки</div>`;
      return;
    }

    tapeItems = [];
    const repeatCount = Math.max(14, Math.ceil(70 / users.length));
    for (let r = 0; r < repeatCount; r++) {
      for (let i = 0; i < users.length; i++) {
        tapeItems.push({
          user: users[i],
          originalIndex: i,
          color: getColorForIndex(i)
        });
      }
    }

    const fragment = document.createDocumentFragment();
    tapeItems.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'tape-card';
      card.id = `tape-card-${idx}`;
      card.style.borderTop = `4px solid ${item.color.bg}`;
      card.innerHTML = `
        <div class="tape-card-avatar" style="background: ${item.color.bg}; color: ${item.color.text}">
          ${getInitials(item.user)}
        </div>
        <div class="tape-card-name" title="${escapeHtml(item.user)}">${escapeHtml(item.user)}</div>
      `;
      fragment.appendChild(card);
    });
    el.tapeTrack.appendChild(fragment);
  }

  function renderTape() {
    setupTapeTrack();
    if (el.tapeTrack) {
      el.tapeTrack.style.transform = `translateX(0px)`;
    }
  }

  // --- CASINO LEVER PULL & SPIN LOGIC ---
  function getNextPlaceNumber() {
    return winners.length + 1;
  }

  function updateStatusPill(spinning) {
    const nextPlace = getNextPlaceNumber();
    if (spinning) {
      el.leverStatusPill.classList.add('spinning');
      el.spinStatusText.textContent = `Крутится рулетка (${nextPlace} МЕСТО)...`;
    } else {
      el.leverStatusPill.classList.remove('spinning');
      if (users.length > 0) {
        el.spinStatusText.textContent = `Потяните рычаг слева (Раунд на ${nextPlace} место)`;
      } else {
        el.spinStatusText.textContent = 'Все участники разыграны! Нажмите «Обновить все»';
      }
    }
  }

  function pullLeverAndSpin() {
    if (isSpinning) return;
    if (users.length === 0) {
      alert('Список участников пуст! Нажмите «Обновить все» или добавьте новые имена.');
      if (el.topUsernameInput) el.topUsernameInput.focus();
      return;
    }

    // Trigger mechanical lever pull animation
    if (el.casinoLeverContainer) {
      el.casinoLeverContainer.classList.add('pulling');
    }
    sfx.playLeverPull();

    setTimeout(() => {
      if (el.casinoLeverContainer) {
        el.casinoLeverContainer.classList.remove('pulling');
      }
    }, 280);

    // Spin start
    spin();
  }

  function spin() {
    if (isSpinning) return;
    if (users.length === 0) return;

    isSpinning = true;
    updateStatusPill(true);
    sfx.playWhoosh();

    const winnerIndex = Math.floor(Math.random() * users.length);
    const winnerName = users[winnerIndex];

    if (activeTab === 'wheel') {
      spinWheel(winnerIndex, winnerName);
    } else {
      spinTape(winnerIndex, winnerName);
    }
  }

  function spinWheel(targetIndex, winnerName) {
    const numSlices = users.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const targetSliceMid = targetIndex * sliceAngle + sliceAngle / 2;
    const organicOffset = (Math.random() - 0.5) * (sliceAngle * 0.7);

    let desiredWheelAngle = getPointerAngle() - (targetSliceMid + organicOffset);
    desiredWheelAngle = desiredWheelAngle % (2 * Math.PI);
    if (desiredWheelAngle < 0) desiredWheelAngle += 2 * Math.PI;

    const currentNorm = wheelRotation % (2 * Math.PI);
    let delta = desiredWheelAngle - currentNorm;
    if (delta < 0) delta += 2 * Math.PI;

    const fullSpins = 6 + Math.floor(Math.random() * 3);
    const totalRotation = fullSpins * 2 * Math.PI + delta;

    const startRotation = wheelRotation;
    const finalRotation = startRotation + totalRotation;
    const duration = 6500;
    const startTime = performance.now();

    lastPassedIndex = -1;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 4);

      wheelRotation = startRotation + totalRotation * ease;

      const currentIndex = getHoveredUserIndex(wheelRotation);
      if (currentIndex !== -1 && currentIndex !== lastPassedIndex) {
        lastPassedIndex = currentIndex;
        const pitch = Math.max(-200, (1 - progress) * 200);
        sfx.playTick(pitch);

        needleDeflection = -0.32 * (1 - progress * 0.7);
        updateTickerHUD(users[currentIndex], getColorForIndex(currentIndex));
      } else {
        needleDeflection *= 0.85;
      }

      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        wheelRotation = finalRotation;
        needleDeflection = 0;
        drawWheel();
        onSpinComplete(winnerName, targetIndex);
      }
    }

    requestAnimationFrame(animate);
  }

  function spinTape(targetIndex, winnerName) {
    if (!el.tapeTrack || tapeItems.length === 0) {
      onSpinComplete(winnerName, targetIndex);
      return;
    }

    const cardWidth = 148;
    const containerWidth = el.tapeContainer.offsetWidth;
    const centerPoint = containerWidth / 2;

    const candidates = [];
    for (let i = 25; i < tapeItems.length - 5; i++) {
      if (tapeItems[i].originalIndex === targetIndex) {
        candidates.push(i);
      }
    }

    const chosenItemIdx = candidates[Math.floor(candidates.length / 2)] || 30;
    const cardCenter = chosenItemIdx * cardWidth + cardWidth / 2;
    const randomCardOffset = (Math.random() - 0.5) * (cardWidth * 0.6);
    const targetScroll = cardCenter - centerPoint + randomCardOffset;

    const startScroll = 0;
    const duration = 6500;
    const startTime = performance.now();
    let lastCardIdx = -1;

    function animateTape(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 4);

      const currentScroll = startScroll + targetScroll * ease;
      el.tapeTrack.style.transform = `translateX(-${currentScroll}px)`;

      const currentPassingIdx = Math.floor((currentScroll + centerPoint) / cardWidth);
      if (currentPassingIdx >= 0 && currentPassingIdx < tapeItems.length && currentPassingIdx !== lastCardIdx) {
        lastCardIdx = currentPassingIdx;
        sfx.playTick((1 - progress) * 150);
        const item = tapeItems[currentPassingIdx];
        updateTickerHUD(item.user, item.color);
      }

      if (progress < 1) {
        requestAnimationFrame(animateTape);
      } else {
        el.tapeTrack.style.transform = `translateX(-${targetScroll}px)`;
        onSpinComplete(winnerName, targetIndex);
      }
    }

    requestAnimationFrame(animateTape);
  }

  function updateTickerHUD(name, color) {
    if (!el.currentTickerName) return;
    el.currentTickerName.textContent = name;
    if (el.tickerBadge) {
      el.tickerBadge.style.backgroundColor = color.bg;
      el.tickerBadge.style.boxShadow = `0 0 10px ${color.bg}`;
    }
  }

  // --- CLEAN WINNER SCREEN (БЕЗ ЛИШНИХ ПАНЕЛЕЙ И ПОДРОБНОСТЕЙ) ---
  function getWinVerb(name) {
    const trimmed = name.trim();
    const lastChar = trimmed.slice(-1).toLowerCase();
    return (lastChar === 'а' || lastChar === 'я') ? 'Выпала' : 'Выпал';
  }

  function fireCelebrationConfetti() {
    if (!window.confetti) return;
    window.confetti({ particleCount: 130, origin: { x: 0.5, y: 0.45 } });
    setTimeout(() => {
      if (window.confetti) {
        window.confetti({ particleCount: 75, angleMin: 45, angleMax: 85, origin: { x: 0.1, y: 0.8 } });
      }
    }, 220);
    setTimeout(() => {
      if (window.confetti) {
        window.confetti({ particleCount: 75, angleMin: 95, angleMax: 135, origin: { x: 0.9, y: 0.8 } });
      }
    }, 400);
  }

  function onSpinComplete(winnerName, winnerIndex) {
    isSpinning = false;

    const place = winners.length + 1;
    const winnerColor = getColorForIndex(winnerIndex);

    const newWinnerRecord = {
      name: winnerName,
      place: place,
      color: winnerColor,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    winners.push(newWinnerRecord);

    // Requirement: "он должн автоматом вылетать из списка который предоставлен справа"
    users.splice(winnerIndex, 1);

    saveState();

    renderUsersTable();
    renderWinnersList();
    drawWheel();
    if (activeTab === 'tape') renderTape();
    updateStatusPill(false);

    sfx.playWinFanfare();
    fireCelebrationConfetti();

    showCleanWinner(newWinnerRecord);
  }

  function showCleanWinner(winner) {
    const verb = getWinVerb(winner.name);
    const place = winner.place;

    // Requirement: "вот выпал человек и нужно написать то что выпал такой то человек и все без всяких лишних панелей"
    el.cleanWinnerTitle.innerHTML = `${verb} <span class="clean-winner-name">${escapeHtml(winner.name)}</span>!`;
    el.cleanWinnerPlace.textContent = `🥇 ${place} место`;

    el.winnerModal.classList.add('active');
  }

  function hideCleanWinner() {
    el.winnerModal.classList.remove('active');
  }

  // --- "ОБНОВИТЬ ВСЕ" (RESET/RESTORE ALL) & "УДАЛИТЬ ВСЕ" ---
  function resetAll() {
    if (isSpinning) return;

    const allKnown = new Set();
    initialPool.forEach(name => allKnown.add(name));
    users.forEach(name => allKnown.add(name));
    winners.forEach(w => allKnown.add(w.name));

    if (allKnown.size === 0) {
      DEFAULT_USERS.forEach(name => allKnown.add(name));
    }

    users = Array.from(allKnown);
    winners = [];

    saveState();
    renderUsersTable();
    renderWinnersList();
    drawWheel();
    if (activeTab === 'tape') renderTape();
    updateStatusPill(false);

    alert(`Все участники (${users.length}) возвращены! Раунды сброшены к 1 месту.`);
  }

  function deleteAll() {
    if (isSpinning) return;
    if (users.length === 0 && winners.length === 0) return;

    if (confirm('Удалить всех участников из списка?')) {
      users = [];
      winners = [];
      initialPool = [];
      saveState();
      renderUsersTable();
      renderWinnersList();
      drawWheel();
      if (activeTab === 'tape') renderTape();
      updateStatusPill(false);
    }
  }

  // --- PARTICIPANTS TABLE (RIGHT PANEL) ---
  function renderUsersTable() {
    el.usersTableBody.innerHTML = '';
    el.userCountBadge.textContent = users.length;

    if (users.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'empty-row';
      emptyRow.innerHTML = `
        <td colspan="4" class="empty-cell">
          <div class="empty-placeholder">
            <span>✨</span>
            <p>Список пуст</p>
            <small>Напишите имя выше и нажмите Enter</small>
          </div>
        </td>
      `;
      el.usersTableBody.appendChild(emptyRow);
      return;
    }

    const fragment = document.createDocumentFragment();

    users.forEach((username, index) => {
      const color = getColorForIndex(index);
      const row = document.createElement('tr');
      row.className = 'user-row';
      row.id = `user-row-${index}`;

      row.innerHTML = `
        <td class="col-num">${index + 1}</td>
        <td class="col-avatar">
          <div class="user-color-badge" style="background: ${color.bg}; color: ${color.text}">
            ${getInitials(username)}
          </div>
        </td>
        <td class="col-name">
          <span class="user-name-text" title="${escapeHtml(username)}">${escapeHtml(username)}</span>
        </td>
        <td class="col-actions">
          <button class="row-delete-btn" title="Удалить из списка" data-index="${index}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </td>
      `;

      fragment.appendChild(row);
    });

    el.usersTableBody.appendChild(fragment);
  }

  function addUserFromText(rawVal) {
    if (isSpinning) return;
    if (!rawVal) return;

    let newNames = [];
    if (rawVal.includes('\n') || rawVal.includes(',')) {
      newNames = rawVal.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    } else {
      newNames = [rawVal];
    }

    users.push(...newNames);
    newNames.forEach(n => {
      if (!initialPool.includes(n)) initialPool.push(n);
    });

    saveState();
    renderUsersTable();
    drawWheel();
    if (activeTab === 'tape') renderTape();
    updateStatusPill(false);

    const container = document.querySelector('.table-scroll-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  function removeUser(index) {
    if (isSpinning) return;
    if (index >= 0 && index < users.length) {
      users.splice(index, 1);
      saveState();
      renderUsersTable();
      drawWheel();
      if (activeTab === 'tape') renderTape();
      updateStatusPill(false);
    }
  }

  // --- WINNERS LIST (LEFT PANEL) ---
  function renderWinnersList() {
    el.winnerCountBadge.textContent = winners.length;

    if (winners.length > 0 && winners[0]) {
      const champ = winners[0];
      el.firstPlaceCard.style.display = 'flex';
      el.firstPlaceName.textContent = champ.name;
      el.firstPlaceDetails.textContent = `Победитель 1-го места • ${champ.timestamp || 'недавно'}`;
    } else {
      el.firstPlaceCard.style.display = 'none';
    }

    el.winnersList.innerHTML = '';
    if (winners.length === 0) {
      el.winnersList.innerHTML = `
        <div class="empty-winners">
          <span>🏆</span>
          <p>Победителей пока нет</p>
          <small>Потяните рычаг, чтобы определить 1-е место!</small>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    winners.forEach((winner, index) => {
      const placeNum = winner.place || index + 1;
      const item = document.createElement('div');
      item.className = `winner-card place-${placeNum <= 3 ? placeNum : 'other'}`;

      let placeBadgeIcon = '';
      if (placeNum === 1) placeBadgeIcon = '🥇 1 МЕСТО';
      else if (placeNum === 2) placeBadgeIcon = '🥈 2 МЕСТО';
      else if (placeNum === 3) placeBadgeIcon = '🥉 3 МЕСТО';
      else placeBadgeIcon = `🎖️ ${placeNum} МЕСТО`;

      item.innerHTML = `
        <div class="winner-place-pill">${placeBadgeIcon}</div>
        <div class="winner-info-row">
          <div class="winner-avatar" style="background: ${winner.color?.bg || '#9333ea'}; color: ${winner.color?.text || '#fff'}">
            ${getInitials(winner.name)}
          </div>
          <div class="winner-text-wrap">
            <span class="winner-name">${escapeHtml(winner.name)}</span>
            <span class="winner-time">${winner.timestamp || ''}</span>
          </div>
          <button class="restore-winner-btn" title="Вернуть участника обратно в рулетку" data-index="${index}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
          </button>
        </div>
      `;

      fragment.appendChild(item);
    });

    el.winnersList.appendChild(fragment);
  }

  function restoreWinner(index) {
    if (isSpinning) return;
    if (index >= 0 && index < winners.length) {
      const [restored] = winners.splice(index, 1);
      users.push(restored.name);
      saveState();
      renderWinnersList();
      renderUsersTable();
      drawWheel();
      if (activeTab === 'tape') renderTape();
      updateStatusPill(false);
    }
  }

  // --- INTERACTIVE MOVABLE PANELS ON HOVER ---
  function setupInteractivePanels() {
    const panels = document.querySelectorAll('.interactive-panel');
    panels.forEach((panel) => {
      panel.addEventListener('mousemove', (e) => {
        const rect = panel.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        // Subtle, smooth 3D tilt
        panel.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-5px) scale(1.008)`;
      });

      panel.addEventListener('mouseleave', () => {
        panel.style.transform = '';
      });
    });
  }

  // --- UTILS ---
  function getInitials(name) {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // 1. Casino Slot Machine Lever Interaction
    if (el.casinoLeverContainer) {
      el.casinoLeverContainer.addEventListener('click', pullLeverAndSpin);

      // Support drag down
      let isDragging = false;
      let startY = 0;

      el.casinoLeverContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
      });

      window.addEventListener('mouseup', (e) => {
        if (isDragging) {
          isDragging = false;
          if (e.clientY - startY > 30) {
            pullLeverAndSpin();
          }
        }
      });
    }

    // 2. Spacebar Key Shortcut
    document.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable
      );

      if (e.key === 'Escape' && el.winnerModal.classList.contains('active')) {
        hideCleanWinner();
        return;
      }

      if (e.code === 'Space' && !isInputFocused) {
        e.preventDefault();
        if (el.winnerModal.classList.contains('active')) {
          hideCleanWinner();
        } else {
          pullLeverAndSpin();
        }
      }
    });

    // 3. User Input
    if (el.topUsernameInput) {
      el.topUsernameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = el.topUsernameInput.value.trim();
          if (val) {
            addUserFromText(val);
            el.topUsernameInput.value = '';
          }
        }
      });
    }

    if (el.addUserBtn) {
      el.addUserBtn.addEventListener('click', () => {
        const val = el.topUsernameInput.value.trim();
        if (val) {
          addUserFromText(val);
          el.topUsernameInput.value = '';
        }
      });
    }

    // 4. Table Delete Buttons
    el.usersTableBody.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.row-delete-btn');
      if (delBtn) {
        const idx = parseInt(delBtn.dataset.index, 10);
        removeUser(idx);
      }
    });

    // 5. Winners list restore
    el.winnersList.addEventListener('click', (e) => {
      const restoreBtn = e.target.closest('.restore-winner-btn');
      if (restoreBtn) {
        const idx = parseInt(restoreBtn.dataset.index, 10);
        restoreWinner(idx);
      }
    });

    // 6. Action buttons
    el.resetAllBtn.addEventListener('click', resetAll);
    el.deleteAllBtn.addEventListener('click', deleteAll);

    // 7. Tabs
    el.viewWheelTab.addEventListener('click', () => {
      activeTab = 'wheel';
      el.viewWheelTab.classList.add('active');
      el.viewTapeTab.classList.remove('active');
      el.wheelWrapper.style.display = 'flex';
      el.tapeWrapper.style.display = 'none';
      resizeCanvas();
    });

    el.viewTapeTab.addEventListener('click', () => {
      activeTab = 'tape';
      el.viewTapeTab.classList.add('active');
      el.viewWheelTab.classList.remove('active');
      el.wheelWrapper.style.display = 'none';
      el.tapeWrapper.style.display = 'flex';
      renderTape();
    });

    // 8. Quick Tools
    el.shuffleUsersBtn.addEventListener('click', () => {
      if (isSpinning) return;
      if (users.length < 2) return;
      for (let i = users.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [users[i], users[j]] = [users[j], users[i]];
      }
      saveState();
      renderUsersTable();
      drawWheel();
      if (activeTab === 'tape') renderTape();
    });

    el.demoUsersBtn.addEventListener('click', () => {
      if (isSpinning) return;
      users = [...DEFAULT_USERS];
      initialPool = [...DEFAULT_USERS];
      saveState();
      renderUsersTable();
      drawWheel();
      if (activeTab === 'tape') renderTape();
      updateStatusPill(false);
    });

    el.clearWinnersBtn.addEventListener('click', () => {
      if (isSpinning) return;
      if (winners.length === 0) return;
      if (confirm('Сбросить только историю пьедестала?')) {
        winners = [];
        saveState();
        renderWinnersList();
        updateStatusPill(false);
      }
    });

    // 9. Clean Winner Modal button
    el.continueSpinBtn.addEventListener('click', () => {
      hideCleanWinner();
    });

    // 10. Audio & Fullscreen
    el.audioToggleBtn.addEventListener('click', () => {
      sfx.enabled = !sfx.enabled;
      el.audioToggleBtn.classList.toggle('muted', !sfx.enabled);
      el.audioToggleBtn.title = sfx.enabled ? 'Звук включен' : 'Звук выключен';
    });

    el.fullscreenToggleBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    window.addEventListener('resize', () => {
      resizeCanvas();
      if (activeTab === 'tape') renderTape();
    });
  }

  // --- INITIALIZATION ---
  function init() {
    cacheDom();
    loadState();
    setupEventListeners();
    setupInteractivePanels();
    renderUsersTable();
    renderWinnersList();
    updateStatusPill(false);

    setTimeout(() => {
      resizeCanvas();
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
