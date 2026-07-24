document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navLinkItems = document.querySelectorAll('.nav-link');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinkItems.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  const currentPage = document.body.dataset.page;
  if (currentPage) {
    navLinkItems.forEach((link) => {
      link.classList.toggle('active', link.dataset.navTarget === currentPage);
    });
  }

  const fadeEls = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  fadeEls.forEach((el) => fadeObserver.observe(el));

  // Portfolio banner carousel
  const bannerTrack = document.getElementById('bannerTrack');
  if (bannerTrack) {
    const slides = Array.from(bannerTrack.children);
    const dotsWrap = document.getElementById('bannerDots');
    const total = slides.length;
    let index = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'banner-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `第 ${i + 1} 張輪播圖`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(i) {
      index = i;
      bannerTrack.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, j) => d.classList.toggle('active', j === index));
    }

    function nextSlide() {
      goTo((index + 1) % total);
    }

    let timer = setInterval(nextSlide, 3500);
    const banner = bannerTrack.closest('.banner');
    banner.addEventListener('mouseenter', () => clearInterval(timer));
    banner.addEventListener('mouseleave', () => {
      timer = setInterval(nextSlide, 3500);
    });
  }

  // Work mosaic image lightbox
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const zoomableImages = Array.from(document.querySelectorAll('.mosaic-item img'));
    let currentIndex = 0;

    const updateArrows = () => {
      lightboxPrev.style.display = currentIndex > 0 ? 'flex' : 'none';
      lightboxNext.style.display = currentIndex < zoomableImages.length - 1 ? 'flex' : 'none';
    };

    const showImage = (index) => {
      currentIndex = index;
      const img = zoomableImages[currentIndex];
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      updateArrows();
    };

    const openLightbox = (index) => {
      showImage(index);
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightboxImg.src = '';
      document.body.style.overflow = '';
    };

    zoomableImages.forEach((img, i) => {
      img.addEventListener('click', () => openLightbox(i));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => {
      if (currentIndex > 0) showImage(currentIndex - 1);
    });
    lightboxNext.addEventListener('click', () => {
      if (currentIndex < zoomableImages.length - 1) showImage(currentIndex + 1);
    });
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && currentIndex > 0) showImage(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < zoomableImages.length - 1) showImage(currentIndex + 1);
    });
  }
});
