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
      if (productThumbs.children[index])
        productThumbs.children[index].classList.add("active");
    }
  }

  function openModal(item) {
    currentItem = item;
    photos = (item.dataset.photos || "")
      .split(",")
      .map(p => p.trim())
      .filter(Boolean);

    // Adjust paths if on artist or shop page
    const isArtistPage = location.pathname.includes("/artists/");
    const isShopPage = location.pathname.includes("/sale/");
    if (isArtistPage || isShopPage) {
      photos = photos.map(p => "../" + p);
    }

    if (!photos.length) photos = [item.querySelector("img").src];

    index = 0;
    showPhoto(0);

    if (productTitle) productTitle.textContent = item.dataset.title || "";
    if (productDesc) productDesc.textContent = item.dataset.desc || "";
    if (productSize) productSize.textContent = item.dataset.size || "";
    if (productMedium) productMedium.textContent = item.dataset.medium || "";
    if (productYear) productYear.textContent = item.dataset.year || "";
    if (productPrice) productPrice.textContent = "₾" + (item.dataset.price || "");

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

  // Use event delegation for dynamic items
  document.addEventListener("click", e => {
    const item = e.target.closest(".shop-item");
    if (item) openModal(item);
  });

  closeBtn && closeBtn.addEventListener("click", () => modal.classList.remove("open"));
  galleryPrev && galleryPrev.addEventListener("click", e => {
    e.stopPropagation();
    showPhoto((index - 1 + photos.length) % photos.length);
  });
  galleryNext && galleryNext.addEventListener("click", e => {
    e.stopPropagation();
    showPhoto((index + 1) % photos.length);
  });

  if (morePhotosBtn && productThumbs) {
    morePhotosBtn.onclick = e => {
      e.stopPropagation();
      productThumbs.style.display =
        productThumbs.style.display === "flex" ? "none" : "flex";
    };
  }

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      if (!currentItem) return;
      const title = currentItem.dataset.title || "";
      const price = currentItem.dataset.price || "";
      const artistId = currentItem.dataset.artist || "";
      const artistData = window.ARTISTS?.find(a => a.id === artistId);
      const artistName = artistData ? artistData.name : artistId;
      const message = `გამარჯობა, მე დაინტერესული ვარ ნახატით: ${title} ავტორი ${artistName}, ფასი: ₾${price}. გთხოვთ, დამიკავშირდით დეტალებისთვის.`;
      const whatsappNumber = artistData.whatsapp || "995579388833";
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, "_blank");
    });
  }

  /* =========================
     SHOP FILTER
  ========================= */
  const filterBtns = document.querySelectorAll(".pill");
  function applyFilter(type) {
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === type));
    document.querySelectorAll(".shop-item").forEach(i => {
      i.style.display = (type === 'all' || i.dataset.status === type) ? 'block' : 'none';
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  // initialize default filter: prefer an explicit `.pill.active`, then `sale` when using the sale/shop page,
  // otherwise fall back to `all` so all items are visible by default.
  const defaultFilter = document.querySelector('.pill.active')?.dataset.filter || 'all';
  applyFilter(defaultFilter);

  /* =========================
     HERO SLIDER (arrows)
  ========================= */
  const slides = document.querySelectorAll('.hero-slides .slide');
  const prevSlide = document.getElementById('prevSlide');
  const nextSlide = document.getElementById('nextSlide');
  let currentSlide = 0;

  if (slides.length) {
    const activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));
    currentSlide = activeIndex >= 0 ? activeIndex : 0;
    function showSlide(i) {
      slides.forEach(s => s.classList.remove('active'));
      slides[i].classList.add('active');
      currentSlide = i;
    }

    prevSlide && prevSlide.addEventListener('click', () => {
      showSlide((currentSlide - 1 + slides.length) % slides.length);
    });
    nextSlide && nextSlide.addEventListener('click', () => {
      showSlide((currentSlide + 1) % slides.length);
    });
  }

  /* =========================
     PROJECTS SLIDER (arrows)
  ========================= */
  const projectsPrev = document.getElementById('projectsPrev');
  const projectsNext = document.getElementById('projectsNext');
  const projectsTrack = document.getElementById('projectsTrack');

  if (projectsTrack) {
    let currentIndex = 0;
    const cards = projectsTrack.querySelectorAll('.card');
    const totalCards = cards.length;
    const visibleCards = window.innerWidth > 900 ? 3 : window.innerWidth > 600 ? 2 : 1;
    const maxIndex = Math.max(0, totalCards - visibleCards);

    function updateSlider() {
      const translateX = -currentIndex * (100 / visibleCards);
      projectsTrack.style.transform = `translateX(${translateX}%)`;
    }

    projectsPrev && projectsPrev.addEventListener('click', () => {
      currentIndex = Math.max(0, currentIndex - 1);
      updateSlider();
    });
    projectsNext && projectsNext.addEventListener('click', () => {
      currentIndex = Math.min(maxIndex, currentIndex + 1);
      updateSlider();
    });

    // Update on resize
    window.addEventListener('resize', () => {
      const newVisible = window.innerWidth > 900 ? 3 : window.innerWidth > 600 ? 2 : 1;
      if (newVisible !== visibleCards) {
        location.reload(); // Simple way to recalculate
      }
    });
  }

});
document.addEventListener("click", function (e) {
  const clicked = e.target.closest(".news-item");
  if (!clicked) return;

  e.preventDefault(); // 🔥 ეს აკლდა

  document.querySelectorAll(".news-item.open").forEach(item => {
    if (item !== clicked) item.classList.remove("open");
  });

  clicked.classList.toggle("open");
});

