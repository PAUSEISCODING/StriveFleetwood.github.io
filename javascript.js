const text = document.querySelector(".scroll-text")

window.addEventListener("scroll", () => {
  let y = window.scrollY
  let move = Math.min(y * 0.5, 150)
  text.style.transform = "translateY(-" + move + "px)"
})

const btn = document.getElementById("modeToggle")
let isDarkMode = document.body.classList.contains("dark")

function setColorMode(darkMode) {
  isDarkMode = darkMode
  document.body.classList.toggle("dark", darkMode)
  document.body.classList.toggle("light", !darkMode)

  document.querySelectorAll(".gallery-collection").forEach(el => {
    el.classList.toggle("dark", darkMode)
    el.classList.toggle("light", !darkMode)
  })
  document.querySelectorAll(".gallery-item").forEach(el => {
    el.classList.toggle("dark", darkMode)
    el.classList.toggle("light", !darkMode)
  })

  localStorage.setItem("colorMode", darkMode ? "dark" : "light")
}

const savedMode = localStorage.getItem("colorMode")
if (savedMode === "dark" || savedMode === "light") {
  document.body.classList.add("no-transition")
  setColorMode(savedMode === "dark")
  window.requestAnimationFrame(() => {
    document.body.classList.remove("no-transition")
  })
}

btn.addEventListener("click", () => {
  setColorMode(!isDarkMode)
})

const burger = document.getElementById("burger")
const nav = document.getElementById("navLinks")

burger.addEventListener("click", () => {
  burger.classList.toggle("active")
  nav.classList.toggle("active")
})

const projectFilter = document.getElementById("projectFilter")
const projectCards = document.querySelectorAll(".project-card")

if (projectFilter && projectCards.length) {
  projectFilter.addEventListener("change", () => {
    const filterValue = projectFilter.value
    projectCards.forEach(card => {
      const matches = filterValue === "all" || card.dataset.category === filterValue
      card.style.display = matches ? "block" : "none"
    })
  })
}

/* Lightbox stuffs */

const items = document.querySelectorAll('.gallery-item, .gallery-collection');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-image');
const lightboxVideo = document.querySelector('.lightbox-video');
const closeBtn = document.querySelector('.lightbox-close');
const leftArrow = document.querySelector('.lightbox-arrow.left');
const rightArrow = document.querySelector('.lightbox-arrow.right');

let currentIndex = 0;

// Only attach item click listeners if items exist
if (items.length > 0) {
  items.forEach((item, index) => {
    item.addEventListener('click', () => {
      currentIndex = index;
      openLightbox();
    });
  });
}

function openLightbox() {
  if (!lightbox) return;

  const item = items[currentIndex];
  const type = item.dataset.type || "image";

  lightbox.classList.add("active");

  if (type === "video") {
    const src = item.dataset.videoSrc;

    lightboxImg.classList.remove("active");
    lightboxVideo.classList.add("active");

    lightboxVideo.src = src;
    lightboxVideo.play();
  } else {
    const bg = item.style.getPropertyValue('--bg')
      .replace("url('", "")
      .replace("')", "");

    lightboxVideo.pause();
    lightboxVideo.classList.remove("active");

    lightboxImg.classList.add("active");
    lightboxImg.src = bg;
  }
}

function closeLightbox() {
  if (!lightbox) return;

  lightbox.classList.remove('active');

  lightboxVideo.pause();
  lightboxVideo.currentTime = 0;
  lightboxVideo.src = "";
}

function nextImage() {
  if (!lightboxImg) return;

  lightboxImg.classList.add('swipe-left');
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % items.length;
    openLightbox();
    lightboxImg.classList.remove('swipe-left');
  }, 150);
}

function prevImage() {
  if (!lightboxImg) return;

  lightboxImg.classList.add('swipe-right');
  setTimeout(() => {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    openLightbox();
    lightboxImg.classList.remove('swipe-right');
  }, 150);
}

/* ⭐ SAFE EVENT LISTENERS ⭐ */
if (lightbox) {
  // Close button
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  // Arrows
  if (rightArrow) rightArrow.addEventListener('click', nextImage);
  if (leftArrow) leftArrow.addEventListener('click', prevImage);

  // Background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') nextImage();
    else if (e.key === 'ArrowLeft') prevImage();
  });

  // Swipe support
  let startX = 0;
  let endX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  lightbox.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
  });

  function handleSwipe() {
    const diff = endX - startX;
    if (Math.abs(diff) < 50) return;

    if (diff > 0) prevImage();
    else nextImage();
  }
}

// video thumbnail stuffs

function generateVideoThumbnail(videoSrc, callback) {
  const video = document.createElement('video');
  video.src = videoSrc;
  video.crossOrigin = "anonymous";
  video.muted = true;

  video.addEventListener('loadeddata', () => {
    video.currentTime = 2.0; // grab frame at 2.0s
  });

  video.addEventListener('seeked', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const thumbnail = canvas.toDataURL('image/jpeg');
    callback(thumbnail);
  });
}

document.querySelectorAll('[data-type="video"]').forEach(item => {
  const videoSrc = item.dataset.videoSrc;

  generateVideoThumbnail(videoSrc, (thumb) => {
    item.style.setProperty('--bg', `url('${thumb}')`);
  });
});

document.querySelectorAll('[data-type="video"]').forEach(item => {
  const videoSrc = item.dataset.videoSrc;

  const tempVideo = document.createElement('video');
  tempVideo.src = videoSrc;
  tempVideo.addEventListener('loadedmetadata', () => {
    const duration = tempVideo.duration;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60).toString().padStart(2, '0');

    item.dataset.duration = `${minutes}:${seconds}`;
  });
});

// Carousel shenanigans
const carousel = document.querySelector('.carousel');
if (carousel) {
  let autoMode = true;
  let autoResumeTimeout = null;

  const cards = document.querySelectorAll('.carousel-card');

  // Measure actual rendered card height
  const cardRect = cards[0].getBoundingClientRect();
  const cardHeight = cardRect.height;
  const cardBottomOffset = cardHeight / 2;

  console.log("Card height:", cardHeight);
  console.log("Card bottom offset:", cardBottomOffset);

  // 1) Positions: 0–6
  function assignInitialPositions() {
    cards.forEach((card, i) => {
      card.dataset.pos = i;
    });
  }

  // 2) True circular rotation
  function advancePositions() {
    const total = cards.length;

    cards.forEach(card => {
      let pos = parseInt(card.dataset.pos, 10);
      pos = (pos + 1) % total;
      card.dataset.pos = pos;
    });
  }

  // 3) 3D transform math
  function get3DTransform(logicalOffset, radius, tiltStrength) {
    const maxVisibleOffset = 2;
    const arc = 140;
    const angle = (logicalOffset / maxVisibleOffset) * (arc / 2);
    const rad = angle * (Math.PI / 180);

    const x = Math.sin(rad) * radius;
    const z = Math.cos(rad) * radius;

    const distanceFromFront = Math.abs(logicalOffset) / maxVisibleOffset;
    const scale = 0.95 - distanceFromFront * 0.3;
    const tilt = Math.sin(rad) * tiltStrength;

    return { x, z, scale, tilt, angle };
  }

  // 4) Apply transforms
  function apply3DWheel(animated = true) {
    const total = cards.length;
    const radius = 480;
    const tiltStrength = 12;
    const maxVisibleOffset = 2;

    cards.forEach((card, index) => {
      const pos = parseInt(card.dataset.pos, 10);
      const logicalOffset = ((pos + 3) % total) - 3;

      // Hide cards outside the visible range
      if (Math.abs(logicalOffset) > maxVisibleOffset) {
        card.style.opacity = 0;
        card.style.pointerEvents = "none";
        card.style.transform = "translate(-50%, -50%) scale(0.01)";
        return;
      }

      const cfg = get3DTransform(logicalOffset, radius, tiltStrength);

      // ⭐ SHADOW (now inside the card)
      const shadow = card.querySelector(".card-shadow");

      if (shadow) {
        const depthScale = 0.9 + (cfg.z / 480) * 0.4;
        const opacity = Math.max(0, 1 - Math.abs(logicalOffset) * 0.4);

        shadow.style.transform = `
          translateX(-50%)
          scale(${depthScale})
        `;
        shadow.style.opacity = opacity;
      }

      // ⭐ CARD TRANSFORM
      if (!animated) {
        card.style.transition = "none";
      } else {
        card.style.transition = "transform 0.35s ease, opacity 0.35s ease";
      }

      card.style.transform = `
        translate(-50%, -50%)
        translateX(${cfg.x}px)
        translateZ(${cfg.z - 150}px)
        rotateY(${cfg.tilt}deg)
        scale(${cfg.scale})
      `;

      card.style.opacity = 1;
      card.style.zIndex = Math.round(cfg.z);
    });
  }

  function scrollToNextCardCarousel() {
    advancePositions();
    apply3DWheel(true);
  }

  function startAutoScroll() {
    autoMode = true;

    function loop() {
      if (!autoMode) return;
      scrollToNextCardCarousel();
      setTimeout(loop, 3000);
    }

    loop();
  }

  carousel.addEventListener('pointerdown', () => {
    autoMode = false;

    clearTimeout(autoResumeTimeout);
    autoResumeTimeout = setTimeout(() => {
      startAutoScroll();
    }, 8000);
  });

  assignInitialPositions();
  apply3DWheel(false);
  startAutoScroll();
}

// Ground plane logs
const ground = document.querySelector(".carousel-ground");
console.log("Ground plane transform:", getComputedStyle(ground).transform);

const groundMatrix = new DOMMatrixReadOnly(
  getComputedStyle(ground).transform
);
console.log("Ground world Z:", groundMatrix.m43);


// carousel functionality, everything else before this was just the math to get it to scale, spin and have shadows :D

let mode = "idle"; // "idle" | "active"
let revealedCard = null;
let idleLoopTimeout = null;
let revealTimeout = null;
let activeTimeout = null;
let isRotating = false;

