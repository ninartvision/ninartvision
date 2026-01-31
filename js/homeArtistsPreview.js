document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("homeArtistsGrid");
  if (!grid) return;

  const artists = window.ARTISTS || [];
  if (!artists.length) {
    grid.innerHTML = `<p class="muted">No artists added yet.</p>`;
    return;
  }

  // Show only first 4 artists on home page
  const displayArtists = artists.slice(0, 4);

  grid.innerHTML = displayArtists.map(artist => `
    <a class="artist-card" href="artists/artist.html?artist=${artist.id}">
      <div class="artist-avatar" style="background-image:url('${artist.avatar}')"></div>
      <h3>${artist.name}</h3>
    </a>
  `).join("");
});
