/* eslint-env node */
/* global SpreadsheetApp, ScriptApp, DriveApp, PropertiesService, Logger, HtmlService */

function getDonationFilterCriteria( userId, startAt, endAt ) {

    // 1. Validate the userId, startAt and endAt dates.
    if ( isNullOrEmptySpace( userId ) === true ||
    parseInt( userId, 10 ) <= 0 ) {
        log( 'invalid user id: "' + userId + '"', true, arguments );
        return SpreadsheetApp.newFilterCriteria();
    }

    var filename = 'donations';
    var startDate = new Date( startAt );
    var endDate = new Date( endAt );
    if ( isValidDateObject( startDate ) === false ||
    isValidDateObject( endDate ) === false ) {
        log( 'invalid start and/or end date. start: "' + startAt + '", ' +
        'end: "' + endAt + '"', true, arguments );
        return SpreadsheetApp.newFilterCriteria();
    }

    // 2. Get the spreadsheet with the donations
    var spreadsheet = getFileByFilename( filename );

    // 3. Get the first sheet of the spreadsheet
    var sheet = spreadsheet.getSheets()[ 0 ];

    // 4. Create the filter criteria for finding all rows where:
    // DONOR_ID = userId
    // DELETED_AT = null
    // GIVEN_AT >= startAt
    // GIVEN_AT <= endAt
    var headers = getHeaders( filename );
    var donorIdColIndex = getColumnIndex( headers, 'donor_id' );
    var deletedAtColIndex = getColumnIndex( headers, 'deleted_at' );
    var givenAtColIndex = getColumnIndex( headers, 'given_at' );



    // https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newFilterCriteria()
    // Return FilterCriteriaBuilder
    var newCriteria = SpreadsheetApp.newFilterCriteria()
    .withCriteria( SpreadsheetApp.BooleanCriteria.CUSTOM_FORMULA, )
    .whenDateAfter( startDate )
    .whenDateBefore( endDate )



}

/**
* . Creates the required "donors" spreadsheet if it doesn't already exist.
* . In Google Sheets, a "spreadsheet" represents the entire file.
* . A "sheet" is literally a sheet within the spreadsheet file. When a
* . file is created, one sheet exists by default with the name "Sheet1".
* . @returns Spreadsheet|null
*/
function getDonorsFile() {
  return getFile( 'donorsSpreadsheetFileName' );
}


/**
* . Fills the "State" select element.
*/
function fillStatePicker() {
   var states = getStates();

  var output = '<option value="">Select a state...</option>';

  for ( var key in states ) {

    output += '<option value="' + key + '">' +
      states[ key ] + '</option>';
  }

  return output;
}

function fillUsersPicker( showTrashed ) {
  var filename = 'donors';
  var headers = getHeaders( filename );
  var firstNameColIndex = getColumnIndex( headers, 'firstname' );
  var middleColIndex = getColumnIndex( headers, 'mi' );
  var lastNameColIndex = getColumnIndex( headers, 'lastname' );
  var suffixColIndex = getColumnIndex( headers, 'suffix' );
  var sortArray = [
      { column: firstNameColIndex, ascending: true },
      { column: lastNameColIndex, ascending: true },
      { column: suffixColIndex, ascending: true }
  ];

  return fillPicker( filename, sortArray, showTrashed );
}
