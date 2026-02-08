document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("homeArtistsGrid");
  const searchInput = document.querySelector(".search-input");
  const sectionTop = document.querySelector("#artists .section-top");
  if (!grid) return;

  // Use local window.ARTISTS data
  let artists = Array.isArray(window.ARTISTS) ? window.ARTISTS.slice(0, 3) : [];

  function renderArtists(artistsToShow, isSearching = false) {
    if (!artistsToShow.length) {
      grid.innerHTML = `<p class="muted">No artists found matching your search. Try searching by artist name or style.</p>`;
      if (sectionTop && isSearching) {
        const subtitle = sectionTop.querySelector(".muted");
        if (subtitle) subtitle.textContent = "No results found";
      }
      return;
    }
    grid.innerHTML = artistsToShow.map(artist => {
      const artistSlug = artist.id || artist.slug || artist.name;
      const artistPage = `artists/artist.html?artist=${encodeURIComponent(artistSlug)}`;
      const avatarUrl = artist.avatar || 'images/artists/placeholder.jpg';
      return `
        <a class="artist-card" href="${artistPage}">
          <div class="artist-avatar" style="background-image:url('${avatarUrl}')"></div>
          <h3 class="artist-name">
            <img src="images/icon.jpg" alt="Georgia" class="flag-icon">
            <span>${artist.name}</span>
          </h3>
          ${artist.style ? `<p class="artist-style">${artist.style}</p>` : ''}
        </a>
      `;
    }).join("");
    if (sectionTop && isSearching) {
      const subtitle = sectionTop.querySelector(".muted");
      if (subtitle) {
        const count = artistsToShow.length;
        subtitle.textContent = `Found ${count} artist${count !== 1 ? 's' : ''} matching your search`;
      }
    } else if (sectionTop) {
      const subtitle = sectionTop.querySelector(".muted");
      if (subtitle) {
        subtitle.textContent = "Discover our highlighted creators and explore their projects.";
      }
    }
  }

  renderArtists(artists, false);

  if (searchInput) {
    let searchTimeout;
    let allArtists = Array.isArray(window.ARTISTS) ? window.ARTISTS : [];
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      if (searchTerm) {
        searchInput.classList.add("searching");
      } else {
        searchInput.classList.remove("searching");
      }
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (!searchTerm) {
          renderArtists(artists, false);
          return;
        }
        const filtered = allArtists.filter(artist => {
          const name = (artist.name || "").toLowerCase();
          const style = (artist.style || "").toLowerCase();
          const searchWords = searchTerm.split(/\s+/);
          return searchWords.every(word => name.includes(word) || style.includes(word));
        });
        renderArtists(filtered, true);
      }, 150);
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        searchInput.classList.remove("searching");
        renderArtists(artists, false);
        searchInput.blur();
      }
    });
  }
});



