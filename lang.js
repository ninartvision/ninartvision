function setLang(lang) {
  // შეცვალე ყველა data-en / data-ka ტექსტი
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = el.dataset[lang];
  });

  // active კლასის მართვა
  document.querySelectorAll(".lang-item").forEach(btn => {
    btn.classList.remove("active");
  });

  const activeBtn = document.querySelector(
    `.lang-item[onclick="setLang('${lang}')"]`
  );
  if (activeBtn) activeBtn.classList.add("active");

  // 🔐 ენის დამახსოვრება
  localStorage.setItem("siteLang", lang);
}

// 🔁 გვერდის ჩატვირთვისას – დამახსოვრებული ენა
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("siteLang") || "en";
  setLang(savedLang);
});
