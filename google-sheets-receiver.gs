const REQUESTS_SHEET_NAME = "Project Requests";
const SPREADSHEET_ID_PROPERTY = "REQUESTS_SPREADSHEET_ID";
const UPLOAD_FOLDER_ID_PROPERTY = "REQUESTS_UPLOAD_FOLDER_ID";
const MAX_UPLOAD_FILES = 10;
const MAX_UPLOAD_BYTES_PER_FILE = 5 * 1024 * 1024;
const MAX_UPLOAD_BYTES_TOTAL = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = {
  "image/jpeg": true,
  "image/png": true,
  "image/gif": true,
  "image/webp": true,
  "image/heic": true,
  "image/heif": true,
  "application/pdf": true,
  "application/msword": true,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": true
};

function setupRequestsSheet() {
  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty(SPREADSHEET_ID_PROPERTY);
  if (existingId) {
    const existingSpreadsheet = SpreadsheetApp.openById(existingId);
    const existingSheet = existingSpreadsheet.getSheetByName(REQUESTS_SHEET_NAME);
    if (existingSheet) {
      existingSheet.getRange(1, 13).setValue("Reference / Uploaded Files (Drive links)");
    }
    return existingSpreadsheet.getUrl();
  }

  const spreadsheet = SpreadsheetApp.create("MARK-NEWTON WEB STUDIO - Project Requests");
  const sheet = spreadsheet.getSheets()[0];
  sheet.setName(REQUESTS_SHEET_NAME);
  sheet.appendRow([
    "Submitted At",
    "Full Name",
    "Business / Brand",
    "WhatsApp",
    "Email",
    "Social Media Handle",
    "Location",
    "Service",
    "Package",
    "Project Description",
    "Preferred Deadline",
    "Estimated Budget",
    "Reference / Uploaded Files (Drive links)",
    "Additional Requirements (JSON)"
  ]);
  sheet.setFrozenRows(1);
  properties.setProperty(SPREADSHEET_ID_PROPERTY, spreadsheet.getId());
  return spreadsheet.getUrl();
}

function doGet() {
  return HtmlService.createHtmlOutput(
    "The project request receiver is online. Submit requests through the website form."
  );
}

function doPost(event) {
  const parameters = event && event.parameters;
  if (!parameters) {
    return responsePage("Request not received", "The request data was missing. Please return to the form and try again.", false);
  }

  const values = {};
  Object.keys(parameters).forEach(function (key) {
    values[key] = Array.isArray(parameters[key])
      ? parameters[key].map(String).join(", ")
      : String(parameters[key] || "");
  });

  if (values.website) {
    return responsePage("Request not received", "The request could not be accepted. Please return to the form and try again.", false);
  }

  const requiredFields = ["fullName", "whatsapp", "service", "projectDescription", "agreement"];
  const missingField = requiredFields.find(function (field) {
    return !values[field] || !values[field].trim();
  });
  if (missingField) {
    return responsePage("Request not received", "Some required information is missing. Please return to the form and complete all required fields.", false);
  }

  const textFields = [
    "fullName",
    "businessName",
    "whatsapp",
    "email",
    "socialHandle",
    "location",
    "service",
    "package",
    "projectDescription",
    "deadline",
    "budget",
    "reference"
  ];
  const maxFieldLength = 10000;
  const oversizedField = textFields.find(function (field) {
    return values[field] && values[field].length > maxFieldLength;
  });
  if (oversizedField) {
    return responsePage("Request not received", "One of the answers is too long. Please shorten it and submit the form again.", false);
  }

  let uploads;
  try {
    uploads = values.fileUploads ? JSON.parse(values.fileUploads) : [];
  } catch (error) {
    return responsePage("Request not received", "The uploaded files could not be processed. Please try again.", false);
  }
  if (!Array.isArray(uploads)) {
    return responsePage("Request not received", "The uploaded files could not be processed. Please try again.", false);
  }
  if (uploads.length > MAX_UPLOAD_FILES) {
    return responsePage("Request not received", "You can attach up to 10 files. Please remove some files and submit again.", false);
  }

  let totalEncodedLength = 0;
  const invalidUpload = uploads.find(function (upload) {
    if (!upload || typeof upload.name !== "string" || typeof upload.type !== "string" || typeof upload.data !== "string") {
      return true;
    }
    const safeName = upload.name.replace(/[\\/:*?"<>|]/g, "_").slice(0, 180);
    const encodedLength = upload.data.length;
    totalEncodedLength += encodedLength;
    return !safeName ||
      !/\.(jpe?g|png|gif|webp|heic|heif|pdf|docx?)$/i.test(safeName) ||
      !ALLOWED_UPLOAD_TYPES[upload.type.toLowerCase()] ||
      encodedLength > Math.ceil(MAX_UPLOAD_BYTES_PER_FILE / 3) * 4 ||
      !/^[A-Za-z0-9+/]*={0,2}$/.test(upload.data) ||
      encodedLength % 4 !== 0;
  });
  if (invalidUpload || totalEncodedLength > Math.ceil(MAX_UPLOAD_BYTES_TOTAL / 3) * 4) {
    return responsePage("Request not received", "One or more uploaded files are invalid or exceed the upload limits. Please check the file types and sizes.", false);
  }

  const spreadsheetId = PropertiesService.getScriptProperties()
    .getProperty(SPREADSHEET_ID_PROPERTY);
  if (!spreadsheetId) {
    return responsePage("Request not received", "The request receiver has not been set up yet. Please contact the studio directly.", false);
  }

  const createdFiles = [];
  try {
    let totalUploadBytes = 0;
    uploads.forEach(function (upload) {
      if (!upload || typeof upload.name !== "string" || typeof upload.type !== "string" || typeof upload.data !== "string") {
        throw new Error("Invalid uploaded file data.");
      }

      const bytes = Utilities.base64Decode(upload.data);
      totalUploadBytes += bytes.length;
      if (bytes.length > MAX_UPLOAD_BYTES_PER_FILE || totalUploadBytes > MAX_UPLOAD_BYTES_TOTAL) {
        throw new Error("Uploaded files exceed the size limit.");
      }
      if (!ALLOWED_UPLOAD_TYPES[upload.type.toLowerCase()]) {
        throw new Error("An uploaded file type is not allowed.");
      }

      const safeName = upload.name.replace(/[\\/:*?"<>|]/g, "_").slice(0, 180);
      if (!safeName) {
        throw new Error("An uploaded file has an invalid name.");
      }
    });

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(REQUESTS_SHEET_NAME);
    if (!sheet) {
      throw new Error("The project requests sheet is missing. Run setupRequestsSheet again.");
    }

    const uploadLinks = [];
    if (uploads.length) {
      const folder = getUploadFolder();
      uploads.forEach(function (upload) {
        const bytes = Utilities.base64Decode(upload.data);
        const safeName = upload.name.replace(/[\\/:*?"<>|]/g, "_").slice(0, 180);
        const blob = Utilities.newBlob(bytes, upload.type.toLowerCase(), safeName);
        const file = folder.createFile(blob);
        createdFiles.push(file);
        uploadLinks.push(file.getName() + ": " + file.getUrl());
      });
    }

    const extraFields = {};
    Object.keys(values).forEach(function (key) {
      if (textFields.indexOf(key) === -1 && key !== "agreement" && key !== "website" && key !== "fileUploads") {
        extraFields[key] = values[key];
      }
    });

    const row = [
      new Date(),
      values.fullName,
      values.businessName,
      values.whatsapp,
      values.email,
      values.socialHandle,
      values.location,
      values.service,
      values.package,
      values.projectDescription,
      values.deadline,
      values.budget,
      [values.reference, uploadLinks.join("\n")].filter(Boolean).join("\n"),
      JSON.stringify(extraFields)
    ].map(safeCellValue);

    sheet.appendRow(row);
    return responsePage(
      "Thank You from MARK-NEWTON WEB STUDIO!",
      "Your project request has been received successfully. We appreciate you choosing MARK-NEWTON WEB STUDIO. Our team will review your details and contact you soon.",
      true
    );
  } catch (error) {
    createdFiles.forEach(function (file) {
      try {
        file.setTrashed(true);
      } catch (cleanupError) {
        console.error(cleanupError);
      }
    });
    console.error(error);
    return responsePage("Request not received", "We could not save your request or uploaded files right now. Please contact the studio directly and try again later.", false);
  }
}

function getUploadFolder() {
  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty(UPLOAD_FOLDER_ID_PROPERTY);
  if (existingId) {
    return DriveApp.getFolderById(existingId);
  }

  const folder = DriveApp.createFolder("MARK-NEWTON WEB STUDIO - Project Request Uploads");
  properties.setProperty(UPLOAD_FOLDER_ID_PROPERTY, folder.getId());
  return folder;
}

function setupRequestUploads() {
  return getUploadFolder().getUrl();
}

function safeCellValue(value) {
  if (typeof value === "string" && /^[=+\-@]/.test(value)) {
    return "'" + value;
  }
  return value;
}

function responsePage(title, message, success) {
  const color = success ? "#15803d" : "#b91c1c";
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const html = '<!doctype html><html lang="en"><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + safeTitle + ' | MARK-NEWTON WEB STUDIO</title>' +
    '<style>body{font:16px Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:40px 18px}' +
    'main{max-width:620px;margin:10vh auto;background:#fff;padding:36px;border-radius:16px;' +
    'box-shadow:0 16px 40px #0f172a14;text-align:center}h1{color:' + color + ';margin:18px 0 12px}' +
    'p{line-height:1.7;color:#475569}.status-icon{width:56px;height:56px;margin:auto;border-radius:50%;' +
    'background:' + (success ? "#dcfce7" : "#fee2e2") + ';color:' + color +
    ';font-size:32px;line-height:56px;font-weight:bold}</style><main>' +
    (success ? '<div class="status-icon" aria-hidden="true">&#10003;</div>' : '') +
    '<h1>' + safeTitle + '</h1><p>' + safeMessage + '</p></main></html>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[character];
  });
}
