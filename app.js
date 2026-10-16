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
  const components = [];

  const loadPromises = components.map((comp) => {
    const placeholder = document.querySelector(`[data-replace="${comp}"]`);
    if (!placeholder) return Promise.resolve();

    return fetch(`components/${comp}.html?v=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.text())
      .then((html) => {
        placeholder.outerHTML = html;
      })
      .catch((err) => console.error(err));
  });

  Promise.all(loadPromises).then(() => {
    console.log("All components loaded. Initializing scripts...");

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

    // ── 2. Gallery Sliding Track Carousel (Matching CarouselSection.jsx) ──
    const galleryTrack = document.getElementById("gallery-slider-track");
    const gallerySlides = document.querySelectorAll(".gallery-slide");
    const galleryPrevBtn = document.getElementById("gallery-prev-btn");
    const galleryNextBtn = document.getElementById("gallery-next-btn");

    if (galleryTrack && gallerySlides.length > 0) {
      let curGalleryIdx = 0;
      const totalGallery = gallerySlides.length;
      let galleryInterval;

      const updateGalleryView = (idx) => {
        galleryTrack.style.transform = `translateX(calc(-${idx} * (var(--slide-w) + 16px)))`;
        gallerySlides.forEach((slide, i) => {
          const pb = slide.querySelector(".gallery-progress-bar");
          const title = slide.querySelector(".gallery-slide-title");
          if (pb) {
            if (i === idx) {
              pb.classList.remove("hidden");
              pb.style.animation = "none";
              // Trigger reflow
              void pb.offsetWidth;
              pb.style.animation = "galleryProgressLine 4s linear forwards";
            } else {
              pb.classList.add("hidden");
            }
          }
          if (title) {
            if (i === idx) {
              title.style.opacity = "1";
              title.style.transform = "translateY(0)";
            } else {
              title.style.opacity = "0";
              title.style.transform = "translateY(20px)";
            }
          }
        });
      };

      const nextGallery = () => {
        curGalleryIdx = (curGalleryIdx + 1) % totalGallery;
        updateGalleryView(curGalleryIdx);
      };

      const prevGallery = () => {
        curGalleryIdx = (curGalleryIdx - 1 + totalGallery) % totalGallery;
        updateGalleryView(curGalleryIdx);
      };

      if (galleryNextBtn) {
        galleryNextBtn.addEventListener("click", () => {
          nextGallery();
          resetGalleryAutoplay();
        });
      }

      if (galleryPrevBtn) {
        galleryPrevBtn.addEventListener("click", () => {
          prevGallery();
          resetGalleryAutoplay();
        });
      }

      const resetGalleryAutoplay = () => {
        clearInterval(galleryInterval);
        galleryInterval = setInterval(nextGallery, 4000);
      };

      resetGalleryAutoplay();
    }

    // ── 3. Amenities Sliding Track Carousel (Matching CarouselSection.jsx) ──
    const amenitiesTrack = document.getElementById("amenities-slider-track");
    const amenitiesSlides = document.querySelectorAll(".amenities-slide");
    const amenitiesPrevBtn = document.getElementById("amenities-prev-btn");
    const amenitiesNextBtn = document.getElementById("amenities-next-btn");

    if (amenitiesTrack && amenitiesSlides.length > 0) {
      let curAmenitiesIdx = 0;
      const totalAmenities = amenitiesSlides.length;
      let amenitiesInterval;

      const updateAmenitiesView = (idx) => {
        amenitiesTrack.style.transform = `translateX(calc(-${idx} * (var(--slide-w) + 16px)))`;
        amenitiesSlides.forEach((slide, i) => {
          const pb = slide.querySelector(".amenities-progress-bar");
          const title = slide.querySelector(".amenities-slide-title");
          if (pb) {
            if (i === idx) {
              pb.classList.remove("hidden");
              pb.style.animation = "none";
              void pb.offsetWidth;
              pb.style.animation = "amenitiesProgressLine 4s linear forwards";
            } else {
              pb.classList.add("hidden");
            }
          }
          if (title) {
            if (i === idx) {
              title.style.opacity = "1";
              title.style.transform = "translateY(0)";
            } else {
              title.style.opacity = "0";
              title.style.transform = "translateY(20px)";
            }
          }
        });
      };

      const nextAmenities = () => {
        curAmenitiesIdx = (curAmenitiesIdx + 1) % totalAmenities;
        updateAmenitiesView(curAmenitiesIdx);
      };

      const prevAmenities = () => {
        curAmenitiesIdx = (curAmenitiesIdx - 1 + totalAmenities) % totalAmenities;
        updateAmenitiesView(curAmenitiesIdx);
      };

      if (amenitiesNextBtn) {
        amenitiesNextBtn.addEventListener("click", () => {
          nextAmenities();
          resetAmenitiesAutoplay();
        });
      }

      if (amenitiesPrevBtn) {
        amenitiesPrevBtn.addEventListener("click", () => {
          prevAmenities();
          resetAmenitiesAutoplay();
        });
      }

      const resetAmenitiesAutoplay = () => {
        clearInterval(amenitiesInterval);
        amenitiesInterval = setInterval(nextAmenities, 4000);
      };

      resetAmenitiesAutoplay();
    }

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
        el.innerHTML = el.innerHTML.replace(
          /\+?91\s*9513550974|\+?91\s*919596286287|\+?91\s*9718344024|\+?91\s*9560582493/g,
          "+91 " + callNumber.replace(/^91/, ""),
        );
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
  curGalleryLightboxIdx = idx;
  const lb = document.getElementById("gallery-lightbox");
  const img = document.getElementById("gallery-lightbox-img");
  const cap = document.getElementById("gallery-lightbox-caption");
  const counter = document.getElementById("gallery-counter");
  if (lb && img && galleryData[idx]) {
    img.src = galleryData[idx].src;
    if (cap) cap.textContent = galleryData[idx].title;
    if (counter) counter.textContent = `${idx + 1} / ${galleryData.length}`;
    lb.classList.remove("hidden");
    lb.classList.add("is-open", "flex");
    document.body.style.overflow = "hidden";
  }
};

window.closeGalleryLightbox = function() {
  const lb = document.getElementById("gallery-lightbox");
  if (lb) {
    lb.classList.remove("is-open", "flex");
    lb.classList.add("hidden");
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
  curAmenitiesLightboxIdx = idx;
  const lb = document.getElementById("amenities-lightbox");
  const img = document.getElementById("amenities-lightbox-img");
  const cap = document.getElementById("amenities-lightbox-caption");
  const counter = document.getElementById("amenities-counter");
  if (lb && img && amenitiesData[idx]) {
    img.src = amenitiesData[idx].src;
    if (cap) cap.textContent = amenitiesData[idx].title;
    if (counter) counter.textContent = `${idx + 1} / ${amenitiesData.length}`;
    lb.classList.remove("hidden");
    lb.classList.add("is-open", "flex");
    document.body.style.overflow = "hidden";
  }
};

window.closeAmenitiesLightbox = function() {
  const lb = document.getElementById("amenities-lightbox");
  if (lb) {
    lb.classList.remove("is-open", "flex");
    lb.classList.add("hidden");
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

