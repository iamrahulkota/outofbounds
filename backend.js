/*Apps script code of google spreadsheets
  used for storing the fedd back details
*/

var sheetName = 'Sheet1'
var scriptProp = PropertiesService.getScriptProperties()

function intialSetup () {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
}

function doPost (e) {
  var lock = LockService.getScriptLock()
  lock.tryLock(10000)

  try {
    var doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
    var sheet = doc.getSheetByName(sheetName)

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    var nextRow = sheet.getLastRow() + 1

    var newRow = headers.map(function(header) {
      return header === 'timestamp' ? new Date() : e.parameter[header]
    })

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  finally {
    lock.releaseLock()
  }
}

// This line declares a variable called "app" and assigns it a reference to a Google Spreadsheet specified by its URL
let app = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/11pHpNhKcLewbBLvf42_XuhpWwgfpogisWiQCe8hBVZo/edit#gid=0");
// This line declares a variable called "sheet" and assigns it a reference to a specific sheet within the spreadsheet specified by its name
let sheet = app.getSheetByName("Sheet1");
 
// This function is called when a POST request is made to the URL of the script
function doPost(e){
  try{
    // This line parses the request data as a JSON object and assigns it to a variable called "obj"
    let obj = JSON.parse(e.postData.contents);
    // This line decodes the base64-encoded image data and assigns it to a variable called "dcode"
    let dcode = Utilities.base64Decode(obj.base64);
    // This line creates a new blob from the decoded data, with the specified MIME type and filename, and assigns it to a variable called "blob"
    let blob = Utilities.newBlob(dcode,obj.type,obj.name);
    // This line creates a new file in the user's Google Drive from the blob data and assigns it to a variable called "newFile"
    let newFile = DriveApp.createFile(blob);
    // This line sets the sharing permissions of the new file to "anyone with the link can view", and gets a URL for downloading the file, which is assigned to a variable called "link"
    let link = newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW).getDownloadUrl();
    // This line gets the index of the last row in the sheet and assigns it to a variable called "lr"
    let lr = sheet.getLastRow();
    // This line sets a formula in the first column of the next row after the last row, which displays the image using the specified URL, and assigns it to a range
    sheet.getRange(lr+1,1).setFormula(`=IMAGE("${link}")`);
    // This line returns a plain text response indicating that the image was uploaded
    return ContentService.createTextOutput("image uploaded")
  }catch(err){
    // This line returns an error message as a plain text response if there was an error during the upload process
    return ContentService.createTextOutput(err)
  }
}
