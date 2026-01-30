document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("homeShopGrid");
  const buttons = document.querySelectorAll(".preview-btn");

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
        <img src="${p.img}" alt="${p.title}">
        <div class="shop-meta">
          <span>${p.title}</span>
          <span class="price">${p.price}</span>
        </div>
      `;

      grid.appendChild(div);
    });
  }

  if (!window.ARTWORKS) {
    grid.innerHTML = "❌ ARTWORKS not loaded";
    return;
  }

  items = window.ARTWORKS.filter(a => a.artist === "nini").map(a => ({
    status: a.status,
    title: a.title,
    price: "₾" + a.price,
    img: a.img
  }));

  render();
  setInterval(render, 5000); // 🔁 ავტომატური ცვლა

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });
});
