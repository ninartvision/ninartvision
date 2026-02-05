/**
 * Shop page rendering with artist filtering from Sanity
 */

// ========================================
// State management
// ========================================

let selectedArtist = "all"; // "all" or artist ID (nini, mzia, nanuli)
let selectedFilter = "all"; // "all", "sale", "sold"
let allArtists = []; // Populated from Sanity

// Slug to ID mapping (matches artist.js)
const slugToId = {
  'nini-mzhavia': 'nini',
  'mzia-kashia': 'mzia',
  'nanuli-gogiberidze': 'nanuli'
};

// ========================================
// Fetch and populate artist filter
// ========================================

async function populateArtistFilter() {
  const artistFilter = document.getElementById("artistFilter");
  
  if (!artistFilter) {
    console.warn('Artist filter element not found');
    return;
  }

  try {
    // Fetch all artists from Sanity
    allArtists = await fetchArtistsFromSanity();
    
    if (!allArtists || allArtists.length === 0) {
      console.warn('No artists found in Sanity');
      return;
    }

    // Populate dropdown with artists
    artistFilter.innerHTML = '<option value="all">All Artists</option>';
    
    allArtists.forEach(artist => {
      const artistId = artist.slug?.current ? slugToId[artist.slug.current] : null;
      if (artistId) {
        const option = document.createElement('option');
        option.value = artistId;
        option.textContent = artist.name;
        artistFilter.appendChild(option);
      }
    });

  } catch (error) {
    console.error('Error fetching artists:', error);
  }
}

// ========================================
// Filter and display logic
// ========================================

/**
 * Render artworks based on selected artist and status filter
 */
function renderArtworks() {
  const grid = document.getElementById("shopGrid");

  if (!window.ARTWORKS) {
    grid.innerHTML = "❌ ARTWORKS not loaded";
    return;
  }

  // Apply filters
  const filtered = window.ARTWORKS.filter(art => {
    // Filter by showInShop flag - only show artworks explicitly marked for shop
    const showInShop = art.showInShop === true;
    
    // Filter by artist
    const matchesArtist = selectedArtist === "all" || art.artist === selectedArtist;
    
    // Filter by status
    const matchesStatus = {
      all: true,
      sale: art.status === "sale",
      sold: art.status === "sold"
    }[selectedFilter];

    return showInShop && matchesArtist && matchesStatus;
  });

  // Sort: sale items first, then sold
  const sorted = filtered.sort((a, b) => {
    if (a.status === 'sale' && b.status !== 'sale') return -1;
    if (a.status !== 'sale' && b.status === 'sale') return 1;
    return 0;
  });

  if (sorted.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
        <p>No artworks found for the selected filters.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = sorted.map(a => `
    <div class="shop-item ${a.status}" data-artist="${a.artist}" data-status="${a.status}" data-title="${a.title}" data-price="${a.price}" data-size="${a.size}" data-medium="${a.medium}" data-year="${a.year}" data-desc="${a.desc}" data-photos="${a.photos.join(',')}">
      <img src="../${a.img.toLowerCase()}" alt="${a.title}" loading="lazy">
      ${a.status === 'sold' ? '<div class="sold-badge"></div>' : ''}
      <div class="shop-meta">
        <span>${a.title}</span>
        <span class="price">₾${a.price}</span>
      </div>
    </div>
  `).join("");

  // Re-initialize modal functionality for the newly rendered items
  if (window.initShopItems) {
    window.initShopItems();
  }
}

// ========================================
// Event listeners
// ========================================

document.addEventListener("DOMContentLoaded", async () => {
  // Populate artist filter from Sanity
  await populateArtistFilter();

  // Artist filter change
  const artistFilter = document.getElementById("artistFilter");
  if (artistFilter) {
    artistFilter.addEventListener("change", (e) => {
      selectedArtist = e.target.value;
      
      // Track shop filter usage
      if (typeof trackShopFilter === 'function') {
        const artistName = allArtists.find(a => {
          const artistId = a.slug?.current ? slugToId[a.slug.current] : null;
          return artistId === e.target.value;
        })?.name || e.target.value;
        trackShopFilter('artist', artistName);
      }
      
      renderArtworks();
    });
  }

  // Status filter pills
  const pills = document.querySelectorAll(".filter-tabs .pill");
  pills.forEach(p => {
    p.addEventListener("click", () => {
      pills.forEach(x => x.classList.remove("active"));
      p.classList.add("active");
      selectedFilter = p.dataset.filter;
      
      // Track status filter usage
      if (typeof trackShopFilter === 'function') {
        trackShopFilter('status', selectedFilter);
      }
      
      renderArtworks();
    });
  });

  // Set "ALL" pill active on load
  pills[0]?.classList.add("active");

  // Initial render (shows all artists, all statuses)
  renderArtworks();
});