/**
 * Dewa Bike Tour - Modern Client-Side JavaScript
 * Pure Vanilla JS - 100% Compatible with GitHub Pages
 */

document.addEventListener('DOMContentLoaded', () => {
  // Constants
  const WHATSAPP_NUMBER = '6281339545689';
  const USD_RATE = 15500; // 1 USD ~ 15,500 IDR for estimation

  // Package Data Dictionary for Quick Price Lookup
  const packageData = {
    'Kintamani Downhill': {
      title: 'Kintamani Downhill Cycling Tour',
      regular: 550000,
      saving: 350000
    },
    'Ubud Rice Fields': {
      title: 'Ubud Rice Fields & Village Tour',
      regular: 550000,
      saving: 350000
    },
    'E-Bike Ubud Countryside': {
      title: 'Ubud E-Bike Countryside Tour',
      regular: 650000,
      saving: 450000
    },
    'Cycling + River Tubing': {
      title: 'Cycling + River Tubing Adventure',
      regular: 850000,
      saving: 850000
    },
    'Cycling + ATV Quad Bike': {
      title: 'Cycling + ATV Quad Bike Adventure',
      regular: 950000,
      saving: 950000
    },
    'Rice Paddy Planting & Rafting': {
      title: 'Rice Paddy Planting & Ayung Rafting',
      regular: 450000,
      saving: 350000
    }
  };

  /* -------------------------------------------------------------
   * 1. STICKY HEADER SCROLL EFFECT
   * ------------------------------------------------------------- */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  /* -------------------------------------------------------------
   * 2. MOBILE MENU TOGGLE
   * ------------------------------------------------------------- */
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    const toggleMenu = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const isOpen = navMenu.classList.toggle('mobile-open');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };

    mobileToggle.addEventListener('click', toggleMenu);

    // Close when clicking outside header/menu
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        if (navMenu.classList.contains('mobile-open')) {
          navMenu.classList.remove('mobile-open');
          mobileToggle.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Mobile dropdown and link behavior
    navMenu.querySelectorAll('.nav-item').forEach(item => {
      const link = item.querySelector('.nav-link');
      const dropdown = item.querySelector('.dropdown-menu');

      if (dropdown && link) {
        link.addEventListener('click', (e) => {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            e.stopPropagation();
            item.classList.toggle('open-mobile');
          }
        });
      } else if (link) {
        link.addEventListener('click', () => {
          navMenu.classList.remove('mobile-open');
          mobileToggle.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        });
      }
    });

    // Close mobile menu when clicking any dropdown item
    navMenu.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* -------------------------------------------------------------
   * 3. PACKAGE CATEGORY FILTERS
   * ------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const packageCards = document.querySelectorAll('.package-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCat = btn.getAttribute('data-category');

      packageCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (selectedCat === 'all' || cardCat === selectedCat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* -------------------------------------------------------------
   * 4. FAQ ACCORDION INTERACTION
   * ------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items for a clean accordion look
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* -------------------------------------------------------------
   * 5. BOOKING MODAL & LIVE ESTIMATOR
   * ------------------------------------------------------------- */
  const modal = document.getElementById('bookingModal');
  const modalClose = document.getElementById('modalClose');
  const openBookingBtns = document.querySelectorAll('.open-booking-btn');

  const modalTourSelect = document.getElementById('modalTourSelect');
  const modalTourTitle = document.getElementById('modalTourTitle');
  const modalTierInputs = document.querySelectorAll('input[name="modalTier"]');
  const radioCards = document.querySelectorAll('.radio-card');
  const modalGuestsInput = document.getElementById('modalGuests');
  const stepDec = document.getElementById('stepDec');
  const stepInc = document.getElementById('stepInc');
  const modalDate = document.getElementById('modalDate');
  const modalName = document.getElementById('modalName');
  const modalHotel = document.getElementById('modalHotel');

  const calcPricePerPerson = document.getElementById('calcPricePerPerson');
  const calcGuestCount = document.getElementById('calcGuestCount');
  const calcTotalIdr = document.getElementById('calcTotalIdr');
  const calcTotalUsd = document.getElementById('calcTotalUsd');
  const btnSubmitModalBooking = document.getElementById('btnSubmitModalBooking');

  // Set default date to tomorrow
  if (modalDate) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    modalDate.value = tomorrow.toISOString().split('T')[0];
    modalDate.min = new Date().toISOString().split('T')[0];
  }

  // Format IDR currency
  const formatIDR = (num) => {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  };

  // Live Recalculate Prices
  const recalculateModal = () => {
    const selectedTourKey = modalTourSelect.value;
    const tourInfo = packageData[selectedTourKey] || {
      regular: 550000,
      saving: 350000
    };

    let selectedTier = 'regular';
    modalTierInputs.forEach(input => {
      if (input.checked) selectedTier = input.value;
    });

    const pricePerPerson = selectedTier === 'regular' ? tourInfo.regular : tourInfo.saving;
    const guests = parseInt(modalGuestsInput.value, 10) || 1;
    const total = pricePerPerson * guests;
    const totalUSD = Math.round(total / USD_RATE);

    calcPricePerPerson.textContent = formatIDR(pricePerPerson);
    calcGuestCount.textContent = `${guests} ${guests > 1 ? 'guests' : 'guest'}`;
    calcTotalIdr.textContent = formatIDR(total);
    calcTotalUsd.textContent = `(Approx. ~$${totalUSD} USD)`;
  };

  // Open Modal logic
  const openModal = (tourKey = 'Kintamani Downhill') => {
    if (modalTourSelect) {
      if (packageData[tourKey]) {
        modalTourSelect.value = tourKey;
        modalTourTitle.textContent = `Book: ${packageData[tourKey].title}`;
      } else {
        modalTourSelect.value = 'Kintamani Downhill';
      }
    }
    recalculateModal();
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    const modalCard = modal.querySelector('.modal-card');
    if (modalCard) {
      modalCard.scrollTop = 0;
      modalCard.scrollLeft = 0;
    }
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  };

  openBookingBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tour = btn.getAttribute('data-tour') || 'Kintamani Downhill';
      openModal(tour);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Close when clicking outside card
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Stepper increment / decrement
  if (stepDec && stepInc && modalGuestsInput) {
    stepDec.addEventListener('click', () => {
      let val = parseInt(modalGuestsInput.value, 10) || 1;
      if (val > 1) {
        modalGuestsInput.value = val - 1;
        recalculateModal();
      }
    });

    stepInc.addEventListener('click', () => {
      let val = parseInt(modalGuestsInput.value, 10) || 1;
      if (val < 50) {
        modalGuestsInput.value = val + 1;
        recalculateModal();
      }
    });
  }

  // Tour select change
  if (modalTourSelect) {
    modalTourSelect.addEventListener('change', () => {
      const selected = modalTourSelect.value;
      if (packageData[selected]) {
        modalTourTitle.textContent = `Book: ${packageData[selected].title}`;
      }
      recalculateModal();
    });
  }

  // Tier radio changes & visual styling
  modalTierInputs.forEach(radio => {
    radio.addEventListener('change', () => {
      radioCards.forEach(card => card.classList.remove('selected'));
      radio.closest('.radio-card').classList.add('selected');
      recalculateModal();
    });
  });

  // Submit WhatsApp Booking from Modal
  if (btnSubmitModalBooking) {
    btnSubmitModalBooking.addEventListener('click', () => {
      const tourKey = modalTourSelect.value;
      const tourName = packageData[tourKey] ? packageData[tourKey].title : tourKey;
      let selectedTier = 'regular';
      modalTierInputs.forEach(r => { if (r.checked) selectedTier = r.value; });
      const tierLabel = selectedTier === 'regular' ? 'Regular (Inc. Lunch & Hotel Transfer)' : 'Saving (Ride Only)';
      
      const guests = modalGuestsInput.value;
      const date = modalDate.value || 'Flexible';
      const name = modalName.value.trim() || 'Guest';
      const hotel = modalHotel.value.trim() || '-';
      const totalCost = calcTotalIdr.textContent;

      const message = 
`*NEW RESERVATION - DEWA BIKE TOUR*
---------------------------------------
👤 *Name*: ${name}
🚲 *Tour Package*: ${tourName}
📦 *Package Tier*: ${tierLabel}
📅 *Tour Date*: ${date}
👥 *Number of Guests*: ${guests} ${guests > 1 ? 'Guests' : 'Guest'}
🏨 *Hotel / Pickup Location*: ${hotel}
💰 *Estimated Total*: ${totalCost}
---------------------------------------
Hello Dewa Bike Tour Team, please check slot availability for the schedule above. Thank you! 🙏`;

      const encodedMsg = encodeURIComponent(message);
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;
      window.open(waUrl, '_blank');
      closeModal();
    });
  }

  /* -------------------------------------------------------------
   * 6. QUICK CONTACT FORM (BOTTOM SECTION)
   * ------------------------------------------------------------- */
  const quickContactForm = document.getElementById('quickContactForm');
  if (quickContactForm) {
    // Set default date for quick contact
    const cDateInput = document.getElementById('cDate');
    if (cDateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      cDateInput.value = tomorrow.toISOString().split('T')[0];
      cDateInput.min = new Date().toISOString().split('T')[0];
    }

    quickContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cName').value.trim();
      const date = document.getElementById('cDate').value;
      const guests = document.getElementById('cGuests').value;
      const packageSel = document.getElementById('cPackageSelect').value;
      const notes = document.getElementById('cNotes').value.trim() || '-';

      const message = 
`*INQUIRY & BOOKING - DEWA BIKE TOUR*
---------------------------------------
👤 *Name*: ${name}
📅 *Tour Date*: ${date}
👥 *Guests*: ${guests}
🚲 *Package*: ${packageSel}
📝 *Notes / Hotel*: ${notes}
---------------------------------------
Hello Dewa Bike Tour, please confirm package availability and details for my trip above.`;

      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
    });
  }

  /* -------------------------------------------------------------
   * 7. TOUR PHOTO GALLERY SLIDER / CAROUSEL
   * ------------------------------------------------------------- */
  const initTourSlider = () => {
    const slider = document.getElementById('tourSlider');
    if (!slider) return;

    const track = slider.querySelector('.tour-slider-track');
    const slides = slider.querySelectorAll('.tour-slide');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const counterCurrent = document.getElementById('currentSlideNum');
    const counterTotal = document.getElementById('totalSlidesNum');
    const dotsContainer = document.getElementById('sliderDots');
    const thumbs = document.querySelectorAll('.tour-thumb');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoplayTimer = null;

    if (counterTotal) counterTotal.textContent = totalSlides;

    // Build dots dynamically if container is empty
    if (dotsContainer && dotsContainer.children.length === 0) {
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
        dot.setAttribute('type', 'button');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => {
          stopAutoplay();
          goToSlide(i);
        });
        dotsContainer.appendChild(dot);
      }
    }

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.slider-dot') : [];
    const thumbsContainer = document.getElementById('sliderThumbs');

    const updateSlider = () => {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      if (counterCurrent) counterCurrent.textContent = currentIndex + 1;

      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });

      thumbs.forEach((thumb, idx) => {
        thumb.classList.toggle('active', idx === currentIndex);
      });

      // Safely scroll ONLY the horizontal thumbnail strip without ever scrolling the page window
      if (thumbsContainer && thumbs[currentIndex]) {
        const activeThumb = thumbs[currentIndex];
        const targetLeft = activeThumb.offsetLeft - (thumbsContainer.clientWidth / 2) + (activeThumb.offsetWidth / 2);
        thumbsContainer.scrollTo({ left: targetLeft, behavior: 'smooth' });
      }
    };

    const goToSlide = (index) => {
      if (index < 0) {
        currentIndex = totalSlides - 1;
      } else if (index >= totalSlides) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }
      updateSlider();
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        stopAutoplay();
        goToSlide(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        stopAutoplay();
        goToSlide(currentIndex + 1);
      });
    }

    thumbs.forEach((thumb, idx) => {
      thumb.addEventListener('click', () => {
        stopAutoplay();
        goToSlide(idx);
      });
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    slider.addEventListener('touchstart', (e) => {
      stopAutoplay();
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      // Ensure horizontal swipe is dominant over vertical scroll
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX > 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      }
    };

    // Keyboard navigation when slider is focused
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        stopAutoplay();
        goToSlide(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        stopAutoplay();
        goToSlide(currentIndex + 1);
      }
    });

    // Autoplay functions
    const startAutoplay = () => {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, 5000);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  };

  initTourSlider();
});
