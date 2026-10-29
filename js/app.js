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
      title: 'Kintamani Downhill Cycling Tour (Regular)',
      isEBike: false,
      isSaving: false
    },
    'Ubud Rice Fields': {
      title: 'Ubud Rice Fields & Village Tour (Regular)',
      isEBike: false,
      isSaving: false
    },
    'E-Bike Ubud Countryside': {
      title: 'Ubud E-Bike Countryside Tour (Regular)',
      isEBike: true,
      isSaving: false
    },
    'Kintamani Downhill (Saving)': {
      title: 'Kintamani Downhill Cycling (Saving Package)',
      isEBike: false,
      isSaving: true
    },
    'Ubud Rice Fields (Saving)': {
      title: 'Ubud Rice Fields & Village Tour (Saving Package)',
      isEBike: false,
      isSaving: true
    },
    'E-Bike Ubud Countryside (Saving)': {
      title: 'Ubud E-Bike Tour (Saving Package)',
      isEBike: true,
      isSaving: true
    },
    'Cycling + River Tubing': {
      title: 'Cycling + River Tubing Adventure',
      comboPrice: 850000
    },
    'Cycling + ATV Quad Bike': {
      title: 'Cycling + ATV Quad Bike Adventure',
      comboPrice: 950000
    },
    'Rice Paddy Planting & Rafting': {
      title: 'Rice Paddy Planting & Ayung Rafting',
      comboPrice: 450000
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
   * 1.1 DESKTOP STICKY SIDEBAR SCROLL SYNC (ZERO JITTER)
   * ------------------------------------------------------------- */
  const initDesktopStickySidebar = () => {
    const sidebarCards = document.querySelectorAll('.tour-sidebar-card');
    if (!sidebarCards.length) return;

    sidebarCards.forEach(card => {
      // Ensure no transform is applied, letting native GPU sticky run at 120Hz with zero stutter or ghosting
      if (card.style.transform) {
        card.style.transform = '';
      }

      const grid = card.closest('.tour-detail-grid');
      if (!grid) return;

      let isHovered = false;
      card.addEventListener('mouseenter', () => { isHovered = true; });
      card.addEventListener('mouseleave', () => { isHovered = false; });

      let ticking = false;

      const updateScrollSync = () => {
        if (window.innerWidth <= 1024) return;

        const headerEl = document.getElementById('header');
        const headerHeight = headerEl ? headerEl.offsetHeight : 72;
        const topOffset = headerHeight + 16;
        const gridRect = grid.getBoundingClientRect();

        // Dynamic Scroll Sync: saat bagian kiri discroll turun, bagian kanan ikut turun menampilkan tombol booking
        if (!isHovered) {
          const maxInternalScroll = card.scrollHeight - card.clientHeight;
          if (maxInternalScroll > 0) {
            if (gridRect.top >= topOffset) {
              card.scrollTop = 0;
            } else {
              const scrollPast = topOffset - gridRect.top;
              const syncDistance = 420;
              const progress = Math.min(1, Math.max(0, scrollPast / syncDistance));
              card.scrollTop = Math.round(progress * maxInternalScroll);
            }
          }
        }
      };

      const onScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateScrollSync();
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      window.addEventListener('load', updateScrollSync);
      updateScrollSync();
    });
  };

  initDesktopStickySidebar();

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
  // Google Apps Script Web App URL for Google Sheets & Email notifications
  const GOOGLE_SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwbjBCkaDQPV8kjjuO78uR_lKJ0_6Sswa7MX9e5b_sQGNh-UNeMXlzgLjxM4l5EO_5nYw/exec';

  const ensureBookingModal = () => {
    let modalEl = document.getElementById('bookingModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.className = 'modal-backdrop';
      modalEl.id = 'bookingModal';
      modalEl.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" id="modalClose" aria-label="Close modal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="modal-header">
        <div class="section-tag">PRIVATE TOUR BOOKING FORM</div>
        <h3 id="modalTourTitle">Book Dewa Bike Tour</h3>
        <p>Calculate your total price instantly and forward your booking details via WhatsApp or Email.</p>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Select Cycling Tour</label>
          <select id="modalTourSelect">
            <optgroup label="Regular Packages (Inc. Lunch &amp; Hotel Transfer)">
              <option value="Kintamani Downhill">Kintamani Downhill Cycling (Regular)</option>
              <option value="Ubud Rice Fields">Ubud Rice Fields Cycling (Regular)</option>
              <option value="E-Bike Ubud Countryside">Ubud E-Bike Tour (Regular)</option>
              <option value="Cycling + River Tubing">Cycling + River Tubing Combo</option>
              <option value="Cycling + ATV Quad Bike">Cycling + ATV Quad Bike Combo</option>
              <option value="Rice Paddy Planting &amp; Rafting">Rice Paddy Planting &amp; Rafting</option>
            </optgroup>
            <optgroup label="Saving Packages (Ride Only, Without Lunch &amp; Transfer)">
              <option value="Kintamani Downhill (Saving)">Kintamani Downhill (Saving Package)</option>
              <option value="Ubud Rice Fields (Saving)">Ubud Rice Fields (Saving Package)</option>
              <option value="E-Bike Ubud Countryside (Saving)">Ubud E-Bike Tour (Saving Package)</option>
            </optgroup>
          </select>
        </div>

        <div class="form-group" id="packageTierGroup">
          <label>Package Tier</label>
          <div class="tier-radio-group">
            <label class="radio-card selected" data-tier-card="private">
              <input type="radio" name="modalTier" value="private" checked>
              <div class="radio-info">
                <strong>PRIVATE</strong>
                <span id="tierDescPrivate">Without sharing other group</span>
              </div>
            </label>
            <label class="radio-card" data-tier-card="sharing">
              <input type="radio" name="modalTier" value="sharing">
              <div class="radio-info">
                <strong>SHARING</strong>
                <span id="tierDescSharing">With a small group</span>
              </div>
            </label>
          </div>
        </div>

        <div class="datetime-row">
          <div class="form-group">
            <label for="modalDate">Tour Date</label>
            <input type="date" id="modalDate" required>
          </div>
          <div class="form-group">
            <label for="modalTime" id="labelModalTime">Preferred Pick-Up Time</label>
            <div class="time-trigger-box" id="timeTriggerBox" tabindex="0" role="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Select preferred pick-up time">
              <span class="time-trigger-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </span>
              <input type="text" id="modalTime" class="time-trigger-input" placeholder="e.g. 08:30 AM" value="08:30 AM" readonly required>
            </div>
          </div>
        </div>

        <div class="form-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <label style="margin: 0; font-weight: 600;">Number of Guests by Age</label>
            <span class="total-guests-pill" id="calcTotalGuestsPill">2 Guests</span>
          </div>

          <div class="age-category-list">
            <!-- 1. Adult -->
            <div class="age-row" id="rowAdult">
              <div class="age-meta">
                <span class="age-name" id="nameLabelAdult">Adults</span>
                <span class="age-desc" id="descLabelAdult">Age 12+ years</span>
                <span class="age-price" id="priceLabelAdult">Rp 600.000/pax</span>
              </div>
              <div class="number-stepper compact">
                <button type="button" class="age-step-btn" data-target="guestAdult" data-dir="-">&minus;</button>
                <input type="number" id="guestAdult" value="2" min="1" max="50" readonly>
                <button type="button" class="age-step-btn" data-target="guestAdult" data-dir="+">&plus;</button>
              </div>
            </div>

            <!-- 2. Child 8 - 11 yrs -->
            <div class="age-row" id="row8_11">
              <div class="age-meta">
                <span class="age-name" id="nameLabel8_11">Children</span>
                <span class="age-desc" id="descLabel8_11">Age 8 &ndash; 11 years old</span>
                <span class="age-price" id="priceLabel8_11">Rp 400.000/pax</span>
              </div>
              <div class="number-stepper compact">
                <button type="button" class="age-step-btn" data-target="guest8_11" data-dir="-">&minus;</button>
                <input type="number" id="guest8_11" value="0" min="0" max="50" readonly>
                <button type="button" class="age-step-btn" data-target="guest8_11" data-dir="+">&plus;</button>
              </div>
            </div>

            <!-- 3. Child 6, 7 yrs -->
            <div class="age-row" id="row6_7">
              <div class="age-meta">
                <span class="age-name" id="nameLabel6_7">Children</span>
                <span class="age-desc" id="descLabel6_7">Age 6 &ndash; 7 years old</span>
                <span class="age-price" id="priceLabel6_7">Rp 300.000/pax</span>
              </div>
              <div class="number-stepper compact">
                <button type="button" class="age-step-btn" data-target="guest6_7" data-dir="-">&minus;</button>
                <input type="number" id="guest6_7" value="0" min="0" max="50" readonly>
                <button type="button" class="age-step-btn" data-target="guest6_7" data-dir="+">&plus;</button>
              </div>
            </div>

            <!-- 4. Child 3, 4, 5 yrs -->
            <div class="age-row" id="row3_5">
              <div class="age-meta">
                <span class="age-name" id="nameLabel3_5">Young Children</span>
                <span class="age-desc" id="descLabel3_5">Age 3, 4, 5 years old</span>
                <span class="age-price" id="priceLabel3_5">Rp 200.000/pax</span>
              </div>
              <div class="number-stepper compact">
                <button type="button" class="age-step-btn" data-target="guest3_5" data-dir="-">&minus;</button>
                <input type="number" id="guest3_5" value="0" min="0" max="50" readonly>
                <button type="button" class="age-step-btn" data-target="guest3_5" data-dir="+">&plus;</button>
              </div>
            </div>

            <!-- 5. Infant 1, 2 yrs -->
            <div class="age-row" id="row1_2">
              <div class="age-meta">
                <span class="age-name" id="nameLabel1_2">Infants / Toddlers</span>
                <span class="age-desc" id="descLabel1_2">Age 1 &ndash; 2 years old</span>
                <span class="age-price" id="priceLabel1_2">Rp 50.000/pax</span>
              </div>
              <div class="number-stepper compact">
                <button type="button" class="age-step-btn" data-target="guest1_2" data-dir="-">&minus;</button>
                <input type="number" id="guest1_2" value="0" min="0" max="50" readonly>
                <button type="button" class="age-step-btn" data-target="guest1_2" data-dir="+">&plus;</button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Lead Guest Name <span style="color:#e53e3e;">*</span></label>
          <input type="text" id="modalName" placeholder="Your Name / Lead Guest" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Email Address <span style="color:#e53e3e;">*</span></label>
            <input type="email" id="modalEmail" placeholder="e.g. name@example.com" required>
          </div>
          <div class="form-group">
            <label>Phone / WhatsApp / Telegram (+ ..) <span style="color:#e53e3e;">*</span></label>
            <input type="tel" id="modalPhone" placeholder="e.g. +61 412 345 678" required>
          </div>
        </div>

        <div class="form-group">
          <label>Nationality <span style="color:#e53e3e;">*</span></label>
          <input type="text" id="modalNationality" placeholder="e.g. Australia, Germany, Indonesia" required>
        </div>

        <div class="form-group">
          <label>Rider Height(s) <span style="color:#e53e3e;">*</span></label>
          <input type="text" id="modalHeight" placeholder="e.g. Rider 1: 175 cm, Rider 2: 162 cm" required>
          <div class="bike-size-guide" id="bikeSizeGuide">
            <div class="bike-size-header">
              <span class="bike-icon">🚲</span>
              <span id="bikeSizeTitle">Normal Bike Sizes: S to XL</span>
            </div>
            <span class="bike-size-hint" id="bikeSizeHint">Normal bikes are available in sizes S to XL. Please specify each rider's height so we can prepare the perfect bike frame.</span>
          </div>
        </div>

        <div class="form-group" id="groupHotel">
          <label>Hotel Pickup / Special Requests</label>
          <input type="text" id="modalHotel" placeholder="Hotel Name or Pickup Location">
        </div>

        <!-- Live Price Calculation Box -->
        <div class="price-calculation-box">
          <div class="calc-breakdown-items" id="calcBreakdownList">
            <div class="calc-row">
              <span>Adults (2x Rp 600.000):</span>
              <strong>Rp 1.200.000</strong>
            </div>
            <div class="calc-row" style="color: var(--text-muted); font-size: 0.82rem;">
              <span>Total participants:</span>
              <strong>2 guests</strong>
            </div>
          </div>
          <div class="calc-divider"></div>
          <div class="calc-row total-row">
            <span>Estimated Total Cost:</span>
            <div>
              <span class="total-idr" id="calcTotalIdr">Rp 1.200.000</span>
              <span class="total-usd" id="calcTotalUsd">(Approx. ~$77 USD)</span>
            </div>
          </div>
        </div>

        <!-- Booking Action Buttons -->
        <div class="modal-booking-actions">
          <button type="button" class="btn btn-booking-now" id="btnSubmitModalDirect">
            Booking Now
          </button>
          <div class="modal-secondary-actions">
            <button type="button" class="btn btn-whatsapp" id="btnSubmitModalBooking">
              <svg width="18" height="18" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
              <span>Confirm book on Whatsapp</span>
            </button>
            <button type="button" class="btn btn-email" id="btnSubmitModalEmail">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <span>Confirm book via Email</span>
            </button>
          </div>
        </div>
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
  const modalEmail = document.getElementById('modalEmail');
  const modalPhone = document.getElementById('modalPhone');
  const modalNationality = document.getElementById('modalNationality');
  const modalHeight = document.getElementById('modalHeight');
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
    const selectedTourKey = (modalTourSelect && modalTourSelect.value) ? modalTourSelect.value : 'Kintamani Downhill';
    const pkg = packageData[selectedTourKey] || {
      isEBike: false,
      isSaving: false
    };

    const isEBike = !!pkg.isEBike;
    const isSaving = !!pkg.isSaving;
    const comboPrice = pkg.comboPrice;

    let selectedTier = 'private';
    const checkedRadio = document.querySelector('input[name="modalTier"]:checked');
    if (checkedRadio) selectedTier = checkedRadio.value;

    // Dynamic bike sizing guide based on isEBike
    const bikeSizeGuide = document.getElementById('bikeSizeGuide');
    const bikeSizeTitle = document.getElementById('bikeSizeTitle');
    const bikeSizeHint = document.getElementById('bikeSizeHint');

    if (bikeSizeGuide && bikeSizeTitle && bikeSizeHint) {
      if (isEBike) {
        bikeSizeGuide.classList.add('ebike-mode');
        bikeSizeTitle.innerHTML = '⚡ E-Bike Sizes: S and M only';
        bikeSizeHint.textContent = 'Electric bikes (E-Bikes) are available in sizes S and M only. Please specify each rider\'s height so we can prepare the perfect bike frame.';
      } else {
        bikeSizeGuide.classList.remove('ebike-mode');
        bikeSizeTitle.innerHTML = '🚲 Normal Bike Sizes: S to XL';
        bikeSizeHint.textContent = 'Normal bikes are available in sizes S to XL. Please specify each rider\'s height so we can prepare the perfect bike frame.';
      }
    }

    // Toggle Hotel Pickup & Time Label: Hidden for all Saving Packages, visible for Regular / Combo Packages
    const groupHotel = document.getElementById('groupHotel');
    if (groupHotel) {
      groupHotel.style.display = isSaving ? 'none' : 'block';
    }
    const labelModalTime = document.getElementById('labelModalTime');
    if (labelModalTime) {
      labelModalTime.textContent = isSaving ? 'Preferred Tour Time' : 'Preferred Pick-Up Time';
    }

    // References to row elements
    const rowAdult = document.getElementById('rowAdult');
    const row8_11 = document.getElementById('row8_11');
    const row6_7 = document.getElementById('row6_7');
    const row3_5 = document.getElementById('row3_5');
    const row1_2 = document.getElementById('row1_2');

    // References to labels
    const nameLabelAdult = document.getElementById('nameLabelAdult');
    const descLabelAdult = document.getElementById('descLabelAdult');
    const priceLabelAdult = document.getElementById('priceLabelAdult');

    const nameLabel8_11 = document.getElementById('nameLabel8_11');
    const descLabel8_11 = document.getElementById('descLabel8_11');
    const priceLabel8_11 = document.getElementById('priceLabel8_11');

    const nameLabel6_7 = document.getElementById('nameLabel6_7');
    const descLabel6_7 = document.getElementById('descLabel6_7');
    const priceLabel6_7 = document.getElementById('priceLabel6_7');

    const nameLabel3_5 = document.getElementById('nameLabel3_5');
    const descLabel3_5 = document.getElementById('descLabel3_5');
    const priceLabel3_5 = document.getElementById('priceLabel3_5');

    const nameLabel1_2 = document.getElementById('nameLabel1_2');
    const descLabel1_2 = document.getElementById('descLabel1_2');
    const priceLabel1_2 = document.getElementById('priceLabel1_2');

    // Configure category visibility & label descriptions based on tour type
    if (comboPrice) {
      if (row8_11) row8_11.style.display = 'none';
      if (row6_7) row6_7.style.display = 'none';
      if (row3_5) row3_5.style.display = 'none';
      if (row1_2) row1_2.style.display = 'none';
      if (rowAdult) rowAdult.style.display = 'flex';
      if (nameLabelAdult) nameLabelAdult.textContent = 'Guests (Combo Rider)';
      if (descLabelAdult) descLabelAdult.textContent = 'Minimum 2 pax for combo';
    } else if (isEBike && !isSaving) {
      // E-Bike Regular (Gambar 1)
      if (row8_11) row8_11.style.display = 'none';
      if (row6_7) row6_7.style.display = 'none';
      if (row3_5) row3_5.style.display = 'flex';
      if (row1_2) row1_2.style.display = 'flex';
      if (rowAdult) rowAdult.style.display = 'flex';

      if (nameLabelAdult) nameLabelAdult.textContent = 'Adults (Solo E-Bike)';
      if (descLabelAdult) descLabelAdult.textContent = 'Age 12+ years';
      if (nameLabel3_5) nameLabel3_5.textContent = 'Children (Baby Seat)';
      if (descLabel3_5) descLabel3_5.textContent = 'Age 3, 4 years old (middle baby seat)';
      if (nameLabel1_2) nameLabel1_2.textContent = 'Infants (Baby Seat)';
      if (descLabel1_2) descLabel1_2.textContent = 'Age 1, 2 years old (middle baby seat)';
    } else if (isEBike && isSaving) {
      // E-Bike Saving (Gambar 3)
      if (row8_11) row8_11.style.display = 'none';
      if (row6_7) row6_7.style.display = 'none';
      if (row3_5) row3_5.style.display = 'none';
      if (row1_2) row1_2.style.display = 'flex';
      if (rowAdult) rowAdult.style.display = 'flex';

      if (nameLabelAdult) nameLabelAdult.textContent = 'Adults / Over 11 yrs';
      if (descLabelAdult) descLabelAdult.textContent = 'Over 11 years of age';
      if (nameLabel1_2) nameLabel1_2.textContent = 'Baby / Toddler (Baby Seat)';
      if (descLabel1_2) descLabel1_2.textContent = 'Age 1, 2, 3 years old (baby seat)';
    } else if (!isEBike && isSaving) {
      // Normal Bike Saving (Gambar 2)
      if (rowAdult) rowAdult.style.display = 'flex';
      if (row8_11) row8_11.style.display = 'flex';
      if (row6_7) row6_7.style.display = 'flex';
      if (row3_5) row3_5.style.display = 'flex';
      if (row1_2) row1_2.style.display = 'flex';

      if (nameLabelAdult) nameLabelAdult.textContent = 'Adults';
      if (descLabelAdult) descLabelAdult.textContent = 'Age 12+ years';
      if (nameLabel8_11) nameLabel8_11.textContent = 'Child (Under 11 yo)';
      if (descLabel8_11) descLabel8_11.textContent = 'Age 8 – 11 years old';
      if (nameLabel6_7) nameLabel6_7.textContent = 'Young Child (3-7 yo)';
      if (descLabel6_7) descLabel6_7.textContent = 'Age 6 – 7 years old';
      if (nameLabel3_5) nameLabel3_5.textContent = 'Young Child (3-7 yo)';
      if (descLabel3_5) descLabel3_5.textContent = 'Age 3, 4, 5 years old';
      if (nameLabel1_2) nameLabel1_2.textContent = 'Infants / Toddlers';
      if (descLabel1_2) descLabel1_2.textContent = 'Age 1 and 2 years old';
    } else {
      // Normal Bike Regular
      if (rowAdult) rowAdult.style.display = 'flex';
      if (row8_11) row8_11.style.display = 'flex';
      if (row6_7) row6_7.style.display = 'flex';
      if (row3_5) row3_5.style.display = 'flex';
      if (row1_2) row1_2.style.display = 'flex';

      if (nameLabelAdult) nameLabelAdult.textContent = 'Adults';
      if (descLabelAdult) descLabelAdult.textContent = 'Age 12+ years';
      if (nameLabel8_11) nameLabel8_11.textContent = 'Children';
      if (descLabel8_11) descLabel8_11.textContent = 'Age 8 – 11 years old';
      if (nameLabel6_7) nameLabel6_7.textContent = 'Children';
      if (descLabel6_7) descLabel6_7.textContent = 'Age 6 – 7 years old';
      if (nameLabel3_5) nameLabel3_5.textContent = 'Young Children';
      if (descLabel3_5) descLabel3_5.textContent = 'Age 3, 4, 5 years old';
      if (nameLabel1_2) nameLabel1_2.textContent = 'Infants / Toddlers';
      if (descLabel1_2) descLabel1_2.textContent = 'Age 1 – 2 years old';
    }

    // Read participant counts (ignore hidden rows)
    const nAdult = parseInt(document.getElementById('guestAdult')?.value || '1', 10);
    const n8_11 = (row8_11 && row8_11.style.display !== 'none') ? parseInt(document.getElementById('guest8_11')?.value || '0', 10) : 0;
    const n6_7 = (row6_7 && row6_7.style.display !== 'none') ? parseInt(document.getElementById('guest6_7')?.value || '0', 10) : 0;
    const n3_5 = (row3_5 && row3_5.style.display !== 'none') ? parseInt(document.getElementById('guest3_5')?.value || '0', 10) : 0;
    const n1_2 = (row1_2 && row1_2.style.display !== 'none') ? parseInt(document.getElementById('guest1_2')?.value || '0', 10) : 0;

    const totalGuests = nAdult + n8_11 + n6_7 + n3_5 + n1_2;

    // Update pill badge
    const pill = document.getElementById('calcTotalGuestsPill');
    if (pill) {
      pill.textContent = `${totalGuests} ${totalGuests > 1 ? 'Guests' : 'Guest'}`;
    }

    // Determine unit price per category
    let pAdult = 600000;
    let p8_11 = 0;
    let p6_7 = 0;
    let p3_5 = 0;
    let p1_2 = 0;

    if (comboPrice) {
      pAdult = comboPrice;
      p8_11 = comboPrice;
      p6_7 = comboPrice;
      p3_5 = comboPrice;
      p1_2 = 0;
    } else if (isEBike && !isSaving) {
      // E-Bike Regular (Gambar 1)
      if (selectedTier === 'private') {
        pAdult = (totalGuests === 1 && nAdult === 1) ? 650000 : 600000;
        p3_5 = 200000;
        p1_2 = 50000;
      } else {
        // sharing
        pAdult = 550000;
        p3_5 = 150000;
        p1_2 = 50000;
      }
    } else if (isEBike && isSaving) {
      // E-Bike Saving (Gambar 3)
      if (selectedTier === 'private') {
        pAdult = 450000;
        p1_2 = 50000;
      } else {
        // sharing
        pAdult = 400000;
        p1_2 = 50000;
      }
    } else if (!isEBike && isSaving) {
      // Normal Bike Saving (Gambar 2)
      if (selectedTier === 'private') {
        pAdult = 400000;
        p8_11 = 100000;
        p6_7 = 75000;
        p3_5 = 75000;
        p1_2 = 50000;
      } else {
        // sharing
        pAdult = 350000;
        p8_11 = 100000;
        p6_7 = 75000;
        p3_5 = 75000;
        p1_2 = 50000;
      }
    } else {
      // Normal Bike Regular
      if (selectedTier === 'private') {
        pAdult = (totalGuests === 1 && nAdult === 1) ? 650000 : 600000;
        p8_11 = 400000;
        p6_7 = 300000;
        p3_5 = 200000;
        p1_2 = 50000;
      } else {
        // sharing
        pAdult = 550000;
        p8_11 = 350000;
        p6_7 = 250000;
        p3_5 = 150000;
        p1_2 = 0; // Free
      }
    }

    // Update row price labels
    if (priceLabelAdult) {
      priceLabelAdult.textContent = formatIDR(pAdult) + ((selectedTier === 'private' && !isSaving && !comboPrice && totalGuests === 1) ? ' (1 pax)' : '/pax');
    }
    if (priceLabel8_11) priceLabel8_11.textContent = formatIDR(p8_11) + '/pax';
    if (priceLabel6_7) priceLabel6_7.textContent = formatIDR(p6_7) + '/pax';
    if (priceLabel3_5) priceLabel3_5.textContent = formatIDR(p3_5) + '/pax';
    if (priceLabel1_2) priceLabel1_2.textContent = p1_2 === 0 ? 'Free' : (formatIDR(p1_2) + (isEBike ? '' : '/pax'));

    // Calculate costs
    const costAdult = nAdult * pAdult;
    const cost8_11 = n8_11 * p8_11;
    const cost6_7 = n6_7 * p6_7;
    const cost3_5 = n3_5 * p3_5;
    const cost1_2 = n1_2 * p1_2;

    const totalIDR = costAdult + cost8_11 + cost6_7 + cost3_5 + cost1_2;
    const totalUSD = Math.round(totalIDR / USD_RATE);

    // Update itemized breakdown in the calculation box
    const listEl = document.getElementById('calcBreakdownList');
    if (listEl) {
      let html = '';
      if (nAdult > 0) {
        const titleAdult = nameLabelAdult?.textContent || 'Adults';
        html += `<div class="calc-row"><span>${titleAdult} (${nAdult}x ${formatIDR(pAdult)}):</span><strong>${formatIDR(costAdult)}</strong></div>`;
      }
      if (n8_11 > 0) {
        const title8_11 = nameLabel8_11?.textContent || 'Child (8-11 yo)';
        html += `<div class="calc-row"><span>${title8_11} (${n8_11}x ${formatIDR(p8_11)}):</span><strong>${formatIDR(cost8_11)}</strong></div>`;
      }
      if (n6_7 > 0) {
        const title6_7 = nameLabel6_7?.textContent || 'Child (6-7 yo)';
        html += `<div class="calc-row"><span>${title6_7} (${n6_7}x ${formatIDR(p6_7)}):</span><strong>${formatIDR(cost6_7)}</strong></div>`;
      }
      if (n3_5 > 0) {
        const title3_5 = nameLabel3_5?.textContent || 'Child (3-5 yo)';
        html += `<div class="calc-row"><span>${title3_5} (${n3_5}x ${formatIDR(p3_5)}):</span><strong>${formatIDR(cost3_5)}</strong></div>`;
      }
      if (n1_2 > 0) {
        const title1_2 = nameLabel1_2?.textContent || 'Infant (1-2 yo)';
        html += `<div class="calc-row"><span>${title1_2} (${n1_2}x ${p1_2 === 0 ? 'Free' : formatIDR(p1_2)}):</span><strong>${p1_2 === 0 ? 'Free' : formatIDR(cost1_2)}</strong></div>`;
      }
      html += `<div class="calc-row" style="color: var(--text-muted); font-size: 0.82rem;"><span>Total participants:</span><strong>${totalGuests} ${totalGuests > 1 ? 'guests' : 'guest'}</strong></div>`;
      listEl.innerHTML = html;
    }

    if (calcTotalIdr) calcTotalIdr.textContent = formatIDR(totalIDR);
    if (calcTotalUsd) calcTotalUsd.textContent = `(Approx. ~$${totalUSD} USD)`;
  };

  // Open Modal logic
  const openModal = (tourKey = 'Kintamani Downhill', tier = 'private') => {
    // If on a saving package page, automatically ensure saving variant is selected
    if (window.location.pathname.includes('saving-packages') && !tourKey.includes('(Saving)')) {
      tourKey = `${tourKey} (Saving)`;
      tier = 'saving';
    } else if (tier === 'saving' && !tourKey.includes('(Saving)')) {
      tourKey = `${tourKey} (Saving)`;
    }

    if (modalTourSelect) {
      if (packageData[tourKey]) {
        modalTourSelect.value = tourKey;
      } else {
        modalTourSelect.value = 'Kintamani Downhill';
      }
      if (modalTourTitle) {
        modalTourTitle.textContent = `Book: ${packageData[modalTourSelect.value]?.title || tourKey}`;
      }
    }

    // Set tier radio
    const targetTier = (tier === 'sharing') ? 'sharing' : 'private';
    const radioTarget = document.querySelector(`input[name="modalTier"][value="${targetTier}"]`);
    if (radioTarget) radioTarget.checked = true;

    document.querySelectorAll('#bookingModal .radio-card').forEach(card => {
      const input = card.querySelector('input');
      if (input && input.value === targetTier) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    recalculateModal();
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const modalCard = modal.querySelector('.modal-card');
    if (modalCard) {
      modalCard.scrollTop = 0;
      modalCard.scrollLeft = 0;
    }
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  };

  // Delegate click for any .open-booking-btn anywhere across the document
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-booking-btn');
    if (btn) {
      e.preventDefault();
      const tour = btn.getAttribute('data-tour') || 'Kintamani Downhill';
      const tier = btn.getAttribute('data-tier') || 'regular';
      openModal(tour, tier);
    }
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Prevent background scroll and close when clicking outside card
  if (modal) {
    modal.addEventListener('wheel', (e) => {
      if (e.target === modal) {
        e.preventDefault();
      }
    }, { passive: false });

    modal.addEventListener('touchmove', (e) => {
      if (e.target === modal) {
        e.preventDefault();
      }
    }, { passive: false });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Stepper increment / decrement for age categories
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.age-step-btn');
    if (btn) {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const dir = btn.getAttribute('data-dir');
      const input = document.getElementById(targetId);
      if (input) {
        let val = parseInt(input.value, 10) || 0;
        const min = parseInt(input.getAttribute('min') || '0', 10);
        const max = parseInt(input.getAttribute('max') || '50', 10);
        if (dir === '+' && val < max) {
          input.value = val + 1;
          recalculateModal();
        } else if (dir === '-' && val > min) {
          // For adults: prevent reducing to 0 if no other guests are selected
          if (targetId === 'guestAdult' && val === 1) {
            const n8_11 = parseInt(document.getElementById('guest8_11')?.value || '0', 10);
            const n6_7 = parseInt(document.getElementById('guest6_7')?.value || '0', 10);
            const n3_5 = parseInt(document.getElementById('guest3_5')?.value || '0', 10);
            const n1_2 = parseInt(document.getElementById('guest1_2')?.value || '0', 10);
            if (n8_11 + n6_7 + n3_5 + n1_2 === 0) return;
          }
          input.value = val - 1;
          recalculateModal();
        }
      }
    }
  });

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
  document.addEventListener('change', (e) => {
    if (e.target && e.target.name === 'modalTier') {
      document.querySelectorAll('#bookingModal .radio-card').forEach(card => card.classList.remove('selected'));
      const card = e.target.closest('.radio-card');
      if (card) card.classList.add('selected');
      recalculateModal();
    }
  });

  // Helper to extract current modal booking details
  const getBookingDetails = () => {
    const tourKey = (modalTourSelect && modalTourSelect.value) ? modalTourSelect.value : 'Kintamani Downhill';
    const pkg = packageData[tourKey] || {};
    const tourName = pkg.title || tourKey;
    let selectedTier = 'private';
    const checkedRadio = document.querySelector('input[name="modalTier"]:checked');
    if (checkedRadio) selectedTier = checkedRadio.value;
    
    const isSaving = !!pkg.isSaving;
    let tierLabel = (selectedTier === 'private') 
      ? 'PRIVATE (Without sharing other group)'
      : 'SHARING (With a small group)';
    if (isSaving) {
      tierLabel += ' [Saving Package - Ride Only]';
    } else if (!pkg.comboPrice) {
      tierLabel += ' [Regular Package - Inc. Lunch & Hotel Transfer]';
    }

    const row8_11 = document.getElementById('row8_11');
    const row6_7 = document.getElementById('row6_7');
    const row3_5 = document.getElementById('row3_5');
    const row1_2 = document.getElementById('row1_2');

    const nAdult = parseInt(document.getElementById('guestAdult')?.value || '1', 10);
    const n8_11 = (row8_11 && row8_11.style.display !== 'none') ? parseInt(document.getElementById('guest8_11')?.value || '0', 10) : 0;
    const n6_7 = (row6_7 && row6_7.style.display !== 'none') ? parseInt(document.getElementById('guest6_7')?.value || '0', 10) : 0;
    const n3_5 = (row3_5 && row3_5.style.display !== 'none') ? parseInt(document.getElementById('guest3_5')?.value || '0', 10) : 0;
    const n1_2 = (row1_2 && row1_2.style.display !== 'none') ? parseInt(document.getElementById('guest1_2')?.value || '0', 10) : 0;
    const totalGuests = nAdult + n8_11 + n6_7 + n3_5 + n1_2;

    const parts = [];
    if (nAdult > 0) {
      const lbl = document.getElementById('nameLabelAdult')?.textContent || 'Adults';
      parts.push(`${lbl}: ${nAdult} pax`);
    }
    if (n8_11 > 0) {
      const lbl = document.getElementById('nameLabel8_11')?.textContent || 'Child (8-11 yo)';
      parts.push(`${lbl}: ${n8_11} pax`);
    }
    if (n6_7 > 0) {
      const lbl = document.getElementById('nameLabel6_7')?.textContent || 'Child (6-7 yo)';
      parts.push(`${lbl}: ${n6_7} pax`);
    }
    if (n3_5 > 0) {
      const lbl = document.getElementById('nameLabel3_5')?.textContent || 'Child (3-5 yo)';
      parts.push(`${lbl}: ${n3_5} pax`);
    }
    if (n1_2 > 0) {
      const lbl = document.getElementById('nameLabel1_2')?.textContent || 'Infant (1-2 yo)';
      parts.push(`${lbl}: ${n1_2} pax`);
    }

    let formattedDate = 'Flexible';
    if (modalDate && modalDate.value) {
      const dateParts = modalDate.value.split('-');
      if (dateParts.length === 3) {
        formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      } else {
        formattedDate = modalDate.value;
      }
    }
    const modalTimeEl = document.getElementById('modalTime');
    const selectedTime = (modalTimeEl && modalTimeEl.value.trim()) ? modalTimeEl.value.trim() : '08:30 AM';
    const dateTime = (formattedDate !== 'Flexible') ? `${formattedDate} ${selectedTime}` : 'Flexible';
    const date = formattedDate;

    const name = (modalName && modalName.value.trim()) ? modalName.value.trim() : 'Guest';
    const email = (modalEmail && modalEmail.value.trim()) ? modalEmail.value.trim() : '-';
    const phone = (modalPhone && modalPhone.value.trim()) ? modalPhone.value.trim() : '-';
    const nationality = (modalNationality && modalNationality.value.trim()) ? modalNationality.value.trim() : '-';
    const elHeight = document.getElementById('modalHeight');
    const riderHeight = (elHeight && elHeight.value.trim()) ? elHeight.value.trim() : '-';
    const hotel = isSaving ? '' : ((modalHotel && modalHotel.value.trim()) ? modalHotel.value.trim() : '-');
    const totalCost = (calcTotalIdr && calcTotalIdr.textContent) ? calcTotalIdr.textContent : 'Rp 1.200.000';
    const totalUsd = (calcTotalUsd && calcTotalUsd.textContent) ? calcTotalUsd.textContent.trim() : '';

    return { tourKey, tourName, selectedTier, tierLabel, isSaving, totalGuests, parts, date, time: selectedTime, dateTime, name, email, phone, nationality, riderHeight, hotel, totalCost, totalUsd };
  };

  // Validate required booking modal fields
  const validateBookingForm = () => {
    const elName = document.getElementById('modalName');
    const elEmail = document.getElementById('modalEmail');
    const elPhone = document.getElementById('modalPhone');
    const elNationality = document.getElementById('modalNationality');
    const elHeight = document.getElementById('modalHeight');
    const elDate = document.getElementById('modalDate');
    const elTime = document.getElementById('modalTime');

    [elName, elEmail, elPhone, elNationality, elHeight, elDate, elTime].forEach(el => {
      if (el) el.classList.remove('input-error');
    });

    const name = elName ? elName.value.trim() : '';
    const email = elEmail ? elEmail.value.trim() : '';
    const phone = elPhone ? elPhone.value.trim() : '';
    const nationality = elNationality ? elNationality.value.trim() : '';
    const height = elHeight ? elHeight.value.trim() : '';
    const date = elDate ? elDate.value : '';
    const timeVal = elTime ? elTime.value.trim() : '';

    if (!name) {
      if (elName) {
        elName.classList.add('input-error');
        elName.focus();
      }
      alert('Please enter your Full Name (Lead Guest).');
      return false;
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      if (elEmail) {
        elEmail.classList.add('input-error');
        elEmail.focus();
      }
      alert('Please enter a valid Email Address.');
      return false;
    }

    if (!phone || phone.length < 5) {
      if (elPhone) {
        elPhone.classList.add('input-error');
        elPhone.focus();
      }
      alert('Please enter your Phone / WhatsApp / Telegram number.');
      return false;
    }

    if (!nationality) {
      if (elNationality) {
        elNationality.classList.add('input-error');
        elNationality.focus();
      }
      alert('Please enter your Nationality.');
      return false;
    }

    if (!height) {
      if (elHeight) {
        elHeight.classList.add('input-error');
        elHeight.focus();
      }
      alert('Please enter Rider Height(s) for bike sizing.');
      return false;
    }

    if (!date) {
      if (elDate) {
        elDate.classList.add('input-error');
        elDate.focus();
      }
      alert('Please select your preferred Tour Date.');
      return false;
    }

    if (!timeVal) {
      if (elTime) {
        elTime.classList.add('input-error');
        elTime.focus();
      }
      alert('Please enter your preferred Tour Time (e.g. 08:30 AM).');
      return false;
    }

    return true;
  };

  // Build complete detail text for Google Sheets & Email Notification
  const buildDetailString = (b, method) => {
    const ageBreakdown = b.parts.length ? b.parts.map(p => `   • ${p}`).join('\n') : '   • Adults: 2 pax';
    let str = `• Lead Guest Name: ${b.name}
• Tour Package: ${b.tourName}
• Total Guests: ${b.totalGuests} Guests
${ageBreakdown}
• Rider Height(s) & Bike Size: ${b.riderHeight}
• Tour Date: ${b.dateTime}`;

    if (!b.isSaving && b.hotel && b.hotel !== '-') {
      str += `\n• Hotel Pickup / Special Requests: ${b.hotel}`;
    }

    str += `\n• Estimated Total Cost: ${b.totalCost} ${b.totalUsd}
• Email Address: ${b.email}
• Phone / WhatsApp / Telegram: ${b.phone}
• Nationality: ${b.nationality}
• Package Tier: ${b.tierLabel}
• Booking Method: ${method}`;

    return str;
  };

  // Send booking record to Google Sheets & Trigger Email Notification via Google Apps Script
  const sendBookingToGoogleSheets = async (bookingData, method) => {
    if (!GOOGLE_SHEETS_WEBAPP_URL || GOOGLE_SHEETS_WEBAPP_URL.includes('PASTE_YOUR_')) {
      console.info('Google Sheets Web App URL is not yet configured in js/app.js. Skipping webhook post.');
      return;
    }

    const detailText = buildDetailString(bookingData, method);
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const timestampStr = `${dateFormatted} ${timeFormatted} WITA`;

    const payload = {
      timestamp: timestampStr,
      email: bookingData.email,
      phone: bookingData.phone,
      nationality: bookingData.nationality,
      tourDate: bookingData.dateTime,
      tourName: bookingData.tourName,
      guestName: bookingData.name,
      riderHeight: bookingData.riderHeight,
      hotel: bookingData.isSaving ? 'Not Included (Saving Package)' : (bookingData.hotel || '-'),
      totalGuests: bookingData.totalGuests || '1',
      totalCost: `${bookingData.totalCost} ${bookingData.totalUsd}`,
      method: method,
      detail: detailText
    };

    try {
      await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Google Sheets fetch warning:', err);
    }
  };

  // Submit via WhatsApp
  const handleWhatsAppBooking = async () => {
    if (!validateBookingForm()) return;

    const b = getBookingDetails();
    const btn = document.getElementById('btnSubmitModalBooking');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.7';
    }

    // Send data to Google Sheets in background
    try {
      await sendBookingToGoogleSheets(b, 'Confirm book on WhatsApp');
    } catch (e) {
      // Continue even if network glitch
    }

    const partsList = b.parts.map(p => `   • ${p}`).join('\n');
    let message = 
`*NEW RESERVATION - DEWA BIKE TOUR*
---------------------------------------
👤 *Lead Guest Name*: ${b.name}
🚲 *Tour Package*: ${b.tourName}
👥 *Total Guests*: ${b.totalGuests} Guests
${partsList}
📏 *Rider Height(s)*: ${b.riderHeight}
📅 *Tour Date*: ${b.dateTime}`;

    if (!b.isSaving && b.hotel && b.hotel !== '-') {
      message += `\n🏨 *Hotel Pickup / Notes*: ${b.hotel}`;
    }

    message += `\n💰 *Estimated Total*: ${b.totalCost} ${b.totalUsd}
---------------------------------------
📧 *Email*: ${b.email}
📞 *Phone / Telegram*: ${b.phone}
🌍 *Nationality*: ${b.nationality}
📦 *Package Tier*: ${b.tierLabel}
---------------------------------------
Hello Dewa Bike Tour Team, please check slot availability for the schedule above. Thank you! 🙏`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;
    window.open(waUrl, '_blank');

    if (btn) {
      btn.style.pointerEvents = '';
      btn.style.opacity = '';
      btn.innerHTML = origHtml;
    }
    closeModal();
  };

  // Submit via Email
  const handleEmailBooking = async () => {
    if (!validateBookingForm()) return;

    const b = getBookingDetails();
    const btn = document.getElementById('btnSubmitModalEmail');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.7';
    }

    // Send data to Google Sheets in background
    try {
      await sendBookingToGoogleSheets(b, 'Confirm book via Email');
    } catch (e) {
      // Continue
    }

    const partsList = b.parts.map(p => `  * ${p}`).join('\n');
    const subject = `New Tour Reservation: ${b.tourName} - ${b.name} (${b.dateTime})`;
    let body = 
`Hello Dewa Bike Tour Team,

I would like to book a tour with Dewa Bike Tour. Here are my booking details:

- Lead Guest Name: ${b.name}
- Tour Package: ${b.tourName}
- Total Guests: ${b.totalGuests} Guests
${partsList}
- Rider Height(s) & Bike Size: ${b.riderHeight}
- Tour Date: ${b.dateTime}`;

    if (!b.isSaving && b.hotel && b.hotel !== '-') {
      body += `\n- Hotel Pickup / Special Requests: ${b.hotel}`;
    }

    body += `\n- Estimated Total Cost: ${b.totalCost} ${b.totalUsd}
- Email Address: ${b.email}
- Phone / WhatsApp / Telegram: ${b.phone}
- Nationality: ${b.nationality}
- Package Tier: ${b.tierLabel}

Please check slot availability and confirm my reservation.

Thank you!
Best regards,
${b.name}`;

    const mailtoUrl = `mailto:dewabiketour@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    if (btn) {
      btn.style.pointerEvents = '';
      btn.style.opacity = '';
      btn.innerHTML = origHtml;
    }
    closeModal();
  };

  // Direct Booking submission ("Booking Now")
  const handleDirectBooking = async () => {
    if (!validateBookingForm()) return;

    const b = getBookingDetails();
    const btn = document.getElementById('btnSubmitModalDirect');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.75';
      btn.innerHTML = '<span>Submitting Booking...</span>';
    }

    // Send booking data to Google Sheets & Apps Script
    try {
      await sendBookingToGoogleSheets(b, 'Booking Now (Web Direct)');
    } catch (e) {
      console.warn('Booking post error:', e);
    }

    if (btn) {
      btn.style.pointerEvents = '';
      btn.style.opacity = '';
      btn.innerHTML = origHtml;
    }

    alert('Someone will reconfirm your booking via WhatsApp or Email');
    closeModal();
  };

  // Delegate click for Booking Now, WhatsApp & Email submit buttons in Modal
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btnSubmitModalDirect')) {
      e.preventDefault();
      handleDirectBooking();
    } else if (e.target.closest('#btnSubmitModalBooking')) {
      e.preventDefault();
      handleWhatsAppBooking();
    } else if (e.target.closest('#btnSubmitModalEmail')) {
      e.preventDefault();
      handleEmailBooking();
    }
  });

  /* -------------------------------------------------------------
   * 5B. CUSTOM WHEEL TIME PICKER (iOS Style with AM/PM)
   * ------------------------------------------------------------- */
  const WHEEL_ITEM_HEIGHT = 44;
  let tempHour = '08';
  let tempMinute = '30';
  let tempPeriod = 'AM';

  const ensureTimePickerModal = () => {
    let overlay = document.getElementById('timePickerOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'time-picker-overlay';
      overlay.id = 'timePickerOverlay';
      overlay.setAttribute('aria-hidden', 'true');

      let hoursHtml = '<div class="wheel-spacer"></div><div class="wheel-spacer"></div>';
      for (let h = 1; h <= 12; h++) {
        const val = h < 10 ? `0${h}` : `${h}`;
        hoursHtml += `<div class="wheel-item" data-value="${val}">${val}</div>`;
      }
      hoursHtml += '<div class="wheel-spacer"></div><div class="wheel-spacer"></div>';

      let minutesHtml = '<div class="wheel-spacer"></div><div class="wheel-spacer"></div>';
      for (let m = 0; m < 60; m++) {
        const val = m < 10 ? `0${m}` : `${m}`;
        minutesHtml += `<div class="wheel-item" data-value="${val}">${val}</div>`;
      }
      minutesHtml += '<div class="wheel-spacer"></div><div class="wheel-spacer"></div>';

      let periodHtml = '<div class="wheel-spacer"></div><div class="wheel-spacer"></div>';
      periodHtml += '<div class="wheel-item" data-value="AM">AM</div>';
      periodHtml += '<div class="wheel-item" data-value="PM">PM</div>';
      periodHtml += '<div class="wheel-spacer"></div><div class="wheel-spacer"></div>';

      overlay.innerHTML = `
        <div class="time-picker-backdrop" id="timePickerBackdrop"></div>
        <div class="time-picker-card" role="dialog" aria-modal="true" aria-label="Select Preferred Pick-Up Time">
          <div class="time-picker-highlight"></div>
          <div class="time-picker-wheels">
            <div class="time-wheel-col" id="wheelColHour" data-type="hour" tabindex="0">
              ${hoursHtml}
            </div>
            <div class="time-wheel-col" id="wheelColMinute" data-type="minute" tabindex="0">
              ${minutesHtml}
            </div>
            <div class="time-wheel-col time-wheel-period" id="wheelColPeriod" data-type="period" tabindex="0">
              ${periodHtml}
            </div>
          </div>
          <div class="time-picker-fade-top"></div>
          <div class="time-picker-fade-bottom"></div>
          <div class="time-picker-footer">
            <button type="button" class="btn-time-reset" id="btnTimePickerReset">
              Reset
            </button>
            <button type="button" class="btn-time-confirm" id="btnTimePickerConfirm" aria-label="Confirm time">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Attach scroll listeners to the 3 columns
      ['wheelColHour', 'wheelColMinute', 'wheelColPeriod'].forEach(id => {
        const col = document.getElementById(id);
        if (col) {
          let timer = null;
          col.addEventListener('scroll', () => {
            const type = col.getAttribute('data-type');
            updateColumnSelection(col, type);
            clearTimeout(timer);
            timer = setTimeout(() => {
              updateColumnSelection(col, type);
            }, 50);
          }, { passive: true });
        }
      });
    }
    return overlay;
  };

  const parseCurrentTime = (timeStr) => {
    const s = (timeStr || '').trim();
    const match = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      let p = (match[3] || 'AM').toUpperCase();
      if (h === 0) {
        h = 12;
      } else if (h > 12) {
        h = h - 12;
        p = 'PM';
      }
      const hourStr = h < 10 ? `0${h}` : `${h}`;
      const minuteStr = m < 10 ? `0${m}` : `${m}`;
      return { hour: hourStr, minute: minuteStr, period: p };
    }
    return { hour: '08', minute: '30', period: 'AM' };
  };

  const updateColumnSelection = (col, type) => {
    if (!col) return;
    const scrollTop = col.scrollTop;
    const index = Math.max(0, Math.round(scrollTop / WHEEL_ITEM_HEIGHT));
    const items = col.querySelectorAll('.wheel-item');
    items.forEach((item, idx) => {
      if (idx === index) {
        item.classList.add('selected');
        const val = item.getAttribute('data-value');
        if (type === 'hour') tempHour = val;
        else if (type === 'minute') tempMinute = val;
        else if (type === 'period') tempPeriod = val;
      } else {
        item.classList.remove('selected');
      }
    });
  };

  const scrollToValue = (col, targetValue, behavior = 'auto') => {
    if (!col) return;
    const items = col.querySelectorAll('.wheel-item');
    let targetIndex = 0;
    items.forEach((item, idx) => {
      if (item.getAttribute('data-value') === targetValue) {
        targetIndex = idx;
      }
    });
    col.scrollTo({ top: targetIndex * WHEEL_ITEM_HEIGHT, behavior: behavior });
    items.forEach((item, idx) => {
      if (idx === targetIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  };

  const openTimePicker = () => {
    const overlay = ensureTimePickerModal();
    const inputEl = document.getElementById('modalTime');
    const triggerBox = document.getElementById('timeTriggerBox');
    if (triggerBox) triggerBox.setAttribute('aria-expanded', 'true');

    const parsed = parseCurrentTime(inputEl ? inputEl.value : '08:30 AM');
    tempHour = parsed.hour;
    tempMinute = parsed.minute;
    tempPeriod = parsed.period;

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');

    const colHour = document.getElementById('wheelColHour');
    const colMinute = document.getElementById('wheelColMinute');
    const colPeriod = document.getElementById('wheelColPeriod');

    setTimeout(() => {
      if (colHour) scrollToValue(colHour, tempHour, 'auto');
      if (colMinute) scrollToValue(colMinute, tempMinute, 'auto');
      if (colPeriod) scrollToValue(colPeriod, tempPeriod, 'auto');
    }, 20);
  };

  const closeTimePicker = () => {
    const overlay = document.getElementById('timePickerOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    }
    const triggerBox = document.getElementById('timeTriggerBox');
    if (triggerBox) {
      triggerBox.setAttribute('aria-expanded', 'false');
    }
  };

  const confirmTimePicker = () => {
    const formatted = `${tempHour}:${tempMinute} ${tempPeriod}`;
    const inputEl = document.getElementById('modalTime');
    if (inputEl) {
      inputEl.value = formatted;
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
    closeTimePicker();
  };

  const resetTimePicker = () => {
    tempHour = '08';
    tempMinute = '30';
    tempPeriod = 'AM';
    const colHour = document.getElementById('wheelColHour');
    const colMinute = document.getElementById('wheelColMinute');
    const colPeriod = document.getElementById('wheelColPeriod');
    if (colHour) scrollToValue(colHour, '08', 'smooth');
    if (colMinute) scrollToValue(colMinute, '30', 'smooth');
    if (colPeriod) scrollToValue(colPeriod, 'AM', 'smooth');
  };

  // Event delegations for Wheel Time Picker
  document.addEventListener('click', (e) => {
    if (e.target.closest('#timeTriggerBox') || e.target.closest('#modalTime')) {
      e.preventDefault();
      openTimePicker();
    } else if (e.target.closest('#timePickerBackdrop')) {
      closeTimePicker();
    } else if (e.target.closest('#btnTimePickerReset')) {
      e.preventDefault();
      resetTimePicker();
    } else if (e.target.closest('#btnTimePickerConfirm')) {
      e.preventDefault();
      confirmTimePicker();
    } else {
      const wheelItem = e.target.closest('.wheel-item');
      if (wheelItem) {
        const col = wheelItem.closest('.time-wheel-col');
        if (col) {
          const items = Array.from(col.querySelectorAll('.wheel-item'));
          const idx = items.indexOf(wheelItem);
          if (idx !== -1) {
            col.scrollTo({ top: idx * WHEEL_ITEM_HEIGHT, behavior: 'smooth' });
          }
        }
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('timePickerOverlay');
    if (overlay && overlay.classList.contains('active')) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeTimePicker();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        confirmTimePicker();
      }
    } else if (e.target.closest('#timeTriggerBox') && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openTimePicker();
    }
  });

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

      const isIndonesian = document.documentElement.lang === 'id';

      const message = isIndonesian ?
`*KONSULTASI & RESERVASI - DEWA BIKE TOUR*
---------------------------------------
👤 *Nama*: ${name}
📅 *Tanggal Tur*: ${date}
👥 *Jumlah Peserta*: ${guests} Orang
🚲 *Paket Tur*: ${packageSel}
📝 *Catatan / Hotel*: ${notes}
---------------------------------------
Halo Dewa Bike Tour, mohon info ketersediaan slot untuk jadwal perjalanan saya di atas. Terima kasih!` :
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
      document.documentElement.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const modalBody = modal.querySelector('.facility-modal-body');
      if (modalBody) modalBody.scrollTop = 0;
    };

    const closeFacilityModal = () => {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
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

    // Prevent any scrolling on the backdrop (green line area) so the background stays completely fixed
    modal.addEventListener('wheel', (e) => {
      if (e.target === modal) {
        e.preventDefault();
      }
    }, { passive: false });

    modal.addEventListener('touchmove', (e) => {
      if (e.target === modal) {
        e.preventDefault();
      }
    }, { passive: false });

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
        modalBadge.className = 'team-modal-badge ' + (badgeClass === 'badge-amber' ? 'badge-amber' : 'badge-green');
      }

      if (modalName) modalName.textContent = name;
      if (modalRole) {
        modalRole.textContent = role;
        modalRole.style.color = (badgeClass === 'badge-amber' ? 'var(--accent-hover)' : 'var(--primary)');
      }
      if (modalDesc) modalDesc.textContent = bio;

      modal.classList.add('open');
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const modalCard = modal.querySelector('.modal-card');
      if (modalCard) modalCard.scrollTop = 0;
    };

    const closeTeamModal = () => {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
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

    // Prevent background scroll and close when clicking outside card
    modal.addEventListener('wheel', (e) => {
      if (e.target === modal) {
        e.preventDefault();
      }
    }, { passive: false });

    modal.addEventListener('touchmove', (e) => {
      if (e.target === modal) {
        e.preventDefault();
      }
    }, { passive: false });

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
      document.documentElement.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      renderThumbnails();
      updateSlide(currentIndex);
    };

    const closeLightbox = () => {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
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
    // Prevent any scrolling on lightbox backdrop so background is completely fixed
    modal.addEventListener('wheel', (e) => {
      e.preventDefault();
    }, { passive: false });

    modal.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

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

  /* -------------------------------------------------------------
   * 11. CLEAN URL ADDRESS BAR (FOR LIVE SITE)
   * ------------------------------------------------------------- */
  try {
    if (window.location.protocol.startsWith('http') && window.location.pathname.endsWith('.html')) {
      let cleanPath = window.location.pathname.replace(/\.html$/, '');
      if (cleanPath.endsWith('/index')) {
        cleanPath = cleanPath.slice(0, -5) || '/';
      }
      const newUrl = cleanPath + window.location.search + window.location.hash;
      window.history.replaceState(null, '', newUrl);
    }
  } catch (err) {
    // Graceful fallback
  }

  /* -------------------------------------------------------------
   * 12. FAIL-SAFE LINK CLICK HANDLER FOR OFFLINE / LOCAL PREVIEWS
   * ------------------------------------------------------------- */
  if (window.location.protocol === 'file:') {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('javascript:')) return;
      if (href.endsWith('.html') || href.includes('.html#') || href.includes('.html?')) return;
      
      if (href === './' || href === '../' || href === '../../' || href.endsWith('/')) {
        e.preventDefault();
        window.location.href = href + 'index.html';
        return;
      }
      
      const parts = href.split('#');
      const baseAndQuery = parts[0].split('?');
      const base = baseAndQuery[0];
      const query = baseAndQuery[1] ? '?' + baseAndQuery[1] : '';
      const hash = parts[1] ? '#' + parts[1] : '';
      if (!base) return;
      
      e.preventDefault();
      window.location.href = base + '.html' + query + hash;
    });
  }

  /* -------------------------------------------------------------
   * 11B. BIKE SIZING PHOTO POPUP MODAL
   * ------------------------------------------------------------- */
  const initBikePhotoModal = () => {
    const BIKE_PHOTOS_DATA = {
      childseat: {
        file: 'bike-childseat.jpg',
        title: 'Childseat (Age 1 – 4 Years)',
        subtitle: 'Front mounted childseat on bike (Size M – XL / E-Bike)',
        desc: 'Comfortable and safe front childseat equipped with footrests and safety harness, allowing your toddler (1 to 4 years old) to securely enjoy the ride with parents.'
      },
      backseat: {
        file: 'bike-backseat.jpg',
        title: 'Backseat (Age 5 – 7 Years)',
        subtitle: 'Rear child seat on adult bike (Size M only)',
        desc: 'Sturdy rear seat carrier with safety handle and footpegs, specifically designed for kids aged 5–7 years to ride safely behind an adult.'
      },
      small120: {
        file: 'bike-small-120cm.jpg',
        title: 'Small Bike (Min Height 120 cm)',
        subtitle: 'Junior mountain bike for riders 120 cm and taller',
        desc: 'Lightweight junior mountain bike with front suspension and child-proportioned brakes. Lower than 120 cm can comfortably use a backseat.'
      },
      small135: {
        file: 'bike-small-135cm.jpg',
        title: 'Small Bike (Min Height 135 cm)',
        subtitle: 'Youth mountain bike for riders 135 cm and taller',
        desc: 'Youth performance mountain bike with front suspension fork and Shimano gearing, perfectly fitted for older children and pre-teens at least 135 cm tall.'
      },
      adults: {
        file: 'bike-adults.jpg',
        title: 'Adults Bike (Sizes S – XL)',
        subtitle: 'Hardtail mountain bike with Shimano gears & hydraulic disc brakes',
        desc: 'High-quality adult mountain bikes available in full frame sizes from S to XL. Regularly serviced and safety checked by our in-house mechanics.'
      },
      ebike: {
        file: 'gallery-home-3.jpg',
        title: 'E-Bike (Sizes S – M)',
        subtitle: 'Electric assist bicycle (Min height 150 cm)',
        desc: 'Comfortable and easy-to-ride electric bicycle featuring smooth pedal assistance, front suspension, and reliable disc brakes. Perfect for riding effortlessly through rice fields and village roads. Minimum rider height 150 cm.'
      }
    };

    const getImagesPath = () => {
      const sample = document.querySelector('img[src*="images/"]');
      if (sample) {
        const src = sample.getAttribute('src');
        const idx = src.indexOf('images/');
        if (idx !== -1) {
          return src.substring(0, idx) + 'images/';
        }
      }
      const path = window.location.pathname;
      if (path.includes('/regular-packages/') || path.includes('/saving-packages/') || path.includes('/combination-tours/') || path.includes('/other-activities/')) {
        return '../../images/';
      }
      if (path.includes('/bike-tours/') || path.includes('/other-tours/') || path.includes('/about/')) {
        return '../images/';
      }
      return 'images/';
    };

    let currentKeyIndex = 0;
    let activeKeys = [];

    const getAvailableKeys = () => {
      const items = Array.from(document.querySelectorAll('.bike-sizing-item'));
      const keys = items.map(el => el.getAttribute('data-bike-key')).filter(Boolean);
      const uniqueKeys = Array.from(new Set(keys));
      return uniqueKeys.length > 0 ? uniqueKeys : Object.keys(BIKE_PHOTOS_DATA);
    };

    const updateSlide = (index, direction = 0) => {
      if (!activeKeys.length) activeKeys = getAvailableKeys();
      if (!activeKeys.length) return;

      if (index < 0) index = activeKeys.length - 1;
      if (index >= activeKeys.length) index = 0;
      currentKeyIndex = index;

      const key = activeKeys[currentKeyIndex];
      const data = BIKE_PHOTOS_DATA[key];
      if (!data) return;

      const basePath = getImagesPath();
      const imgEl = document.getElementById('bikePhotoImg');
      const titleEl = document.getElementById('bikePhotoTitle');
      const subtitleEl = document.getElementById('bikePhotoSubtitle');
      const descEl = document.getElementById('bikePhotoDesc');
      const counterEl = document.getElementById('bikePhotoCounter');
      const dotsEl = document.getElementById('bikePhotoDots');
      const prevBtn = document.getElementById('bikePhotoPrev');
      const nextBtn = document.getElementById('bikePhotoNext');

      const isMulti = activeKeys.length > 1;

      if (counterEl) {
        counterEl.textContent = `${currentKeyIndex + 1} / ${activeKeys.length}`;
        counterEl.style.display = isMulti ? 'block' : 'none';
      }

      if (dotsEl) {
        if (isMulti) {
          dotsEl.style.display = 'flex';
          dotsEl.innerHTML = activeKeys.map((k, i) => `
            <button type="button" class="bike-popup-dot ${i === currentKeyIndex ? 'active' : ''}" data-index="${i}" aria-label="Go to photo ${i + 1}"></button>
          `).join('');
        } else {
          dotsEl.style.display = 'none';
        }
      }

      if (prevBtn) prevBtn.style.display = isMulti ? 'flex' : 'none';
      if (nextBtn) nextBtn.style.display = isMulti ? 'flex' : 'none';

      if (imgEl) {
        if (direction !== 0) {
          imgEl.style.opacity = '0.35';
          imgEl.style.transform = direction > 0 ? 'translateX(12px)' : 'translateX(-12px)';
          setTimeout(() => {
            imgEl.src = basePath + data.file;
            imgEl.alt = data.title;
            imgEl.style.opacity = '1';
            imgEl.style.transform = 'none';
          }, 110);
        } else {
          imgEl.src = basePath + data.file;
          imgEl.alt = data.title;
          imgEl.style.opacity = '1';
          imgEl.style.transform = 'none';
        }
      }

      if (titleEl) titleEl.textContent = data.title;
      if (subtitleEl) subtitleEl.textContent = data.subtitle;
      if (descEl) descEl.textContent = data.desc;
    };

    const nextSlide = () => updateSlide(currentKeyIndex + 1, 1);
    const prevSlide = () => updateSlide(currentKeyIndex - 1, -1);

    const ensureModal = () => {
      let modal = document.getElementById('bikePhotoModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.className = 'bike-popup-modal';
        modal.id = 'bikePhotoModal';
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
          <div class="bike-popup-backdrop" id="bikePhotoBackdrop"></div>
          <div class="bike-popup-card" role="dialog" aria-modal="true" aria-labelledby="bikePhotoTitle">
            <button type="button" class="bike-popup-close" id="bikePhotoClose" aria-label="Close photo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div class="bike-popup-img-wrap" id="bikePhotoImgWrap">
              <span class="bike-popup-counter" id="bikePhotoCounter">1 / 5</span>
              <button type="button" class="bike-popup-nav prev" id="bikePhotoPrev" aria-label="Previous bike photo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button type="button" class="bike-popup-nav next" id="bikePhotoNext" aria-label="Next bike photo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              <img id="bikePhotoImg" src="" alt="Bike photo" loading="lazy">
              <div class="bike-popup-dots" id="bikePhotoDots"></div>
            </div>
            <div class="bike-popup-info">
              <span class="bike-popup-tag">BIKE &amp; SEATING SPECIFICATION</span>
              <h3 id="bikePhotoTitle"></h3>
              <p class="bike-popup-subtitle" id="bikePhotoSubtitle"></p>
              <p class="bike-popup-desc" id="bikePhotoDesc"></p>
            </div>
          </div>
        `;
        // Prevent background scrolling on touch or mouse wheel
        modal.addEventListener('wheel', (e) => {
          if (!e.target.closest('.bike-popup-card')) {
            e.preventDefault();
          }
        }, { passive: false });

        modal.addEventListener('touchmove', (e) => {
          if (!e.target.closest('.bike-popup-card')) {
            e.preventDefault();
          }
        }, { passive: false });

        // Touch swipe gestures for sliding photos
        let touchStartX = 0;
        let touchStartY = 0;

        modal.addEventListener('touchstart', (e) => {
          if (e.touches && e.touches[0]) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        }, { passive: true });

        modal.addEventListener('touchend', (e) => {
          if (e.changedTouches && e.changedTouches[0]) {
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
              if (deltaX < 0) {
                nextSlide();
              } else {
                prevSlide();
              }
            }
          }
        }, { passive: true });

        document.body.appendChild(modal);
      }
      return modal;
    };

    const openModal = (key) => {
      activeKeys = getAvailableKeys();
      const foundIdx = activeKeys.indexOf(key);
      currentKeyIndex = foundIdx !== -1 ? foundIdx : 0;

      const modal = ensureModal();
      updateSlide(currentKeyIndex, 0);

      // Lock body and html scroll
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
      const modal = document.getElementById('bikePhotoModal');
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }

      // Unlock body and html scroll
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };

    document.addEventListener('click', (e) => {
      const item = e.target.closest('.bike-sizing-item');
      if (item) {
        e.preventDefault();
        const key = item.getAttribute('data-bike-key');
        if (key) openModal(key);
        return;
      }
      if (e.target.closest('#bikePhotoClose') || e.target.closest('#bikePhotoBackdrop')) {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.target.closest('#bikePhotoNext')) {
        e.preventDefault();
        nextSlide();
        return;
      }
      if (e.target.closest('#bikePhotoPrev')) {
        e.preventDefault();
        prevSlide();
        return;
      }
      const dot = e.target.closest('.bike-popup-dot');
      if (dot) {
        e.preventDefault();
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(idx)) updateSlide(idx, idx > currentKeyIndex ? 1 : -1);
        return;
      }
    });

    document.addEventListener('keydown', (e) => {
      const modal = document.getElementById('bikePhotoModal');
      const isActive = modal && modal.classList.contains('active');
      if (!isActive) {
        if (e.key === 'Enter' || e.key === ' ') {
          const item = document.activeElement ? document.activeElement.closest('.bike-sizing-item') : null;
          if (item) {
            e.preventDefault();
            const key = item.getAttribute('data-bike-key');
            if (key) openModal(key);
          }
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    });

    // Preload images and pre-initialize modal if page has bike sizing items
    if (document.querySelector('.bike-sizing-item')) {
      ensureModal();
      const basePath = getImagesPath();
      Object.keys(BIKE_PHOTOS_DATA).forEach((k) => {
        const d = BIKE_PHOTOS_DATA[k];
        if (d && d.file) {
          const preloadImg = new Image();
          preloadImg.src = basePath + d.file;
        }
      });
    }
  };

  initTourSlider();
  initFacilityModal();
  initTeamModal();
  initGalleryLightbox();
  initBikePhotoModal();
});

