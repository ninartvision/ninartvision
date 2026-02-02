document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("homeArtistsGrid");
  const searchInput = document.querySelector(".search-input");
  const sectionTop = document.querySelector("#artists .section-top");
  
  if (!grid) return;

  // Show loading state
  grid.innerHTML = `<p class="muted">Loading artists...</p>`;

  // Fetch featured artists from Sanity (exactly 3 for homepage)
  let artists = [];
  try {
    artists = await fetchArtistsFromSanity(3, true); // Fetch only featured artists
  } catch (error) {
    console.error('Error loading artists:', error);
    grid.innerHTML = `<p class="muted">Unable to load artists. Please try again later.</p>`;
    return;
  }

  if (!artists.length) {
    grid.innerHTML = `<p class="muted">No artists available yet.</p>`;
    return;
  }

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

    grid.innerHTML = artistsToShow.map(artist => {
      // Map slugs to existing HTML filenames
      const artistSlug = artist.slug?.current || artist.slug || artist._id;
      const slugToFile = {
        'nini-mzhavia': 'nini.html',
        'mzia-kashia': 'mzia.html',
        'nanuli-gogiberidze': 'nanuli.html',
        'salome-mzhavia': 'salome.html'
      };
      const artistPage = slugToFile[artistSlug] || `${artistSlug}.html`;
      
      return `
        <a class="artist-card" href="artists/${artistPage}">
          <div class="artist-avatar" style="background-image:url('${artist.avatar || 'images/artists/placeholder.jpg'}')"></div>
          <h3 class="artist-name">
            <img src="images/icon.jpg" alt="Georgia" class="flag-icon">
            <span>${artist.name}</span>
          </h3>
          ${artist.style ? `<p class="artist-style">${artist.style}</p>` : ''}
        </a>
      `;
    }).join("");
    
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

  // Initial render - show all fetched artists (max 3 from Sanity)
  renderArtists(artists, false);

  // Search functionality - fetch ALL artists when user searches
  if (searchInput) {
    let searchTimeout;
    let allArtists = null; // Cache for all artists
    
    searchInput.addEventListener("input", async (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      
      // Add visual feedback
      if (searchTerm) {
        searchInput.classList.add("searching");
      } else {
        searchInput.classList.remove("searching");
      }
      
      // Debounce search for better performance
      clearTimeout(searchTimeout);
      
      searchTimeout = setTimeout(async () => {
        if (!searchTerm) {
          // If search is empty, show only first 3 artists again
          renderArtists(artists, false);
          return;
        }

        // Fetch all artists if not cached (for search)
        if (!allArtists) {
          try {
            allArtists = await fetchArtistsFromSanity(); // Fetch all without limit
          } catch (error) {
            console.error('Error fetching all artists for search:', error);
            return;
          }
        }

        // Filter artists by name (supports partial matches, case-insensitive)
        const filtered = allArtists.filter(artist => {
          const name = (artist.name || "").toLowerCase();
          const style = (artist.style || "").toLowerCase();
          
          // Split search term to match first name, last name individually
          const searchWords = searchTerm.split(/\s+/);
          
          // Check if all search words match somewhere in name or style
          return searchWords.every(word => 
            name.includes(word) || style.includes(word)
          );
        });

        // Show all matching results (not limited to 3 when searching)
        renderArtists(filtered, true);
      }, 150); // 150ms debounce delay
    });
    
    // Clear search on Escape key
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



