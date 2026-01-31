function setLang(lang, event) {
  // Prevent event propagation to avoid conflicts with other buttons
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  // შეცვალე ყველა data-en / data-ka ტექსტი
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = el.dataset[lang];
  });

  // active კლასის მართვა
  document.querySelectorAll(".lang-item").forEach(btn => {
    btn.classList.remove("active");
  });

  const activeBtn = document.querySelector(
    `.lang-item[onclick*="'${lang}'"]`
  );
  if (activeBtn) activeBtn.classList.add("active");

  // 🔐 ენის დამახსოვრება
  localStorage.setItem("siteLang", lang);
}

// 🔁 გვერდის ჩატვირთვისას – დამახსოვრებული ენა
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("siteLang") || "en";
  setLang(savedLang);

  // Add proper event listeners to prevent conflicts
  document.querySelectorAll(".lang-item").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      e.preventDefault();
      const langCode = this.getAttribute("onclick").match(/'(\w+)'/)[1];
      setLang(langCode, e);
    });
  });
});
