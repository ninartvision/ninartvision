/**
 * Home Shop Preview - Artworks Section
 * Displays artworks with showInShop === true
 * Auto-rotation and SALE/SOLD filtering
 */

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("homeShopGrid");
  const buttons = document.querySelectorAll(".preview-btn");
  const section = document.querySelector(".home-shop-preview");

  if (!grid) return;

  let items = [];
  let currentFilter = "sale";
  const LIMIT = 3;

  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function render() {
    grid.innerHTML = "";

    const filtered = items.filter(
      item => item.status === currentFilter
    );

    const show = shuffle(filtered).slice(0, LIMIT);

    if (!show.length) {
      grid.innerHTML = `<p class="muted">No artworks available.</p>`;
      return;
    }

    show.forEach(p => {
      const div = document.createElement("div");
      div.className = "shop-item " + p.status;

      div.innerHTML = `
        <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.src='images/placeholder.jpg'">
        <div class="shop-meta">
          <span>${p.title}</span>
          <span class="price">${p.price}</span>
        </div>
      `;

      grid.appendChild(div);
    });
  }

  // Load artworks - prioritize Sanity featured, fallback to showInShop artworks
  try {
    const featuredArtworks = await fetchFeaturedArtworks();
    
    if (featuredArtworks && featuredArtworks.length > 0) {
      // Use Sanity featured artworks with new image structure
      items = featuredArtworks.map(artwork => ({
        status: artwork.status,
        title: artwork.title,
        price: "₾" + artwork.price,
        image: artwork.image?.asset?.url || artwork.image || 'images/placeholder.jpg'
      }));
    } else {
      // Fallback to legacy data with showInShop filter
      if (window.ARTWORKS) {
        items = window.ARTWORKS
          .filter(a => a.showInShop === true) // Only show artworks marked for shop
          .map(a => ({
            status: a.status,
            title: a.title,
            price: "₾" + a.price,
            image: a.img.toLowerCase()
          }));
      }
    }
  } catch (error) {
    console.error('❌ Error loading featured artworks:', error);
    
    // Fallback to legacy data with showInShop filter
    if (window.ARTWORKS) {
      items = window.ARTWORKS
        .filter(a => a.showInShop === true) // Only show artworks marked for shop
        .map(a => ({
          status: a.status,
          title: a.title,
          price: "₾" + a.price,
          image: a.img.toLowerCase()
        }));
    }
  }

  // Always show section if we have data
  if (section && items.length > 0) {
    section.style.display = 'block';
  }

  // Initial render and auto-rotation
  render();
  setInterval(render, 5000); // 🔁 Auto-rotate every 5 seconds

  // Filter button handlers
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });
});
