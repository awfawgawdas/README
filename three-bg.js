/**
 * Three.js 3D Background - Continuous Lucky Quantum Atom / Randomizer Core
 * Runs automatically upon entering the site.
 * Renders an animated glowing 3D Atom with orbital rings, glowing nodes, and drifting starfield.
 */

(function () {
  'use strict';

  function init3DBackground() {
    const canvas = document.getElementById('bg3d-canvas');
    if (!canvas) return;

    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded, skipping 3D background');
      return;
    }

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 18;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('WebGL not supported:', e);
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0x2e0854, 2.5);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0xd946ef, 3, 50);
    light1.position.set(10, 10, 10);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x38bdf8, 2.5, 50);
    light2.position.set(-10, -10, 10);
    scene.add(light2);

    const light3 = new THREE.PointLight(0xf59e0b, 2, 40);
    light3.position.set(0, 8, -5);
    scene.add(light3);

    // Main Group containing the Quantum Atom
    const atomGroup = new THREE.Group();
    // Offset slightly towards center-right or center for aesthetic balance
    atomGroup.position.set(0, 0, 0);
    scene.add(atomGroup);

    // 3. Central Quantum Core (Lucky Polyhedron + Inner Glow Sphere)
    // Outer wireframe icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(2.8, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xd946ef,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
      roughness: 0.3,
      metalness: 0.8
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    atomGroup.add(coreMesh);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    atomGroup.add(innerMesh);

    // Dodecahedron facet shell
    const shellGeo = new THREE.DodecahedronGeometry(2.1);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    atomGroup.add(shellMesh);

    // 4. Orbital Electron Rings with Nodes
    const rings = [];
    const ringConfigs = [
      { radius: 4.8, tube: 0.045, color: 0xd946ef, rotX: Math.PI / 3, rotY: 0, rotZ: Math.PI / 6, speed: 0.018 },
      { radius: 6.0, tube: 0.045, color: 0x8b5cf6, rotX: -Math.PI / 4, rotY: Math.PI / 4, rotZ: 0, speed: -0.014 },
      { radius: 7.2, tube: 0.04, color: 0x06b6d4, rotX: Math.PI / 6, rotY: -Math.PI / 3, rotZ: Math.PI / 4, speed: 0.012 },
      { radius: 8.4, tube: 0.035, color: 0xf59e0b, rotX: -Math.PI / 3, rotY: Math.PI / 6, rotZ: -Math.PI / 4, speed: -0.009 }
    ];

    ringConfigs.forEach((cfg) => {
      const ringGroup = new THREE.Group();
      ringGroup.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ);

      // Torus
      const torusGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 120);
      const torusMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.7,
        transparent: true,
        opacity: 0.65
      });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      ringGroup.add(torusMesh);

      // Orbiting quantum node (electron sphere)
      const nodeGeo = new THREE.SphereGeometry(0.32, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: cfg.color,
        emissiveIntensity: 1.2,
        roughness: 0.1,
        metalness: 0.5
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      ringGroup.add(nodeMesh);

      atomGroup.add(ringGroup);

      rings.push({
        group: ringGroup,
        node: nodeMesh,
        radius: cfg.radius,
        speed: cfg.speed,
        angle: Math.random() * Math.PI * 2
      });
    });

    // 5. Ambient Floating Starfield & Casino Luck Dust
    const starsCount = 90;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    const paletteColors = [
      new THREE.Color(0xd946ef),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xf59e0b)
    ];

    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 45;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 35;
      starPositions[i3 + 2] = (Math.random() - 0.5) * 30 - 2;

      const c = paletteColors[Math.floor(Math.random() * paletteColors.length)];
      starColors[i3] = c.r;
      starColors[i3 + 1] = c.g;
      starColors[i3 + 2] = c.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.75
    });

    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 6. Mouse Interaction Parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.8;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.6;
    });

    // 7. Continuous Animation Loop (Runs always from start)
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Base rotation of atom group
      atomGroup.rotation.y = elapsedTime * 0.18 + mouseX;
      atomGroup.rotation.x = Math.sin(elapsedTime * 0.12) * 0.15 + mouseY;
      atomGroup.rotation.z = Math.cos(elapsedTime * 0.1) * 0.1;

      // Core rotation
      coreMesh.rotation.x = elapsedTime * 0.35;
      coreMesh.rotation.y = elapsedTime * 0.45;
      shellMesh.rotation.x = -elapsedTime * 0.25;
      shellMesh.rotation.z = elapsedTime * 0.3;

      // Core breathing pulsation
      const pulse = 1 + Math.sin(elapsedTime * 2.2) * 0.05;
      innerMesh.scale.set(pulse, pulse, pulse);

      // Rings and orbiting nodes
      rings.forEach((r) => {
        r.angle += r.speed;
        r.node.position.x = Math.cos(r.angle) * r.radius;
        r.node.position.y = Math.sin(r.angle) * r.radius;
      });

      // Subtle starfield drift
      starField.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    }

    animate();

    // 8. Resize Handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DBackground);
  } else {
    init3DBackground();
  }
})();

