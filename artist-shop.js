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

  if (avatar && artistData?.avatar) {
    avatar.src = "../" + artistData.avatar;
  }

  // ABOUT ARTIST (optional block)
  const aboutTextEl = document.getElementById("aboutText");
  if (aboutTextEl && artistData?.about) {
    aboutTextEl.textContent = artistData.about;
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

        <img src="../${a.img}" alt="${a.title}">

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
