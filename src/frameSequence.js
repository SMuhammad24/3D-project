import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class FrameSequenceEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.totalFrames = 240;
    this.images = [];
    this.currentFrame = 0;
    this.targetFrame = 0;
    this.isLoaded = false;

    this.hudFrameNum = document.getElementById('hud-frame-num');
    this.hudBar = document.getElementById('hud-bar');
    this.preloadFill = document.getElementById('preload-fill');
    this.preloadPct = document.getElementById('preload-pct');
    this.preloader = document.getElementById('preloader');

    this.initCanvasSize();
    window.addEventListener('resize', () => this.initCanvasSize());
  }

  initCanvasSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.dpr = dpr;

    if (this.isLoaded) {
      this.drawFrame(Math.round(this.currentFrame));
    }
  }

  /**
   * Preloads all 240 JPG frames with progress updates
   */
  async preloadFrames() {
    let loadedCount = 0;
    const promises = [];

    for (let i = 0; i < this.totalFrames; i++) {
      const p = new Promise((resolve) => {
        const img = new Image();
        const frameIndex = String(i).padStart(3, '0');
        const baseUrl = import.meta.env.BASE_URL || './';
        const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        img.src = `${cleanBase}frames/frame_${frameIndex}.jpg`;

        img.onload = () => {
          loadedCount++;
          const pct = Math.round((loadedCount / this.totalFrames) * 100);
          if (this.preloadFill) this.preloadFill.style.width = `${pct}%`;
          if (this.preloadPct) this.preloadPct.textContent = `${pct}%`;
          resolve(img);
        };

        img.onerror = () => {
          loadedCount++;
          resolve(null);
        };

        this.images[i] = img;
      });

      promises.push(p);
    }

    await Promise.all(promises);
    this.isLoaded = true;

    // Fade out preloader
    if (this.preloader) {
      setTimeout(() => {
        this.preloader.classList.add('loaded');
      }, 300);
    }

    // Draw initial hero frame
    this.drawFrame(0);
    this.initScrollBinding();
    this.startRenderLoop();
  }

  /**
   * Draw specific frame index onto the canvas with unified deep obsidian background
   * and studio spotlight feathering
   */
  drawFrame(frameIndex) {
    const idx = Math.max(0, Math.min(this.totalFrames - 1, Math.floor(frameIndex)));
    const img = this.images[idx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // 1. Fill entire canvas seamlessly with pure dark obsidian
    this.ctx.fillStyle = '#07090d';
    this.ctx.fillRect(0, 0, w, h);

    // 2. Calculate aspect fit (contain mode)
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const scale = Math.min(w / imgW, h / imgH);

    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = (w - drawW) / 2;
    const drawY = (h - drawH) / 2;

    // 3. Draw image
    this.ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // 4. Soft Edge Feathering Vignette: dissolves any rectangular boundaries into #07090d
    const grad = this.ctx.createRadialGradient(
      w / 2, h / 2, Math.min(drawW, drawH) * 0.38,
      w / 2, h / 2, Math.max(w, h) * 0.52
    );
    grad.addColorStop(0, 'rgba(7, 9, 13, 0)');
    grad.addColorStop(0.65, 'rgba(7, 9, 13, 0.35)');
    grad.addColorStop(1, 'rgba(7, 9, 13, 1)');

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // 5. Update HUD
    const displayNum = String(idx + 1).padStart(3, '0');
    if (this.hudFrameNum) this.hudFrameNum.textContent = displayNum;
    if (this.hudBar) this.hudBar.style.width = `${((idx + 1) / this.totalFrames) * 100}%`;
  }

  /**
   * Bind scroll track progress linearly to the 240 frames
   */
  initScrollBinding() {
    ScrollTrigger.create({
      trigger: '#scroll-track',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      onUpdate: (self) => {
        this.targetFrame = self.progress * (this.totalFrames - 1);
      }
    });

    this.initTextCardAnimations();
  }

  initTextCardAnimations() {
    const panels = [
      { id: '#feat-wheel' },
      { id: '#feat-power' },
      { id: '#feat-sensor' },
      { id: '#feat-flow' },
      { id: '#design' }
    ];

    panels.forEach((p) => {
      const el = document.querySelector(p.id);
      if (!el) return;

      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 75%',
          end: 'bottom 25%',
          toggleActions: 'play reverse play reverse'
        }
      })
      .fromTo(el.querySelector('.tech-card'), 
        { y: 50, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }
      );
    });
  }

  startRenderLoop() {
    const render = () => {
      if (this.isLoaded) {
        const diff = this.targetFrame - this.currentFrame;
        if (Math.abs(diff) > 0.01) {
          this.currentFrame += diff * 0.14;
        }
        this.drawFrame(this.currentFrame);
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }
}
