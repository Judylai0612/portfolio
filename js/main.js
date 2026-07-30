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

  const fadeEls = document.querySelectorAll('.fade-in, .reveal-text');
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

    let timer = setInterval(nextSlide, 2000);
    const banner = bannerTrack.closest('.banner');
    banner.addEventListener('mouseenter', () => clearInterval(timer));
    banner.addEventListener('mouseleave', () => {
      timer = setInterval(nextSlide, 2000);
    });
  }

  // Work mosaic image lightbox
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxZoom = document.getElementById('lightboxZoom');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const zoomableImages = Array.from(document.querySelectorAll('.mosaic-item img'));
    let currentIndex = 0;

    // Zoom / pan state
    const MAX_SCALE = 2.5;
    const BTN_SCALE = 2;
    let scale = 1;
    let panX = 0;
    let panY = 0;

    const applyTransform = () => {
      lightboxImg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
      lightboxImg.classList.toggle('is-zoomed', scale > 1);
      if (lightboxZoom) lightboxZoom.classList.toggle('is-active', scale > 1);
    };

    const clampPan = () => {
      const maxX = (lightboxImg.offsetWidth * (scale - 1)) / 2;
      const maxY = (lightboxImg.offsetHeight * (scale - 1)) / 2;
      panX = Math.min(maxX, Math.max(-maxX, panX));
      panY = Math.min(maxY, Math.max(-maxY, panY));
    };

    const resetZoom = () => {
      scale = 1;
      panX = 0;
      panY = 0;
      applyTransform();
    };

    const updateArrows = () => {
      lightboxPrev.style.display = currentIndex > 0 ? 'flex' : 'none';
      lightboxNext.style.display = currentIndex < zoomableImages.length - 1 ? 'flex' : 'none';
    };

    const showImage = (index) => {
      currentIndex = index;
      const img = zoomableImages[currentIndex];
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      resetZoom();
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
      resetZoom();
      document.body.style.overflow = '';
    };

    zoomableImages.forEach((img, i) => {
      img.addEventListener('click', () => openLightbox(i));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxZoom) {
      lightboxZoom.addEventListener('click', () => {
        if (scale > 1) {
          resetZoom();
        } else {
          scale = BTN_SCALE;
          applyTransform();
        }
      });
    }
    lightboxImg.addEventListener('dblclick', (e) => {
      e.preventDefault();
      if (scale > 1) {
        resetZoom();
      } else {
        scale = BTN_SCALE;
        applyTransform();
      }
    });
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

    // Mouse drag to pan while zoomed
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    lightboxImg.addEventListener('mousedown', (e) => {
      if (scale <= 1) return;
      e.preventDefault();
      dragging = true;
      dragStartX = e.clientX - panX;
      dragStartY = e.clientY - panY;
      lightboxImg.classList.add('is-dragging');
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      panX = e.clientX - dragStartX;
      panY = e.clientY - dragStartY;
      clampPan();
      applyTransform();
    });
    document.addEventListener('mouseup', () => {
      dragging = false;
      lightboxImg.classList.remove('is-dragging');
    });

    // Touch: pinch to zoom, one-finger pan while zoomed
    let pinchStartDist = 0;
    let pinchStartScale = 1;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchPanning = false;

    const touchDist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    lightboxImg.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        pinchStartDist = touchDist(e.touches);
        pinchStartScale = scale;
      } else if (e.touches.length === 1 && scale > 1) {
        touchPanning = true;
        touchStartX = e.touches[0].clientX - panX;
        touchStartY = e.touches[0].clientY - panY;
        lightboxImg.classList.add('is-dragging');
      }
    }, { passive: true });

    lightboxImg.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && pinchStartDist > 0) {
        e.preventDefault();
        scale = Math.min(MAX_SCALE, Math.max(1, pinchStartScale * (touchDist(e.touches) / pinchStartDist)));
        if (scale === 1) {
          panX = 0;
          panY = 0;
        }
        clampPan();
        applyTransform();
      } else if (e.touches.length === 1 && touchPanning) {
        e.preventDefault();
        panX = e.touches[0].clientX - touchStartX;
        panY = e.touches[0].clientY - touchStartY;
        clampPan();
        applyTransform();
      }
    }, { passive: false });

    lightboxImg.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) pinchStartDist = 0;
      if (e.touches.length === 0) {
        touchPanning = false;
        lightboxImg.classList.remove('is-dragging');
      }
    });
  }
});
