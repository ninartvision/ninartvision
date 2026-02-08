document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("homeArtistsGrid");
  if (!grid) return;

  grid.innerHTML = `<p class="muted">Loading artists...</p>`;

  try {
    // 🔑 Sanity-დან წამოვიღოთ 3 არტისტი
    const artists = await fetchArtistsFromSanity(3);

    if (!artists || !artists.length) {
      grid.innerHTML = `<p class="muted">No artists available.</p>`;
      return;
    }

    grid.innerHTML = artists.map(artist => {
      const slug = artist.slug || artist._id;

      const avatar =
        artist.image?.asset?.url ||
        "images/artists/placeholder.jpg";

      return `
        <a class="artist-card"
           href="artists/artist.html?artist=${encodeURIComponent(slug)}">

          <div class="artist-avatar"
               style="background-image:url('${avatar}')"></div>

          <h3 class="artist-name">
            <img src="images/icon.jpg" class="flag-icon" alt="">
            <span>${artist.name}</span>
          </h3>

          ${artist.style ? `<p class="artist-style">${artist.style}</p>` : ""}
        </a>
      `;
    }).join("");

  } catch (err) {
    console.error("❌ Failed to load artists on home page", err);
    grid.innerHTML = `<p class="muted">Failed to load artists.</p>`;
  }
});
