document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("shopGrid");

  if (!window.ARTWORKS) {
    grid.innerHTML = "❌ ARTWORKS not loaded";
    return;
  }

  // Show all Nini's items, sorted by status (sale first, then sold)
  const items = window.ARTWORKS.filter(a => a.artist === "nini").sort((a, b) => {
    if (a.status === 'sale' && b.status !== 'sale') return -1;
    if (a.status !== 'sale' && b.status === 'sale') return 1;
    return 0;
  });

  if (!items.length) {
    grid.innerHTML = "No artworks for sale.";
    return;
  }

  grid.innerHTML = items.map(a => `
    <div class="shop-item ${a.status}" data-artist="${a.artist}" data-status="${a.status}" data-title="${a.title}" data-price="${a.price}" data-size="${a.size}" data-medium="${a.medium}" data-year="${a.year}" data-desc="${a.desc}" data-photos="${a.photos.join(',')}">
      <img src="../${a.img.toLowerCase()}" alt="${a.title}" loading="lazy">
      ${a.status === 'sold' ? '<div class="sold-badge"></div>' : ''}
      <div class="shop-meta">
        <span>${a.title}</span>
        <span class="price">₾${a.price}</span>
      </div>
    </div>
  `).join("");
});