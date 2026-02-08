/**
 * SANITY CMS CLIENT CONFIGURATION
 * 
 * This file handles all communication with Sanity CMS.
 * Replace YOUR_PROJECT_ID and YOUR_DATASET with your actual Sanity credentials.
 * 
 * Get these from: sanity.cli.ts or https://sanity.io/manage
 */

const SANITY_CONFIG = {
  projectId: '8t5h923j',          // Ninart Vision Sanity project ID
  dataset: 'production',          // Production dataset
  apiVersion: '2025-02-05',       // API version matching schema
  useCdn: false,                   // ✅ NO CDN: Immediate updates, always fresh data
  perspective: 'published'         // Only show published content
};

/**
 * Fetch artists from Sanity CMS
 * @param {number} limit - Maximum number of artists to fetch (optional)
 * @param {boolean} featuredOnly - Fetch only featured artists (optional)
 * @returns {Promise<Array>} Array of artist objects
 */
async function fetchArtistsFromSanity(limit = null, featuredOnly = false) {
  try {
    // Build GROQ query with optional featured filter
    let query = featuredOnly 
      ? `*[_type == "artist" && featured == true] | order(_createdAt desc)`
      : `*[_type == "artist"] | order(_createdAt desc)`;
    
    if (limit) {
      query += `[0...${limit}]`;
    }
    
    // Add field projection with ALL new fields
    query += `{
      _id,
      name,
      "slug": slug.current,
      shortDescription,
      subtitle,
      image{
        asset->{
          _id,
          url,
          metadata{lqip, dimensions}
        },
        alt
      },
      gallery[]{
        asset->{
          _id,
          url,
          metadata{lqip, dimensions}
        },
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

    // Build Sanity API URL
    const url = `https://${SANITY_CONFIG.projectId}.${SANITY_CONFIG.useCdn ? 'apicdn' : 'api'}.sanity.io/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodeURIComponent(query)}`;
    
    // Fetch with cache-busting headers for real-time updates
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Sanity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.result) {
      console.warn('⚠️ No artists found in Sanity');
      return [];
    }

    return data.result;

  } catch (error) {
    console.error('❌ Error fetching artists from Sanity:', error);
    
    // Show user-friendly error message
    if (error.message.includes('YOUR_PROJECT_ID')) {
      console.error('🔧 Please update SANITY_CONFIG in sanity-client.js with your actual project ID');
    }
    
    return [];
  }
}

/**
 * Fetch a single artist by slug or ID
 * @param {string} identifier - Artist slug or _id
 * @returns {Promise<Object|null>} Artist object or null
 */
async function fetchArtistBySlug(identifier) {
  try {
    const query = `*[_type == "artist" && (slug.current == "${identifier}" || _id == "${identifier}")][0]{
      _id,
      name,
      "slug": slug.current,
      shortDescription,
      subtitle,
      image{
        asset->{
          _id,
          url,
          metadata{lqip, dimensions}
        },
        alt
      },
      gallery[]{
        asset->{
          _id,
          url,
          metadata{lqip, dimensions}
        },
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

    // Fetch with cache-busting headers
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Sanity API error: ${response.status}`);
    }

    const data = await response.json();
    return data.result || null;

  } catch (error) {
    console.error('❌ Error fetching artist from Sanity:', error);
    return null;
  }
}

/**
 * Fetch featured artworks from Sanity CMS
 * @param {number} limit - Maximum number of artworks to fetch (optional)
 * @returns {Promise<Array>} Array of featured artwork objects
 */
async function fetchFeaturedArtworks(limit = null) {
  try {
    // Build GROQ query for featured artworks
    let query = `*[_type == "artwork" && featured == true] | order(_createdAt desc)`;
    
    if (limit) {
      query += `[0...${limit}]`;
    }
    
    // Filter: Show artworks with no status (legacy) OR published/sold
    query = query.replace(
      '*[_type == "artwork"',
      '*[_type == "artwork" && (!defined(status) || status in ["published", "sold"])'
    );
    
    // Add field projection with ALL artwork fields
    query += `{
      _id,
      title,
      "slug": slug.current,
      shortDescription,
      image{
        asset->{
          _id,
          url,
          metadata{lqip, dimensions}
        },
        alt
      },
      images[]{
        asset->{
          _id,
          url,
          metadata{lqip, dimensions}
        },
        alt,
        _key
      },
      year,
      medium,
      dimensions,
      category,
      shortDescription,
      "desc": shortDescription,
      price,
      status,
      featured,
      "artist": artist->{
        _id,
        name,
        "slug": slug.current
      }
    }`;

    // Build Sanity API URL (always use .api for real-time data)
    const url = `https://${SANITY_CONFIG.projectId}.api.sanity.io/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodeURIComponent(query)}`;
    
    // Fetch with cache-busting headers
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Sanity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.result) {
      console.warn('⚠️ No featured artworks found in Sanity');
      return [];
    }

    return data.result;

  } catch (error) {
    console.error('❌ Error fetching featured artworks from Sanity:', error);
    return [];
  }
}
