(async function () {
  /* ---------------------------
     GET ARTIST SLUG
  --------------------------- */
  const params = new URLSearchParams(location.search)
  const artistSlug = params.get('artist')

  if (!artistSlug) {
    console.error('No artist slug in URL')
    return
  }

  const grid = document.getElementById('shopGrid')

  /* ---------------------------
     FETCH ARTIST FROM SANITY
  --------------------------- */
  async function fetchArtist() {
    const query = `
      *[_type == "artist" && slug.current == "${artistSlug}"][0]{
        _id,
        name,
        "avatar": image.asset->url,
        bio_en,
        bio_ka,
        about,
        style,
        seoTitle,
        seoDescription,
        "slug": slug.current
      }
    `

    const res = await fetch(
      'https://8t5h923j.api.sanity.io/v2026-02-01/data/query/production?query=' +
        encodeURIComponent(query),
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const { result } = await res.json()
    return result
  }

  /* ---------------------------
     FETCH ARTWORKS FROM SANITY
  --------------------------- */
  async function fetchArtworks() {
    const query = `
      *[_type == "artwork" && artist->slug.current == "${artistSlug}"] | order(_createdAt desc){
        _id,
        title,
        price,
        "size": dimensions,
        medium,
        year,
        status,
        "desc": description,
        "img": image.asset->url,
        "photos": images[].asset->url,
        "slug": slug.current,
        featured
      }
    `

    const res = await fetch(
      'https://8t5h923j.api.sanity.io/v2026-02-01/data/query/production?query=' +
        encodeURIComponent(query),
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const { result } = await res.json()
    return result || []
  }

  /* ---------------------------
     UPDATE SEO META TAGS
  --------------------------- */
  function updateSEOTags(artist) {
    if (!artist) return

    const pageTitle = artist.seoTitle || `${artist.name} | Ninart Vision`
    const pageDesc = artist.seoDescription || `Discover artworks by ${artist.name}, a contemporary Georgian artist.`

    // Update title
    document.title = pageTitle
    const titleTag = document.getElementById('pageTitle')
    if (titleTag) titleTag.setAttribute('content', pageTitle)

    // Update meta description
    const descTag = document.getElementById('pageDescription')
    if (descTag) descTag.setAttribute('content', pageDesc)

    // Update Open Graph
    const ogTitle = document.getElementById('ogTitle')
    const ogDesc = document.getElementById('ogDescription')
    const ogImage = document.getElementById('ogImage')
    const ogUrl = document.getElementById('ogUrl')

    if (ogTitle) ogTitle.setAttribute('content', pageTitle)
    if (ogDesc) ogDesc.setAttribute('content', pageDesc)
    if (ogImage && artist.avatar) ogImage.setAttribute('content', artist.avatar)
    if (ogUrl) ogUrl.setAttribute('content', window.location.href)

    // Update Twitter Card
    const twitterTitle = document.getElementById('twitterTitle')
    const twitterDesc = document.getElementById('twitterDescription')
    const twitterImage = document.getElementById('twitterImage')

    if (twitterTitle) twitterTitle.setAttribute('content', pageTitle)
    if (twitterDesc) twitterDesc.setAttribute('content', pageDesc)
    if (twitterImage && artist.avatar) twitterImage.setAttribute('content', artist.avatar)
  }

  /* ---------------------------
     RENDER BIO TEXT
  --------------------------- */
  function renderBio(artist) {
    const aboutTextEl = document.getElementById('aboutText')
    if (!aboutTextEl) return

    // Prioritize bio_en, fallback to bio_ka, then about
    const bioText = artist.bio_en || artist.bio_ka || artist.about || 'Biography not available.'
    aboutTextEl.textContent = bioText
  }

  /* ---------------------------
     RENDER ARTWORKS
  --------------------------- */
  function renderArtworks(artworks) {
    if (!grid) return

    if (!artworks.length) {
      grid.innerHTML = `<p class="muted">No artworks found.</p>`
      return
    }

    grid.innerHTML = artworks
      .map(
        (a) => `
      <div class="shop-item ${a.status === 'sold' ? 'sold' : 'sale'}"
        data-status="${a.status}"
        data-title="${a.title || 'Untitled'}"
        data-price="${a.price || ''}"
        data-size="${a.size || ''}"
        data-medium="${a.medium || ''}"
        data-year="${a.year || ''}"
        data-desc="${a.desc || ''}"
        data-photos="${(a.photos && a.photos.length ? a.photos : [a.img]).join(',')}">

        <img src="${a.img}" 
             alt="${a.title || 'Artwork'}" 
             loading="lazy"
             onerror="this.src='../images/placeholder.jpg'">

        ${a.status === 'sold' ? '<div class="sold-badge"></div>' : ''}

        <div class="shop-meta">
          <span>${a.title || 'Untitled'}</span>
          ${a.price ? `<span class="price">₾${a.price}</span>` : ''}
        </div>
      </div>
    `
      )
      .join('')

    if (window.initShopItems) window.initShopItems()
  }

  /* ---------------------------
     INIT PAGE
  --------------------------- */
  try {
    const artist = await fetchArtist()
    const artworks = await fetchArtworks()

    if (artist) {
      // Update artist header
      const nameEl = document.querySelector('.artist-name')
      const avatarEl = document.getElementById('artistAvatar')

      if (nameEl) nameEl.textContent = artist.name || 'Artist'
      
      if (avatarEl && artist.avatar) {
        avatarEl.src = artist.avatar
        avatarEl.style.display = 'block'
      } else if (avatarEl) {
        avatarEl.style.display = 'none'
      }

      // Render bio
      renderBio(artist)

      // Update SEO meta tags
      updateSEOTags(artist)

      // Store globally for compatibility
      window.CURRENT_ARTIST = artist
    }

    renderArtworks(artworks)
  } catch (err) {
    console.error('❌ Artist page error:', err)
    if (grid) grid.innerHTML = `<p class="muted">Failed to load content.</p>`
  }
})()
