// ============= TUNING KNOBS =============
const DROP_Y         = 260;
const DURATION       = 900;
const OFFSET         = 220;
const COLOR_AT       = 0.28;
const COLOR_DURATION = 100;
// Email for Contact Me actions:
const EMAIL          = 'Hutchtanner12@outlook.com';
// ========================================


// ====== SELECTORS ======
const loadingScreen   = document.querySelector('.loading-screen');
const firstSection    = document.getElementById('first-section');
const firstSectionBox = document.getElementById('first-section-text');
const subtitleText    = document.getElementById('subtitle-text');
const titleEl         = document.getElementById('site-title');
const loadingLogo     = document.getElementById('loading-logo');
const firstNav        = document.querySelector('.first-nav');
const explodeBtn      = document.getElementById('explode-btn');



// ====== HELPERS ======
function splitLetters(el) {
  const text = el.textContent;
  el.textContent = "";
  for (const ch of text) {
    const span = document.createElement("span");
    span.className = ch === " " ? "space" : "letter";
    span.textContent = ch;
    el.appendChild(span);
  }
}

function avoidOverlap() {
  if (!loadingLogo || !titleEl) return;
  loadingLogo.classList.remove('logo-compact');
  const a = loadingLogo.getBoundingClientRect();
  const b = titleEl.getBoundingClientRect();
  const overlap = !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  if (overlap) loadingLogo.classList.add('logo-compact');
}

// Simple explode effect (uses existing .letter spans). Requires a button #explode-btn.
function wireExplosion() {
  const btn = document.getElementById('explode-btn');
  if (!btn || !titleEl) return;

  btn.addEventListener('click', () => {
    const letters = Array.from(titleEl.querySelectorAll('.letter'));
    // keep blast roughly inside hero width
    const R = Math.min(320, Math.max(230, Math.floor(firstSection.clientWidth * 0.26)));

    letters.forEach((span, i) => {
      span.style.transition = `transform 700ms ${i * 40}ms cubic-bezier(.2,.7,.2,1)`;
      const angle = Math.random() * Math.PI * 2;
      const dist = (0.5 + Math.random() * 0.5) * R; // 0.5R..R
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const rot = (Math.random() * 2 - 1) * 50; // -50..50deg
      span.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
    });

    btn.textContent = 'Well! Now scroll down.';
    btn.disabled = true;
  }, { once: true });
}


// ====== NAV DROPDOWNS (hover on desktop, tap on touch) ======
function setupDropdowns() {
  if (!firstNav) return;

  const navItems  = Array.from(firstNav.querySelectorAll('.nav-item'));
  const HAS_HOVER = window.matchMedia('(hover: hover)').matches; // desktop/trackpad

  function handleDropdownAction(el) {
    const action = el.getAttribute('data-action');
    if (action === 'copy-email') {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(EMAIL).then(() => {
          el.textContent = 'Copied!';
          setTimeout(() => (el.textContent = 'Copy My Email'), 1200);
        }).catch(() => alert(EMAIL));
      } else {
        const ta = document.createElement('textarea');
        ta.value = EMAIL;
        document.body.appendChild(ta);
        ta.select(); document.execCommand('copy');
        document.body.removeChild(ta);
        el.textContent = 'Copied!';
        setTimeout(() => (el.textContent = 'Copy My Email'), 1200);
      }
    }
    if (action === 'open-email') {
      window.location.href = `mailto:${EMAIL}`;
    }
  }

  if (HAS_HOVER) {
    // Desktop: open purely on hover, no click required
    navItems.forEach(item => {
      const btn = item.querySelector('.nav-link[data-menu]');
      item.addEventListener('mouseenter', () => {
        item.classList.add('open');
        if (btn) btn.setAttribute('aria-expanded', 'true');
      });
      item.addEventListener('mouseleave', () => {
        item.classList.remove('open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    });

    // Clicks inside dropdown still perform actions (copy/open)
    firstNav.addEventListener('click', (e) => {
      const dropBtn = e.target.closest('.drop-link');
      if (dropBtn) handleDropdownAction(dropBtn);
    });
  } else {
    // Touch fallback: tap to open/close; tap options to act
    function closeAll() {
      navItems.forEach(item => {
        item.classList.remove('open');
        const btn = item.querySelector('.nav-link[data-menu]');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    firstNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-link[data-menu]');
      const dropBtn = e.target.closest('.drop-link');

      if (btn) {
        e.preventDefault();
        const item = btn.closest('.nav-item');
        const isOpen = item.classList.contains('open');
        closeAll();
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
        return;
      }
      if (dropBtn) handleDropdownAction(dropBtn);
    });

    document.addEventListener('click', (e) => {
      if (!firstNav.contains(e.target)) closeAll();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
    });
  }
}


// ====== INITIAL STATE ======
if (titleEl) {
  titleEl.style.visibility = 'hidden';
  if (!titleEl.querySelector('.letter')) splitLetters(titleEl);
}
if (subtitleText) subtitleText.style.opacity = '0';

window.addEventListener('resize', avoidOverlap);
setTimeout(avoidOverlap, 0);
setupDropdowns();

if (explodeBtn) {
  explodeBtn.style.opacity = '0';
  explodeBtn.style.pointerEvents = 'none';
}


// ====== LOADER / SMILEY SEQUENCE ======
anime({
  targets: '#face-circle',
  strokeDashoffset: [anime.setDashoffset, 0],
  easing: 'easeInOutSine',
  duration: 650,
  loop: false,
  complete: () => {
    anime({
      targets: ['#eye-left', '#eye-right', '#mouth'],
      opacity: [0, 1],
      duration: 800,
      easing: 'easeInOutSine',
      complete: () => {
        anime({
          targets: '#mouth',
          d: [{ value: 'M32 64 Q50 82 68 64' }],
          duration: 500,
          easing: 'easeInOutSine',
          complete: () => {
            anime({ targets: '#face-circle', opacity: 0, duration: 500, easing: 'linear' });
            anime({
              targets: '#text-ring',
              opacity: 1,
              duration: 400,
              easing: 'linear',
              delay: 400,
              complete: () => {
                anime.timeline()
                  .add({ targets: '#text-ring', opacity: [1, 0], duration: 200, easing: 'linear' })
                  .add({
                    targets: '#text-ring',
                    opacity: [0, 1],
                    duration: 200,
                    easing: 'linear',
                    complete: () => {
                      anime({ targets: '#text-ring', rotate: 360, easing: 'linear', duration: 8000, loop: true });

                      // ====== NAME DROP ======
                      if (!titleEl) return;
                      const nodes = Array.from(titleEl.querySelectorAll('.letter, .space'));
                      const third = Math.floor(nodes.length / 3);
                      const groupO = nodes.slice(0, third + 1);
                      const groupA = nodes.slice(third + 1, third * 2 + 1);
                      const groupS = nodes.slice(third * 2 + 1);

                      anime.set([groupO, groupS], { translateY: DROP_Y,  skewY: 50,  opacity: 0 });
                      anime.set(groupA,            { translateY: -DROP_Y, skewY: -50, opacity: 0 });

                      titleEl.style.visibility = 'visible';
                      avoidOverlap();

                      const tl = anime.timeline({ autoplay: true, easing: 'easeOutExpo' });

                      tl.add({ targets: groupO, translateY: 0, skewY: 0, opacity: 1, duration: DURATION, delay: 200 })
                        .add({ targets: groupA, translateY: 0, skewY: 0, opacity: 1, duration: DURATION }, `-=${DURATION - OFFSET}`)
                        .add({ targets: groupS, translateY: 0, skewY: 0, opacity: 1, duration: DURATION }, `-=${DURATION - OFFSET}`)

                        // ====== SECTION SLIDE ======
                        .add({
                          targets: firstSection,
                          translateY: ['-100vh', '0vh'],
                          duration: 700,
                          easing: 'easeInOutQuad',
                          begin: () => {
                            document.body.appendChild(titleEl);
                            Object.assign(titleEl.style, {
                              position: 'fixed',
                              top: '45%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              zIndex: '20000',
                              pointerEvents: 'none',
                              color: '#000'
                            });

                            titleEl.classList.add('color-merge');
                            let colorSwitched = false;
                            anime({
                              targets: firstSection,
                              duration: 700,
                              easing: 'linear',
                              update: anim => {
                                if (!colorSwitched && anim.progress >= COLOR_AT * 100) {
                                  colorSwitched = true;
                                  anime({
                                    targets: titleEl,
                                    color: ['#000', '#fff'],
                                    duration: COLOR_DURATION,
                                    easing: 'linear',
                                    complete: () => titleEl.classList.remove('color-merge')
                                  });
                                }
                              }
                            });
                          },
                          complete: () => {
                            // FLIP handoff
                            const r1 = titleEl.getBoundingClientRect();
                            if (firstSectionBox && titleEl.parentNode !== firstSectionBox) {
                              firstSectionBox.appendChild(titleEl);
                            }
                            const r2 = titleEl.getBoundingClientRect();
                            const dx = r1.left - r2.left;
                            const dy = r1.top  - r2.top;

                            titleEl.style.transform     = `translate(${dx}px, ${dy}px)`;
                            titleEl.style.position      = 'static';
                            titleEl.style.zIndex        = '';
                            titleEl.style.pointerEvents = '';
                            titleEl.style.color         = '';

                            requestAnimationFrame(() => {
                              titleEl.style.transition = 'transform 120ms linear';
                              titleEl.style.transform  = 'translate(0,0)';
                              titleEl.addEventListener('transitionend', () => {
                                titleEl.style.transition = '';
                                titleEl.style.transform  = '';
                              }, { once: true });
                            });

                            // Reveal the word-only nav now
                            if (firstNav) firstNav.classList.add('ready');

                            // Fade in subtitle AFTER the slide completes
                            if (subtitleText) {
                              anime({ targets: subtitleText, opacity: [0, 1], duration: 600, easing: 'linear' });
                            }

                            // Fade in the "Don't Click Me" button NOW too
                            if (explodeBtn) {
                              anime({
                                targets: explodeBtn,
                                opacity: [0, 1],
                                duration: 600,
                                easing: 'linear',
                                complete: () => { explodeBtn.style.pointerEvents = 'auto'; }
                              });
                            }

                            // Enable the explode button (if present)
                            wireExplosion();

                            // remove the loading screen
                            anime({
                              targets: '.loading-screen',
                              opacity: 0,
                              duration: 300,
                              easing: 'linear',
                              complete: () => { if (loadingScreen) loadingScreen.style.display = 'none'; }
                            });
                          }
                        });
                    }
                  });
              }
            });
          }
        });
      }
    });
  }
});
/* ========= SKILLS / HAND MORPH (GSAP) ========= */
(() => {
  // if GSAP or plugin isn’t loaded, do nothing
  if (!window.gsap || !window.MorphSVGPlugin) return;

  gsap.registerPlugin(MorphSVGPlugin);

  // Your skills SVG wrapper id from the HTML snippet:
  const svg  = document.getElementById('skills-hand-svg');
  if (!svg) return;

  const hand = svg.querySelector('#hand');
  if (!hand) return;

  // If you’ve added target paths (#hand1..#hand6), we’ll use whichever exist
  const HAND_TARGETS = ['#hand1', '#hand2', '#hand3', '#hand4', '#hand5', '#hand6']
    .filter(sel => svg.querySelector(sel));

  let current = 0;

function morphTo(index) {
  current = (index + targets.length) % targets.length;
  const targetPath = svg.querySelector(targets[current]);
  if (!targetPath) return;

  gsap.to(handPath, {
    duration: 0.6,
    morphSVG: targetPath,
    ease: 'power2.inOut',
    onComplete: () => setActive(current)
  });
}

  // gentle idle bounce
  gsap.to(hand, {
    y: -7,
    duration: 0.7,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut',
    transformOrigin: '50% 50%'
  });

  // click/tap cycles forward
 svg.addEventListener('click', () => morphTo(current + 1));

  // keyboard arrows
  document.addEventListener('keydown', (e) => {
    if (!HAND_TARGETS.length) return;
    if (e.key === 'ArrowRight') {
      current = (current + 1) % HAND_TARGETS.length;
      morphTo(current);
    } else if (e.key === 'ArrowLeft') {
      current = (current - 1 + HAND_TARGETS.length) % HAND_TARGETS.length;
      morphTo(current);
    }
  });
})();

/* ================= SKILLS: Hand morph + copy sync ================= */
(() => {
  const svg = document.getElementById('skills-hand-svg');
  const hasGSAP = !!window.gsap;
  const hasMorph = !!window.MorphSVGPlugin;

  if (!svg) return; // skills section not on this page
  if (!hasGSAP || !hasMorph) {
    console.warn('[skills] GSAP/MorphSVG missing. Add the two <script> tags before script.js.');
    return;
  }

  gsap.registerPlugin(MorphSVGPlugin);

  const handPath = svg.querySelector('#hand');
  const targets = ['#hand1', '#hand2', '#hand3', '#hand4', '#hand5', '#hand6'];
  let current = -1; // Start at -1 so first click goes to index 0 (#hand1)

  // If #hand has no "d" yet, initialize it from the first hidden path
  if (handPath && !handPath.getAttribute('d')) {
    const first = svg.querySelector(targets[0]);
    if (first) handPath.setAttribute('d', first.getAttribute('d'));
  }

  // Copy blocks on the right
  const copyRoot = document.getElementById('skill-copy');
  const items = copyRoot ? Array.from(copyRoot.querySelectorAll('.skill-item')) : [];

  function setActive(i) {
    items.forEach((el, idx) => el.classList.toggle('is-active', idx === i));
  }
  setActive(0); // Start with first skill text active

  function morphTo(i) {
    current = (i + targets.length) % targets.length;
    const targetPath = svg.querySelector(targets[current]);
    if (!targetPath) return;

    gsap.to(handPath, {
      duration: 0.6,
      morphSVG: targetPath,
      ease: 'power2.inOut',
      onComplete: () => setActive(current + 1) // +1 because skill text indices start at 0 for the intro
    });
  }

  // Subtle idle bounce
  gsap.to(handPath, {
    y: -7,
    duration: 0.7,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut'
  });

  // Click hand to advance
  svg.addEventListener('click', () => morphTo(current + 1));

  // Arrow button controls
const arrowLeft  = document.getElementById('arrow-left');
const arrowRight = document.getElementById('arrow-right');

if (arrowLeft && arrowRight) {
  arrowLeft.addEventListener('click', () => morphTo(current - 1));
  arrowRight.addEventListener('click', () => morphTo(current + 1));
}

  // Arrow keys to navigate
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') morphTo(current + 1);
    else if (e.key === 'ArrowLeft') morphTo(current - 1);
  });
})();



/* ================= NOODLY LINE ANIMATIONS (ROBUST) ================= */
(() => {
  const workBoxes = document.querySelectorAll('.work-box');
  if (!workBoxes.length) return;

  // Animation class for each box
  class NoodlyLine {
    constructor(boxElement) {
      this.box = boxElement;
      this.canvas = boxElement.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.progress = 0;
      this.speed = parseFloat(this.box.dataset.speed) || 0.00019;
      
      // Simplified state management
      this.isVisible = false;     // Is the box currently visible?
      this.isAnimating = false;   // Is animation currently running?
      this.animationId = null;    // Track animation frame
      
      this.setupCanvas();
      this.createPoints();
      this.setupMouse();
      this.animate();
    }

    setupCanvas() {
      const resizeCanvas = () => {
        this.canvas.width = this.box.offsetWidth;
        this.canvas.height = this.box.offsetHeight;
        this.createPoints();
      };
      
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
    }

    createPoints() {
      this.points = [];
      const numPoints = 16;
      for (let i = 0; i <= numPoints; i++) {
        let y = (i / numPoints) * this.canvas.height;
        this.points.push({ x: 0, y, vx: 0 });
      }
    }

    setupMouse() {
      this.mouseX = -100;
      this.mouseY = -100;

      this.box.addEventListener('mousemove', (e) => {
        const rect = this.box.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        let nearest = this.points.reduce((a, b) =>
          Math.abs(b.y - this.mouseY) < Math.abs(a.y - this.mouseY) ? b : a
        );

        const distanceToPoint = Math.sqrt(
          Math.pow(this.mouseX - nearest.x, 2) + 
          Math.pow(this.mouseY - nearest.y, 2)
        );

        if (distanceToPoint < 90) {
          const forceX = (this.mouseX - nearest.x) * 0.08;
          nearest.vx += forceX;
          
          const nearestIndex = this.points.indexOf(nearest);
          if (nearestIndex > 0) {
            this.points[nearestIndex - 1].vx += forceX * 0.3;
          }
          if (nearestIndex < this.points.length - 1) {
            this.points[nearestIndex + 1].vx += forceX * 0.3;
          }
        }
      });

      this.box.addEventListener('mouseleave', () => {
        this.mouseX = -100;
        this.mouseY = -100;
      });
    }

    // Clear, simple state change methods
    startAnimation() {
      if (this.isVisible && !this.isAnimating) {
        this.isAnimating = true;
        this.progress = 0;
        this.points.forEach(p => { p.x = 0; p.vx = 0; });
        console.log(`Starting animation for ${this.box.id}`);
      }
    }

    stopAnimation() {
      this.isAnimating = false;
      this.progress = 0;
      this.points.forEach(p => { p.x = 0; p.vx = 0; });
      console.log(`Stopping animation for ${this.box.id}`);
    }

    setVisible(visible) {
      this.isVisible = visible;
      if (!visible) {
        this.stopAnimation();
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.isAnimating && this.isVisible) {
        this.progress += this.speed;
        const baseX = this.progress * this.canvas.width;

        if (this.progress > 1.3) {
          // Animation complete - restart after a delay
          this.stopAnimation();
          setTimeout(() => {
            if (this.isVisible) { // Only restart if still visible
              this.startAnimation();
            }
          }, 1000);
        } else {
          // Elastic physics update
          const springStrength = 0.021;
          const damping = 0.62;

          for (let i = 0; i < this.points.length; i++) {
            let p = this.points[i];
            let spring = (baseX - p.x) * springStrength;
            p.vx += spring;

            if (i > 0) {
              let left = this.points[i - 1];
              let diff = p.x - left.x;
              const coupling = 0.02;
              left.vx += diff * coupling;
              p.vx -= diff * coupling;
            }

            p.vx *= damping;
            p.x += p.vx;
          }

          // Draw curve
          this.ctx.beginPath();
          this.ctx.moveTo(this.points[0].x, this.points[0].y);

          for (let i = 1; i < this.points.length - 2; i++) {
            const xc = (this.points[i].x + this.points[i + 1].x) / 2;
            const yc = (this.points[i].y + this.points[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
          }

          const i = this.points.length - 2;
          this.ctx.quadraticCurveTo(
            this.points[i].x,
            this.points[i].y,
            this.points[i + 1].x,
            this.points[i + 1].y
          );

          this.ctx.strokeStyle = '#ffffffff';
          this.ctx.lineWidth = 2;
          this.ctx.stroke();
        }
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  // Initialize all boxes
  const noodlyLines = Array.from(workBoxes).map(box => new NoodlyLine(box));

  // Simplified observer with cleaner state management
  const observerOptions = {
    threshold: 0.8,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const boxId = entry.target.id;
      const index = parseInt(boxId.replace('workBox', '')) - 1;
      const noodlyLine = noodlyLines[index];
      
      if (!noodlyLine) return;
      
      if (entry.isIntersecting) {
        console.log(`${boxId} is now visible`);
        noodlyLine.setVisible(true);
        
        const title = entry.target.querySelector('.box-title');
        if (title) {
          title.classList.add('moved-up');
          
          // Start animation after title animation
          setTimeout(() => {
            noodlyLine.startAnimation();
          }, 1900);
        }
      } else {
        console.log(`${boxId} is no longer visible`);
        noodlyLine.setVisible(false);
        
        const title = entry.target.querySelector('.box-title');
        if (title) {
          title.classList.remove('moved-up');
        }
      }
    });
  }, observerOptions);

  // Start observing immediately
  workBoxes.forEach(box => observer.observe(box));
})();


/* ================= YARN ANIMATION ================= */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  
  gsap.registerPlugin(ScrollTrigger);

  // Flag to track if life section yarn is complete
  let lifeYarnComplete = false;

  // Original yarn path animation (MODIFIED - adds completion tracking)
  const path = document.querySelector("#yarn-unravel path");
  if (path) {
    const pathData = path.getAttribute('d');
    // Add a line that continues straight down
    const extendedPath = pathData + ' L441.6,1500'; // Continue to bottom
    path.setAttribute('d', extendedPath);
        
  
    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length
    });

    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: "#life",
        start: "top center",
        end: "bottom center",
        scrub: 1,
        onComplete: () => {
          // Mark life yarn as complete
          lifeYarnComplete = true;
          console.log("Life section yarn animation completed");
        }
      }
    });
  }
// Function to get the end point of the life section yarn path
function getLifeYarnEndPoint() {
  const lifePath = document.querySelector("#yarn-unravel path");
  if (!lifePath) return null;
  
  // Get the total length and the final point
  const totalLength = lifePath.getTotalLength();
  const endPoint = lifePath.getPointAtLength(totalLength);
  
  // Get the life section's position to convert to global coordinates
  const lifeSection = document.getElementById('life');
  const lifeSectionRect = lifeSection.getBoundingClientRect();
  const yarnContainer = document.querySelector('.yarn-container');
  const yarnContainerRect = yarnContainer.getBoundingClientRect();
  
  // Calculate the actual X position relative to the achievements section
  const achievementsSection = document.querySelector('#achievements-anchor');
  const achievementsRect = achievementsSection.getBoundingClientRect();
  
  // Convert the end point to achievements section coordinates
  const globalX = yarnContainerRect.left + endPoint.x;
  const relativeX = globalX - achievementsRect.left;
  
  return {
    x: relativeX,
    y: endPoint.y
  };
}

// Updated yarn path creation function
function createContinuousYarnPath() {
  const section = document.querySelector('#achievements-anchor');
  const gridContainer = document.querySelector('.achievements-grid');
  const continuousPath = document.querySelector('#continuous-yarn');
  
  if (!section || !gridContainer || !continuousPath) {
    console.warn('Required elements not found for yarn path');
    return;
  }

  // Get the end point of the life section yarn
  const lifeYarnEnd = getLifeYarnEndPoint();
  
  // Calculate start position
  let startX, startY;
  
  if (lifeYarnEnd) {
    // Add the responsive offset here
    const offset = section.offsetWidth * 0.06; // 3% of section width
    startX = lifeYarnEnd.x + offset;
    startY = -60;
    console.log(`Using life yarn end X: ${startX} (with offset: ${offset})`);
  } else {
    // Fallback to your current positioning
    startX = gridContainer.offsetWidth * 0.825;
    startY = -60;
    console.log('Life yarn end not found, using fallback positioning');
  }
  
  // End point (unchanged)
  const endX = gridContainer.offsetWidth / 2;
  const endY = gridContainer.offsetHeight * 0.85;

  const workBoxes = ['#workBox1', '#workBox2', '#workBox3', '#workBox4'];
  const pathPoints = [{ x: startX, y: startY }];

  // Rest of your existing path creation logic...
  workBoxes.forEach(selector => {
    const box = document.querySelector(selector);
    if (box) {
      const boxRect = box.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      
      const x = (boxRect.left - sectionRect.left) + (box.offsetWidth / 2);
      const y = (boxRect.top - sectionRect.top) + (box.offsetHeight / 2);
      
      pathPoints.push({ x, y });
    }
  });

  pathPoints.push({ x: endX, y: endY });

  // Your existing smooth path creation function
  function createSmoothPath(points) {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];
      
      if (i === 1) {
        const controlX1 = previous.x;
        const controlY1 = previous.y + (current.y - previous.y) * 0.3;
        const controlX2 = current.x - (current.x - previous.x) * 0.3;
        const controlY2 = current.y - (current.y - previous.y) * 0.3;
        
        path += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${current.x} ${current.y}`;
      } else {
        const next = points[i + 1];
        const controlDistance = 0.4;
        
        let controlX1, controlY1, controlX2, controlY2;
        
        if (next) {
          const angle1 = Math.atan2(current.y - previous.y, current.x - previous.x);
          const angle2 = Math.atan2(next.y - current.y, next.x - current.x);
          const avgAngle = (angle1 + angle2) / 2;
          
          const distance = Math.sqrt(Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2));
          const controlLength = distance * controlDistance;
          
          controlX1 = previous.x + Math.cos(angle1) * controlLength;
          controlY1 = previous.y + Math.sin(angle1) * controlLength;
          controlX2 = current.x - Math.cos(avgAngle) * controlLength;
          controlY2 = current.y - Math.sin(avgAngle) * controlLength;
        } else {
          controlX1 = previous.x + (current.x - previous.x) * 0.7;
          controlY1 = previous.y + (current.y - previous.y) * 0.7;
          controlX2 = current.x - (current.x - previous.x) * 0.3;
          controlY2 = current.y - (current.y - previous.y) * 0.3;
        }
        
        path += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${current.x} ${current.y}`;
      }
    }
    
    return path;
  }

  const fullPath = createSmoothPath(pathPoints);
  continuousPath.setAttribute('d', fullPath);

  // Rest of your GSAP animation setup (unchanged)
  const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  tempPath.setAttribute("d", fullPath);
  document.body.appendChild(tempPath);
  const totalLength = tempPath.getTotalLength();
  document.body.removeChild(tempPath);

  gsap.set(continuousPath, {
    strokeDasharray: totalLength,
    strokeDashoffset: totalLength
  });

  gsap.to(continuousPath, {
    strokeDashoffset: 0,
    ease: "none",
    scrollTrigger: {
      trigger: "#achievements-anchor",
      start: "top 70%",
      end: "bottom center",
      scrub: 1.5,
      onUpdate: (self) => {
        if (!lifeYarnComplete) {
          gsap.set(continuousPath, { strokeDashoffset: totalLength });
          return;
        }
      }
    }
  });

  console.log(`Yarn path created starting at X: ${startX}, Y: ${startY}`);
}

  // Initialize the achievements yarn path
  function initAchievementsYarnPath() {
    setTimeout(() => {
      createContinuousYarnPath();
    }, 500);
  }

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initAchievementsYarnPath, 300);
  });

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAchievementsYarnPath);
  } else {
    initAchievementsYarnPath();
  }
})();

// ===== TZH Logo Animation =====
const tzhContainer = document.querySelector('.tzh-logo-container');
const circleLogo = document.querySelector('.circle-logo');
const mouthPath = document.querySelector('.mouth-path');
let mouthTimeline;

// TIMING CONTROLS
const STRAIGHT_HOLD_TIME = 1.5;
const TRANSITION_DURATION = 1;

// Create the looping animation timeline
function createMouthAnimation() {
  mouthTimeline = gsap.timeline({ repeat: -1 });
  
  mouthTimeline.to(mouthPath, {
    attr: { d: "M26 50 Q40 50 54 50" },
    duration: STRAIGHT_HOLD_TIME,
    ease: "none"
  });
  
  mouthTimeline.to(mouthPath, {
    attr: { d: "M26 50 Q40 62 54 50" },
    duration: TRANSITION_DURATION,
    ease: "power1.inOut"
  });
  
  mouthTimeline.to(mouthPath, {
    attr: { d: "M26 50 Q40 62 54 50" },
    duration: STRAIGHT_HOLD_TIME,
    ease: "none"
  });
  
  mouthTimeline.to(mouthPath, {
    attr: { d: "M26 50 Q40 50 54 50" },
    duration: TRANSITION_DURATION,
    ease: "power1.inOut"
  });
}

// Start animation on hover
if (circleLogo) {
  circleLogo.addEventListener('mouseenter', () => {
    if (!mouthTimeline) {
      createMouthAnimation();
    } else {
      mouthTimeline.play();
    }
  });

  circleLogo.addEventListener('mouseleave', () => {
    if (mouthTimeline) {
      mouthTimeline.pause();
      gsap.to(mouthPath, {
        attr: { d: "M26 50 Q40 50 54 50" },
        duration: 0.3,
        ease: "power1.out"
      });
    }
  });
}

// Show logo when first-nav is ready (after loading animation)
// Add this to your existing code that makes .first-nav ready
// Or use a timeout:
setTimeout(() => {
  if (tzhContainer) {
    tzhContainer.classList.add('ready');
  }
}, 3000); // Adjust timing to match when your loading screen finishes