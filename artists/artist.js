const params = new URLSearchParams(location.search);
const artistId = params.get("artist");

const artist = ARTISTS.find(a => a.id === artistId);
if (artist) {
  document.querySelector(".artist-name").textContent = artist.name;
  document.getElementById("artistAvatar").src = "../" + artist.avatar;
}

const artworks = ARTWORKS.filter(a => a.artist === artistId).sort((a, b) => {
  if (a.status === 'sale' && b.status !== 'sale') return -1;
  if (a.status !== 'sale' && b.status === 'sale') return 1;
  return 0;
});

const grid = document.getElementById("shopGrid");
grid.innerHTML = artworks.map(a => `
  <div class="shop-item ${a.status}" data-artist="${a.artist}" data-status="${a.status}" data-title="${a.title}" data-price="${a.price}" data-size="${a.size}" data-medium="${a.medium}" data-year="${a.year}" data-desc="${a.desc}" data-photos="${a.photos.join(',')}">
    <img src="../${a.img}" alt="${a.title}">
    <div class="shop-meta">
      <span>${a.title}</span>
      <span class="price">₾${a.price}</span>
    </div>
  </div>
`).join("");

if (window.initShopItems) initShopItems();
