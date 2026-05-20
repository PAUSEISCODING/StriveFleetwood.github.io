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
const closeBtn = document.querySelector('.lightbox-close');
const leftArrow = document.querySelector('.lightbox-arrow.left');
const rightArrow = document.querySelector('.lightbox-arrow.right');

let currentIndex = 0;
let images = [];

items.forEach((item, index) => {
  const bg = item.style.getPropertyValue('--bg')
    .replace("url('", "")
    .replace("')", "");
  images.push(bg);

  item.addEventListener('click', () => {
    currentIndex = index;
    openLightbox();
  });
});

function openLightbox() {
  lightbox.classList.add('active');
  lightboxImg.src = images[currentIndex];
}

function closeLightbox() {
  lightbox.classList.remove('active');
}

function nextImage() {
  currentIndex = (currentIndex + 1) % images.length;
  lightboxImg.src = images[currentIndex];
}

function prevImage() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  lightboxImg.src = images[currentIndex];
}

closeBtn.addEventListener('click', closeLightbox);
rightArrow.addEventListener('click', nextImage);
leftArrow.addEventListener('click', prevImage);

// Close on background click
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// Lightbox Swipe support
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

  // Minimum swipe distance
  if (Math.abs(diff) < 50) return;

  if (diff > 0) {
    prevImage();
  } else {
    nextImage();
  }
}

function nextImage() {
  lightboxImg.classList.add('swipe-left');
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImg.src = images[currentIndex];
    lightboxImg.classList.remove('swipe-left');
  }, 150);
}

function prevImage() {
  lightboxImg.classList.add('swipe-right');
  setTimeout(() => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImg.src = images[currentIndex];
    lightboxImg.classList.remove('swipe-right');
  }, 150);
}

