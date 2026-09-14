import { FrameSequenceEngine } from './frameSequence.js';
import confetti from 'canvas-confetti';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('frame-canvas');
  if (!canvas) return;

  // 1. Initialize Frame Sequence Engine & Preloader
  const engine = new FrameSequenceEngine(canvas);
  engine.preloadFrames();

  // 2. Cinematic Intro Video Elements & Transition Components
  const introViewport = document.getElementById('intro-viewport');
  const introVideo = document.getElementById('intro-video');
  const introProgressBar = document.getElementById('intro-progress-bar');
  const skipIntroBtn = document.getElementById('skip-intro-btn');
  const replayIntroBtn = document.getElementById('replay-intro-btn');
  const transitionBeam = document.getElementById('transition-beam');
  const canvasWrapper = document.getElementById('canvas-wrapper');
  const mainNavbar = document.getElementById('main-navbar');
  const hudIndicator = document.getElementById('hud-indicator');
  const heroCard = document.getElementById('hero-card');

  let introCompleted = false;

  function blendIntroToHero() {
    if (introCompleted) return;
    introCompleted = true;

    // A. Trigger subtle Apple-style optical light beam sweep & ambient glow
    if (transitionBeam) {
      transitionBeam.classList.add('active');
      setTimeout(() => {
        transitionBeam.classList.remove('active');
      }, 1200);
    }

    // B. Softly dissolve & expand intro viewport with smooth cubic easing
    if (introViewport) {
      introViewport.classList.add('faded');
    }

    // C. Transition 3D canvas from intro state into crisp focus
    if (canvasWrapper) {
      canvasWrapper.classList.remove('canvas-intro-state');
    }

    // D. Staggered reveal of global Navigation Bar
    if (mainNavbar) {
      setTimeout(() => {
        mainNavbar.classList.remove('nav-intro-hidden');
      }, 100);
    }

    // E. Staggered reveal of Hero Card
    if (heroCard) {
      setTimeout(() => {
        heroCard.classList.remove('hero-intro-hidden');
      }, 200);
    }

    // F. Staggered reveal of HUD Indicator
    if (hudIndicator) {
      setTimeout(() => {
        hudIndicator.classList.remove('hud-intro-hidden');
      }, 350);
    }

    // G. Ensure Frame 0 is rendered cleanly on canvas
    if (engine && engine.isLoaded) {
      engine.drawFrame(0);
    }
  }

  if (introVideo) {
    // 1.45x: Optimal speed for fast, punchy pacing while maintaining buttery 60fps smoothness
    const OPTIMAL_SPEED = 1.45;
    introVideo.playbackRate = OPTIMAL_SPEED;

    introVideo.addEventListener('timeupdate', () => {
      if (introVideo.duration) {
        const pct = (introVideo.currentTime / introVideo.duration) * 100;
        if (introProgressBar) introProgressBar.style.width = `${pct}%`;

        // Start smooth crossfade slightly before end for seamless handoff
        if (introVideo.currentTime >= introVideo.duration - 0.45) {
          blendIntroToHero();
        }
      }
    });

    introVideo.addEventListener('ended', blendIntroToHero);

    // Autoplay with guaranteed speed setup
    introVideo.play().then(() => {
      introVideo.playbackRate = OPTIMAL_SPEED;
    }).catch(() => {});
  }

  // Skip button click
  if (skipIntroBtn) {
    skipIntroBtn.addEventListener('click', () => {
      if (introVideo) introVideo.pause();
      blendIntroToHero();
    });
  }

  // Scroll trigger to blend
  window.addEventListener('scroll', () => {
    if (!introCompleted && window.scrollY > 20) {
      blendIntroToHero();
    }
  }, { passive: true });

  // Replay Intro Button
  if (replayIntroBtn && introVideo && introViewport) {
    replayIntroBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      introCompleted = false;

      // Re-apply intro state classes
      if (heroCard) heroCard.classList.add('hero-intro-hidden');
      if (mainNavbar) mainNavbar.classList.add('nav-intro-hidden');
      if (hudIndicator) hudIndicator.classList.add('hud-intro-hidden');
      if (canvasWrapper) canvasWrapper.classList.add('canvas-intro-state');

      introViewport.classList.remove('faded');
      introVideo.currentTime = 0;
      introVideo.playbackRate = 1.45;
      introVideo.play().catch(() => {});
    });
  }

  // 3. UI References & Features
  const colorButtons = document.querySelectorAll('.color-btn');
  const galleryModalBtn = document.getElementById('gallery-modal-btn');
  const openGalleryBottom = document.getElementById('open-gallery-bottom');
  const galleryModal = document.getElementById('gallery-modal');
  const closeGalleryBtn = document.getElementById('close-gallery-btn');
  const preorderCta = document.getElementById('preorder-cta');
  const topBuyBtn = document.getElementById('top-buy-btn');

  // --- COLORWAY SELECTOR ---
  colorButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      colorButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // --- PHOTO & VIDEO GALLERY MODAL ---
  function openModal() {
    if (galleryModal) galleryModal.classList.add('active');
  }

  function closeModal() {
    if (galleryModal) galleryModal.classList.remove('active');
  }

  if (galleryModalBtn) galleryModalBtn.addEventListener('click', openModal);
  if (openGalleryBottom) openGalleryBottom.addEventListener('click', openModal);
  if (closeGalleryBtn) closeGalleryBtn.addEventListener('click', closeModal);

  if (galleryModal) {
    galleryModal.addEventListener('click', (e) => {
      if (e.target === galleryModal) closeModal();
    });
  }

  // --- BUY NOW CELEBRATION ---
  function triggerBuyEffect() {
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#10b981', '#ffffff', '#8b5cf6']
    });
  }

  if (preorderCta) preorderCta.addEventListener('click', triggerBuyEffect);
  if (topBuyBtn) topBuyBtn.addEventListener('click', (e) => {
    const target = document.getElementById('buy-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });

  console.log('Logitech MX Master 2S Experience Active (Ultra-Smooth Fast Intro Mode).');
});
