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
        name,
        "avatar": avatar.asset->url,
        bio_en,
        bio_ka,
        style
      }
    `

    const res = await fetch(
      'https://8t5h923j.api.sanity.io/v2024-01-01/data/query/production?query=' +
        encodeURIComponent(query)
    )

    const { result } = await res.json()
    return result
  }

  /* ---------------------------
     FETCH ARTWORKS FROM SANITY
  --------------------------- */
  async function fetchArtworks() {
    const query = `
      *[_type == "artwork" && artist->slug.current == "${artistSlug}"] | order(_createdAt desc){
        title,
        price,
        size,
        medium,
        year,
        status,
        desc,
        "img": image.asset->url,
        "photos": images[].asset->url
      }
    `

    const res = await fetch(
      'https://8t5h923j.api.sanity.io/v2024-01-01/data/query/production?query=' +
        encodeURIComponent(query)
    )

    const { result } = await res.json()
    return result || []
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
        data-title="${a.title}"
        data-price="${a.price}"
        data-size="${a.size}"
        data-medium="${a.medium}"
        data-year="${a.year}"
        data-desc="${a.desc || ''}"
        data-photos="${(a.photos && a.photos.length ? a.photos : [a.img]).join(',')}">

        <img src="${a.img}" alt="${a.title}" loading="lazy">

        ${a.status === 'sold' ? '<div class="sold-badge"></div>' : ''}

        <div class="shop-meta">
          <span>${a.title}</span>
          <span class="price">₾${a.price || ''}</span>
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

    // Artist header
    const nameEl = document.querySelector('.artist-name')
    const avatarEl = document.getElementById('artistAvatar')

    if (artist && nameEl) nameEl.textContent = artist.name || 'Artist'
    if (artist && avatarEl && artist.avatar) avatarEl.src = artist.avatar

    renderArtworks(artworks)
  } catch (err) {
    console.error('Artist page error:', err)
    if (grid) grid.innerHTML = `<p class="muted">Failed to load content.</p>`
  }
})()
