window._cLink = window.WHATSAPP_URL;

// Gallery Data for Lightbox
const galleryData = [
  { src: "images/gallery/g1.webp", title: "Majestic High-Rise Residential Towers" },
  { src: "images/gallery/g2.webp", title: "Aerial Night View & Premium Amenities" },
  { src: "images/gallery/g3.webp", title: "Spacious Township & Green Landscaping" },
  { src: "images/gallery/g4.webp", title: "105-Acre Master Township Aerial View" },
  { src: "images/gallery/g5.webp", title: "Grand Entrance Gateway & Drop-off Plaza" },
  { src: "images/gallery/g6.webp", title: "Lush Landscaped Water Features & Pathways" },
  { src: "images/gallery/g7.webp", title: "Elegant Residential Tower Exterior" },
  { src: "images/gallery/g8.webp", title: "Grand Entrance Gate & Arrival Plaza" },
  { src: "images/gallery/g9.webp", title: "Majestic High-Rise Towers Exterior View" },
  { src: "images/gallery/g10.webp", title: "Panoramic Township View at Dusk" }
];

// Amenities Data for Lightbox
const amenitiesData = [
  { src: "images/amenities/a1.webp", title: "Signature 8-Acre Racecourse & Polo Club" },
  { src: "images/amenities/a2.webp", title: "State-of-the-Art Luxury Clubhouse" },
  { src: "images/amenities/a3.webp", title: "Resort-Style Swimming Pool & Aquatic Deck" },
  { src: "images/amenities/a4.webp", title: "Multi-Purpose Ground Amenities & Sports Arena" },
  { src: "images/amenities/a5.webp", title: "Executive Clubhouse Lounge & Studio" },
  { src: "images/amenities/a6.webp", title: "Exclusive Fine Dining Restaurant & Bar" },
  { src: "images/amenities/a7.webp", title: "Al Fresco Dining by the Water" },
  { src: "images/amenities/a8.webp", title: "Grand Lobby & Waiting Lounge" },
  { src: "images/amenities/a9.webp", title: "Premium Reception & Concierge Desk" }
];

let curGalleryLightboxIdx = 0;
let curAmenitiesLightboxIdx = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Show popup modal after 30 seconds
  setTimeout(() => {
      const modalEl = document.getElementById("leadModal");
      if (modalEl) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          modal.show();
        } else {
          modalEl.classList.add("show");
          modalEl.style.display = "block";
          document.body.classList.add("modal-open");
        }
      }
    }, 30000);

    // ── 1. Hero Cross-fade Slider (Matching Hero.jsx) ──
    let curHeroSlide = 0;
    const preloadSlide1 = () => {
      const d1 = document.getElementById("hero-desk-slide-1");
      const m1 = document.getElementById("hero-mob-slide-1");
      if (d1 && (!d1.getAttribute("src") || d1.getAttribute("src") === "") && d1.dataset.src) {
        d1.src = d1.dataset.src;
      }
      if (m1 && (!m1.getAttribute("src") || m1.getAttribute("src") === "") && m1.dataset.src) {
        m1.src = m1.dataset.src;
      }
    };
    setTimeout(preloadSlide1, 2500);

    setInterval(() => {
      preloadSlide1();
      curHeroSlide = (curHeroSlide + 1) % 2;
      const d0 = document.getElementById("hero-desk-slide-0");
      const d1 = document.getElementById("hero-desk-slide-1");
      const m0 = document.getElementById("hero-mob-slide-0");
      const m1 = document.getElementById("hero-mob-slide-1");

      if (d0 && d1) {
        if (curHeroSlide === 0) {
          d0.style.opacity = "1";
          d0.style.zIndex = "2";
          d1.style.opacity = "0";
          d1.style.zIndex = "1";
        } else {
          d0.style.opacity = "0";
          d0.style.zIndex = "1";
          d1.style.opacity = "1";
          d1.style.zIndex = "2";
        }
      }
      if (m0 && m1) {
        if (curHeroSlide === 0) {
          m0.style.opacity = "1";
          m0.style.zIndex = "2";
          m1.style.opacity = "0";
          m1.style.zIndex = "1";
        } else {
          m0.style.opacity = "0";
          m0.style.zIndex = "1";
          m1.style.opacity = "1";
          m1.style.zIndex = "2";
        }
      }
    }, 5000);

    // ═══════════════════════════════════════════════════════════
    //  INFINITE LOOP CAROUSEL ENGINE (Seamless Cloning + Teleport)
    // ═══════════════════════════════════════════════════════════
    function setupInfiniteCarousel(config) {
      const track = document.getElementById(config.trackId);
      if (!track) return null;

      if (track.dataset.infiniteInit === "true") return null;
      track.dataset.infiniteInit = "true";

      const originalSlides = Array.from(track.querySelectorAll(config.slideSelector));
      const total = originalSlides.length;
      if (total <= 1) return null;

      const CLONES = 3;

      // Set data-real-idx on original slides
      originalSlides.forEach((slide, idx) => {
        slide.setAttribute("data-real-idx", idx);
      });

      // Prepend clones of the last CLONES slides
      for (let i = total - CLONES; i < total; i++) {
        const clone = originalSlides[i].cloneNode(true);
        clone.classList.add("is-clone");
        clone.setAttribute("data-real-idx", i);
        track.insertBefore(clone, track.firstChild);
      }

      // Append clones of the first CLONES slides
      for (let i = 0; i < CLONES; i++) {
        const clone = originalSlides[i].cloneNode(true);
        clone.classList.add("is-clone");
        clone.setAttribute("data-real-idx", i);
        track.appendChild(clone);
      }

      const allSlides = Array.from(track.querySelectorAll(config.slideSelector));
      let curDomIdx = CLONES; // Start at real slide 0
      let isAnimating = false;
      let autoplayTimer = null;
      const animDuration = 700; // ms

      // Initial track position without transition
      track.style.transition = "none";
      track.style.transform = `translateX(calc(-${curDomIdx} * (var(--slide-w) + 16px)))`;
      void track.offsetWidth; // Force reflow
      track.style.transition = "";

      const updateUI = (domIdx, animateProgress = true) => {
        allSlides.forEach((slide, i) => {
          const pb = slide.querySelector("." + config.progressBarClass);
          const title = slide.querySelector("." + config.titleClass);

          if (pb) {
            if (i === domIdx) {
              pb.classList.remove("hidden");
              if (animateProgress) {
                pb.style.animation = "none";
                void pb.offsetWidth;
                pb.style.animation = `${config.progressAnimName} ${config.autoplayDelay || 4000}ms linear forwards`;
              }
            } else {
              pb.classList.add("hidden");
              pb.style.animation = "none";
            }
          }

          if (title) {
            if (i === domIdx) {
              title.style.opacity = "1";
              title.style.transform = "translateY(0)";
            } else {
              title.style.opacity = "0";
              title.style.transform = "translateY(20px)";
            }
          }
        });
      };

      const moveTo = (targetDomIdx) => {
        if (isAnimating) return;
        isAnimating = true;
        curDomIdx = targetDomIdx;
        track.style.transition = `transform ${animDuration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
        track.style.transform = `translateX(calc(-${curDomIdx} * (var(--slide-w) + 16px)))`;
        updateUI(curDomIdx, true);

        // Safety fallback in case transitionend is delayed or missed
        clearTimeout(track._safetyTimeout);
        track._safetyTimeout = setTimeout(() => {
          if (isAnimating) {
            handleTransitionEnd();
          }
        }, animDuration + 60);
      };

      const handleTransitionEnd = () => {
        clearTimeout(track._safetyTimeout);
        isAnimating = false;

        // Passed last original slide into right clones -> teleport back to original counterpart
        if (curDomIdx >= total + CLONES) {
          track.style.transition = "none";
          curDomIdx = curDomIdx - total;
          track.style.transform = `translateX(calc(-${curDomIdx} * (var(--slide-w) + 16px)))`;
          void track.offsetWidth;
          updateUI(curDomIdx, false);
          track.style.transition = "";
        }
        // Passed first original slide into left clones -> teleport forward to original counterpart
        else if (curDomIdx < CLONES) {
          track.style.transition = "none";
          curDomIdx = curDomIdx + total;
          track.style.transform = `translateX(calc(-${curDomIdx} * (var(--slide-w) + 16px)))`;
          void track.offsetWidth;
          updateUI(curDomIdx, false);
          track.style.transition = "";
        }
      };

      track.addEventListener("transitionend", (e) => {
        if (e.target === track && e.propertyName === "transform") {
          handleTransitionEnd();
        }
      });

      const nextSlide = () => {
        if (isAnimating) return;
        moveTo(curDomIdx + 1);
      };

      const prevSlide = () => {
        if (isAnimating) return;
        moveTo(curDomIdx - 1);
      };

      const startAutoplay = () => {
        stopAutoplay();
        autoplayTimer = setInterval(nextSlide, config.autoplayDelay || 4000);
      };

      const stopAutoplay = () => {
        if (autoplayTimer) {
          clearInterval(autoplayTimer);
          autoplayTimer = null;
        }
      };

      const resetAutoplay = () => {
        stopAutoplay();
        startAutoplay();
      };

      const prevBtn = document.getElementById(config.prevBtnId);
      const nextBtn = document.getElementById(config.nextBtnId);

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          nextSlide();
          resetAutoplay();
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          prevSlide();
          resetAutoplay();
        });
      }

      // Pause autoplay on mouse hover, resume on leave
      track.addEventListener("mouseenter", stopAutoplay);
      track.addEventListener("mouseleave", startAutoplay);

      // Touch / Swipe support for mobile
      let touchStartX = 0;
      let touchStartY = 0;
      track.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          stopAutoplay();
        }
      }, { passive: true });

      track.addEventListener("touchend", (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const diffX = touchStartX - e.changedTouches[0].clientX;
          const diffY = touchStartY - e.changedTouches[0].clientY;
          if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
              nextSlide();
            } else {
              prevSlide();
            }
          }
          startAutoplay();
        }
      }, { passive: true });

      // Attach click to open lightbox for all slides (including clones)
      allSlides.forEach((slide) => {
        slide.style.cursor = "pointer";
        let idx = slide.getAttribute("data-real-idx");
        if (idx === null || isNaN(parseInt(idx, 10))) {
          const match = (slide.getAttribute("onclick") || "").match(/\d+/);
          idx = match ? match[0] : "0";
        }
        const parsedIdx = parseInt(idx, 10);
        slide.onclick = function(e) {
          if (config.onSlideClick) {
            config.onSlideClick(parsedIdx);
          }
        };
      });

      // Track-level click delegation (Guarantees desktop clicks anywhere inside slide/image/overlay fire)
      track.addEventListener("click", function(e) {
        if (e.target.closest("button, .gallery-nav-btn, .amenities-nav-btn")) return;
        const slide = e.target.closest(config.slideSelector);
        if (slide) {
          let idx = slide.getAttribute("data-real-idx");
          if (idx === null || isNaN(parseInt(idx, 10))) {
            const match = (slide.getAttribute("onclick") || "").match(/\d+/);
            idx = match ? match[0] : "0";
          }
          if (config.onSlideClick) {
            config.onSlideClick(parseInt(idx, 10));
          }
        }
      });

      // Initial UI activation
      updateUI(curDomIdx, true);
      startAutoplay();

      return { nextSlide, prevSlide, stopAutoplay, startAutoplay };
    }

    // ── 2. Gallery Infinite Carousel ──
    setupInfiniteCarousel({
      trackId: "gallery-slider-track",
      slideSelector: ".gallery-slide",
      prevBtnId: "gallery-prev-btn",
      nextBtnId: "gallery-next-btn",
      progressBarClass: "gallery-progress-bar",
      progressAnimName: "galleryProgressLine",
      titleClass: "gallery-slide-title",
      autoplayDelay: 4000,
      onSlideClick: function(idx) {
        if (typeof window.openGalleryLightbox === "function") {
          window.openGalleryLightbox(idx);
        }
      }
    });

    // ── 3. Amenities Infinite Carousel ──
    setupInfiniteCarousel({
      trackId: "amenities-slider-track",
      slideSelector: ".amenities-slide",
      prevBtnId: "amenities-prev-btn",
      nextBtnId: "amenities-next-btn",
      progressBarClass: "amenities-progress-bar",
      progressAnimName: "amenitiesProgressLine",
      titleClass: "amenities-slide-title",
      autoplayDelay: 4000,
      onSlideClick: function(idx) {
        if (typeof window.openAmenitiesLightbox === "function") {
          window.openAmenitiesLightbox(idx);
        }
      }
    });

    // ── 4. Header Smart Scroll Behavior (Matching heera/Navbar.jsx) ──
    const mainNav = document.getElementById("mainNavbar");
    if (mainNav) {
      let lastScrollY = window.scrollY;

      const onNavScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY <= 50) {
          mainNav.classList.remove("sticky", "scrolled-up-expanded");
        } else if (Math.abs(currentScrollY - lastScrollY) > 4) {
          if (currentScrollY > lastScrollY) {
            // Scrolling down -> collapse to hanging logo tab
            mainNav.classList.add("sticky");
            mainNav.classList.remove("scrolled-up-expanded");
          } else {
            // Scrolling up -> bring back the full navbar with links
            mainNav.classList.remove("sticky");
            mainNav.classList.add("scrolled-up-expanded");
          }
        }

        // Section darkness check
        const darkSections = document.querySelectorAll(
          "#highlights, #location, #developer, .hero-container, footer"
        );
        let overDarkSection = false;
        const navY = 80;
        darkSections.forEach((sec) => {
          const rect = sec.getBoundingClientRect();
          if (rect.top <= navY && rect.bottom >= navY) {
            overDarkSection = true;
          }
        });
        if (overDarkSection) {
          mainNav.classList.add("nav-over-dark");
          mainNav.classList.remove("nav-over-light");
        } else {
          mainNav.classList.remove("nav-over-dark");
          mainNav.classList.add("nav-over-light");
        }

        lastScrollY = currentScrollY;
      };

      window.addEventListener("scroll", onNavScroll, { passive: true });
      onNavScroll();
    }

    // ── 5. Form Validation (Bootstrap) ──
    const forms = document.querySelectorAll(".needs-validation");
    Array.from(forms).forEach((form) => {
      form.addEventListener(
        "submit",
        (event) => {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add("was-validated");
        },
        false,
      );
    });

    // ── 6. Modals & Click Handlers ──
    document.addEventListener("click", (e) => {
      const toggle = e.target.closest('[data-bs-toggle="modal"]');
      if (toggle) {
        e.preventDefault();
        const targetSelector = toggle.getAttribute("data-bs-target");
        const modalEl = document.querySelector(targetSelector);
        if (modalEl && window.bootstrap) {
          const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          modal.show();
        } else if (modalEl) {
          modalEl.classList.add("show");
          modalEl.style.display = "block";
          document.body.classList.add("modal-open");
        }
      }

      const dismiss = e.target.closest('[data-bs-dismiss="modal"]');
      if (dismiss) {
        const modalEl = dismiss.closest(".modal");
        if (modalEl && window.bootstrap) {
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
        } else if (modalEl) {
          modalEl.classList.remove("show");
          modalEl.style.display = "none";
          document.body.classList.remove("modal-open");
        }
      }
    });

    // ── 7. AOS Scroll Animation ──
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 800,
        once: false,
        mirror: true,
        offset: 50,
        easing: "ease-out-cubic",
      });
      setTimeout(() => AOS.refresh(), 500);
      setTimeout(() => AOS.refresh(), 2000);
    }

    // ── 8. Inject Config Variables into UI ──
    const callNumber = window.CALL_NO || window.WHATSAPP_NO;
    if (callNumber) {
      document.querySelectorAll('a[href^="tel:"]').forEach((el) => {
        el.href = "tel:+" + callNumber.replace(/^\+/, "");
        if (window.CALL_DISPLAY) {
          el.innerHTML = el.innerHTML.replace(/\+?91[\s\d-]+/g, window.CALL_DISPLAY);
        }
      });
    }

    const waUrl = window.WHATSAPP_URL || window._cLink;
    if (waUrl) {
      document.querySelectorAll('a[href*="wa.me"], #mobile-whatsapp').forEach((el) => {
        el.href = waUrl;
      });
    }

    document.querySelectorAll('[name="form_name"]').forEach((el) => {
      if (!el.value) el.value = window.PROJECT_NAME || "Lead Form";
    });

    const reraEl = document.getElementById("dynamic-rera");
    if (reraEl && typeof window.RERA_NO !== "undefined") {
      reraEl.innerText = window.RERA_NO;
    }

    document.dispatchEvent(new Event("componentsLoaded"));
});

// ── Global Floor Plan Toggle (Master Plan vs Floor Plans) ──
window.switchPlanTab = function(tab) {
  const masterContent = document.getElementById('tab-content-master');
  const floorContent = document.getElementById('tab-content-floor');
  const masterBtn = document.getElementById('tab-btn-master');
  const floorBtn = document.getElementById('tab-btn-floor');

  if (tab === 'master') {
    if (masterContent) {
      masterContent.style.display = 'block';
      masterContent.classList.remove('hidden');
    }
    if (floorContent) {
      floorContent.style.display = 'none';
      floorContent.classList.add('hidden');
    }
    if (masterBtn) {
      masterBtn.classList.add('active');
      masterBtn.classList.remove('inactive');
      masterBtn.style.backgroundColor = '#000242';
      masterBtn.style.color = '#ffffff';
    }
    if (floorBtn) {
      floorBtn.classList.remove('active');
      floorBtn.classList.add('inactive');
      floorBtn.style.backgroundColor = 'transparent';
      floorBtn.style.color = '#000242';
    }
  } else {
    if (masterContent) {
      masterContent.style.display = 'none';
      masterContent.classList.add('hidden');
    }
    if (floorContent) {
      floorContent.style.display = 'block';
      floorContent.classList.remove('hidden');
    }
    if (floorBtn) {
      floorBtn.classList.add('active');
      floorBtn.classList.remove('inactive');
      floorBtn.style.backgroundColor = '#000242';
      floorBtn.style.color = '#ffffff';
    }
    if (masterBtn) {
      masterBtn.classList.remove('active');
      masterBtn.classList.add('inactive');
      masterBtn.style.backgroundColor = 'transparent';
      masterBtn.style.color = '#000242';
    }
  }
};

window.toggleFloorPlan = function(tab) {
  window.switchPlanTab(tab);
};

// ── Global Lightbox Handlers: Gallery ──
window.openGalleryLightbox = function(idx) {
  let index = 0;
  if (typeof idx === 'number' && !isNaN(idx)) {
    index = idx;
  } else if (typeof idx === 'string' && !isNaN(parseInt(idx, 10))) {
    index = parseInt(idx, 10);
  } else if (typeof curGalleryLightboxIdx === 'number' && !isNaN(curGalleryLightboxIdx)) {
    index = curGalleryLightboxIdx;
  }
  const total = galleryData.length;
  index = Math.max(0, Math.min(index, total - 1));
  curGalleryLightboxIdx = index;

  const lb = document.getElementById("gallery-lightbox");
  const img = document.getElementById("gallery-lightbox-img");
  const cap = document.getElementById("gallery-lightbox-caption");
  const counter = document.getElementById("gallery-counter");
  if (lb && img && galleryData[index]) {
    img.src = galleryData[index].src;
    if (cap) cap.textContent = galleryData[index].title;
    if (counter) counter.textContent = `${index + 1} / ${total}`;
    lb.classList.remove("hidden");
    lb.classList.add("is-open", "flex");
    lb.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
};

window.closeGalleryLightbox = function() {
  const lb = document.getElementById("gallery-lightbox");
  if (lb) {
    lb.classList.remove("is-open", "flex");
    lb.classList.add("hidden");
    lb.style.display = "none";
    document.body.style.overflow = "";
  }
};

window.nextGalleryLightbox = function(e) {
  if (e) e.stopPropagation();
  curGalleryLightboxIdx = (curGalleryLightboxIdx + 1) % galleryData.length;
  window.openGalleryLightbox(curGalleryLightboxIdx);
};

window.prevGalleryLightbox = function(e) {
  if (e) e.stopPropagation();
  curGalleryLightboxIdx = (curGalleryLightboxIdx - 1 + galleryData.length) % galleryData.length;
  window.openGalleryLightbox(curGalleryLightboxIdx);
};

// ── Global Lightbox Handlers: Amenities ──
window.openAmenitiesLightbox = function(idx) {
  let index = 0;
  if (typeof idx === 'number' && !isNaN(idx)) {
    index = idx;
  } else if (typeof idx === 'string' && !isNaN(parseInt(idx, 10))) {
    index = parseInt(idx, 10);
  } else if (typeof curAmenitiesLightboxIdx === 'number' && !isNaN(curAmenitiesLightboxIdx)) {
    index = curAmenitiesLightboxIdx;
  }
  const total = amenitiesData.length;
  index = Math.max(0, Math.min(index, total - 1));
  curAmenitiesLightboxIdx = index;

  const lb = document.getElementById("amenities-lightbox");
  const img = document.getElementById("amenities-lightbox-img");
  const cap = document.getElementById("amenities-lightbox-caption");
  const counter = document.getElementById("amenities-counter");
  if (lb && img && amenitiesData[index]) {
    img.src = amenitiesData[index].src;
    if (cap) cap.textContent = amenitiesData[index].title;
    if (counter) counter.textContent = `${index + 1} / ${total}`;
    lb.classList.remove("hidden");
    lb.classList.add("is-open", "flex");
    lb.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
};

window.closeAmenitiesLightbox = function() {
  const lb = document.getElementById("amenities-lightbox");
  if (lb) {
    lb.classList.remove("is-open", "flex");
    lb.classList.add("hidden");
    lb.style.display = "none";
    document.body.style.overflow = "";
  }
};

window.nextAmenitiesLightbox = function(e) {
  if (e) e.stopPropagation();
  curAmenitiesLightboxIdx = (curAmenitiesLightboxIdx + 1) % amenitiesData.length;
  window.openAmenitiesLightbox(curAmenitiesLightboxIdx);
};

window.prevAmenitiesLightbox = function(e) {
  if (e) e.stopPropagation();
  curAmenitiesLightboxIdx = (curAmenitiesLightboxIdx - 1 + amenitiesData.length) % amenitiesData.length;
  window.openAmenitiesLightbox(curAmenitiesLightboxIdx);
};

// Keyboard navigation for lightboxes
window.addEventListener("keydown", (e) => {
  const mLb = document.getElementById("masterplan-lightbox");
  const gLb = document.getElementById("gallery-lightbox");
  const aLb = document.getElementById("amenities-lightbox");

  if (mLb && mLb.classList.contains("is-open")) {
    if (e.key === "Escape") window.closeMasterPlanLightbox();
  } else if (gLb && gLb.classList.contains("is-open")) {
    if (e.key === "Escape") window.closeGalleryLightbox();
    if (e.key === "ArrowRight") window.nextGalleryLightbox();
    if (e.key === "ArrowLeft") window.prevGalleryLightbox();
  } else if (aLb && aLb.classList.contains("is-open")) {
    if (e.key === "Escape") window.closeAmenitiesLightbox();
    if (e.key === "ArrowRight") window.nextAmenitiesLightbox();
    if (e.key === "ArrowLeft") window.prevAmenitiesLightbox();
  } else if (e.key === "Escape") {
    window.closeMobileNav();
  }
});

// ── Global Mobile Popup Navigation ──
window.openMobileNav = function() {
  const popup = document.getElementById("popupMenu");
  const trigger = document.getElementById("mobNavTrigger");
  if (popup) {
    popup.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  if (trigger) trigger.classList.add("open");
};

window.closeMobileNav = function() {
  const popup = document.getElementById("popupMenu");
  const trigger = document.getElementById("mobNavTrigger");
  if (popup) {
    popup.classList.remove("open");
    document.body.style.overflow = "";
  }
  if (trigger) trigger.classList.remove("open");
};

// ── Global Lead Modal Opener ──
window.openLeadModal = function() {
  const modalEl = document.getElementById("leadModal");
  if (modalEl) {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.show();
    } else {
      modalEl.classList.add("show");
      modalEl.style.display = "block";
      document.body.classList.add("modal-open");
    }
  }
};

