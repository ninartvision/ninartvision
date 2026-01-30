document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("artistsGrid");
  const pagination = document.getElementById("pagination");

  // არტისტები მოდის data.js-დან
  const artists = window.ARTISTS || [];
  const PER_PAGE = 8;
  let page = 1;

  // ✅ ერთიანი სწორი ლინკი ყველასთვის
  function getArtistLink(artist) {
    const id = (artist.id || "").toLowerCase().trim();
    return `artists/artist.html?artist=${encodeURIComponent(id)}`;
  }

  function render() {
    if (!grid) return;

    if (!artists.length) {
      grid.innerHTML = `<p class="muted">No artists added yet.</p>`;
      if (pagination) pagination.innerHTML = "";
      return;
    }

    const start = (page - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const items = artists.slice(start, end);

    grid.innerHTML = items
      .map(
        (artist) => `
        <a class="artist-card" href="${getArtistLink(artist)}">
          <div class="artist-avatar" style="background-image:url('${artist.avatar || ""}');"></div>
          <h3>${artist.name || ""}</h3>
          ${artist.bio ? `<p class="muted">${artist.bio}</p>` : ""}
        </a>
      `
      )
      .join("");

    renderPagination();
  }

  function renderPagination() {
    if (!pagination) return;

    const totalPages = Math.ceil(artists.length / PER_PAGE);
    if (totalPages <= 1) {
      pagination.innerHTML = "";
      return;
    }

    pagination.innerHTML = Array.from({ length: totalPages }, (_, i) => {
      const p = i + 1;
      return `<button class="page-btn ${p === page ? "active" : ""}" data-page="${p}">${p}</button>`;
    }).join("");

    pagination.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        page = Number(btn.dataset.page);
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  render();
});
