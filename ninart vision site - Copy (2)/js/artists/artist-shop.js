document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("shopGrid");
  const title = document.querySelector(".artist-name");
  const avatar = document.getElementById("artistAvatar");

  const params = new URLSearchParams(location.search);
  let artistId = params.get("artist");

  // If no artist param, try to infer from filename
  if (!artistId) {
    const path = location.pathname.toLowerCase();
    if (path.includes("nini.html")) artistId = "nini";
    else if (path.includes("mzia.html")) artistId = "mzia";
    else if (path.includes("nanuli.html")) artistId = "nanuli";
  }

  if (!artistId) {
    title.textContent = "Artist not found";
    return;
  }

  // Get artist data
  const artistData = window.ARTISTS?.find(a => a.id === artistId);
  title.textContent = artistData ? artistData.name : artistId.toUpperCase();
  if (avatar && artistData) avatar.src = "../" + artistData.avatar;

  // ABOUT ARTIST TEXT
  const aboutTextEl = document.getElementById("aboutText");
  if (aboutTextEl && artistData && artistData.about) {
    aboutTextEl.textContent = artistData.about;
  }

  // ARTWORKS
  if (!window.ARTWORKS) {
    grid.innerHTML = "❌ ARTWORKS not loaded";
    return;
  }

  const items = window.ARTWORKS.filter(a => a.artist === artistId);

  if (!items.length) {
    grid.innerHTML = "No artworks for this artist.";
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
         data-photos="${a.photos.join(',')}">
      <div class="shop-meta">
        <span>${a.title}</span>
        <span class="price">₾${a.price}</span>
      </div>
      <img src="../${a.img}" alt="${a.title}">
    </div>
  `).join("");
});

// 🔽 THIS MUST BE OUTSIDE DOMContentLoaded
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
