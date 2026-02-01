/**
 * SEARCH FUNCTIONALITY
 * 
 * Implements full search across artists, artworks, styles, and themes
 * No visual changes - only adds functionality to existing search input
 */

(function() {
  'use strict';

  // Wait for DOM and data to be loaded
  document.addEventListener('DOMContentLoaded', function() {
    initSearch();
  });

  function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    // Create search results dropdown
    const resultsContainer = createResultsContainer();
    searchInput.parentElement.appendChild(resultsContainer);

    // Search state
    let searchTimeout;
    const DEBOUNCE_DELAY = 300; // ms

    // Event listeners
    searchInput.addEventListener('input', function(e) {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      if (query.length < 2) {
        hideResults();
        return;
      }

      // Debounce search
      searchTimeout = setTimeout(() => {
        performSearch(query);
      }, DEBOUNCE_DELAY);
    });

    // Handle keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
      handleKeyboardNavigation(e, resultsContainer);
    });

    // Close results when clicking outside
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
        hideResults();
      }
    });

    // Focus on search with Ctrl/Cmd + K
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  function createResultsContainer() {
    const container = document.createElement('div');
    container.className = 'search-results-dropdown';
    container.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      margin-top: 8px;
      max-height: 400px;
      overflow-y: auto;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      z-index: 1000;
      display: none;
    `;
    return container;
  }

  function performSearch(query) {
    const results = {
      artists: [],
      artworks: [],
      styles: new Set()
    };

    const queryLower = query.toLowerCase();

    // Search artists
    if (window.ARTISTS) {
      results.artists = window.ARTISTS.filter(artist => {
        // Skip placeholder artists
        if (artist.avatar && artist.avatar.includes('placeholder.jpg')) {
          return false;
        }

        const nameMatch = artist.name.toLowerCase().includes(queryLower);
        const styleMatch = artist.style && artist.style.toLowerCase().includes(queryLower);
        const aboutMatch = artist.about && artist.about.toLowerCase().includes(queryLower);

        // Collect unique styles for style-based search
        if (styleMatch && artist.style) {
          results.styles.add(artist.style);
        }

        return nameMatch || styleMatch || aboutMatch;
      });
    }

    // Search artworks
    if (window.ARTWORKS) {
      results.artworks = window.ARTWORKS.filter(artwork => {
        const titleMatch = artwork.title && artwork.title.toLowerCase().includes(queryLower);
        const descMatch = artwork.desc && artwork.desc.toLowerCase().includes(queryLower);
        const mediumMatch = artwork.medium && artwork.medium.toLowerCase().includes(queryLower);
        const artistMatch = artwork.artist && artwork.artist.toLowerCase().includes(queryLower);

        return titleMatch || descMatch || mediumMatch || artistMatch;
      }).slice(0, 10); // Limit to 10 artworks
    }

    displayResults(results, query);
  }

  function displayResults(results, query) {
    const container = document.querySelector('.search-results-dropdown');
    if (!container) return;

    container.innerHTML = '';

    const totalResults = results.artists.length + results.artworks.length;

    if (totalResults === 0) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #666;">
          <p style="margin: 0; font-size: 14px;">No results found for "${escapeHtml(query)}"</p>
          <p style="margin: 8px 0 0; font-size: 13px; opacity: 0.7;">Try searching for artist names, styles, or themes</p>
        </div>
      `;
      showResults();
      return;
    }

    // Show artists
    if (results.artists.length > 0) {
      const artistsSection = document.createElement('div');
      artistsSection.style.cssText = 'padding: 12px 0;';
      
      const artistsTitle = document.createElement('div');
      artistsTitle.style.cssText = 'padding: 8px 16px; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px;';
      artistsTitle.textContent = `Artists (${results.artists.length})`;
      artistsSection.appendChild(artistsTitle);

      results.artists.forEach(artist => {
        const item = createArtistResultItem(artist, query);
        artistsSection.appendChild(item);
      });

      container.appendChild(artistsSection);
    }

    // Show artworks
    if (results.artworks.length > 0) {
      const artworksSection = document.createElement('div');
      artworksSection.style.cssText = 'padding: 12px 0; border-top: 1px solid rgba(0, 0, 0, 0.06);';
      
      const artworksTitle = document.createElement('div');
      artworksTitle.style.cssText = 'padding: 8px 16px; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px;';
      artworksTitle.textContent = `Artworks (${results.artworks.length})`;
      artworksSection.appendChild(artworksTitle);

      results.artworks.forEach(artwork => {
        const item = createArtworkResultItem(artwork, query);
        artworksSection.appendChild(item);
      });

      container.appendChild(artworksSection);
    }

    showResults();
  }

  function createArtistResultItem(artist, query) {
    const item = document.createElement('a');
    item.href = `artists/${artist.id}.html`;
    item.className = 'search-result-item';
    item.style.cssText = `
      display: flex;
      align-items: center;
      padding: 12px 16px;
      text-decoration: none;
      color: #111;
      transition: background 0.2s ease;
      cursor: pointer;
    `;

    item.innerHTML = `
      <img 
        src="${artist.avatar}" 
        alt="${escapeHtml(artist.name)}"
        style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; margin-right: 12px; flex-shrink: 0;"
      >
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${highlightMatch(artist.name, query)}
        </div>
        <div style="font-size: 13px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${highlightMatch(artist.style, query)}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-left: 8px; opacity: 0.5; flex-shrink: 0;">
        <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    // Hover effect
    item.addEventListener('mouseenter', function() {
      this.style.background = '#f9f9f9';
    });
    item.addEventListener('mouseleave', function() {
      this.style.background = 'transparent';
    });

    return item;
  }

  function createArtworkResultItem(artwork, query) {
    const artistData = window.ARTISTS && window.ARTISTS.find(a => a.id === artwork.artist);
    const artistName = artistData ? artistData.name : 'Unknown Artist';

    const item = document.createElement('a');
    item.href = `sale/shop.html?artwork=${artwork.id}`;
    item.className = 'search-result-item';
    item.style.cssText = `
      display: flex;
      align-items: center;
      padding: 12px 16px;
      text-decoration: none;
      color: #111;
      transition: background 0.2s ease;
      cursor: pointer;
    `;

    item.innerHTML = `
      <img 
        src="${artwork.img}" 
        alt="${escapeHtml(artwork.title)}"
        style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; margin-right: 12px; flex-shrink: 0;"
      >
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${highlightMatch(artwork.title, query)}
        </div>
        <div style="font-size: 13px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${escapeHtml(artistName)} • ${escapeHtml(artwork.medium)}
        </div>
      </div>
      <div style="margin-left: 8px; font-weight: 600; font-size: 14px; color: #111; flex-shrink: 0;">
        ₾${artwork.price}
      </div>
    `;

    // Hover effect
    item.addEventListener('mouseenter', function() {
      this.style.background = '#f9f9f9';
    });
    item.addEventListener('mouseleave', function() {
      this.style.background = 'transparent';
    });

    return item;
  }

  function highlightMatch(text, query) {
    if (!text) return '';
    
    const escaped = escapeHtml(text);
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    const index = textLower.indexOf(queryLower);
    if (index === -1) return escaped;

    const before = escapeHtml(text.substring(0, index));
    const match = escapeHtml(text.substring(index, index + query.length));
    const after = escapeHtml(text.substring(index + query.length));

    return `${before}<strong style="background: #fff3cd; padding: 0 2px; border-radius: 2px;">${match}</strong>${after}`;
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showResults() {
    const container = document.querySelector('.search-results-dropdown');
    if (container) {
      container.style.display = 'block';
      // Ensure parent has position relative
      const wrapper = document.querySelector('.search-wrapper');
      if (wrapper && getComputedStyle(wrapper).position === 'static') {
        wrapper.style.position = 'relative';
      }
    }
  }

  function hideResults() {
    const container = document.querySelector('.search-results-dropdown');
    if (container) {
      container.style.display = 'none';
    }
  }

  function handleKeyboardNavigation(e, resultsContainer) {
    const items = resultsContainer.querySelectorAll('.search-result-item');
    if (items.length === 0) return;

    const activeElement = document.activeElement;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeElement === e.target) {
        // Focus first item
        items[0].focus();
      } else {
        // Focus next item
        const currentIndex = Array.from(items).indexOf(activeElement);
        if (currentIndex < items.length - 1) {
          items[currentIndex + 1].focus();
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = Array.from(items).indexOf(activeElement);
      if (currentIndex > 0) {
        items[currentIndex - 1].focus();
      } else if (currentIndex === 0) {
        e.target.focus();
      }
    } else if (e.key === 'Escape') {
      hideResults();
      e.target.blur();
    }
  }

  // Add custom scrollbar styling
  const style = document.createElement('style');
  style.textContent = `
    .search-results-dropdown::-webkit-scrollbar {
      width: 8px;
    }
    .search-results-dropdown::-webkit-scrollbar-track {
      background: transparent;
    }
    .search-results-dropdown::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
    .search-results-dropdown::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.3);
    }
    .search-result-item:focus {
      outline: none;
      background: #f9f9f9 !important;
    }
  `;
  document.head.appendChild(style);

})();
