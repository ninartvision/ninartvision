const grid = document.getElementById("galleryGrid");

function renderArtworks() {
  grid.innerHTML = "";

  artworks.forEach((art) => {
    const isSold = art.status === "sold";

    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <img class="thumb-img" src="images/${art.image}" alt="${art.title}" />




      <div class="card-body">
        <h3>${art.title}</h3>
        <p class="muted">${art.material} | ${art.size}</p>

        <div class="card-row">
          <span class="price">${art.price}</span>

          <div class="buy-row">
            <a class="buy insta" href="${art.instagram}" target="_blank">Instagram</a>
            ${
              isSold
                ? `<span class="sold-badge">SOLD</span>`
                : `<a class="buy" href="${art.whatsapp}" target="_blank">WhatsApp</a>`
            }
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

renderArtworks();
