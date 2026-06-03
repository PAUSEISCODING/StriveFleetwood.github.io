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

  const cards = document.querySelectorAll('.carousel-card');

  // Measure card height (used for shadows)
  const cardRect = cards[0].getBoundingClientRect();
  const cardHeight = cardRect.height;
  const cardBottomOffset = cardHeight / 2;

  //  Assign initial positions

  function assignInitialPositions() {
    cards.forEach((card, i) => {
      card.dataset.pos = i;
    });
  }

  // Move wheel forward

  function scrollToNextCardCarousel() {
    const total = cards.length;

    cards.forEach(card => {
      let pos = parseInt(card.dataset.pos, 10);
      pos = (pos + 1) % total;
      card.dataset.pos = pos;
    });

    apply3DWheel(true);
  }


  // Move wheel backward

  function rotateBackwardOneStep() {
    const total = cards.length;

    cards.forEach(card => {
      let pos = parseInt(card.dataset.pos, 10);
      pos = (pos - 1 + total) % total;
      card.dataset.pos = pos;
    });

    apply3DWheel(true);
  }

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

    return { x, z, scale, tilt };
  }

  // Apply transforms to wheel

  function apply3DWheel(animated = true) {
    const total = cards.length;
    const radius = 480;
    const tiltStrength = 12;
    const maxVisibleOffset = 2;

    cards.forEach(card => {
      const pos = parseInt(card.dataset.pos, 10);
      const logicalOffset = ((pos + 3) % total) - 3;

      // Hide cards outside arc
      if (Math.abs(logicalOffset) > maxVisibleOffset) {
        card.style.opacity = 0;
        card.style.pointerEvents = "none";
        card.style.setProperty("--wheel-transform",
          "translateX(0) translateZ(-999px) scale(0.01)"
        );
        return;
      }

      const cfg = get3DTransform(logicalOffset, radius, tiltStrength);

      if (!animated) {
        card.style.transition = "none";
      } else {
        card.style.transition = "transform 0.35s ease, opacity 0.35s ease";
      }

      card.style.setProperty(
        "--wheel-transform",
        `
          translateX(${cfg.x}px)
          translateZ(${cfg.z - 150}px)
          rotateY(${cfg.tilt}deg)
          scale(${cfg.scale})
        `
      );

      card.style.opacity = 1;
      card.style.zIndex = Math.round(cfg.z);
    });
  }


  // Reveal and close

  let revealedCard = null;

  function revealCard(card) {
    if (!card) return;

    if (revealedCard && revealedCard !== card) {
      closeCard(revealedCard);
    }

    card.classList.add("revealed");
    revealedCard = card;

    const top = card.querySelector(".card-top");
    top.style.setProperty("--topcard-tilt", "rotateZ(-5deg)");

    cards.forEach(c => {
      const pos = parseInt(c.dataset.pos, 10);
      const logicalOffset = ((pos + 3) % cards.length) - 3;

      if (logicalOffset < 0) {
        const distance = Math.abs(logicalOffset);
        const shiftAmount = distance === 1 ? 65 : 15;
        c.style.setProperty("--reveal-shift", `translateX(-${shiftAmount}px)`);
      }
    });
  }

  function closeCard(card) {
    if (!card) return;

    card.classList.remove("revealed");
    cards.forEach(c => c.style.setProperty("--reveal-shift", "translateX(0)"));

    const top = card.querySelector(".card-top");
    top.style.setProperty("--topcard-tilt", "rotateZ(0deg)");

    if (revealedCard === card) revealedCard = null;
  }

  // Click to rotate

  cards.forEach(card => {
    card.addEventListener("click", () => onCardClick(card));
  });

  function onCardClick(card) {
    enterActiveMode();

    const pos = parseInt(card.dataset.pos, 10);

    if (pos === 0) {
      if (revealedCard !== card) revealCard(card);
      return;
    }

    rotateToCard(card);
  }

  function rotateToCard(targetCard) {
    const total = cards.length;
    const targetPos = parseInt(targetCard.dataset.pos, 10);
    const logicalOffset = ((targetPos + 3) % total) - 3;

    if (logicalOffset === 0) {
      revealCard(targetCard);
      return;
    }

    const steps = Math.abs(logicalOffset);
    const forward = logicalOffset < 0;

    cards.forEach(card => {
      let pos = parseInt(card.dataset.pos, 10);
      pos = forward
        ? (pos + steps) % total
        : (pos - steps + total * steps) % total;
      card.dataset.pos = pos;
    });

    apply3DWheel(true);

    setTimeout(() => revealCard(targetCard), 350);
  }

  // Swipe

  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].clientX;
  });

  carousel.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
  });

  function handleSwipe() {
    const dx = touchEndX - touchStartX;

    if (Math.abs(dx) < 40) return;

    enterActiveMode();

    if (dx < 0) rotateBackwardOneStep();
    else scrollToNextCardCarousel();

    // reveal the front card after the wheel settles
    setTimeout(() => {
      const front = getFrontCard();
      revealCard(front);
    }, 350);
  }

  // Carousel nav buttons

  const leftBtn = document.querySelector('.left-btn');
  const rightBtn = document.querySelector('.right-btn');

  leftBtn.addEventListener('click', () => {
    enterActiveMode();
    scrollToNextCardCarousel(); // ← now moves forward

    setTimeout(() => {
      const front = getFrontCard();
      revealCard(front);
    }, 350);
  });

  rightBtn.addEventListener('click', () => {
    enterActiveMode();
    rotateBackwardOneStep(); // ← now moves backward

    setTimeout(() => {
      const front = getFrontCard();
      revealCard(front);
    }, 350);
  });

  // Only enable pouring on the menu page
  const isMenuPage = window.location.pathname.includes("menu");
  if (!isMenuPage) return;

  // Pour sound and tilt controls
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const pourSound = new Audio("assets/sounds/Coffee-Pour.mp3");
  pourSound.loop = false;

  let smoothedTiltX = 0;
  const smoothingFactor = 0.1;

  // Web Audio routing
  const track = audioContext.createMediaElementSource(pourSound);
  const panner = audioContext.createStereoPanner();
  track.connect(panner).connect(audioContext.destination);

  pourSound.volume = 0;
  pourSound.pause();

  let isPouring = false;
  let audioUnlocked = false;
  let motionAllowed = false;

  // Fade-out helper
  function fadeOutAudio(audio, duration = 200) {
    const startVolume = audio.volume;
    const steps = 20;
    const stepTime = duration / steps;

    let currentStep = 0;

    const fade = setInterval(() => {
      currentStep++;
      audio.volume = startVolume * (1 - currentStep / steps);

      if (currentStep >= steps) {
        clearInterval(fade);
        audio.volume = 0;
        audio.pause();
      }
    }, stepTime);
  }

  // AUDIO UNLOCK
  function unlockAudio() {
    if (!audioUnlocked) {
      audioContext.resume();
      // DO NOT play the sound here — it causes the burst
      audioUnlocked = true;
    }
  }

  // MOTION PERMISSION (iOS)
  async function requestMotionPermission() {
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {

      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === "granted") {
          motionAllowed = true;
        }
      } catch (err) {}
    } else {
      motionAllowed = true;
    }
  }

  // USER TAP REQUIRED
  document.body.addEventListener("click", async () => {
    unlockAudio();
    await requestMotionPermission();
  });

  // Stop pouring when screen is off or tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      fadeOutAudio(pourSound, 150);
      isPouring = false;
    }
  });

  // MAIN TILT HANDLER
  window.addEventListener("devicemotion", (e) => {
    if (!motionAllowed || !audioUnlocked) return;
    if (document.hidden) return; // extra safety

    const rawTiltX = e.accelerationIncludingGravity.x;

    // Smooth tilt
    smoothedTiltX = smoothedTiltX + (rawTiltX - smoothedTiltX) * smoothingFactor;

    // Convert tilt to a 0–1 intensity
    let intensity = Math.abs(smoothedTiltX) / 8;
    intensity = Math.min(intensity, 1);

    // Stereo pan
    let panValue = Math.max(-1, Math.min(smoothedTiltX / 8, 1));
    panner.pan.value = panValue;

    // Require a stronger tilt to start pouring
    if (intensity > 0.2) {
      if (!isPouring) {
        pourSound.currentTime = 0;
        pourSound.play();
        isPouring = true;
      }

      pourSound.volume = intensity * 0.6;

    } else {
      if (isPouring) {
        fadeOutAudio(pourSound, 200);
        isPouring = false;
      }
    }
  });

  // Idle mode
  let mode = "idle";
  let idleLoopTimeout = null;
  let revealTimeout = null;
  let activeTimeout = null;

  function getFrontCard() {
    return [...cards].find(card => card.dataset.pos === "0");
  }

  function enterIdleMode() {
    mode = "idle";

    let startDelay = 0;
    if (revealedCard) {
      closeCard(revealedCard);
      startDelay = 600;
    }

    function idleStep() {
      if (mode !== "idle") return;

      scrollToNextCardCarousel();

      idleLoopTimeout = setTimeout(() => {
        if (mode !== "idle") return;

        const frontCard = getFrontCard();
        revealCard(frontCard);

        revealTimeout = setTimeout(() => {
          if (mode !== "idle") return;

          closeCard(frontCard);

          setTimeout(() => {
            if (mode === "idle") idleStep();
          }, 600);

        }, 6000);

      }, 1200);
    }

    setTimeout(() => {
      if (mode === "idle") idleStep();
    }, startDelay);
  }

  function enterActiveMode() {
    if (mode === "active") {
      resetActiveTimeout();
      return;
    }

    mode = "active";

    clearTimeout(idleLoopTimeout);
    clearTimeout(revealTimeout);

    if (revealedCard) closeCard(revealedCard);

    resetActiveTimeout();
  }

  function resetActiveTimeout() {
    clearTimeout(activeTimeout);
    activeTimeout = setTimeout(() => {
      mode = "idle";
      enterIdleMode();
    }, 20000);
  }

  // Initialise

  assignInitialPositions();
  apply3DWheel(false);
  enterIdleMode();
}
