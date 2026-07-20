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

    let timer = setInterval(nextSlide, 4000);
    const banner = bannerTrack.closest('.banner');
    banner.addEventListener('mouseenter', () => clearInterval(timer));
    banner.addEventListener('mouseleave', () => {
      timer = setInterval(nextSlide, 4000);
    });
  }

  // Category detail page: work slide navigation
  const workSlides = Array.from(document.querySelectorAll('.work-slide'));
  if (workSlides.length) {
    const prevBtn = document.querySelector('.work-arrow-prev');
    const nextBtn = document.querySelector('.work-arrow-next');
    const counterCurrent = document.getElementById('workCounterCurrent');
    const counterTotal = document.getElementById('workCounterTotal');
    const total = workSlides.length;
    let current = 0;

    counterTotal.textContent = total;

    function show(i) {
      current = i;
      workSlides.forEach((slide, idx) => {
        if (idx === current) {
          slide.classList.remove('is-active');
          void slide.offsetWidth;
          slide.classList.add('is-active');
        } else {
          slide.classList.remove('is-active');
        }
      });
      counterCurrent.textContent = current + 1;
    }

    prevBtn.addEventListener('click', () => show((current - 1 + total) % total));
    nextBtn.addEventListener('click', () => show((current + 1) % total));
  }
});
