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
   * 1. STICKY / FIXED HEADER SCROLL EFFECT
   * ------------------------------------------------------------- */
  const header = document.getElementById('header');
  const topBar = document.querySelector('.top-announcement');

  if (header) {
    let spacer = null;

    const handleHeaderScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const threshold = topBar ? topBar.offsetHeight : 40;

      if (scrollY > threshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Fail-safe fallback: if browser fails native sticky positioning (e.g. rect.top < -1 when scrolled down)
      const rect = header.getBoundingClientRect();
      if (scrollY > threshold && rect.top < -1) {
        if (!header.classList.contains('is-fixed')) {
          if (!spacer) {
            spacer = document.createElement('div');
            spacer.className = 'header-spacer';
            spacer.style.height = `${header.offsetHeight}px`;
            header.parentNode.insertBefore(spacer, header.nextSibling);
          }
          header.classList.add('is-fixed');
        }
      } else if (scrollY <= threshold && header.classList.contains('is-fixed')) {
        header.classList.remove('is-fixed');
        if (spacer && spacer.parentNode) {
          spacer.parentNode.removeChild(spacer);
          spacer = null;
        }
      }
    };

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    window.addEventListener('resize', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  }

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
  const ensureBookingModal = () => {
    let modalEl = document.getElementById('bookingModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.className = 'modal-backdrop';
      modalEl.id = 'bookingModal';
      modalEl.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" id="modalClose" aria-label="Close modal">&times;</button>
      <div class="modal-header">
        <div class="section-tag">PRIVATE TOUR BOOKING FORM</div>
        <h3 id="modalTourTitle">Book Dewa Bike Tour</h3>
        <p>Calculate your total price instantly and forward your booking details to WhatsApp.</p>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Select Cycling Tour</label>
          <select id="modalTourSelect">
            <option value="Kintamani Downhill" data-regular="550000" data-saving="350000">Kintamani Downhill Cycling</option>
            <option value="Ubud Rice Fields" data-regular="550000" data-saving="350000">Ubud Rice Fields Cycling</option>
            <option value="E-Bike Ubud Countryside" data-regular="650000" data-saving="450000">Ubud E-Bike Tour (Electric)</option>
            <option value="Cycling + River Tubing" data-regular="850000" data-saving="850000">Cycling + River Tubing Combo</option>
            <option value="Cycling + ATV Quad Bike" data-regular="950000" data-saving="950000">Cycling + ATV Quad Bike Combo</option>
            <option value="Rice Paddy Planting & Rafting" data-regular="450000" data-saving="350000">Rice Paddy Planting / Rafting</option>
          </select>
        </div>

        <div class="form-group">
          <label>Package Tier</label>
          <div class="tier-radio-group">
            <label class="radio-card selected">
              <input type="radio" name="modalTier" value="regular" checked>
              <div class="radio-info">
                <strong>Regular (All-Inclusive)</strong>
                <span>+ Hotel pickup & Indonesian lunch</span>
              </div>
            </label>
            <label class="radio-card">
              <input type="radio" name="modalTier" value="saving">
              <div class="radio-info">
                <strong>Saving (Budget)</strong>
                <span>Ride only, without lunch & transfer</span>
              </div>
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Tour Date</label>
            <input type="date" id="modalDate" required>
          </div>
          <div class="form-group">
            <label>Number of Guests</label>
            <div class="number-stepper">
              <button type="button" id="stepDec">-</button>
              <input type="number" id="modalGuests" value="2" min="1" max="50" readonly>
              <button type="button" id="stepInc">+</button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Lead Guest Name</label>
          <input type="text" id="modalName" placeholder="Your Name / Lead Guest">
        </div>

        <div class="form-group">
          <label>Hotel Pickup / Special Requests</label>
          <input type="text" id="modalHotel" placeholder="Hotel Name or Pickup Location">
        </div>

        <!-- Live Price Calculation Box -->
        <div class="price-calculation-box">
          <div class="calc-row">
            <span>Price per person:</span>
            <strong id="calcPricePerPerson">Rp 550,000</strong>
          </div>
          <div class="calc-row">
            <span>Number of guests:</span>
            <strong id="calcGuestCount">2 guests</strong>
          </div>
          <div class="calc-divider"></div>
          <div class="calc-row total-row">
            <span>Estimated Total Cost:</span>
            <div>
              <span class="total-idr" id="calcTotalIdr">Rp 1,100,000</span>
              <span class="total-usd" id="calcTotalUsd">(Approx. ~$71 USD)</span>
            </div>
          </div>
        </div>

        <button type="button" class="btn btn-primary btn-block btn-lg" id="btnSubmitModalBooking">
          <svg width="20" height="20" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
          Confirm & Book on WhatsApp
        </button>
      </div>
    </div>
      `;
      document.body.appendChild(modalEl);
    }
    return modalEl;
  };

  const modal = ensureBookingModal();
  const modalClose = document.getElementById('modalClose');

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
    const selectedTourKey = modalTourSelect ? modalTourSelect.value : 'Kintamani Downhill';
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

  // Delegate click for any .open-booking-btn anywhere across the document
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-booking-btn');
    if (btn) {
      e.preventDefault();
      const tour = btn.getAttribute('data-tour') || 'Kintamani Downhill';
      openModal(tour);
    }
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

  /* -------------------------------------------------------------
   * 8. FACILITY POPUP MODAL
   * ------------------------------------------------------------- */
  const initFacilityModal = () => {
    // 1. Initialize card sliders on .facility-card
    document.querySelectorAll('.facility-card').forEach(card => {
      const slides = card.querySelectorAll('.facility-slider-track .facility-slide');
      const dots = card.querySelectorAll('.facility-dots .dot');
      const prevBtn = card.querySelector('.facility-arrow.prev');
      const nextBtn = card.querySelector('.facility-arrow.next');

      if (slides.length > 1) {
        let currentSlide = 0;

        const setSlide = (idx) => {
          if (idx < 0) idx = slides.length - 1;
          if (idx >= slides.length) idx = 0;
          currentSlide = idx;

          slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentSlide);
          });
          dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
          });
        };

        if (prevBtn) {
          prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setSlide(currentSlide - 1);
          });
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setSlide(currentSlide + 1);
          });
        }
        dots.forEach((dot, i) => {
          dot.addEventListener('click', (e) => {
            e.stopPropagation();
            setSlide(i);
          });
        });

        // Touch swipe on card slider
        let touchStartX = 0;
        const imgContainer = card.querySelector('.facility-img');
        if (imgContainer) {
          imgContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
          }, { passive: true });
          imgContainer.addEventListener('touchend', (e) => {
            const diffX = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diffX) > 40) {
              if (diffX < 0) setSlide(currentSlide + 1);
              else setSlide(currentSlide - 1);
            }
          }, { passive: true });
        }
      }
    });

    // 2. Modal initialization
    const modal = document.getElementById('facilityModal');
    if (!modal) return;

    const modalClose = document.getElementById('facilityModalClose');
    const modalOkBtn = document.getElementById('facilityModalOkBtn');
    const modalTrack = document.getElementById('facilityModalTrack');
    const modalPrev = document.getElementById('facilityModalPrev');
    const modalNext = document.getElementById('facilityModalNext');
    const modalCounter = document.getElementById('facilityModalCounter');
    const modalTag = document.getElementById('facilityModalTag');
    const modalTitle = document.getElementById('facilityModalTitle');
    const modalDesc = document.getElementById('facilityModalDesc');

    let modalCurrentIdx = 0;
    let modalSlideImgs = [];

    const updateModalSlide = (idx) => {
      if (!modalSlideImgs.length) return;
      if (idx < 0) idx = modalSlideImgs.length - 1;
      if (idx >= modalSlideImgs.length) idx = 0;
      modalCurrentIdx = idx;

      modalSlideImgs.forEach((img, i) => {
        img.classList.toggle('active', i === modalCurrentIdx);
      });

      if (modalCounter) {
        modalCounter.textContent = `${modalCurrentIdx + 1} / ${modalSlideImgs.length}`;
      }
    };

    const openFacilityModal = (card) => {
      const cardSlides = Array.from(card.querySelectorAll('.facility-slider-track img, .facility-img img'));
      const activeCardImg = card.querySelector('.facility-slider-track img.active') || card.querySelector('.facility-img img');
      const tag = card.querySelector('.section-tag');
      const title = card.querySelector('h3');
      const detailData = card.querySelector('.facility-detail-data');

      // Populate modal slides
      if (modalTrack) {
        modalTrack.innerHTML = '';
        modalSlideImgs = [];

        cardSlides.forEach((cImg, i) => {
          const mImg = document.createElement('img');
          mImg.src = cImg.src;
          mImg.alt = cImg.alt || (title ? title.textContent : 'Facility Photo');
          if (cImg === activeCardImg) {
            mImg.classList.add('active');
            modalCurrentIdx = i;
          }
          modalTrack.appendChild(mImg);
          modalSlideImgs.push(mImg);
        });

        if (modalSlideImgs.length > 1) {
          if (modalPrev) modalPrev.style.display = 'flex';
          if (modalNext) modalNext.style.display = 'flex';
          if (modalCounter) modalCounter.style.display = 'block';
          updateModalSlide(modalCurrentIdx);
        } else {
          if (modalPrev) modalPrev.style.display = 'none';
          if (modalNext) modalNext.style.display = 'none';
          if (modalCounter) modalCounter.style.display = 'none';
          if (modalSlideImgs[0]) modalSlideImgs[0].classList.add('active');
        }
      }

      if (modalTag && tag) modalTag.textContent = tag.textContent;
      if (modalTitle && title) modalTitle.textContent = title.textContent;
      if (modalDesc && detailData) modalDesc.innerHTML = detailData.innerHTML;

      modal.classList.add('open');
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';

      const modalCard = modal.querySelector('.modal-card');
      if (modalCard) modalCard.scrollTop = 0;
    };

    const closeFacilityModal = () => {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    };

    if (modalPrev) {
      modalPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        updateModalSlide(modalCurrentIdx - 1);
      });
    }

    if (modalNext) {
      modalNext.addEventListener('click', (e) => {
        e.stopPropagation();
        updateModalSlide(modalCurrentIdx + 1);
      });
    }

    const modalSliderEl = document.getElementById('facilityModalSlider');
    if (modalSliderEl) {
      let mTouchStartX = 0;
      modalSliderEl.addEventListener('touchstart', (e) => {
        mTouchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      modalSliderEl.addEventListener('touchend', (e) => {
        const diffX = e.changedTouches[0].screenX - mTouchStartX;
        if (Math.abs(diffX) > 40) {
          if (diffX < 0) updateModalSlide(modalCurrentIdx + 1);
          else updateModalSlide(modalCurrentIdx - 1);
        }
      }, { passive: true });
    }

    document.querySelectorAll('.facility-card').forEach(card => {
      const imgWrap = card.querySelector('.facility-img');
      const openBtn = card.querySelector('.facility-open-btn');

      if (imgWrap) {
        imgWrap.addEventListener('click', (e) => {
          if (e.target.closest('.facility-arrow') || e.target.closest('.facility-dots')) return;
          openFacilityModal(card);
        });
        imgWrap.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFacilityModal(card);
          }
        });
      }

      if (openBtn) {
        openBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openFacilityModal(card);
        });
      }
    });

    if (modalClose) modalClose.addEventListener('click', closeFacilityModal);
    if (modalOkBtn) modalOkBtn.addEventListener('click', closeFacilityModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeFacilityModal();
    });

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') {
        closeFacilityModal();
      } else if (e.key === 'ArrowRight') {
        updateModalSlide(modalCurrentIdx + 1);
      } else if (e.key === 'ArrowLeft') {
        updateModalSlide(modalCurrentIdx - 1);
      }
    });
  };

  /* -------------------------------------------------------------
   * 9. TEAM MEMBER PHOTO LIGHTBOX MODAL
   * ------------------------------------------------------------- */
  const initTeamModal = () => {
    const modal = document.getElementById('teamPhotoModal');
    if (!modal) return;

    const modalClose = document.getElementById('teamModalClose');
    const modalOkBtn = document.getElementById('teamModalOkBtn');
    const modalImg = document.getElementById('teamModalImg');
    const modalBadge = document.getElementById('teamModalBadge');
    const modalName = document.getElementById('teamModalName');
    const modalRole = document.getElementById('teamModalRole');
    const modalDesc = document.getElementById('teamModalDesc');

    const openTeamModal = (avatar) => {
      const img = avatar.querySelector('img');
      const name = avatar.getAttribute('data-name') || (img ? img.alt : 'Team Member');
      const role = avatar.getAttribute('data-role') || '';
      const bio = avatar.getAttribute('data-bio') || '';
      const imgSrc = avatar.getAttribute('data-img') || (img ? img.src : '');
      const badgeClass = avatar.getAttribute('data-badge-class') || '';
      const objectPos = avatar.getAttribute('data-pos') || 'center 15%';

      if (modalImg) {
        modalImg.src = imgSrc;
        modalImg.alt = name;
        modalImg.style.objectPosition = objectPos;
      }

      if (modalBadge) {
        modalBadge.textContent = role;
        modalBadge.className = 'team-modal-badge ' + (badgeClass === 'badge-amber' ? 'badge-amber' : 'badge-orange');
      }

      if (modalName) modalName.textContent = name;
      if (modalRole) {
        modalRole.textContent = role;
        modalRole.style.color = (badgeClass === 'badge-amber' ? 'var(--accent-hover)' : 'var(--primary)');
      }
      if (modalDesc) modalDesc.textContent = bio;

      modal.classList.add('open');
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';

      const modalCard = modal.querySelector('.modal-card');
      if (modalCard) modalCard.scrollTop = 0;
    };

    const closeTeamModal = () => {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('.clickable-team-avatar').forEach(avatar => {
      avatar.addEventListener('click', () => openTeamModal(avatar));
      avatar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTeamModal(avatar);
        }
      });
    });

    if (modalClose) modalClose.addEventListener('click', closeTeamModal);
    if (modalOkBtn) modalOkBtn.addEventListener('click', closeTeamModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeTeamModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeTeamModal();
      }
    });
  };

  /* -------------------------------------------------------------
   * 10. GALLERY LIGHTBOX SLIDER MODAL
   * ------------------------------------------------------------- */
  const initGalleryLightbox = () => {
    const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');
    if (galleryItems.length === 0) return;

    let modal = document.getElementById('galleryLightboxModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'galleryLightboxModal';
      modal.className = 'lightbox-backdrop';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Photo Gallery Lightbox');
      modal.innerHTML = `
        <div class="lightbox-container">
          <button type="button" class="lightbox-close" id="lightboxClose" aria-label="Close gallery">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div class="lightbox-header-bar">
            <span class="lightbox-counter" id="lightboxCounter">1 / 1</span>
          </div>

          <button type="button" class="lightbox-nav prev" id="lightboxPrev" aria-label="Previous photo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>

          <button type="button" class="lightbox-nav next" id="lightboxNext" aria-label="Next photo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

          <div class="lightbox-stage" id="lightboxStage">
            <div class="lightbox-img-wrap" id="lightboxImgWrap">
              <img id="lightboxImg" src="" alt="Gallery photo">
            </div>
            <div class="lightbox-caption" id="lightboxCaption"></div>
            <div class="lightbox-thumbnails-wrap" id="lightboxThumbnailsWrap">
              <div class="lightbox-thumbnails" id="lightboxThumbnails" role="tablist" aria-label="Photo thumbnails"></div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const modalClose = modal.querySelector('#lightboxClose');
    const modalPrev = modal.querySelector('#lightboxPrev');
    const modalNext = modal.querySelector('#lightboxNext');
    const modalImg = modal.querySelector('#lightboxImg');
    const modalCaption = modal.querySelector('#lightboxCaption');
    const modalCounter = modal.querySelector('#lightboxCounter');
    const modalStage = modal.querySelector('#lightboxStage');
    const modalThumbnails = modal.querySelector('#lightboxThumbnails');

    let currentList = [];
    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    const getVisibleGalleryItems = () => {
      const items = Array.from(document.querySelectorAll('.gallery-grid .gallery-item'));
      return items.filter(item => {
        const style = window.getComputedStyle(item);
        return style.display !== 'none' && item.offsetParent !== null;
      });
    };

    const renderThumbnails = () => {
      if (!modalThumbnails) return;
      modalThumbnails.innerHTML = '';

      currentList.forEach((item, idx) => {
        const img = item.querySelector('img');
        const overlaySpan = item.querySelector('.gallery-overlay span');
        const captionText = overlaySpan ? overlaySpan.textContent.trim() : (img ? img.alt : `Photo ${idx + 1}`);
        const src = img ? (img.getAttribute('src') || '') : '';

        const thumbBtn = document.createElement('button');
        thumbBtn.type = 'button';
        thumbBtn.className = `lightbox-thumb${idx === currentIndex ? ' active' : ''}`;
        thumbBtn.setAttribute('aria-label', `Go to photo ${idx + 1}: ${captionText}`);
        thumbBtn.setAttribute('data-index', idx);
        thumbBtn.innerHTML = `<img src="${src}" alt="${captionText}" loading="lazy">`;

        thumbBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (idx !== currentIndex) {
            const dir = idx > currentIndex ? 1 : -1;
            updateSlide(idx, dir);
          }
        });

        modalThumbnails.appendChild(thumbBtn);
      });
    };

    const updateSlide = (index, direction = 0) => {
      if (!currentList.length) return;
      if (index < 0) index = currentList.length - 1;
      if (index >= currentList.length) index = 0;
      currentIndex = index;

      const currentItem = currentList[currentIndex];
      const img = currentItem.querySelector('img');
      const overlaySpan = currentItem.querySelector('.gallery-overlay span');
      const captionText = overlaySpan ? overlaySpan.textContent.trim() : (img ? img.alt : '');
      const src = img ? (img.getAttribute('src') || '') : '';

      if (modalImg) {
        modalImg.style.opacity = '0';
        modalImg.style.transform = direction !== 0 ? `translateX(${direction * 25}px) scale(0.96)` : 'scale(0.96)';
        
        setTimeout(() => {
          modalImg.src = src;
          modalImg.alt = captionText;
          modalImg.onload = () => {
            modalImg.style.opacity = '1';
            modalImg.style.transform = 'translateX(0) scale(1)';
          };
          if (modalImg.complete) {
            modalImg.style.opacity = '1';
            modalImg.style.transform = 'translateX(0) scale(1)';
          }
        }, 120);
      }

      if (modalCaption) {
        modalCaption.textContent = captionText;
      }

      if (modalCounter) {
        modalCounter.textContent = `${currentIndex + 1} / ${currentList.length}`;
      }

      if (modalThumbnails) {
        const thumbs = modalThumbnails.querySelectorAll('.lightbox-thumb');
        thumbs.forEach((thumb, idx) => {
          if (idx === currentIndex) {
            thumb.classList.add('active');
            thumb.setAttribute('aria-current', 'true');
            thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          } else {
            thumb.classList.remove('active');
            thumb.removeAttribute('aria-current');
          }
        });
      }
    };

    const openLightbox = (item) => {
      currentList = getVisibleGalleryItems();
      if (!currentList.length) currentList = Array.from(galleryItems);

      const foundIndex = currentList.indexOf(item);
      currentIndex = foundIndex !== -1 ? foundIndex : 0;

      modal.classList.add('open');
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';

      renderThumbnails();
      updateSlide(currentIndex);
    };

    const closeLightbox = () => {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      if (modalImg) modalImg.src = '';
    };

    const nextSlide = () => {
      updateSlide(currentIndex + 1, 1);
    };

    const prevSlide = () => {
      updateSlide(currentIndex - 1, -1);
    };

    galleryItems.forEach(item => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      const titleSpan = item.querySelector('.gallery-overlay span');
      if (titleSpan) {
        item.setAttribute('aria-label', `View photo: ${titleSpan.textContent.trim()}`);
      }

      item.addEventListener('click', () => openLightbox(item));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(item);
        }
      });
    });

    if (modalClose) modalClose.addEventListener('click', closeLightbox);
    if (modalNext) modalNext.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });
    if (modalPrev) modalPrev.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });

    modal.addEventListener('click', (e) => {
      if (e.target.closest('.lightbox-thumbnails-wrap') || e.target.closest('.lightbox-img-wrap')) {
        return;
      }
      if (e.target === modal || e.target.classList.contains('lightbox-container') || e.target === modalStage) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    });

    modal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diffX = touchEndX - touchStartX;
      if (Math.abs(diffX) > 40) {
        if (diffX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }, { passive: true });
  };

  initTourSlider();
  initFacilityModal();
  initTeamModal();
  initGalleryLightbox();
});

