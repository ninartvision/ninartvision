(async function() {
  const params = new URLSearchParams(location.search);
  const artistSlug = params.get("artist");

  if (!artistSlug) {
    console.error('No artist identifier provided');
    return;
  }

  // Extract short artist ID from slug (e.g., "nini-mzhavia" -> "nini")
  // This maintains compatibility with legacy artwork data
  const slugToId = {
    'nini-mzhavia': 'nini',
    'mzia-kashia': 'mzia',
    'nanuli-gogiberidze': 'nanuli',
    'salome-mzhavia': 'salome'
  };
  const artistId = slugToId[artistSlug] || artistSlug.split('-')[0] || artistSlug;

  // Fetch artist data from Sanity
  let artist = null;
  try {
    artist = await fetchArtistBySlug(artistSlug);
  } catch (error) {
    console.error('Error loading artist:', error);
  }

  // Make artist data globally available for other scripts (like artist-shop.js)
  window.CURRENT_ARTIST = artist;
  window.CURRENT_ARTIST_ID = artistId;

  // Track artist page view
  if (artist && typeof trackArtistView === 'function') {
    trackArtistView(artistSlug, artist.name);
  }

  // Update SEO metadata
  updateSEOMetadata(artist);

  // Display artist info
  const artistNameEl = document.querySelector(".artist-name");
  const artistAvatarEl = document.getElementById("artistAvatar");
  
  if (artist && artistNameEl && artistAvatarEl) {
    artistNameEl.textContent = artist.name || "Artist";
    artistAvatarEl.src = artist.avatar || "../images/artists/placeholder.jpg";
  } else if (artistNameEl) {
    artistNameEl.textContent = "Artist Not Found";
  }

  // Setup biography display
  setupBioDisplay(artist, artistId);

  // Load artworks (using artistId for compatibility with legacy ARTWORKS array)
  const artworks = window.ARTWORKS ? window.ARTWORKS.filter(a => a.artist === artistId).sort((a, b) => {
    if (a.status === 'sale' && b.status !== 'sale') return -1;
    if (a.status !== 'sale' && b.status === 'sale') return 1;
    return 0;
  }) : [];

  const grid = document.getElementById("shopGrid");
  if (grid) {
    if (!artworks.length) {
      grid.innerHTML = '<p class="muted" style="text-align:center;">No artworks available for this artist.</p>';
    } else {
      grid.innerHTML = artworks.map(a => `
        <div class="shop-item ${a.status}" data-artist="${a.artist}" data-status="${a.status}" data-title="${a.title}" data-price="${a.price}" data-size="${a.size}" data-medium="${a.medium}" data-year="${a.year}" data-desc="${a.desc}" data-photos="${a.photos.join(',')}">
          <img src="../${a.img.toLowerCase()}" alt="${a.title}" loading="lazy">
          ${a.status === 'sold' ? '<div class="sold-badge"></div>' : ''}
          <div class="shop-meta">
            <span>${a.title}</span>
            <span class="price">₾${a.price}</span>
          </div>
        </div>
      `).join("");
    }
  }

  if (window.initShopItems) initShopItems();

  /**
   * Setup biography display (single language, with fallback logic)
   */
  function setupBioDisplay(artist, artistId) {
    const aboutToggle = document.getElementById("aboutToggle");
    const aboutArtist = document.getElementById("aboutArtist");
    const aboutText = document.getElementById("aboutText");

    if (!aboutToggle || !aboutArtist || !aboutText) return;

    let isVisible = false; // About section hidden by default

    // Set initial state
    aboutArtist.style.display = "none";
    aboutToggle.textContent = "About ▼";

    // Toggle about section visibility
    aboutToggle.addEventListener("click", () => {
      isVisible = !isVisible;
      aboutArtist.style.display = isVisible ? "block" : "none";
      aboutToggle.textContent = isVisible ? "About ▲" : "About ▼";
    });

    // Function to get bio text with fallback logic
    function getBioText() {
      if (!artist) {
        // Fallback to hardcoded bios when Sanity data unavailable
        const artistBios = {
          nini: "Nini Mzhavia is a contemporary abstract artist whose works explore modern visual language, emotion, and form through vibrant colors and dynamic compositions.",
          mzia: "Mzia Kashia creates impressionist works that blend reality with artistic interpretation, capturing the essence of Georgian landscapes and cultural heritage.",
          nanuli: "Nanuli Gogiberidze specializes in decorative impressionism, creating vivid artworks that celebrate beauty, nature, and Georgian artistic traditions."
        };
        
        return artistBios[artistId] || "No biography available.";
      }

      // Try English bio first
      if (artist.bio_en && artist.bio_en.trim()) {
        return artist.bio_en;
      }

      // Fallback to Georgian bio
      if (artist.bio_ka && artist.bio_ka.trim()) {
        return artist.bio_ka;
      }

      // Fallback to legacy 'about' field
      if (artist.about && artist.about.trim()) {
        return artist.about;
      }

      return "No biography available.";
    }

    // Set bio text
    aboutText.textContent = getBioText();
  }

  /**
   * Update SEO metadata dynamically based on artist data
   */
  function updateSEOMetadata(artist) {
    if (!artist) return;

    const currentUrl = window.location.href;
    
    // Generate fallback title
    const fallbackTitle = artist.name 
      ? `${artist.name} - Contemporary Artist | Ninart Vision`
      : 'Artist | Ninart Vision';
    
    // Generate fallback description
    let fallbackDescription = 'Discover contemporary Georgian artists and their artworks at Ninart Vision.';
    if (artist.name && artist.style) {
      fallbackDescription = `Discover artworks by ${artist.name}, specializing in ${artist.style}. Explore their unique collection at Ninart Vision.`;
    } else if (artist.bio_en && artist.bio_en.trim()) {
      // Use first 160 characters of English bio
      fallbackDescription = artist.bio_en.substring(0, 157) + '...';
    } else if (artist.bio_ka && artist.bio_ka.trim()) {
      // Use first 160 characters of Georgian bio
      fallbackDescription = artist.bio_ka.substring(0, 157) + '...';
    }

    // Use custom SEO fields if available, otherwise use fallbacks
    const seoTitle = artist.seoTitle || fallbackTitle;
    const seoDescription = artist.seoDescription || fallbackDescription;
    const seoImage = artist.avatar || '../images/logo.png';

    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
      pageTitle.textContent = seoTitle;
      document.title = seoTitle; // Also update document.title
    }

    // Update meta description
    const pageDescription = document.getElementById('pageDescription');
    if (pageDescription) {
      pageDescription.setAttribute('content', seoDescription);
    }

    // Update Open Graph tags
    const ogTitle = document.getElementById('ogTitle');
    if (ogTitle) ogTitle.setAttribute('content', seoTitle);

    const ogDescription = document.getElementById('ogDescription');
    if (ogDescription) ogDescription.setAttribute('content', seoDescription);

    const ogImage = document.getElementById('ogImage');
    if (ogImage) {
      // Convert relative URL to absolute for Open Graph
      const absoluteImageUrl = seoImage.startsWith('http') 
        ? seoImage 
        : new URL(seoImage, window.location.origin).href;
      ogImage.setAttribute('content', absoluteImageUrl);
    }

    const ogUrl = document.getElementById('ogUrl');
    if (ogUrl) ogUrl.setAttribute('content', currentUrl);

    // Update Twitter Card tags
    const twitterTitle = document.getElementById('twitterTitle');
    if (twitterTitle) twitterTitle.setAttribute('content', seoTitle);

    const twitterDescription = document.getElementById('twitterDescription');
    if (twitterDescription) twitterDescription.setAttribute('content', seoDescription);

    const twitterImage = document.getElementById('twitterImage');
    if (twitterImage) {
      const absoluteImageUrl = seoImage.startsWith('http') 
        ? seoImage 
        : new URL(seoImage, window.location.origin).href;
      twitterImage.setAttribute('content', absoluteImageUrl);
    }
  }
})();
