import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimation(sceneInstance) {
  const progressBar = document.getElementById('scroll-progress-bar');
  const explodeValHud = document.getElementById('hud-explode-val');
  const explodeSlider = document.getElementById('explode-slider');
  const sliderVal = document.getElementById('slider-val');
  const stageDots = document.querySelectorAll('.stage-dot');
  const navItems = document.querySelectorAll('.nav-item');
  const scrollVideo = document.getElementById('scroll-video');

  // Master timeline tied to the whole page scroll
  const masterTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.scroll-flow',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => {
        const progress = self.progress;

        // Scrub video if in video mode
        if (scrollVideo && scrollVideo.duration && !isNaN(scrollVideo.duration)) {
          scrollVideo.currentTime = scrollVideo.duration * progress;
        }
        
        // If user is not currently in orbit mode, apply scroll explode to 3D scene
        if (!sceneInstance.isOrbitMode) {
          sceneInstance.setExplodeProgress(progress);
        }

        // Update HUD percentage
        const pct = Math.round(progress * 100);
        if (progressBar) progressBar.style.height = `${pct}%`;
        if (explodeValHud) explodeValHud.textContent = `${pct < 10 ? '0' : ''}${pct}%`;
        if (explodeSlider) explodeSlider.value = pct;
        if (sliderVal) sliderVal.textContent = `${pct}%`;

        // Update active stage dot & nav link
        const step = Math.min(5, Math.floor(progress * 6));
        stageDots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === step);
        });
        navItems.forEach((link, idx) => {
          link.classList.toggle('active', idx === step);
        });
      }
    }
  });

  // Camera choreography through the scroll stages
  masterTimeline
    // Phase 1: Overview to Top Shell Lift
    .to(sceneInstance.camera.position, {
      x: 3.8,
      y: 4.2,
      z: 4.5,
      ease: 'power1.inOut'
    }, 0)
    .to(sceneInstance.mouseGroup.rotation, {
      y: -Math.PI / 3.5,
      x: 0.25,
      ease: 'power1.inOut'
    }, 0)

    // Phase 2: Dual Scroll Wheels focus
    .to(sceneInstance.camera.position, {
      x: 1.5,
      y: 3.5,
      z: 3.8,
      ease: 'power1.inOut'
    }, 0.25)
    .to(sceneInstance.mouseGroup.rotation, {
      y: -Math.PI / 6,
      x: 0.35,
      ease: 'power1.inOut'
    }, 0.25)

    // Phase 3: Battery Pack isolation
    .to(sceneInstance.camera.position, {
      x: 4.5,
      y: 3.0,
      z: 3.2,
      ease: 'power1.inOut'
    }, 0.5)
    .to(sceneInstance.mouseGroup.rotation, {
      y: -Math.PI / 2.2,
      x: 0.2,
      ease: 'power1.inOut'
    }, 0.5)

    // Phase 4: Darkfield Laser & PCB
    .to(sceneInstance.camera.position, {
      x: 3.5,
      y: 1.2,
      z: 4.8,
      ease: 'power1.inOut'
    }, 0.75)
    .to(sceneInstance.mouseGroup.rotation, {
      y: -Math.PI / 4,
      x: -0.15,
      ease: 'power1.inOut'
    }, 0.75)

    // Phase 5: Full Exploded Blueprint View
    .to(sceneInstance.camera.position, {
      x: 5.2,
      y: 4.8,
      z: 5.8,
      ease: 'power1.inOut'
    }, 1.0)
    .to(sceneInstance.mouseGroup.rotation, {
      y: -Math.PI / 3.8,
      x: 0.22,
      ease: 'power1.inOut'
    }, 1.0);

  // Animate Story Cards on entry
  const cards = document.querySelectorAll('.story-card');
  cards.forEach((card) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        end: 'top 35%',
        scrub: 0.8,
      },
      y: 50,
      opacity: 0,
      scale: 0.96,
      ease: 'power2.out'
    });
  });

  return masterTimeline;
}
