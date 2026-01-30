document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("galleryGrid");

  if (!grid) {
    console.error("❌ galleryGrid not found");
    return;
  }

  // ✅ data.js-დან
  const artworks = window.ARTWORKS || [];

  if (!artworks.length) {
    grid.innerHTML = "<p class='muted'>No artworks found.</p>";
    return;
  }

  grid.innerHTML = "";

  artworks.forEach((art) => {
    const isSold = art.status === "sold";

    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <img
        class="thumb-img"
        src="${art.img}"
        alt="${art.title}"
      />

      <div class="card-body">
        <h3>${art.title}</h3>

        <p class="muted">
          ${art.medium || ""}${art.size ? " | " + art.size : ""}
        </p>

        <div class="card-row">
          <span class="price">₾${art.price}</span>

          <div class="buy-row">
            ${
              isSold
                ? `<span class="sold-badge">SOLD</span>`
                : `
                  <a
                    class="buy insta"
                    href="https://instagram.com/ninart.vision"
                    target="_blank"
                  >Instagram</a>

                  <a
                    class="buy"
                    href="https://wa.me/995579388833?text=Hello, I'm interested in ${encodeURIComponent(
                      art.title
                    )}"
                    target="_blank"
                  >WhatsApp</a>
                `
            }
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
});
