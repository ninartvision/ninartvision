function scrollToForm() {
  document.getElementById("contactForm")
    .scrollIntoView({ behavior: "smooth" });
}

function setLang(lang, event) {
  // Prevent event propagation to avoid conflicts
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = el.dataset[lang];
  });

  document.querySelectorAll(".lang-item").forEach(btn => {
    btn.classList.remove("active");
  });

  const activeBtn = document.querySelector(
    `.lang-item[onclick*="'${lang}'"]`
  );
  if (activeBtn) {
    activeBtn.classList.add("active");
  }

  // Save language preference
  localStorage.setItem("siteLang", lang);
}

// Initialize language on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("siteLang") || "en";
  setLang(savedLang);

  // Add proper event listeners to language buttons
  document.querySelectorAll(".lang-item").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      e.preventDefault();
      const langCode = this.getAttribute("onclick").match(/'(\w+)'/)[1];
      setLang(langCode, e);
    });
  });
});
