document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("galleryGrid");

  if (!grid) {
    console.error("❌ galleryGrid not found");
    return;
  }

  grid.innerHTML = "<p class='muted'>Loading artworks...</p>";

  try {
    const query = `
      *[_type == "artwork" && defined(image)] | order(_createdAt desc) {
        _id,
        title,
        image{
          asset->{
            _id,
            url,
            metadata{lqip, dimensions}
          },
          alt
        },
        "img": image.asset->url,
        images[]{
          asset->{
            _id,
            url,
            metadata{lqip, dimensions}
          },
          alt,
          _key
        },
        "photos": images[].asset->url,
        medium,
        "size": dimensions,
        price,
        status,
        shortDescription,
        "slug": slug.current,
        featured,
        "artist": artist->{
          _id,
          name,
          "slug": slug.current
        }
      }
    `;

    const res = await fetch(
      "https://8t5h923j.api.sanity.io/v2026-02-01/data/query/production?query=" +
        encodeURIComponent(query),
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const { result: artworks } = await res.json();

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
        <img class="thumb-img" src="${art.img}" alt="${art.title}" />

        <div class="card-body">
          <h3>${art.title}</h3>

          <p class="muted">
            ${art.medium || ""}${art.size ? " | " + art.size : ""}
          </p>

          <div class="card-row">
            <span class="price">₾${art.price || ""}</span>

            <div class="buy-row">
              ${
                isSold
                  ? `<span class="sold-badge">SOLD</span>`
                  : `
                    <a class="buy insta"
                      href="https://instagram.com/ninart.vision"
                      target="_blank">Instagram</a>

                    <a class="buy"
                      href="https://wa.me/995579388833?text=Hello, I'm interested in ${encodeURIComponent(
                        art.title
                      )}"
                      target="_blank">WhatsApp</a>
                  `
              }
            </div>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p class='muted'>Failed to load artworks.</p>";
  }
});
