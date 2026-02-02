document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("shopGrid");
  const title = document.querySelector(".artist-name");
  const avatar = document.getElementById("artistAvatar");
  const pills = document.querySelectorAll(".pill");

  if (!grid || !title) return;

  // ---------------------------
  // GET ARTIST ID
  // ---------------------------
  const params = new URLSearchParams(location.search);
  let artistId = params.get("artist");

  // fallback filename-based (optional)
  if (!artistId) {
    const path = location.pathname.toLowerCase();
    if (path.includes("nini")) artistId = "nini";
    if (path.includes("mzia")) artistId = "mzia";
    if (path.includes("nanuli")) artistId = "nanuli";
  }

  if (!artistId) {
    title.textContent = "Artist not found";
    return;
  }

  // ---------------------------
  // ARTIST INFO
  // ---------------------------
  const artistData = (window.ARTISTS || []).find(a => a.id === artistId);

  title.textContent = artistData ? artistData.name : artistId.toUpperCase();

  if (avatar) {
    if (artistData?.avatar) {
      avatar.src = "../" + artistData.avatar;
      avatar.style.display = "block";
    } else {
      avatar.style.display = "none";
    }
  }

  // ABOUT ARTIST (optional block)
  const aboutTextEl = document.getElementById("aboutText");
  if (aboutTextEl && artistData?.about) {
    aboutTextEl.textContent = artistData.about;
  }

  // ---------------------------
  // ABOUT ARTIST - COLLAPSIBLE + LANGUAGE SWITCHER
  // ---------------------------
  const aboutToggle = document.getElementById("aboutToggle");
  const aboutContent = document.getElementById("aboutContent");
  const bioText = document.getElementById("bioText");
  const langSwitches = document.querySelectorAll(".lang-switch");

  // Artist biographies (EN / KA)
  const artistBios = {
    nini: {
      en: "Nini Mzhavia is a contemporary abstract artist whose works explore modern visual language, emotion, and form through vibrant colors and dynamic compositions.",
      ka: "ნინი მჟავია არის თანამედროვე აბსტრაქტული მხატვარი, რომლის ნამუშევრები იკვლევს თანამედროვე ვიზუალურ ენას, ემოციას და ფორმას ცოცხალი ფერებითა და დინამიური კომპოზიციებით."
    },
    mzia: {
      en: "Mzia Kashia creates impressionist works that blend reality with artistic interpretation, capturing the essence of Georgian landscapes and cultural heritage.",
      ka: "მზია ქაშია ქმნის იმპრესიონისტულ ნამუშევრებს, რომლებიც აერთიანებს რეალობას მხატვრულ ინტერპრეტაციასთან და ასახავს ქართული ლანდშაფტებისა და კულტურული მემკვიდრეობის არსს."
    },
    nanuli: {
      en: "Nanuli Gogiberidze specializes in decorative impressionism, creating vivid artworks that celebrate beauty, nature, and Georgian artistic traditions.",
      ka: "ნანული გოგიბერიძე სპეციალიზირებულია დეკორატიულ იმპრესიონიზმში და ქმნის ცოცხალ ნამუშევრებს, რომლებიც ადიდებენ სილამაზეს, ბუნებას და ქართულ მხატვრულ ტრადიციებს."
    }
  };

  let currentLang = "en";

  // Toggle About section
  if (aboutToggle && aboutContent) {
    aboutToggle.addEventListener("click", () => {
      const isHidden = aboutContent.style.display === "none";
      aboutContent.style.display = isHidden ? "block" : "none";
      aboutToggle.innerHTML = isHidden ? "About artist ▲" : "About artist ▼";
    });
  }

  // Language switcher
  if (bioText && langSwitches.length > 0) {
    const updateBio = (lang) => {
      currentLang = lang;
      const bio = artistBios[artistId]?.[lang] || artistData?.about || "No biography available.";
      bioText.textContent = bio;

      // Update button styles
      langSwitches.forEach(btn => {
        if (btn.dataset.lang === lang) {
          btn.style.background = "#333";
          btn.style.color = "#fff";
        } else {
          btn.style.background = "#ddd";
          btn.style.color = "#333";
        }
      });
    };

    // Set initial bio
    updateBio("en");

    // Language switch handlers
    langSwitches.forEach(btn => {
      btn.addEventListener("click", () => {
        updateBio(btn.dataset.lang);
      });
    });
  }

  // ---------------------------
  // ARTWORKS
  // ---------------------------
  if (!window.ARTWORKS) {
    grid.innerHTML = "<p class='muted'>ARTWORKS not loaded</p>";
    return;
  }

  const allArtworks = window.ARTWORKS
    .filter(a => a.artist === artistId)
    .sort((a, b) => {
      if (a.status === "sale" && b.status !== "sale") return -1;
      if (a.status !== "sale" && b.status === "sale") return 1;
      return 0;
    });

  function render(filter = "all") {
    const items =
      filter === "all"
        ? allArtworks
        : allArtworks.filter(a => a.status === filter);

    if (!items.length) {
      grid.innerHTML = "<p class='muted'>No artworks found.</p>";
      return;
    }

    grid.innerHTML = items.map(a => `
      <div class="shop-item ${a.status}"
        data-artist="${a.artist}"
        data-status="${a.status}"
        data-title="${a.title}"
        data-price="${a.price}"
        data-size="${a.size}"
        data-medium="${a.medium}"
        data-year="${a.year}"
        data-desc="${a.desc}"
        data-photos="${a.photos.join(",")}">

        <img src="../${a.img.toLowerCase()}" alt="${a.title}" loading="lazy">
        ${a.status === 'sold' ? '<div class="sold-badge"></div>' : ''}

        <div class="shop-meta">
          <span>${a.title}</span>
          <span class="price">₾${a.price}</span>
        </div>
      </div>
    `).join("");

    // 🔥 modal + gallery init
    if (window.initShopItems) initShopItems();
  }

  // ---------------------------
  // FILTER BUTTONS
  // ---------------------------
  pills.forEach(btn => {
    btn.addEventListener("click", () => {
      pills.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      render(btn.dataset.filter);
    });
  });

  // INIT
  render("all");
});


// ---------------------------
// ABOUT TOGGLE (outside DOMContentLoaded ✔️)
// ---------------------------
function toggleAbout() {
  const box = document.getElementById("aboutArtist");
  const btn = document.querySelector(".about-toggle");

  if (!box) return;

  box.classList.toggle("hidden");

  if (btn) {
    btn.textContent = box.classList.contains("hidden")
      ? "About artist"
      : "Hide about";
  }
}
