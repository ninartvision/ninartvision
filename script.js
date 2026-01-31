document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     MOBILE MENU
  ========================= */
  const openMenu = document.getElementById("openMenu");
  const closeMenu = document.getElementById("closeMenu");
  const menuOverlay = document.getElementById("menuOverlay");

  if (openMenu && closeMenu && menuOverlay) {
    openMenu.onclick = () => menuOverlay.classList.add("active");
    closeMenu.onclick = () => menuOverlay.classList.remove("active");
  }

  /* =========================
     PRODUCT MODAL + GALLERY
  ========================= */
  const modal = document.getElementById("productModal");
  const closeBtn = document.getElementById("productClose");
  const productImg = document.getElementById("productImg");
  const productTitle = document.getElementById("productTitle");
  const productDesc = document.getElementById("productDesc");
  const productSize = document.getElementById("productSize");
  const productMedium = document.getElementById("productMedium");
  const productYear = document.getElementById("productYear");
  const productPrice = document.getElementById("productPrice");

  const productThumbs = document.getElementById("productThumbs");
  const galleryPrev = document.getElementById("galleryPrev");
  const galleryNext = document.getElementById("galleryNext");
  const morePhotosBtn = document.getElementById("morePhotosBtn");
  const addToCartBtn = document.getElementById("addToCartBtn");

  let photos = [];
  let index = 0;
  let currentItem = null;

  function showPhoto(i) {
    if (!photos.length) return;
    index = i;
    productImg.src = photos[index];

    if (productThumbs) {
      [...productThumbs.children].forEach(t => t.classList.remove("active"));
      productThumbs.children[index]?.classList.add("active");
    }
  }

  function openModal(item) {
    currentItem = item;
    photos = (item.dataset.photos || "")
      .split(",")
      .map(p => p.trim())
      .map(p => p.toLowerCase())
      .filter(Boolean);

    const isSubPage =
      location.pathname.includes("/artists/") ||
      location.pathname.includes("/sale/");

    if (isSubPage) photos = photos.map(p => "../" + p);
    if (!photos.length) photos = [item.querySelector("img")?.src];

    showPhoto(0);

    productTitle.textContent = item.dataset.title || "";
    productDesc.textContent = item.dataset.desc || "";
    productSize.textContent = item.dataset.size || "";
    productMedium.textContent = item.dataset.medium || "";
    productYear.textContent = item.dataset.year || "";
    productPrice.textContent = "₾" + (item.dataset.price || "");

    if (productThumbs) {
      productThumbs.innerHTML = "";
      photos.forEach((src, i) => {
        const img = document.createElement("img");
        img.src = src;
        img.className = "product-thumb";
        img.onclick = () => showPhoto(i);
        productThumbs.appendChild(img);
      });
      productThumbs.style.display = "none";
    }

    modal.classList.add("open");
  }

  document.querySelectorAll(".shop-item").forEach(item => {
    item.addEventListener("click", e => {
      if (e.target.closest("a, button")) return;
      openModal(item);
    });
  });

  closeBtn?.addEventListener("click", () =>
    modal.classList.remove("open")
  );

  galleryPrev?.addEventListener("click", e => {
    e.stopPropagation();
    showPhoto((index - 1 + photos.length) % photos.length);
  });

  galleryNext?.addEventListener("click", e => {
    e.stopPropagation();
    showPhoto((index + 1) % photos.length);
  });

  morePhotosBtn?.addEventListener("click", e => {
    e.stopPropagation();
    productThumbs.style.display =
      productThumbs.style.display === "flex" ? "none" : "flex";
  });

  addToCartBtn?.addEventListener("click", () => {
    if (!currentItem) return;
    const title = currentItem.dataset.title || "";
    const price = currentItem.dataset.price || "";
    const artistId = currentItem.dataset.artist || "";
    const artist = window.ARTISTS?.find(a => a.id === artistId);
    const artistName = artist?.name || "";
    const phone = artist?.whatsapp || "995579388833";

    const msg = encodeURIComponent(
      `გამარჯობა, მაინტერესებს ნახატი: ${title}, ავტორი ${artistName}, ფასი ₾${price}`
    );

    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  });

  /* =========================
     SHOP FILTER
  ========================= */
  const pills = document.querySelectorAll(".pill");

  function applyFilter(type) {
    pills.forEach(p => p.classList.toggle("active", p.dataset.filter === type));
    document.querySelectorAll(".shop-item").forEach(i => {
      i.style.display =
        type === "all" || i.dataset.status === type ? "block" : "none";
    });
  }

  pills.forEach(p =>
    p.addEventListener("click", () => applyFilter(p.dataset.filter))
  );

  applyFilter(document.querySelector(".pill.active")?.dataset.filter || "all");

  /* =========================
     HERO SLIDER
  ========================= */
  const slides = document.querySelectorAll(".hero-slides .slide");
  const prev = document.getElementById("prevSlide");
  const next = document.getElementById("nextSlide");
  let slideIndex = 0;

  if (slides.length) {
    function show(i) {
      slides.forEach(s => s.classList.remove("active"));
      slides[i].classList.add("active");
      slideIndex = i;
    }

    prev?.addEventListener("click", () =>
      show((slideIndex - 1 + slides.length) % slides.length)
    );
    next?.addEventListener("click", () =>
      show((slideIndex + 1) % slides.length)
    );
  }

});

/* =========================
   NEWS TOGGLE (SAFE)
========================= */
document.addEventListener("click", e => {
  const item = e.target.closest(".news-item");
  if (!item) return;
  if (e.target.closest("a")) return;

  document
    .querySelectorAll(".news-item.open")
    .forEach(n => n !== item && n.classList.remove("open"));

  item.classList.toggle("open");
});
