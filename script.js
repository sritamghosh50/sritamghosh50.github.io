const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const topBtn = document.getElementById("topBtn");

menuBtn.addEventListener("click", function () {
  navLinks.classList.toggle("active");
});

const navItems = document.querySelectorAll(".nav-links a");

navItems.forEach(function (item) {
  item.addEventListener("click", function () {
    navLinks.classList.remove("active");
  });
});

window.addEventListener("scroll", function () {
  if (window.scrollY > 350) {
    topBtn.classList.add("show");
  } else {
    topBtn.classList.remove("show");
  }
});

topBtn.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

function copyEmail() {
  const email = document.getElementById("emailText").innerText;

  navigator.clipboard.writeText(email).then(function () {
    alert("Email copied: " + email);
  });
}

document.getElementById("year").innerText = new Date().getFullYear();
