function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};

    // Membaca data JSON atau parameter Form
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Format tanggal & waktu WITA (Bali)
    var timestamp = Utilities.formatDate(new Date(), "Asia/Makassar", "yyyy-MM-dd HH:mm:ss");

    // Menambahkan baris ke Google Sheets
    sheet.appendRow([
      timestamp,
      data.fullName || "-",
      data.email || "-",
      data.phone || "-",
      data.tourPackage || "-",
      data.tourDate || "-",
      data.participants || "1",
      data.pickupLocation || "-",
      data.notes || "-"
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Data pemesanan berhasil disimpan!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("API Dewa Bike Tour Aktif! Gunakan metode POST untuk mengirim pemesanan.")
    .setMimeType(ContentService.MimeType.TEXT);
}
