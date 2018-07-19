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

/**
* . Fills the "Users" select element with users from the "donors" file.
* . @param  boolean showTrashed If true, shows soft deleted rows (deleted_at is not null)
* . @return string
*/
//function fillUsersPicker(showTrashed) {
//
//  var data = getAllDonors();
//  var rowCount = data.getNumRows();
//  var output = '<option value="">Select a user...</option>';
//
//  var headers = getHeaders('donors');
//  var firstNameColIndex = getColumnIndex(headers, 'firstname');
//  var lastNameColIndex = getColumnIndex(headers, 'lastname');
//  var idColIndex = getColumnIndex(headers, 'id');
//  var deletedAtColIndex = getColumnIndex(headers, 'deleted_at');
//
//  // sort the data now that we have the index for the
//  // firstname and lastname headers
//  data = data.sort(
//    [
//      {column: firstNameColIndex, ascending: true},
//      {column: lastNameColIndex, ascending: true}
//    ]
//  );
//
//  // loop through all of the cells in order to fill the Users picker
//  for (var row = 1; row <= rowCount; row++) {
//    var firstName = data.getCell(row, firstNameColIndex).getValue();
//    var lastName = data.getCell(row, lastNameColIndex).getValue();
//    var id = data.getCell(row, idColIndex).getValue();
//    var deletedAt =
//        data.getCell(row, deletedAtColIndex).getValue();
//
//    // if the data is invalid or deleted and showTrashed is not true,
//    // then simply skip over this row of data
//    if (isNullOrEmptySpace(id) || isNullOrEmptySpace(firstName) ||
//       (showTrashed !== true && isNullOrEmptySpace(deletedAt) === false)) {
//       continue;
//    }
//
//    output += '<option value="' + id + '">' +
//      titleCase(firstName + ' ' + lastName) + '</option>';
//  }
//
//  return output;
//}

//function getDonorObject(userId) {
//  var object = getObject('donors', userId);
//  log('getDonorObject(); user #' + userId + ': ' + JSON.stringify(object));
//  return object;
//}
