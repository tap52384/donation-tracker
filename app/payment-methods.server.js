/* eslint-env node */
/* global SpreadsheetApp, ScriptApp, DriveApp, PropertiesService, Logger, HtmlService */

function fillPaymentMethodsPicker( showTrashed ) {
  var filename = 'payment-methods';
  var headers = getHeaders( filename );
  var nameColIndex = getColumnIndex( headers, 'name' );

  var sortArray = [
      { column: nameColIndex, ascending: true }
  ];

  return fillPicker( filename, sortArray, showTrashed );
}
