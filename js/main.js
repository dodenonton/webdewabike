/**
 * DEWA BIKE TOUR - MAIN INTERACTIVITY & GOOGLE SHEETS INTEGRATION
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initPackageButtons();
  initBookingForm();
  initWhatsAppFloating();
  initFooterYear();
});

/**
 * 1. NAVBAR SCROLL & MOBILE TOGGLE
 */
function initNavbar() {
  const header = document.querySelector('.header');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');
  const links = document.querySelectorAll('.nav-link');

  // Sticky header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      mobileToggle.innerHTML = isOpen ? '✕' : '☰';
    });

    // Close mobile menu when a nav link is clicked
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.innerHTML = '☰';
      });
    });
  }
}

/**
 * 2. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
 */
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    reveals.forEach(el => el.classList.add('active'));
  }
}

/**
 * 3. PACKAGE "PESAN SEKARANG" BUTTONS
 * Otomatis memilih paket di dropdown form booking saat kartu paket diklik
 */
function initPackageButtons() {
  const bookButtons = document.querySelectorAll('.btn-select-package');
  const packageSelect = document.getElementById('tourPackage');
  const bookingSection = document.getElementById('booking');

  bookButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const packageName = btn.getAttribute('data-package');
      if (packageSelect && packageName) {
        packageSelect.value = packageName;
      }
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * 4. BOOKING FORM & GOOGLE SHEETS INTEGRATION
 */
function initBookingForm() {
  const form = document.getElementById('tourBookingForm');
  const submitBtn = document.getElementById('submitBtn');
  const alertBox = document.getElementById('formAlert');
  const waBackupBox = document.getElementById('waBackupBox');
  const waDirectBtn = document.getElementById('waDirectBtn');

  if (!form) return;

  // Set minimum date to today
  const tourDateInput = document.getElementById('tourDate');
  if (tourDateInput) {
    const today = new Date().toISOString().split('T')[0];
    tourDateInput.setAttribute('min', today);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Ambil data formulir
    const formData = {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      tourPackage: document.getElementById('tourPackage').value,
      tourDate: document.getElementById('tourDate').value,
      participants: document.getElementById('participants').value,
      pickupLocation: document.getElementById('pickupLocation').value.trim(),
      notes: document.getElementById('notes').value.trim()
    };

    // Validasi sederhana
    if (!formData.fullName || !formData.phone || !formData.tourDate) {
      showAlert('Mohon lengkapi Nama, No. WhatsApp, dan Tanggal Tour.', 'error');
      return;
    }

    // Set button ke status loading
    setLoadingState(true);
    hideAlert();

    // Buat pesan teks WhatsApp otomatis untuk cadangan langsung
    const waText = encodeURIComponent(
      `Halo Dewa Bike Tour! Saya ingin konfirmasi booking:\n\n` +
      `👤 Nama: ${formData.fullName}\n` +
      `🚴 Paket: ${formData.tourPackage}\n` +
      `📅 Tanggal: ${formData.tourDate}\n` +
      `👥 Peserta: ${formData.participants} orang\n` +
      `📍 Penjemputan: ${formData.pickupLocation || '-'}\n` +
      `💬 Catatan: ${formData.notes || '-'}`
    );
    const waUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${waText}`;

    // Siapkan link WhatsApp di box cadangan
    if (waDirectBtn) {
      waDirectBtn.href = waUrl;
    }

    try {
      // Periksa apakah URL Google Sheet masih placeholder
      if (CONFIG.GOOGLE_SHEET_WEBAPP_URL.includes("YOUR_SCRIPT_ID_HERE")) {
        // Jika belum disetting, kita simulasikan berhasil dan arahkan ke WhatsApp
        setTimeout(() => {
          setLoadingState(false);
          showAlert(
            'Pesanan tercatat! (Catatan: URL Google Apps Script belum diganti di config.js). Silakan klik tombol di bawah untuk konfirmasi WhatsApp instan.',
            'success'
          );
          if (waBackupBox) waBackupBox.style.display = 'block';
          form.reset();
        }, 1200);
        return;
      }

      // Kirim data ke Google Apps Script (Google Sheets)
      // Menggunakan mode 'no-cors' agar kompatibel dengan redirect Google Web App
      await fetch(CONFIG.GOOGLE_SHEET_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(formData)
      });

      setLoadingState(false);
      showAlert(
        'Terima kasih! Pemesanan Anda berhasil tersimpan di sistem kami. Kami juga menyarankan untuk klik tombol WhatsApp di bawah untuk konfirmasi instan.',
        'success'
      );
      if (waBackupBox) waBackupBox.style.display = 'block';
      form.reset();

    } catch (err) {
      console.error('Error submitting booking:', err);
      setLoadingState(false);
      showAlert(
        'Gagal mengirim ke Google Sheet otomatis. Jangan khawatir! Anda tetap bisa langsung konfirmasi booking via WhatsApp di bawah.',
        'error'
      );
      if (waBackupBox) waBackupBox.style.display = 'block';
    }
  });

  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  }

  function showAlert(msg, type) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `form-alert ${type}`;
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.className = 'form-alert';
    alertBox.textContent = '';
  }
}

/**
 * 5. FLOATING WHATSAPP BUTTON LINK
 */
function initWhatsAppFloating() {
  const waFloating = document.getElementById('floatingWa');
  if (waFloating) {
    const defaultMsg = encodeURIComponent("Halo Dewa Bike Tour, saya ingin bertanya tentang paket cycling tour di Bali!");
    waFloating.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${defaultMsg}`;
  }
}

/**
 * 6. DYNAMIC CURRENT YEAR
 */
function initFooterYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
