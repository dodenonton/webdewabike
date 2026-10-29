/**
 * DEWA BIKE TOUR - GOOGLE APPS SCRIPT WEBHOOK & ADMIN API
 * Versi: 2.0 (Direct Booking, Email Tamu & Admin Dashboard API)
 * 
 * Fitur:
 * 1. Simpan booking ke Google Spreadsheet.
 * 2. Kirim notifikasi email ke Admin (dewabiketour@gmail.com).
 * 3. Kirim konfirmasi email ke Tamu (dengan detail lengkap).
 * 4. API Baca Data Booking untuk Halaman Admin (doGet).
 * 5. API Edit & Hapus Baris Booking langsung di Spreadsheet (doGet & doPost).
 */

// Handler GET: Dipakai oleh Halaman Admin untuk Membaca, Mengedit, dan Menghapus Booking
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "read";
    var callback = e && e.parameter && e.parameter.callback;

    // Aksi 1: HAPUS BARIS LANGSUNG DARI GOOGLE SPREADSHEET
    if (action === "delete") {
      var row = parseInt(e.parameter.row, 10);
      if (!isNaN(row) && row >= 2 && row <= sheet.getLastRow()) {
        sheet.deleteRow(row);
        return createResponse({ status: "success", message: "Baris " + row + " berhasil dihapus.", row: row }, callback);
      } else {
        return createResponse({ status: "error", message: "Nomor baris tidak valid: " + row }, callback);
      }
    }

    // Aksi 2: UPDATE BARIS LANGSUNG DI GOOGLE SPREADSHEET
    if (action === "update") {
      var row = parseInt(e.parameter.row, 10);
      if (!isNaN(row) && row >= 2 && row <= sheet.getLastRow()) {
        if (e.parameter.email !== undefined) sheet.getRange(row, 2).setValue(e.parameter.email);
        if (e.parameter.phone !== undefined) sheet.getRange(row, 3).setValue(e.parameter.phone);
        if (e.parameter.nationality !== undefined) sheet.getRange(row, 4).setValue(e.parameter.nationality);
        if (e.parameter.tourDate !== undefined) sheet.getRange(row, 5).setValue(e.parameter.tourDate);
        if (e.parameter.detail !== undefined) sheet.getRange(row, 6).setValue(e.parameter.detail);
        return createResponse({ status: "success", message: "Baris " + row + " berhasil diperbarui.", row: row }, callback);
      } else {
        return createResponse({ status: "error", message: "Nomor baris tidak valid: " + row }, callback);
      }
    }

    // Aksi 3: BACA SEMUA DATA BOOKING (Default)
    var lastRow = sheet.getLastRow();
    var lastCol = Math.max(sheet.getLastColumn(), 6);
    var spreadsheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
    var rows = [];

    if (lastRow >= 2) {
      var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
      for (var i = 0; i < values.length; i++) {
        var r = values[i];
        var rowNum = i + 2;
        var detailText = String(r[5] || "");

        function extractVal(regex) {
          var m = detailText.match(regex);
          return (m && m[1]) ? m[1].trim() : "";
        }

        var guestName   = extractVal(/(?:•\s*Guest Name:|\bGuest Name:)\s*([^\n\r]+)/);
        var tourName    = extractVal(/(?:•\s*Tour Package:|\bTour Package:)\s*([^\n\r]+)/);
        var tier        = extractVal(/(?:•\s*Package Tier:|\bPackage Tier:)\s*([^\n\r]+)/);
        var riderHeight = extractVal(/(?:•\s*Rider Height\(s\)(?: & Bike Size)?:|\bRider Height:)\s*([^\n\r]+)/);
        var hotel       = extractVal(/(?:•\s*Hotel Pickup(?: \/ Special Requests)?:\s*|\bHotel:)\s*([^\n\r]+)/);
        var totalGuests = extractVal(/(?:•\s*Total Guests:)\s*([^\n\r]+)/);
        var totalCost   = extractVal(/(?:•\s*Estimated Total Cost:|\bTotal Cost:)\s*([^\n\r]+)/);
        var method      = extractVal(/(?:•\s*Booking Method:|\bMethod:)\s*([^\n\r]+)/);

        rows.push({
          row: rowNum,
          timestamp: String(r[0] || ""),
          email: String(r[1] || ""),
          phone: String(r[2] || ""),
          nationality: String(r[3] || ""),
          tourDate: String(r[4] || ""),
          detail: detailText,
          guestName: guestName,
          tourName: tourName,
          tier: tier,
          riderHeight: riderHeight,
          hotel: hotel,
          totalGuests: totalGuests,
          totalCost: totalCost,
          method: method
        });
      }
    }

    // Urutkan booking terbaru di posisi paling atas
    rows.reverse();

    return createResponse({
      status: "success",
      total: rows.length,
      spreadsheetUrl: spreadsheetUrl,
      data: rows
    }, callback);

  } catch (err) {
    return createResponse({ status: "error", message: err.toString() }, callback);
  }
}

// Handler POST: Menerima booking baru dari website, menyimpan ke spreadsheet, kirim email ke Admin & Tamu
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    // Cek apakah aksi Edit atau Hapus dikirim via POST
    if (data.action === "delete") {
      var row = parseInt(data.row, 10);
      if (!isNaN(row) && row >= 2 && row <= sheet.getLastRow()) {
        sheet.deleteRow(row);
        return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Baris " + row + " berhasil dihapus." }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    if (data.action === "update") {
      var row = parseInt(data.row, 10);
      if (!isNaN(row) && row >= 2 && row <= sheet.getLastRow()) {
        if (data.email !== undefined) sheet.getRange(row, 2).setValue(data.email);
        if (data.phone !== undefined) sheet.getRange(row, 3).setValue(data.phone);
        if (data.nationality !== undefined) sheet.getRange(row, 4).setValue(data.nationality);
        if (data.tourDate !== undefined) sheet.getRange(row, 5).setValue(data.tourDate);
        if (data.detail !== undefined) sheet.getRange(row, 6).setValue(data.detail);
        return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Baris " + row + " berhasil diperbarui." }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    var timestamp   = data.timestamp || Utilities.formatDate(new Date(), "Asia/Makassar", "dd/MM/yyyy HH:mm:ss") + " WITA";
    var email       = data.email || "-";
    var phone       = data.phone || "-";
    var nationality = data.nationality || "-";
    var tourDate    = data.tourDate || "-";
    var detail      = data.detail || "-";
    var guestName   = data.guestName || "Guest";
    var tourName    = data.tourName || "Dewa Bike Tour";
    var riderHeight = data.riderHeight || "-";
    var hotel       = data.hotel || "-";
    var totalCost   = data.totalCost || "-";
    var totalGuests = data.totalGuests || "1";
    var method      = data.method || "Web Direct";

    // 1. Simpan ke baris baru Google Spreadsheet (6 Kolom Sesuai Format Anda)
    // Kolom: Timestamp | Email Address | Phone / Whatsapp / Telegram | Nationality | Date of the tour | Detail
    sheet.appendRow([timestamp, email, phone, nationality, tourDate, detail]);

    // 2. Kirim Notifikasi Email ke Pemilik (dewabiketour@gmail.com)
    var adminEmail = "dewabiketour@gmail.com";
    var adminSubject = "🔔 New Booking: " + tourName + " - " + guestName + " (" + tourDate + ")";

    var showHotel = (hotel && hotel !== "-" && hotel !== "" && hotel.indexOf("Not Included") === -1);
    var hotelHtmlRow = showHotel 
      ? '<tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 9px 0; color: #666;">Hotel Pickup / Special Requests:</td><td style="padding: 9px 0; color: #444;">' + hotel + '</td></tr>' 
      : '';
    var hotelPlainRow = showHotel 
      ? "Hotel Pickup        : " + hotel + "\n" 
      : "";

    var adminHtmlBody = 
      '<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">' +
        '<div style="background-color: #105b38; color: #ffffff; padding: 22px; text-align: center;">' +
          '<h2 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">DEWA BIKE TOUR BALI</h2>' +
          '<p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Reservasi Baru Masuk Melalui Website (' + method + ')</p>' +
        '</div>' +
        '<div style="padding: 24px 20px; background-color: #ffffff;">' +
          '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
            '<tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 9px 0; color: #666; width: 40%;">Lead Guest Name:</td><td style="padding: 9px 0; font-weight: bold; color: #222;">' + guestName + '</td></tr>' +
            '<tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 9px 0; color: #666;">Tour Package:</td><td style="padding: 9px 0; font-weight: bold; color: #105b38;">' + tourName + '</td></tr>' +
            '<tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 9px 0; color: #666;">Total Guests:</td><td style="padding: 9px 0; font-weight: bold; color: #222;">' + totalGuests + ' Guests</td></tr>' +
            '<tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 9px 0; color: #666;">Rider Height(s) & Bike Size:</td><td style="padding: 9px 0; font-weight: bold; color: #222;">' + riderHeight + '</td></tr>' +
            '<tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 9px 0; color: #666;">Tour Date:</td><td style="padding: 9px 0; font-weight: bold; color: #222;">' + tourDate + '</td></tr>' +
            hotelHtmlRow +
            '<tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 10px 0; color: #666;">Estimated Total Cost:</td><td style="padding: 10px 0; font-weight: 800; font-size: 16px; color: #105b38;">' + totalCost + '</td></tr>' +
            '<tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 9px 0; color: #666;">Email Address:</td><td style="padding: 9px 0; font-weight: bold; color: #222;"><a href="mailto:' + email + '" style="color: #105b38;">' + email + '</a></td></tr>' +
            '<tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 9px 0; color: #666;">Phone / WhatsApp / Telegram:</td><td style="padding: 9px 0; font-weight: bold; color: #222;"><a href="https://wa.me/' + phone.replace(/[^0-9]/g, '') + '" style="color: #16a34a; text-decoration: none; font-weight: bold;">' + phone + ' 💬 Chat WA</a></td></tr>' +
            '<tr><td style="padding: 9px 0; color: #666;">Nationality:</td><td style="padding: 9px 0; color: #222;">' + nationality + '</td></tr>' +
          '</table>' +
          '<div style="margin-top: 20px; padding: 14px; background-color: #f7faf8; border-left: 4px solid #105b38; border-radius: 4px; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">' +
            '<strong>Detail Lengkap:</strong>\n' + detail +
          '</div>' +
        '</div>' +
        '<div style="background-color: #f4f6f5; color: #777; padding: 14px; text-align: center; font-size: 12px;">' +
          'Data ini otomatis tersimpan di Google Spreadsheet Anda.<br>' +
          'Waktu Reservasi: ' + timestamp +
        '</div>' +
      '</div>';

    var adminPlainBody = 
      "RESERVASI BARU - DEWA BIKE TOUR BALI\n" +
      "==================================================\n" +
      "Lead Guest Name     : " + guestName + "\n" +
      "Tour Package        : " + tourName + "\n" +
      "Total Guests        : " + totalGuests + "\n" +
      "Rider Height(s)     : " + riderHeight + "\n" +
      "Tour Date           : " + tourDate + "\n" +
      hotelPlainRow +
      "Estimated Total Cost: " + totalCost + "\n" +
      "Email Address       : " + email + "\n" +
      "Phone / WhatsApp    : " + phone + "\n" +
      "Nationality         : " + nationality + "\n" +
      "==================================================\n\n" +
      detail;

    // Kirim email notifikasi ke admin
    try {
      MailApp.sendEmail({
        to: adminEmail,
        subject: adminSubject,
        body: adminPlainBody,
        htmlBody: adminHtmlBody,
        replyTo: (email && email !== "-" && email.indexOf("@") !== -1) ? email : adminEmail
      });
    } catch (adminMailErr) {
      Logger.log("Admin email error: " + adminMailErr);
    }

    // 3. KIRIM JUGA EMAIL KONFIRMASI KE TAMU (Permintaan Pengguna)
    if (email && email !== "-" && email.indexOf("@") !== -1) {
      var guestSubject = "🚲 Booking Confirmation: Dewa Bike Tour - " + tourName + " (" + tourDate + ")";

      var guestHtmlBody = 
        '<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">' +
          '<div style="background-color: #105b38; color: #ffffff; padding: 24px; text-align: center;">' +
            '<h2 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">DEWA BIKE TOUR BALI</h2>' +
            '<p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.95;">Thank you for your booking request!</p>' +
          '</div>' +
          '<div style="padding: 26px 22px; background-color: #ffffff; color: #333333; line-height: 1.6;">' +
            '<p style="margin-top: 0; font-size: 15px;">Dear <strong>' + guestName + '</strong>,</p>' +
            '<p style="font-size: 14px; color: #444;">We are delighted to receive your booking request with <strong>Dewa Bike Tour Bali</strong>. Here is a copy of your reservation details:</p>' +
            '<div style="background-color: #f8faf9; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 18px; margin: 18px 0;">' +
              '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
                '<tr style="border-bottom: 1px solid #e9ecef;"><td style="padding: 8px 0; color: #666; width: 42%;">Lead Guest Name:</td><td style="padding: 8px 0; font-weight: bold; color: #222;">' + guestName + '</td></tr>' +
                '<tr style="border-bottom: 1px solid #e9ecef;"><td style="padding: 8px 0; color: #666;">Tour Package:</td><td style="padding: 8px 0; font-weight: bold; color: #105b38;">' + tourName + '</td></tr>' +
                '<tr style="border-bottom: 1px solid #e9ecef;"><td style="padding: 8px 0; color: #666;">Total Guests:</td><td style="padding: 8px 0; font-weight: bold; color: #222;">' + totalGuests + ' Guests</td></tr>' +
                '<tr style="border-bottom: 1px solid #e9ecef;"><td style="padding: 8px 0; color: #666;">Rider Height(s) & Bike Size:</td><td style="padding: 8px 0; font-weight: bold; color: #222;">' + riderHeight + '</td></tr>' +
                '<tr style="border-bottom: 1px solid #e9ecef;"><td style="padding: 8px 0; color: #666;">Tour Date:</td><td style="padding: 8px 0; font-weight: bold; color: #222;">' + tourDate + '</td></tr>' +
                hotelHtmlRow +
                '<tr style="border-bottom: 1px solid #e9ecef;"><td style="padding: 10px 0; color: #666;">Estimated Total Cost:</td><td style="padding: 10px 0; font-weight: 800; font-size: 16px; color: #105b38;">' + totalCost + '</td></tr>' +
                '<tr style="border-bottom: 1px solid #e9ecef;"><td style="padding: 8px 0; color: #666;">Phone / WhatsApp:</td><td style="padding: 8px 0; color: #222;">' + phone + '</td></tr>' +
                '<tr><td style="padding: 8px 0; color: #666;">Email Address:</td><td style="padding: 8px 0; color: #222;">' + email + '</td></tr>' +
              '</table>' +
            '</div>' +
            '<div style="background-color: #eaf5ee; border-left: 4px solid #16a34a; padding: 14px 16px; border-radius: 4px; margin: 18px 0; font-size: 13.5px; color: #15803d;">' +
              '<strong>⚠️ Reconfirmation Notice:</strong><br>' +
              'Someone from our team will reconfirm your booking schedule and pickup timing via WhatsApp or Email shortly. No upfront payment is required online; payment can be completed in cash (IDR) or credit card on the day of the tour.' +
            '</div>' +
            '<p style="font-size: 13.5px; color: #555; margin-bottom: 5px;">If you have any questions or urgent changes, feel free to contact us anytime:</p>' +
            '<ul style="font-size: 13.5px; color: #444; margin-top: 4px; padding-left: 20px;">' +
              '<li><strong>WhatsApp:</strong> <a href="https://wa.me/6285238496766" style="color: #105b38;">+62 852 3849 6766</a></li>' +
              '<li><strong>Email:</strong> <a href="mailto:dewabiketour@gmail.com" style="color: #105b38;">dewabiketour@gmail.com</a></li>' +
              '<li><strong>Website:</strong> <a href="https://www.dewabike.com" style="color: #105b38;">https://www.dewabike.com</a></li>' +
            '</ul>' +
            '<p style="margin-top: 22px; font-size: 14px; color: #333;">Warm regards,<br><strong>Dewa Bike Tour Bali Team</strong></p>' +
          '</div>' +
          '<div style="background-color: #f4f6f5; color: #777; padding: 14px; text-align: center; font-size: 12px;">' +
            'Dewa Bike Tour Bali • Ubud, Gianyar, Bali • info@dewabike.com' +
          '</div>' +
        '</div>';

      var guestPlainBody = 
        "DEWA BIKE TOUR BALI - BOOKING CONFIRMATION\n" +
        "==================================================\n" +
        "Dear " + guestName + ",\n\n" +
        "Thank you for booking with Dewa Bike Tour Bali! Here are your reservation details:\n\n" +
        "- Lead Guest Name     : " + guestName + "\n" +
        "- Tour Package        : " + tourName + "\n" +
        "- Total Guests        : " + totalGuests + "\n" +
        "- Rider Height(s)     : " + riderHeight + "\n" +
        "- Tour Date           : " + tourDate + "\n" +
        hotelPlainRow +
        "- Estimated Total Cost: " + totalCost + "\n" +
        "- Phone / WhatsApp    : " + phone + "\n" +
        "Someone from our team will reconfirm your booking schedule via WhatsApp or Email shortly.\n" +
        "Payment can be completed on the tour day.\n\n" +
        "Contact us:\n" +
        "WhatsApp: +62 852 3849 6766\n" +
        "Email   : dewabiketour@gmail.com\n" +
        "Website : https://www.dewabike.com\n\n" +
        "Warm regards,\nDewa Bike Tour Team";

      try {
        MailApp.sendEmail({
          to: email,
          subject: guestSubject,
          body: guestPlainBody,
          htmlBody: guestHtmlBody,
          replyTo: adminEmail
        });
      } catch (guestMailErr) {
        Logger.log("Guest email error: " + guestMailErr);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper Response Format (JSON vs JSONP)
function createResponse(data, callback) {
  if (callback) {
    return ContentService.createTextOutput(callback + "(" + JSON.stringify(data) + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
