/* eslint-env node */
/* global SpreadsheetApp, ScriptApp, DriveApp, PropertiesService, Logger, HtmlService */

/**
 * [getDonationFilterCriteria description]
 * @param  {string} userId  [description]
 * @param  {string} startAt [description]
 * @param  {string} endAt   [description]
 * @return {Range}         [description]
 */
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

    if ( isNullOrEmpty( spreadsheet ) === true ) {
        log( 'spreadsheet "' + filename + '" could not be found', true, arguments );
        return [];
    }

    // 3. Get the first sheet of the spreadsheet; every speadsheet must
    // have at least one sheet so this is safe.
    var sheet = getFirstSheet( spreadsheet );

    // 4. Clear any filters currently applied to this first sheet
    // https://developers.google.com/apps-script/reference/spreadsheet/sheet#getFilter()
    // https://developers.google.com/apps-script/reference/spreadsheet/filter#remove()
    var currentFilter = sheet.getFilter();
    if ( currentFilter !== null ) {
        log( 'a filter currently exists on this sheet; clearing...', false, arguments );
        sheet.getFilter().remove();
    }

    // 5. Get the actual data range without retrieving the file a second time
    var range = getDataRangeFromSheet( sheet );

    log( '# of all rows originally: ' + range.getNumRows(), false, arguments );

    // 6. To create a new filter for this range, use Range.createFilter()
    // https://developers.google.com/apps-script/reference/spreadsheet/filter
    var filter = range.createFilter();

    // 7. Create the filter criteria for finding all rows where:
    // DONOR_ID = userId
    // DELETED_AT = null
    // GIVEN_AT >= startAt
    // GIVEN_AT <= endAt
    var headers = getHeaders( filename );

    // Numerical column indexes (1-based) for columns needed for filter
    var donorIdColIndex = getColumnIndex( headers, 'donor_id' );
    var deletedAtColIndex = getColumnIndex( headers, 'deleted_at' );
    var givenAtColIndex = getColumnIndex( headers, 'given_at' );

    // https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newFilterCriteria()
    // Return FilterCriteriaBuilder
    var userCriteria = SpreadsheetApp.newFilterCriteria();
    userCriteria.whenNumberEqualTo( parseInt( userId, 10 ) );

    // https://developers.google.com/apps-script/reference/spreadsheet/filter#setColumnFilterCriteria(Integer,FilterCriteria)
    filter.setColumnFilterCriteria( donorIdColIndex, userCriteria.build() );

    log( 'filter includes when "donor_id" = "' + userId + '"', false, arguments );
    log( '# of filtered rows: ' + filter.getRange().getNumRows(), false, arguments );

    // 8. Loop through the rows and see if there is something unique about it
    // to tell you what data is visible

    // 5. Sort the data and return it; let the client-side script handle
    // building the UI
    var columns = {
        'GIVEN_AT': 'ascending'
    };

    var sortArray = getSortArray( filename, columns );

    // Depending on how fast filtering is, we may be able to clear filters
    // after the data range is collected, we'll see.
    return filter.getRange().sort( sortArray );

    // var givenCriteria = SpreadsheetApp.newFilterCriteria();
    // givenCriteria.whenDateEqual( startDate )
    // .whenDateAfter( startDate )
    // .whenDateE;


    // https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newFilterCriteria()
    // Return FilterCriteriaBuilder
    // var newCriteria = SpreadsheetApp.newFilterCriteria()
    // .withCriteria( SpreadsheetApp.BooleanCriteria.CUSTOM_FORMULA, )
    // .whenDateAfter( startDate )
    // .whenDateBefore( endDate )


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
