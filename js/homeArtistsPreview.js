document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("homeArtistsGrid");
  const searchInput = document.querySelector(".search-input");
  const sectionTop = document.querySelector("#artists .section-top");
  
  if (!grid) return;

  const artists = window.ARTISTS || [];
  if (!artists.length) {
    grid.innerHTML = `<p class="muted">No artists added yet.</p>`;
    return;
  }

  // Filter out placeholder artists
  const validArtists = artists.filter(a => {
    return a.avatar && !a.avatar.includes('placeholder.jpg');
  });

  // Function to render artists with smooth transition
  function renderArtists(artistsToShow, isSearching = false) {
    if (!artistsToShow.length) {
      grid.innerHTML = `<p class="muted">No artists found matching your search. Try searching by artist name or style.</p>`;
      
      // Update section title to show no results
      if (sectionTop && isSearching) {
        const subtitle = sectionTop.querySelector(".muted");
        if (subtitle) subtitle.textContent = "No results found";
      }
      return;
    }

    grid.innerHTML = artistsToShow.map(artist => `
      <a class="artist-card" href="artists/artist.html?artist=${artist.id}">
        <div class="artist-avatar" style="background-image:url('${artist.avatar}')"></div>
        <h3>${artist.name}</h3>
      </a>
    `).join("");
    
    // Update section subtitle with search results count
    if (sectionTop && isSearching) {
      const subtitle = sectionTop.querySelector(".muted");
      if (subtitle) {
        const count = artistsToShow.length;
        subtitle.textContent = `Found ${count} artist${count !== 1 ? 's' : ''} matching your search`;
      }
    } else if (sectionTop) {
      // Reset to original text when not searching
      const subtitle = sectionTop.querySelector(".muted");
      if (subtitle) {
        subtitle.textContent = "Discover creators and explore their projects.";
      }
    }
  }

  // Initial render - show only first 4 artists
  renderArtists(validArtists.slice(0, 4), false);

  // Search functionality
  if (searchInput) {
    let searchTimeout;
    
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      
      // Add visual feedback
      if (searchTerm) {
        searchInput.classList.add("searching");
      } else {
        searchInput.classList.remove("searching");
      }
      
      // Debounce search for better performance
      clearTimeout(searchTimeout);
      
      searchTimeout = setTimeout(() => {
        if (!searchTerm) {
          // If search is empty, show only first 4 artists again
          renderArtists(validArtists.slice(0, 4), false);
          return;
        }

        // Filter artists by name (supports partial matches, case-insensitive)
        const filtered = validArtists.filter(artist => {
          const name = (artist.name || "").toLowerCase();
          const style = (artist.style || "").toLowerCase();
          
          // Split search term to match first name, last name individually
          const searchWords = searchTerm.split(/\s+/);
          
          // Check if all search words match somewhere in name or style
          return searchWords.every(word => 
            name.includes(word) || style.includes(word)
          );
        });

        // Show all matching results (not limited to 4 when searching)
        renderArtists(filtered, true);
      }, 150); // 150ms debounce delay
    });
    
    // Clear search on Escape key
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        searchInput.classList.remove("searching");
        renderArtists(validArtists.slice(0, 4), false);
        searchInput.blur();
      }
    });
  }
});



