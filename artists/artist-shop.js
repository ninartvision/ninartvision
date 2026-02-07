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
  const artistSlug = params.get("artist");
  
  // Extract short artist ID from slug for artwork filtering
  const slugToId = {
    'nini-mzhavia': 'nini',
    'mzia-kashia': 'mzia',
    'nanuli-gogiberidze': 'nanuli',
    'salome-mzhavia': 'salome'
  };
  let artistId = slugToId[artistSlug] || artistSlug?.split('-')[0] || artistSlug;

  // Fallback filename-based (optional)
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
  // ARTIST INFO (from Sanity via artist.js or fallback to legacy data)
  // ---------------------------
  const artistData = window.CURRENT_ARTIST || (window.ARTISTS || []).find(a => a.id === artistId);

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

  let currentLang = "ka";

  // Toggle About section
  if (aboutToggle && aboutContent) {
    aboutToggle.addEventListener("click", () => {
      const isHidden = aboutContent.style.display === "none";
      aboutContent.style.display = isHidden ? "block" : "none";
      aboutToggle.innerHTML = isHidden ? "About artist ▲" : "About artist ▼";
    });
  }

  // Function to get bio with fallback logic from Sanity data
  function getBioText(lang) {
    // Use Sanity data from window.CURRENT_ARTIST if available
    const artist = window.CURRENT_ARTIST || artistData;
    
    if (!artist) return "No biography available.";

    // Try requested language from Sanity
    const requestedBio = lang === 'en' ? artist.bio_en : artist.bio_ka;
    if (requestedBio && requestedBio.trim()) {
      return requestedBio;
    }

    // Fallback to other language from Sanity
    const fallbackBio = lang === 'en' ? artist.bio_ka : artist.bio_en;
    if (fallbackBio && fallbackBio.trim()) {
      return fallbackBio;
    }

    // Fallback to legacy 'about' field
    if (artist.about && artist.about.trim()) {
      return artist.about;
    }

    // Last resort: hardcoded bios (legacy support)
    const artistBios = {
      nini: {
        en: "Nini Mzhavia is a contemporary abstract artist whose works explore modern visual language, emotion, and form through vibrant colors and dynamic compositions.",
        ka: "ნინი მჟავია არის თანამედროვე აბსტრაქტული მხატვარი, რომლის ნამუშევრები იკვლევს თანამედროვე ვიზუალურ ენას, ემოციას და ფორმას ცოცხალი ფერებითა და დინამიური კომპოზიციებით."
      },
      mzia: {
        en: "Mzia Kashia creates impressionist works that blend reality with artistic interpretation, capturing the essence of Georgian landscapes and cultural heritage.",
        ka: "მზია კაშია ქმნის იმპრესიონისტულ ნამუშევრებს, რომლებიც აერთიანებს რეალობას მხატვრულ ინტერპრეტაციასთან და ასახავს ქართული ლანდშაფტებისა და კულტურული მემკვიდრეობის არსს."
      },
      nanuli: {
        en: "Nanuli Gogiberidze specializes in decorative impressionism, creating vivid artworks that celebrate beauty, nature, and Georgian artistic traditions.",
        ka: "ნანული გოგიბერიძე სპეციალიზირებულია დეკორატიულ იმპრესიონიზმში და ქმნის ცოცხალ ნამუშევრებს, რომლებიც ადიდებენ სილამაზეს, ბუნებას და ქართულ მხატვრულ ტრადიციებს."
      }
    };

    return artistBios[artistId]?.[lang] || "No biography available.";
  }

  // Language switcher
  if (bioText && langSwitches.length > 0) {
    const updateBio = (lang) => {
      currentLang = lang;
      bioText.textContent = getBioText(lang);

      // Update button styles with improved contrast
      langSwitches.forEach(btn => {
        if (btn.dataset.lang === lang) {
          btn.style.background = "#1a1a1a";
          btn.style.color = "#fff";
          btn.style.opacity = "1";
        } else {
          btn.style.background = "#e8e8e8";
          btn.style.color = "#666";
          btn.style.opacity = "0.7";
        }
      });
    };

    // Set initial bio - default to Georgian (KA)
    const savedLang = localStorage.getItem("siteLang") || "ka";
    updateBio(savedLang);

    // Language switch handlers
    langSwitches.forEach(btn => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        updateBio(lang);
        localStorage.setItem("siteLang", lang);
      });
    });
  }

  // ---------------------------
// ARTWORKS (FROM SANITY)
// ---------------------------
let allArtworks = [];

(async function loadArtworksFromSanity() {
  try {
    const query = `
      *[_type == "artwork" && artist->slug.current == "${artistSlug}"] | order(_createdAt desc) {
        title,
        price,
        status,
        size,
        medium,
        year,
        "img": image.asset->url,
        desc,
        "photos": images[].asset->url
      }
    `;

    const res = await fetch(
      "https://8t5h923j.api.sanity.io/v2024-01-01/data/query/production?query=" +
        encodeURIComponent(query)
    );

    const { result } = await res.json();

    allArtworks = (result || []).map(a => ({
      title: a.title,
      price: a.price || "",
    status: a.status === "sold" ? "sold" : "sale",
      size: a.size || "",
      medium: a.medium || "",
      year: a.year || "",
      img: a.img,
      desc: a.desc || "",
      photos: a.photos && a.photos.length ? a.photos : [a.img]
    }));

    render("all");
  } catch (err) {
    console.error("Sanity artworks error:", err);
    grid.innerHTML = "<p class='muted'>Failed to load artworks.</p>";
  }
})();


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
        data-artist="${artistSlug}"
        data-status="${a.status}"
        data-title="${a.title}"
        data-price="${a.price}"
        data-size="${a.size}"
        data-medium="${a.medium}"
        data-year="${a.year}"
        data-desc="${a.desc}"
        data-photos="${a.photos.join(",")}">

        <img src="${a.img}" alt="${a.title}" loading="lazy">

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
