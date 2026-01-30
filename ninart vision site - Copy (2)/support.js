function scrollToForm() {
  document.getElementById("contactForm")
    .scrollIntoView({ behavior: "smooth" });
}

function setLang(lang) {
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = el.dataset[lang];
  });

  document.querySelectorAll(".lang-item").forEach(btn => {
    btn.classList.remove("active");
  });

  document
    .querySelector(`.lang-item[onclick="setLang('${lang}')"]`)
    .classList.add("active");
}

// default language
setLang("en");
