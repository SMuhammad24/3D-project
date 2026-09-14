import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createMXMasterModel } from './mouseModel.js';
import { soundFX } from './audio.js';

export class MouseScene {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.isOrbitMode = false;
    this.autoRotate = false;
    this.wireframeMode = false;
    this.explodeProgress = 0;

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initLights();
    this.initModel();
    this.initParticles();
    this.initControls();
    this.initRaycaster();

    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    this.animate = this.animate.bind(this);
    this.clock = new THREE.Clock();
    requestAnimationFrame(this.animate);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07090d, 0.035);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 100);
    this.camera.position.set(4.5, 3.2, 5.0);
    this.cameraTarget = new THREE.Vector3(0, 0.3, 0);
    this.camera.lookAt(this.cameraTarget);
  }

  initLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);

    // Key studio light (Warm crisp highlight)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(6, 9, 7);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 25;
    this.keyLight.shadow.bias = -0.0001;
    this.scene.add(this.keyLight);

    // Fill light (Soft lavender/blue)
    const fillLight = new THREE.DirectionalLight(0x8fa8d6, 1.2);
    fillLight.position.set(-6, 4, -5);
    this.scene.add(fillLight);

    // Cyan Rim Light (Cyber precision silhouette)
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.0);
    rimLight.position.set(-5, 6, 6);
    this.scene.add(rimLight);

    // Subtle bottom glow light
    const bottomGlow = new THREE.PointLight(0x00f0ff, 1.5, 10);
    bottomGlow.position.set(0, -2.5, 0);
    this.scene.add(bottomGlow);
  }

  initModel() {
    this.mouseData = createMXMasterModel();
    this.mouseGroup = this.mouseData.root;
    this.parts = this.mouseData.parts;
    this.materials = this.mouseData.materials;

    // Center and position mouse
    this.mouseGroup.position.set(0, 0, 0);
    this.mouseGroup.rotation.y = -Math.PI / 4.5;
    this.mouseGroup.rotation.x = 0.15;
    this.scene.add(this.mouseGroup);
  }

  initParticles() {
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 16;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 14;
    this.controls.minDistance = 2;
    this.controls.enabled = false; // Disabled initially for scroll-driven camera
    this.controls.target.copy(this.cameraTarget);
  }

  initRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mousePointer = new THREE.Vector2(-999, -999);
    this.hoveredPart = null;

    const onPointerMove = (e) => {
      this.mousePointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mousePointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Mouse tilt parallax on the hero section when not in orbit mode
      if (!this.isOrbitMode && window.scrollY < window.innerHeight * 0.8) {
        const targetRotY = -Math.PI / 4.5 + this.mousePointer.x * 0.25;
        const targetRotX = 0.15 - this.mousePointer.y * 0.18;
        this.mouseGroup.rotation.y += (targetRotY - this.mouseGroup.rotation.y) * 0.05;
        this.mouseGroup.rotation.x += (targetRotX - this.mouseGroup.rotation.x) * 0.05;
      }
    };

    window.addEventListener('pointermove', onPointerMove);

    // Click handler for 3D part focus
    window.addEventListener('click', (e) => {
      // Don't trigger if clicked on HUD/buttons
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.story-card')) {
        return;
      }

      this.raycaster.setFromCamera(this.mousePointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.mouseGroup.children, true);

      if (intersects.length > 0) {
        let current = intersects[0].object;
        while (current && current.parent && current.parent !== this.mouseGroup) {
          current = current.parent;
        }
        if (current && current.userData && current.userData.title) {
          soundFX.playClick();
          this.focusPart(current.name);
        }
      }
    });
  }

  /**
   * Applies the explosion vector expansion (0.0 to 1.0)
   */
  setExplodeProgress(progress) {
    this.explodeProgress = Math.max(0, Math.min(1, progress));
    const p = this.explodeProgress;

    Object.keys(this.parts).forEach((key) => {
      const part = this.parts[key];
      const initialPos = part.userData.initialPos || new THREE.Vector3();
      const initialRot = part.userData.initialRot || new THREE.Euler();
      const explodePos = part.userData.explodePos || new THREE.Vector3();
      const explodeRot = part.userData.explodeRot || new THREE.Vector3();

      part.position.x = initialPos.x + explodePos.x * p;
      part.position.y = initialPos.y + explodePos.y * p;
      part.position.z = initialPos.z + explodePos.z * p;

      part.rotation.x = initialRot.x + explodeRot.x * p;
      part.rotation.y = initialRot.y + explodeRot.y * p;
      part.rotation.z = initialRot.z + explodeRot.z * p;
    });
  }

  /**
   * Smoothly focus and isolate a specific part in the 3D scene
   */
  focusPart(partKey) {
    const part = this.parts[partKey];
    if (!part) return;

    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('partSelected', { detail: { partKey, data: part.userData } }));

    // Highlight pulse
    const origY = part.position.y;
    part.position.y += 0.3;
    setTimeout(() => {
      part.position.y = origY;
    }, 300);
  }

  toggleOrbitMode(forcedState) {
    this.isOrbitMode = forcedState !== undefined ? forcedState : !this.isOrbitMode;
    this.controls.enabled = this.isOrbitMode;
    return this.isOrbitMode;
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    return this.autoRotate;
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;
    Object.values(this.materials).forEach(mat => {
      mat.wireframe = this.wireframeMode;
    });
    return this.wireframeMode;
  }

  resetCamera() {
    this.camera.position.set(4.5, 3.2, 5.0);
    this.cameraTarget.set(0, 0.3, 0);
    this.camera.lookAt(this.cameraTarget);
    this.controls.target.copy(this.cameraTarget);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();

    // Rotate particles gently
    if (this.particles) {
      this.particles.rotation.y += delta * 0.04;
      this.particles.rotation.x += delta * 0.02;
    }

    // Auto rotate turntable if enabled
    if (this.autoRotate) {
      this.mouseGroup.rotation.y += delta * 0.6;
    }

    if (this.isOrbitMode) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}
