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
  let currentIndexCarousel = 2; 
  let autoMode = true;
  let userInteracted = false;
  let revealTimeout = null;
  let autoResumeTimeout = null;

  function getFrontCardCarousel() {
    return document.querySelectorAll('.carousel-card')[currentIndexCarousel];
  }

  function updateTrackPositionCarousel() {
    const track = document.querySelector('.carousel-track');
    const cards = document.querySelectorAll('.carousel-card');

    if (!track || cards.length === 0) return;

    const carouselWidth = carousel.offsetWidth;

    const cardWidth = cards[0].offsetWidth;

    const gap = parseInt(getComputedStyle(track).gap);

    // Distance from start of track to center of target card
    const targetCenter = currentIndexCarousel * (cardWidth + gap) + cardWidth / 2;

    const visibleCenter = carouselWidth / 2;

    const offset = targetCenter - visibleCenter;

    track.style.transform = `translateX(-${offset}px)`;
  }


  function scrollToNextCardCarousel() {
    const cards = document.querySelectorAll('.carousel-card');
    currentIndexCarousel = (currentIndexCarousel + 1) % cards.length;
    updateTrackPositionCarousel();
    applyDepthScaling();
  }

  function applyDepthScaling() {
    const cards = document.querySelectorAll('.carousel-card');
    const centerIndex = currentIndexCarousel;

    cards.forEach((card, i) => {
      const offset = i - centerIndex;
      const abs = Math.abs(offset);

      let scale = 1;
      let translate = 0;
      let opacity = 1;

      if (abs === 0) {
        scale = 1;
        translate = 0;
      } 
      else if (abs === 1) {
        scale = 0.8;
        translate = offset * 60;
      } 
      else if (abs === 2) {
        scale = 0.5;
        translate = offset * -10;
      } 
      else {
        scale = 0;
        opacity = 0;
      }

      card.style.transform = `scale(${scale}) translateX(${translate}px)`;
      card.style.opacity = opacity;
    });

    updateTrackPositionCarousel();
  }



  updateTrackPositionCarousel();
  setTimeout(applyDepthScaling, 0);
}



