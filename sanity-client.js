/**
 * SANITY CMS CLIENT CONFIGURATION
 * Handles all communication with Sanity CMS
 */

const SANITY_CONFIG = {
  projectId: '8t5h923j',
  dataset: 'production',
  apiVersion: '2025-02-05',
  useCdn: false,          // always fresh data
  perspective: 'published'
};

/* --------------------------------------------------
   FETCH ARTISTS
-------------------------------------------------- */
async function fetchArtistsFromSanity(limit = null, featuredOnly = false) {
  try {
    let query = featuredOnly
      ? `*[_type == "artist" && featured == true]`
      : `*[_type == "artist"]`;

    query += ` | order(_createdAt desc)`;

    if (limit) {
      query += `[0...${limit}]`;
    }

    query += `{
      _id,
      name,
      "slug": slug.current,
      shortDescription,
      subtitle,
      image{
        asset->{_id, url, metadata{lqip, dimensions}},
        alt
      },
      gallery[]{
        asset->{_id, url, metadata{lqip, dimensions}},
        alt,
        _key
      },
      bio,
      style,
      status,
      featured,
      whatsapp,
      country,
      seoTitle,
      seoDescription
    }`;

    const url = `https://${SANITY_CONFIG.projectId}.api.sanity.io/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodeURIComponent(query)}`;

    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    return data.result || [];
  } catch (err) {
    console.error('❌ fetchArtistsFromSanity error:', err);
    return [];
  }
}

/* --------------------------------------------------
   FETCH SINGLE ARTIST
-------------------------------------------------- */
async function fetchArtistBySlug(identifier) {
  try {
    const query = `*[
      _type == "artist" &&
      (slug.current == "${identifier}" || _id == "${identifier}")
    ][0]{
      _id,
      name,
      "slug": slug.current,
      shortDescription,
      subtitle,
      image{
        asset->{_id, url, metadata{lqip, dimensions}},
        alt
      },
      gallery[]{
        asset->{_id, url, metadata{lqip, dimensions}},
        alt,
        _key
      },
      bio,
      style,
      status,
      featured,
      whatsapp,
      country,
      seoTitle,
      seoDescription
    }`;

    const url = `https://${SANITY_CONFIG.projectId}.api.sanity.io/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodeURIComponent(query)}`;

    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    return data.result || null;
  } catch (err) {
    console.error('❌ fetchArtistBySlug error:', err);
    return null;
  }
}

/* --------------------------------------------------
   FETCH FEATURED ARTWORKS (MANUAL ORDER WORKS HERE)
-------------------------------------------------- */
async function fetchFeaturedArtworks(limit = null) {
  try {
    let query = `
      *[
        _type == "artwork" &&
        featured == true &&
        (!defined(status) || status in ["published", "sold"])
      ]
      | order(coalesce(order, 999) asc, _createdAt desc)
    `;

    if (limit) {
      query += `[0...${limit}]`;
    }

    query += `{
      _id,
      title,
      order,
      "slug": slug.current,
      shortDescription,
      image{
        asset->{_id, url, metadata{lqip, dimensions}},
        alt
      },
      images[]{
        asset->{_id, url, metadata{lqip, dimensions}},
        alt,
        _key
      },
      year,
      medium,
      dimensions,
      category,
      description,
      price,
      status,
      featured,
      "artist": artist->{
        _id,
        name,
        "slug": slug.current
      }
    }`;

    const url = `https://${SANITY_CONFIG.projectId}.api.sanity.io/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodeURIComponent(query)}`;

    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    return data.result || [];
  } catch (err) {
    console.error('❌ fetchFeaturedArtworks error:', err);
    return [];
  }
}

/* --------------------------------------------------
   EXPOSE GLOBAL FUNCTIONS
-------------------------------------------------- */
window.fetchArtistsFromSanity = fetchArtistsFromSanity;
window.fetchArtistBySlug = fetchArtistBySlug;
window.fetchFeaturedArtworks = fetchFeaturedArtworks;
