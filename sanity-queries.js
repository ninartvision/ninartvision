/**
 * STANDARDIZED SANITY GROQ QUERIES
 * Production-ready query patterns with all required fields
 * REAL-TIME MODE: No CDN, immediate updates
 */

const SANITY_API_BASE = 'https://8t5h923j.api.sanity.io/v2026-02-01/data/query/production';

/**
 * Standard artist projection - use this in all artist queries
 */
const ARTIST_PROJECTION = `{
  _id,
  name,
  "avatar": image.asset->url,
  bio_en,
  bio_ka,
  about,
  style,
  whatsapp,
  country,
  seoTitle,
  seoDescription,
  featured,
  "slug": slug.current
}`;

/**
 * Standard artwork projection - use this in all artwork queries
 */
const ARTWORK_PROJECTION = `{
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
  featured,
  "slug": slug.current,
  "artist": artist->{
    _id,
    name,
    "slug": slug.current
  }
}`;

/**
 * Fetch single artist by slug
 */
async function fetchArtistBySlug(slug) {
  const query = `*[_type == "artist" && slug.current == $slug][0]${ARTIST_PROJECTION}`;
  return executeSanityQuery(query, { slug });
}

/**
 * Fetch all artists (with optional filters)
 */
async function fetchArtists(options = {}) {
  const { limit = null, featuredOnly = false } = options;
  
  let query = featuredOnly 
    ? `*[_type == "artist" && featured == true]`
    : `*[_type == "artist"]`;
  
  query += ` | order(_createdAt desc)`;
  
  if (limit) {
    query += `[0...${limit}]`;
  }
  
  query += ARTIST_PROJECTION;
  
  return executeSanityQuery(query);
}

/**
 * Fetch artworks by artist slug
 */
async function fetchArtworksByArtist(artistSlug) {
  const query = `*[_type == "artwork" && artist->slug.current == $artistSlug] | order(_createdAt desc)${ARTWORK_PROJECTION}`;
  return executeSanityQuery(query, { artistSlug });
}

/**
 * Fetch featured artworks
 */
async function fetchFeaturedArtworks(limit = null) {
  let query = `*[_type == "artwork" && featured == true] | order(_createdAt desc)`;
  
  if (limit) {
    query += `[0...${limit}]`;
  }
  
  query += ARTWORK_PROJECTION;
   and cache-busting
 */
async function executeSanityQuery(query, params = {}) {
  try {
    const url = `${SANITY_API_BASE}?query=${encodeURIComponent(query)}`;
    const urlWithParams = params && Object.keys(params).length > 0
      ? `${url}&${new URLSearchParams(Object.entries(params).map(([k, v]) => [`$${k}`, v]))}`
      : url;
    
    // Fetch with cache-busting headers for real-time updates
    const response = await fetch(urlWithParams, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }codeURIComponent(query)}`;
    const urlWithParams = params && Object.keys(params).length > 0
      ? `${url}&${new URLSearchParams(Object.entries(params).map(([k, v]) => [`$${k}`, v]))}`
      : url;
    
    const response = await fetch(urlWithParams);
    
    if (!response.ok) {
      throw new Error(`Sanity API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.result;
    
  } catch (error) {
    console.error('❌ Sanity query failed:', error);
    throw error;
  }
}
