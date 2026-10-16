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
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });

    // Mobile dropdown and link behavior
    navMenu.querySelectorAll('.nav-item').forEach(item => {
      const link = item.querySelector('.nav-link');
      const dropdown = item.querySelector('.dropdown-menu');

      if (dropdown && link) {
        link.addEventListener('click', (e) => {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            item.classList.toggle('open-mobile');
          }
        });
      } else if (link) {
        link.addEventListener('click', () => {
          navMenu.classList.remove('mobile-open');
        });
      }
    });

    // Close mobile menu when clicking any dropdown item
    navMenu.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
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
    calcGuestCount.textContent = `${guests} orang`;
    calcTotalIdr.textContent = formatIDR(total);
    calcTotalUsd.textContent = `(Sekitar ~$${totalUSD} USD)`;
  };

  // Open Modal logic
  const openModal = (tourKey = 'Kintamani Downhill') => {
    if (modalTourSelect) {
      if (packageData[tourKey]) {
        modalTourSelect.value = tourKey;
        modalTourTitle.textContent = `Pesan: ${packageData[tourKey].title}`;
      } else {
        modalTourSelect.value = 'Kintamani Downhill';
      }
    }
    recalculateModal();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
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
        modalTourTitle.textContent = `Pesan: ${packageData[selected].title}`;
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
      const date = modalDate.value || 'Fleksibel';
      const name = modalName.value.trim() || 'Pelanggan';
      const hotel = modalHotel.value.trim() || '-';
      const totalCost = calcTotalIdr.textContent;

      const message = 
`*RESERVASI BARU - DEWA BIKE TOUR*
---------------------------------------
👤 *Nama*: ${name}
🚲 *Paket Tur*: ${tourName}
📦 *Format Paket*: ${tierLabel}
📅 *Tanggal Tur*: ${date}
👥 *Jumlah Peserta*: ${guests} Orang
🏨 *Hotel / Penjemputan*: ${hotel}
💰 *Estimasi Total*: ${totalCost}
---------------------------------------
Halo Tim Dewa Bike Tour, mohon info ketersediaan slot untuk jadwal di atas. Terima kasih! 🙏`;

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
`*KONSULTASI & BOOKING DEWA BIKE TOUR*
---------------------------------------
👤 *Nama*: ${name}
📅 *Tanggal Tur*: ${date}
👥 *Jumlah*: ${guests} Orang
🚲 *Paket*: ${packageSel}
📝 *Catatan / Hotel*: ${notes}
---------------------------------------
Halo Dewa Bike Tour, tolong konfirmasi ketersediaan paket dan harga untuk detail di atas.`;

      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
    });
  }
});
