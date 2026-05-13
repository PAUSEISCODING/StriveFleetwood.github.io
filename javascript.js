const text = document.querySelector(".scroll-text")

window.addEventListener("scroll", () => {
  let y = window.scrollY
  let move = Math.min(y * 0.5, 150)
  text.style.transform = "translateY(-" + move + "px)"
})

const btn = document.getElementById("modeToggle")

btn.addEventListener("click", () => {
  document.body.classList.toggle("light")
  document.body.classList.toggle("dark")
  document.querySelectorAll(".gallery-collection").forEach(el => {
    el.classList.toggle("light")
    el.classList.toggle("dark")
  })
})

const burger = document.getElementById("burger")
const nav = document.getElementById("navLinks")

burger.addEventListener("click", () => {
  burger.classList.toggle("active")
  nav.classList.toggle("active")
})