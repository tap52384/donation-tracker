/* eslint-env node */
/* global SpreadsheetApp, ScriptApp, DriveApp, PropertiesService, Logger,
HtmlService, Utilities, Session */

if ( typeof __dirname !== 'undefined' ) {
  console.log( '__dirname: ' + __dirname );
  require( __dirname + '/polyfills.server.js' );
  require( __dirname + '/enums.js' );
}

/**
 * Returns true if the specified variable is null, undefined, or an empty string.
 * @param  {[type]}  x [description]
 * @return {Boolean}   [description]
 */
function isNullOrEmpty( x ) {
    return x === undefined || x === '' || x === null;
}

/**
* Returns true if the specified variable is null, empty, or with all spaces
* removed an empty string.
*/
function isNullOrEmptySpace( x ) {
    return isNullOrEmpty( x ) || typeof x.trim === 'function' &&
    isNullOrEmpty( x.trim().replace( / /g, '' ) );
}

/**
 * [isBrowser description]
 * @return {Boolean} [description]
 */
function isBrowser() {
   return typeof( window ) !== 'undefined' &&
   typeof document !== 'undefined' &&
   isNullOrEmpty( window ) === false &&
   isNullOrEmpty( document ) === false;
}

/**
 * Retrieves the name of the function for logging purposes.
 * @param  {function|arguments} obj A function or its arguments.
 * @return {string}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments|MDN}
 */
function getFnName( obj ) {
    if ( isNullOrEmpty( obj ) === true ) {
        return '';
    }

    if ( obj && obj.callee && obj.callee.name ) {
        return obj.callee.name;
    }

    // Match:
    // - ^          the beginning of the string
    // - function   the word 'function'
    // - \s+        at least some white space
    // - ([\w\$]+)  capture one or more valid JavaScript identifier characters
    // - \s*        optionally followed by white space (in theory there won't
    //              be any here, so if performance is an issue this can be
    //              omitted[1]
    // - \(         followed by an opening brace
    //
    var result = /^function\s+([\w\$]+)\s*\(/.exec( obj.toString() );

    // for an anonymous function there
    // won't be a match
    return  result  ?  result[ 1 ]  :  '';
}

/**
 * Returns true if the object is a string.
 * @param  {[type]}  s [description]
 * @return {Boolean}   [description]
 */
function isValidStringObject( s ) {
    return isNullOrEmpty( s ) === false &&
    Object.prototype.toString.call( s ) === '[object String]';
};

/**
* . Returns a single row of data as an associative array of values
* . where the column names are the keys for the specific object.
* . @param  string filename
* . @param  int    rowId
* . @return object
*/
function getObject( filename, rowId ) {

  // empty case: no row ID specified
  if ( isNullOrEmptySpace( rowId ) === true ) {
      log( 'no row id specified: ' + rowId, true, arguments );
      return {};
  }

  // only attempt to retrieve the data if a row ID is specified
  var data = getAllData( filename );

  // empty case: the file does not exist or the file
  // is empty
  if ( data === null ) {
      log(
          'no object was returned for rowId "' + rowId + '"',
          false,
          arguments
      );
      return {};
  }

  var rowCount = data.getNumRows();
  var headers = getHeaders( filename );
  var idColIndex = getColumnIndex( headers, 'id' );
  var deletedAtColIndex = getColumnIndex( headers, 'deleted_at' );
  var object = {};

  // loop through all of the cells in order to fill the Users picker
  for ( var row = 1; row <= rowCount; row++ ) {

    // skip unnecessary and deleted (unless showTrashed = true)
    // this code should probably be on getAllData, not getObject
    var id = data.getCell( row, idColIndex ).getValue();

    // var deletedAt = data.getCell( row, deletedAtColIndex ).getValue();

    if ( parseInt( rowId, 10 ) !== parseInt( id, 10 ) ) {
       continue;
    }

    log( 'found the row for userId ' + rowId, false, arguments );

    for ( var key in headers ) {
        var header = headers[ key ];
        var colIndex = getColumnIndex( headers, header );
        var value = data.getCell( row, colIndex ).getValue();

      log( 'current header: ' + header, false, arguments );

        // dates cannot be returned with success handlers for some reason
        // was able to confirm that Date objects are not handled properly.
        // this is mitigated by converting all Date objects to a string, yuck
        // Date.getTime() is not supported in this environment
        // https://developers.google.com/apps-script/guides/html/reference/run#myFunction(...)
        // https://developers.google.com/apps-script/reference/utilities/utilities#formatdatedate-timezone-format
      if ( isDateColumn( header ) === true && typeof value === typeof new Date() ) {
         log( header + ' is a Date object ' + value +
         '; converting to string...', false, arguments );

         // https://developers.google.com/apps-script/reference/utilities/utilities#formatdatedate-timezone-format
         // "yyyy-MM-dd mm:hh:ss a"
         value = Utilities.formatDate( value, 'GMT', 'yyyy-MM-dd' );
        log( 'getObject(); formatDate value: ' + value );
      }

        // save the value in the object
        object[ header ] = value;
        log( header + ': ' + object[ header ] );
    }

    // stop here since we found the object we are looking for
    break;
  }

  log(
      'row ' + rowId + ' of ' + filename + ': ' + JSON.stringify( object ),
      false,
      arguments
  );
  return object;
}

/**
 * Returns true if the specified header name ends in "_AT," which indicates
 * it is a date column. Case-sensitive.
 * @param  {string}  header [description]
 * @return {Boolean}
 */
function isDateColumn( header ) {
   return isValidStringObject( header ) === true &&
   header.endsWith( '_AT' ) === true;
}

/**
* Returns a single row of data as an associative array of values
* where the column names are the keys for the specific object.
* @param  string filename
* @param  int    rowId
* @return object
*/
// function getObject2( filename, rowId ) {
//
//   // 1. Get the first sheet of the specified Spreadsheet
//   var spreadsheet = getFileByFilename( filename );
//   var sheet = spreadsheet.getSheets()[ 0 ];
//
//   // 2. The ID is always in the first column. Search just
//   // that column for the value. When it's found, return the 1-based
//   // row number
//   // Offset should skip the first row (row with the column headers)
//   var column = sheet.getRange( 'A:A' ).offset( 1, 0 );
//
//   // https://developers.google.com/apps-script/reference/spreadsheet/range#getValues()
//   var values = column.getValues();
//   var rowCount = values.length;
//
//   // 3. Using the values in the column, loop until you find the
//   // value you are looking for.
//   for ( var row = 1; row <= rowCount; row++ ) {
//
//   }
//
//   return {};
// }

/**
 * Returns the data range for the specified file, skipping the first row which
 * contains the row headers.
 * @param  {string} filename [description]
 * @return {Range}          [description]
 */
function getDataRangeByFilename( filename ) {

    // 1. Get the Spreadsheet object representing the specified file
    var spreadsheet = getFileByFilename( filename );

    if ( spreadsheet === null ) {
      log( 'the spreadsheet ' + filename + ' was not found or loaded...',
        false,
        arguments
      );
      return null;
    }

    // 2. Get the first sheet of the file
    var sheet = getFirstSheet( spreadsheet );

    // get the range of cells with actual data there
    // https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getDataRange()
    // returns Range
    // https://developers.google.com/apps-script/reference/spreadsheet/range
    // offset should skip the first row (row with the column headers)
    // https://developers.google.com/apps-script/reference/spreadsheet/range#offsetrowoffset-columnoffset
    return getDataRangeFromSheet( sheet );
}

/**
 * When retrieving data from a Sheet, skips the first row (frozen header row).
 * @param  {[type]} sheet [description]
 * @return {Range}       [description]
 */
function getDataRangeFromSheet( sheet ) {
    var range = getAllDataFromSheet( sheet );

    return range === null ? null : range.offset( 1, 0 );
}

/**
 * Retrieves all data as a Range from a Sheet object (includes header row).
 * @param  {[type]} sheet
 * @return {Range}
 */
function getAllDataFromSheet( sheet ) {
    if ( isNullOrEmpty( sheet ) === true ||
    typeof sheet.getDataRange !== 'function' ) {
        log( 'Invalid Sheet or Spreadsheet object specified', true, arguments );
        return null;
    }
    return sheet.getDataRange();
}

/**
* . Returns all data for the specified file as a Range.
* . @param  string filename Either "donors," "donation-types," "donations", or "payment-methods"
* . @return Range|null
*/
function getAllData( filename ) {

  // get the data range for the specified spreadsheet
  var data = getDataRangeByFilename( filename );

  if ( data === null ) {
     return null;
  }

  // var rowCount = data.getNumRows();
  // var colCount = data.getNumColumns();

  // this code used to sort the data; no need as all data will be sorted
  // depending on what it is
  // var headers = getHeaders( filename );
  // var idColIndex = getColumnIndex( headers, 'id' );
  //
  // // sort the data by id
  // data = data.sort(
  //   [
  //     { column: idColIndex, ascending: true }
  //   ]
  // );

  return data;
}


/**
* . Returns a file by filename if it exists.
* . @return {Spreadsheet|null}
*/
function getFileByFilename( filename ) {

    filename = ( '' + filename ).toLowerCase();

    return getFile( filename );
}

/**
 * Returns a Spreadsheet object for the specified filename.
 * @param  {string} propertyName [description]
 * @return {Spreadsheet|null}
 * @see https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#openfile
 */
function getFile( propertyName ) {

  if ( isNullOrEmptySpace( propertyName ) === true ) {
      log( 'propertyName: "' + propertyName + '" is invalid',
      true,
      arguments );
      return null;
  }

  // 1. Get the filename for the spreadsheet based on the script property
  var name = PropertiesService.getScriptProperties().getProperty( propertyName );

  // stop here if the string is null or empty space
  if ( isNullOrEmptySpace( name ) === true ) {
     log( 'could not retrieve the filename for the "' + propertyName +
     '" spreadsheet from the PropertiesService.', true, arguments );
     return null;
  }

  // If the file already exists, then return true
  // Class DriveApp - https://developers.google.com/apps-script/reference/drive/drive-app
  var appFolder = getDataFolder();

  if ( appFolder === null ) {
     log( 'the app folder does not exist and could not be created.',
        true,
        arguments
     );
     return null;
  }

  // returns FileIterator
  // https://developers.google.com/apps-script/reference/drive/file-iterator
  var files = appFolder.getFilesByName( name );

  if ( files.hasNext() === false ) {
     log( 'getFile(); the \'' + name + '\' file does not exist. will attempt creation.' );
     var spreadsheet = createFile( appFolder, name );
     var headers = getHeaders( name );

     log( 'getFile(); the \'' + name + '\' file has been created. initializing...' );
     return initializeFile( spreadsheet, headers );
  }

  // the file already exist, simply return it as a Spreadsheet object
  return SpreadsheetApp.open( files.next() );
}

/**
* Creates the specified Spreadsheet in the /apps/donation-manager folder.
* . It's blank and needs headers added to it.
* . @return Spreadsheet
*/
function createFile( folder, filename ) {

  // do I create it and then move it to the folder? that seems
  // to be the way I may have to go.
  // returns Spreadsheet
  var spreadsheet = SpreadsheetApp.create( filename );

  // use the ID of the spreadsheet in order to move it to the
  // specified folder
  var fileId = spreadsheet.getId();
  var file = DriveApp.getFileById( fileId );

  // change the parent folder of the file (apparently a file can have multiple
  // parents) by adding the file to the app folder and removing it from root
  folder.addFile( file );
  DriveApp.getRootFolder().removeFile( file );

  return spreadsheet;
}

/**
* . Get the first (and only) sheet from the specified file.
* . @param  string filename
* . @return Sheet
*/
function getSheetFromSpreadsheet( filename ) {
   var spreadsheet = getFileByFilename( filename );

   return getFirstSheet( spreadsheet );
}

/**
* . Sets the format for the date related cells as date/time.
* . @param  Sheet  sheet
* . @param  string header
* . @param  string columnLetter
* . @return boolean
*/
function setColDateTimeFmt( sheet, header, columnLetter ) {

  // makes sure the header ends with _AT (used for all date columns)
  if ( isNullOrEmptySpace( header ) === true ||
     header.endsWith( '_AT' ) === false ||
     isNullOrEmptySpace( columnLetter ) === true ) {
     return false;
  }

  // with the columnLetter, we can get the correct range to format correctly
  var entireColumn = sheet.getRange( columnLetter + ':' + columnLetter ).offset( 1, 0 );

  // set the format for this range which should cover all future entries
  // https://developers.google.com/apps-script/reference/spreadsheet/range#setNumberFormat(String)
  // https://developers.google.com/sheets/api/guides/formats
  entireColumn.setNumberFormat( 'mm/dd/yyyy hh:mm:ss AM/PM' );

  // create a data validation rule for this range
  // https://developers.google.com/apps-script/reference/spreadsheet/range#setDataValidation(DataValidation)
  // https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireDate()
  var rule = SpreadsheetApp.newDataValidation().requireDate()
  .setAllowInvalid( false )
  .setHelpText( 'Must be a valid date/time' )
  .build();
  entireColumn.setDataValidation( rule );

  return true;
}

function setIdFmt( sheet, header, columnLetter ) {

  // makes sure the header ends with _AT (used for all date columns)
  if ( isNullOrEmptySpace( header ) === true ||
     ( header.endsWith( '_ID' ) === false && header !== 'ID' ) ||
     isNullOrEmptySpace( columnLetter ) === true ) {
     return false;
  }

  // with the columnLetter, we can get the correct range to format correctly
  var entireColumn = sheet.getRange( columnLetter + ':' + columnLetter ).offset( 1, 0 );

  // set the format for this range which should cover all future entries
  // https://developers.google.com/apps-script/reference/spreadsheet/range#setNumberFormat(String)
  // https://developers.google.com/sheets/api/guides/formats
  entireColumn.setNumberFormat( '#######0' );

  // for all _ID column, make sure the value is a number greater than 0
  var standardRule = SpreadsheetApp.newDataValidation()
  .requireNumberGreaterThanOrEqualTo( 0 )
  .setHelpText( 'Must be a number greater than 0' )
  .setAllowInvalid( false )
  .build();

  if ( header !== 'ID' ) {
     entireColumn.setDataValidation( standardRule );
     return true;
  }

  // for the main ID column, make sure the value is a number
  // AND make sure no values repeat
  // https://webapps.stackexchange.com/a/85849
  // https://support.google.com/docs/answer/3256550
  var criteria = SpreadsheetApp.DataValidationCriteria.CUSTOM_FORMULA;

  // ISNUMBER
  // https://support.google.com/docs/answer/3093296?hl=en
  // AND
  // https://support.google.com/docs/answer/3093301?hl=en
  // Multiple COUNTIF for combining criteria
  // https://www.ablebits.com/office-addins-blog/2017/06/29/countif-google-sheets/
  // =AND(ISNUMBER(A1), COUNTIF($A:$A,"="&A1) + COUNTIF($A:$A,"<=0") < 2)
  var formula = '=COUNTIF($' + columnLetter + ':$' + columnLetter + ',"="&' +
  columnLetter + '1) + ' +
    'COUNTIF($' + columnLetter + ':$' + columnLetter + ',"<=0") < 2';
  var args = [ formula ];

  var combinedRule = SpreadsheetApp.newDataValidation()
  .requireFormulaSatisfied( formula )
  .setHelpText( 'ID must be a unique number greater than 0' )
  .setAllowInvalid( false )
  .build();

  entireColumn.setDataValidation( combinedRule );
  return true;
}

/**
 * [setCurrencyFmt description]
 * @param {[type]} sheet        [description]
 * @param {[type]} header       [description]
 * @param {[type]} columnLetter [description]
 */
function setCurrencyFmt( sheet, header, columnLetter ) {

  // makes sure the header ends with _AT (used for all date columns)
  if ( isNullOrEmptySpace( header ) === true ||
     header !== 'AMOUNT' ||
     isNullOrEmptySpace( columnLetter ) === true ) {
     return false;
  }

  // with the columnLetter, we can get the correct range to format correctly
  var entireColumn = sheet.getRange( columnLetter + ':' + columnLetter ).offset( 1, 0 );

  // set the format for this range which should cover all future entries
  // https://developers.google.com/apps-script/reference/spreadsheet/range#setNumberFormat(String)
  // https://developers.google.com/sheets/api/guides/formats
  entireColumn.setNumberFormat( '$#.00' );

  var rule = SpreadsheetApp.newDataValidation()
  .requireNumberGreaterThanOrEqualTo( 0 )
  .setAllowInvalid( false )
  .setHelpText( 'Amount must be greater than 0' )
  .build();
  entireColumn.setDataValidation( rule );

  return true;
}

/**
* Formats the column to only accept email addresses if applicable.
* @param . sheet
* @param . header
* @param   columnLetter
* @return .boolean
*/
function setEmailFmt( sheet, header, columnLetter ) {

  // makes sure the header equals "EMAIL"
  if ( isNullOrEmptySpace( header ) === true ||
      header.toLowerCase() !== 'email' ) {
      return false;
  }

  // with the columnLetter, we can get the correct range to format correctly
  var entireColumn = sheet.getRange( columnLetter + ':' + columnLetter ).offset( 1, 0 );

  // set the data validation rule for email addresses
  var rule = SpreadsheetApp.newDataValidation()
  .requireTextIsEmail()
  .setAllowInvalid( false )
  .setHelpText( 'Must be a valid email address' )
  .build();
  entireColumn.setDataValidation( rule );

  return true;
}

/**
 * Returns the first Sheet of the specified Spreadsheet object.
 * @param  {Spreadsheet} spreadsheet [description]
 * @return {Sheet|null}             [description]
 */
function getFirstSheet( spreadsheet ) {
    return typeof spreadsheet.getSheets === 'function' ?
    spreadsheet.getSheets()[ 0 ] :
    null;
}

/**
* Adds the column headers to the spreadsheet needed for storing data. This
* function also adds restrictions to columns based on data type (date, number,
* etc).
* @param  Spreadsheet spreadsheet The spreadsheet to add the header row to.
* @param  array       headers     The headers to add to the Spreadsheet.
* @return Spreadsheet
*/
function initializeFile( spreadsheet, headers ) {
  if ( spreadsheet === null ) {
    return null;
  }

  // get the first sheet of the spreadsheet
  var sheet = getFirstSheet( spreadsheet );

  // add the headers to the first cell in each column in the first row (A)
  var numHeaders = headers.length;

  for ( var i = 0; i < numHeaders; i++ ) {
    var columnLetter = getColumnLetter( i + 1 );
    var header = headers[ i ];

    // https://developers.google.com/apps-script/reference/spreadsheet/range#getCell(Integer,Integer)
    // https://developers.google.com/apps-script/reference/spreadsheet/range#setValue(Object)
    var headerCell = sheet.getRange( columnLetter + '1' );
    headerCell.setValue( headers[ i ] );

    // set the column format to DateTime if applicable
    setColDateTimeFmt( sheet, header, columnLetter );

    // set the column format to Numbers if applicable
    setIdFmt( sheet, header, columnLetter );

    // set the column format for currency if applicable
    setCurrencyFmt( sheet, header, columnLetter );

    // set the column format for email if applicable
    setEmailFmt( sheet, header, columnLetter );
  }

  // TODO: Use DataValidation to make sure that all IDs are unique (A column)
  // https://webapps.stackexchange.com/a/85849
  // if done upon file creation, it should never be a problem

  // freeze the first row
  // https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setFrozenRows(Integer)
  sheet.setFrozenRows( 1 );

  return spreadsheet;
}

/**
* . Get the letter representing the column no matter the numerical
* . index (24 or 404).
* . @returns string
*/
function getColumnLetter( index ) {
 var alphas = getAlphabet();
 var numAlphas = alphas.length;
 var output = '';

 var quotient = Math.floor( index / numAlphas );
 var remainder = index % numAlphas;
 var power = getColumnLetterPower( index );

  // the answer has to do with powers
  // 26^0 to 26^1 = 1 character
  // 26^1 to 26^2 = 2 characters
  for ( var i = 1; i < power; i++ ) {
     var quotient = Math.floor( index / ( Math.pow( numAlphas, i ) ) );
     output += alphas[ quotient - 1 ];
  }

  output += alphas[ remainder - 1 ];

  return output;
}

/**
 * [getAlphabet description]
 * @return {array} [description]
 */
function getAlphabet() {
 return [
   'a',
   'b',
   'c',
   'd',
   'e',
   'f',
   'g',
   'h',
   'i',
   'j',
   'k',
   'l',
   'm',
   'n',
   'o',
   'p',
   'q',
   'r',
   's',
   't',
   'u',
   'v',
   'w',
   'x',
   'y',
   'z'
 ];
}

/**
* . Used to determine how many characters are in the column
* . name. For example, the first column has 1, the 29th
* . has 2, and the
* . @returns int
* . TODO: technically, this function is not correct
* . 26^1 = 26 (one character)
* . 26^1 + 1 = 27 (two characters)
* . 26^2 + 26 = (three characters)
* . 26^3 + 26 + (four characters)
*/
function getColumnLetterPower( index ) {
  var alphas = getAlphabet();
  var numAlphas = alphas.length;
  var power = 1;

  while ( index > Math.pow( numAlphas, power ) ) {
    power = power + 1;
  }

  return power;
}

/**
* . Retrieves/creates folders within the apps/donation-tracker folder.
* . @param  string folderName
* . @return Folder
*/
function getFolder( folderName ) {

  if ( isNullOrEmptySpace( folderName ) === true ) {
     return null;
  }

  var appFolder = getAppFolder();

  return dirGetOrCreate( appFolder, folderName );
}

function getDataFolder() {
   return getFolder( 'data' );
}

function getReportsFolder() {
   return getFolder( 'reports' );
}

/**
* . Retrieves the specified folder or creates it if it doesn't exist.
* . @param  Folder parentFolder
* . @param  string folderName
* . @return Folder
*/
function dirGetOrCreate( parentFolder, folderName ) {

   if ( isNullOrEmptySpace( parentFolder ) === true ||
       isNullOrEmptySpace( folderName ) === true ) {
     return null;
   }

  // see if the folder already exists
  // https://developers.google.com/apps-script/reference/drive/drive-app#getFoldersByName(String)
  // Returns FolderIterator
  // https://developers.google.com/apps-script/reference/drive/folder-iterator
  var folders = parentFolder.getFoldersByName( folderName );

  // https://developers.google.com/apps-script/reference/drive/drive-app#createFolder(String)
  // returns Folder
  // https://developers.google.com/apps-script/reference/drive/folder
  return folders.hasNext() === false ? parentFolder.createFolder( folderName ) : folders.next();
}

/**
* . Returns a Folder object for the folder associated with this application.
* . TODO: Ideally, this should be apps/donation-tracker
* . @returns Folder|null
*/
function getAppFolder() {

  // Class DriveApp - https://developers.google.com/apps-script/reference/drive/drive-app
  var root = DriveApp.getRootFolder();

  // get the folder name for the app folder
  var appFolderName = PropertiesService.getScriptProperties()
  .getProperty( 'appFolderName' );

  var addonsRootFolderName = PropertiesService.getScriptProperties()
  .getProperty( 'addonsRootFolderName' );

  // stop here if the string is null or empty space
  if ( isNullOrEmptySpace( appFolderName ) === true ||
  isNullOrEmptySpace( addonsRootFolderName ) === true ) {
     log( 'getAppFolder(); could not retrieve the folder name for this ' +
     'add-on from the PropertiesService.' );
     return null;
  }

  // create the add-ons folder
  var rootAddonsFolder = dirGetOrCreate( root, addonsRootFolderName );

  // create the apps/donation-tracker folder
  var donationTrackerFolder = dirGetOrCreate( rootAddonsFolder, appFolderName );

  // return the Folder object
  return donationTrackerFolder;
}

/**
 * Returns true if the specified property exists in the specified object.
 * @param obj An object.
 * @param prop A property name, property has to be a string.
 * @return bool
 */
function hasProperty( obj, prop ) {

    return isNullOrEmptySpace( obj ) === false &&
    isNullOrEmptySpace( prop ) === false &&
    (
        Object.prototype.hasOwnProperty.call( obj, prop ) ||
        obj.hasOwnProperty( prop ) ||
        obj.prop !== undefined ||
        'undefined' !== typeof obj[ prop ]
    );
};

/**
 * Returns true if the specified object has no properties.
 * @param obj An object.
 * @return bool
 */
function isEmptyObject( obj ) {

    // empty objects have no properties
    if ( obj === null || obj === undefined ) {
        log( getFnName( this ) + '(): object is null or undefined.' );
        return true;
    }

    // ECMAScript5 method of counting properties
    if ( Object && hasProperty( Object, 'getOwnPropertyNames' ) ) {
        var length = Object.getOwnPropertyNames( obj ).length;
        log( 'isEmptyObject(): getOwnPropertyNames revealed ' +
        length + ' properties in this object.' );
        return Object.getOwnPropertyNames( obj ).length === 0;
    }

    if ( obj.length && obj.length > 0 ) {
        log( 'isEmptyObject(): object has a length property greater than 0' );
        return false;
    }

    for ( var key in obj ) {
        if ( obj[ key ] !== null ) {
            log( 'isEmptyObject(): hasOwnProperty found at least one property.' );
            return false;
        }
    }

    // default value
    log( 'isEmptyObject(): failed to prove at least one property exists.' );
    return true;
};


/**
 * [printProperties description]
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
function printProperties( obj ) {

    // stop here if the object is empty
    if ( isEmptyObject( obj ) === true ) {
        log( 'The specified object does not have any properties.' );
        return;
    }

    log( 'specified object is not empty: ' + obj );

    Object.getOwnPropertyNames( obj ).forEach(
        function( val ) {

            // if an object, call this object recursively?
            var type = Object.prototype.toString.call( obj[ val ] );

            if ( type === '[object Object]' ||
            type.indexOf( '[object' ) !== -1 ) {
                log( val + ':' );
                printProperties( obj[ val ] );
            }

            log( val + ' -> ' + obj[ val ] );
        }
    );
}

/**
* . Saves the specified data. If no rowId is specified,
* . a new row is created.
* . @param  string filename
* . @param  int    rowId
* . @param  object data
* . @return boolean
*/
function saveData( filename, rowId, data ) {

  // 0. Make sure the filename is not null or empty
  if ( isNullOrEmptySpace( filename ) === true ) {
    log( 'saveData(); could not save data as no filename was specified. stopping...' );
    return false;
  }

  // 1. Is this an update or a create? The row ID decides.
  var originalRowId = rowId;
  if ( isNullOrEmptySpace( rowId ) === true ||
      rowIdIsValid( filename, parseInt( rowId, 10 ) ) === false ) {
     rowId = getNextId( filename );
  }
  log( 'saveData(); calculated id: ' + rowId );

  // See if rowId is empty
  var isNewRow = isNullOrEmptySpace( originalRowId ) === true ||
      parseInt( originalRowId, 10 ) !== parseInt( rowId, 10 );

  // 2. Stop here if there is no data to be added
  if ( isEmptyObject( data ) === true ) {
    log( 'saveData(); empty data was attempted to be saved to ' +
    filename + ': ' + JSON.stringify( data ) );
    return false;
  }

  // Stop here if there is no row id
  // if we are inserting data, the new row id is given in the
  // above if statement
  if ( isNullOrEmptySpace( rowId ) === true ) {
     log( 'saveData(); no id was available, stopping here...' );
     return false;
  }

  if ( isNewRow === true ) {
     data.CREATED_AT = new Date();
     data.SUBMITTER = Session.getActiveUser().getEmail();
     log( 'saveData(); new row to be inserted with ID ' + rowId );
  }

  // set the id in the data
  data.ID = rowId;

  // set the updated_at date to the current date
  data.UPDATED_AT = new Date();

  // 3. Get headers for this filename
  var headers = getHeaders( filename );

  // keep only the digits if a phone number is specified
  if ( headers.indexOf( 'PHONE' ) !== -1 && data.PHONE !== null ) {
     data.PHONE = cleanPhoneNumber( data.PHONE );
  }

  log( 'saveData(); headers: ' + JSON.stringify( headers ) );
  log( 'saveData(); data:    ' + JSON.stringify( data ) );

  // 4. Get the first sheet for this file.
  var sheet = getSheetFromSpreadsheet( filename );

  for ( var key in data ) {

    // skip the CREATED_AT and SUBMITTER headers if this is
    // not a new record to prevent overwriting the data
    if ( isNewRow === false && ( key === 'CREATED_AT' || key === 'SUBMITTER' ) ) {
       log( 'saveData(); skipping "' + key + '" for existing record #' + rowId );
       continue;
    }

     // 5. Get the cell for the given header
     var column = getColumnIndex( headers, key );
    log( 'saveData(); current column (' + key + '): ' + column );

    if ( column === -1 ) {
       log( 'saveData(); could not save ' + key + ' to ' +
           filename + ' because the header could not be ' +
           'found. stopping here...' );
       return false;
    }
    var columnLetter = getColumnLetter( column );
    var cellRange = columnLetter + rowId;

    log( 'saveData(); cell notation for ' + key + ': ' + cellRange );
     var cell = sheet.getRange( cellRange );
     cell.setValue( data[ key ] );
  }

  var action = isNewRow === true ? 'created' : 'updated';
  var logText = 'row #' + rowId + ' was ' + action +
  ' successfully for file "' + filename + '"';
  log( logText, false, arguments );

  return true;
}

/**
 * Returns a string only containing digits.
 * @param  {string} value [description]
 * @return {string}       [description]
 */
function cleanPhoneNumber( value ) {
   return ( '' + value ).replace( /\D+/g, '' );
}

/**
* Soft deletes the data with ID = rowID from the
* specified filename.
* @param  string filename
* @param  int    rowId
* @return boolean
*/
function deleteData( filename, rowId ) {
  var data = {};
  data.DELETED_AT = new Date();
  return saveData( filename, rowId, data );
}


/**
* . Returns true if the specified row ID is valid
* . for the specified file. This checks automatically
* . for max + 1 in case the need is to insert to new data.
* . This assumes that data has been added correctly
* . and that all IDs are unique.
* . TODO: see if there is a way within Google Sheets
* . to automatically check for this.
* . @param  string filename
* . @param  int    rowId
* . @return boolean
*/
function rowIdIsValid( filename, rowId ) {

   // 1. Must be an integer
   // 2. Must be greater than 0
   // 3. rowId > 0 && rowId <= length + 1 (taking into account the offset used to skip the header row)
   var data = getDataRangeByFilename( filename );

   return data !== null && isNullOrEmptySpace( rowId ) === false &&
     Number.isInteger( rowId ) === true &&
     rowId > 0 && rowId <= data.getNumRows() + 1;
}

/**
* . Returns the next available ID for the current file,
* . assuming all IDs are sequential.
* . @param  string filename
* . @return int
*/
function getNextId( filename ) {
   var data = getDataRangeByFilename( filename );
   return data !== null ? data.getNumRows() + 1 : -1;
}

/**
 * Returns a default sort array based on filename
 * @param  {string} filename
 * @return {array}
 */
function getSortArrayByFilename( filename ) {
    var columns = {
        'name': 'ascending'
    };

    filename = ( '' + filename ).toLowerCase();

    // only include special cases
    if ( filename === 'donations' ) {
        columns = {
            'given_at': 'descending'
        };
    }

    if ( filename === 'donors' ) {
        columns = {
            'firstname': 'ascending',
            'mi': 'ascending',
            'lastname': 'ascending',
            'suffix': 'ascending'
        };
    }

    return getSortArray( filename, columns );
}


/**
 * [getDataValues description]
 * @param  {string} filename    [description]
 * @param  {[type]} sortArray   [description]
 * @param  {[type]} showTrashed [description]
 * @return {array}             [description]
 */
function getDataValues( filename, showTrashed ) {

    if ( isNullOrEmptySpace( filename ) === true ) {
        log(
            'filename "' + filename + '" is invalid',
            true,
            arguments
        );
    }

    // 1. Get all data for the specified filename
    var range = getDataRangeByFilename( filename );

    if ( isNullOrEmpty( range ) === true ) {
        log(
            'could not load data from file "' + filename + '"',
            true,
            arguments
        );
        return [];
    }

    var sortArray = getSortArrayByFilename( filename );

    // 2. Sort the range
    if ( sortArray.length === 0 ) {
        return range.getValues();
    }

    range = range.sort( sortArray );

    var data = range.getDisplayValues();

    // 3. Return the values without the deleted data.
    // TODO: This is a manual process; if there is a way to do it via filter
    // that may be faster. Simultaneously, menu data won't be that long so
    // the effort may not be worth it.
    var headers = getHeaders( filename );
    var deletedAtColIndex = getColumnArrayIndex( headers, 'deleted_at' );
    var idColIndex = getColumnArrayIndex( headers, 'id' );

    var filtered = [];
    var count = data.length;

    for ( var i = 0; i < count; i++ ) {
        var deletedAt = new Date( data[ i ][ deletedAtColIndex ] );
        if ( showTrashed !== true &&
        deletedAtColIndex >= 0 &&
        isNullOrEmptySpace( data[ i ][ deletedAtColIndex ] ) === false ) {
            continue;
        }

        if ( isNullOrEmptySpace( data[ i ][ idColIndex ] ) === true ) {
            continue;
        }

        filtered.push( data[ i ] );
    }

    log( 'data: ' + JSON.stringify( filtered ), false, arguments );

    return filtered;
}

/**
 *
 * @param  {[type]} filename    [description]
 * @param  {[type]} selectId    [description]
 * @param  {[type]} defaultText [description]
 * @param  {[type]} showTrashed [description]
 * @return {object}             [description]
 */
function getMenuData( filename, selectId, defaultText, showTrashed ) {

    // Object to be returned
    var output = new Object();
    output.file = filename;

    log( 'filename: "' + output.file + '"', false, arguments );

    output.selectId = selectId;
    output.defaultText = defaultText;

    output.headers = getHeaders( filename );

    log( 'headers for file "' + filename + '": ' +
    JSON.stringify( output.headers ) );

    output.showTrashed = showTrashed === true;
    output.sortArray = getSortArrayByFilename( filename );

    log( 'sortArray for "' + filename + '": ' +
    JSON.stringify( output.sortArray ), false, arguments );

    output.data = [];

    output.data = getDataValues( filename, showTrashed );
    return output;
}


/**
* . Retrieves all data from the specified file, sorts it
* . using the specified columns and returns a string
* . to fill a <select> element.
* . @param  string  filename
* . @param  array   sortArray
* . @param  boolean showTrashed
* . @return string
*/
function fillPicker( filename, sortArray, showTrashed ) {
  var data =  getAllData( filename );
  var output = '<option value="">Select an item...</option>'.replace( /\-/g, ' ' );

  if ( data === null ) {
     log( 'fillPicker(); the file was not loaded...' );
     return output;
  }

  var rowCount = data.getNumRows();
  var headers = getHeaders( filename );
  var idColIndex = getColumnIndex( headers, 'id' );
  var deletedAtColIndex = getColumnIndex( headers, 'deleted_at' );

  // sort the data using the sort array
  data = data.sort( sortArray );

  // loop through all of the cells in order to fill the picker
  for ( var row = 1; row <= rowCount; row++ ) {
    var values = getCellValues( data, row, sortArray );

    // Skip the data if:
    // 1. ID of the row (cell value in ID column) is empty
    // 2. row is deleted and showTrashed !== true
    // 3. the values specified for the columns in the sortArray are empty
    var id = data.getCell( row, idColIndex ).getValue();
    var deletedAt =
        data.getCell( row, deletedAtColIndex ).getValue();

    // if the data is invalid or deleted and showTrashed is not true,
    // then simply skip over this row of data
    if ( isNullOrEmptySpace( id ) || values.length === 0 ||
        ( showTrashed !== true && isNullOrEmptySpace( deletedAt ) === false ) ) {
       continue;
    }

    output += '<option value="' + id + '">';
    output += titleCase( values.join( ' ' ) );
    output += '</option>';
  }

  return output;
}

/**
*  Dynamically retrieves the values of the specified
* . columns in the array (sortArray) used to sort all
* . all of the data retrieved from a file.
* . @param . Range  data
* . @param . int    rowIndex
* . @param . array  sortArray
* . @return  array
*/
function getCellValues( data, rowIndex, sortArray ) {
  var values = [];

  for ( var key in sortArray ) {
    var value = data.getCell( rowIndex, sortArray[ key ].column ).getValue();
    if ( isNullOrEmptySpace( value ) === false ) {
          values.push( value.trim() );
    }
  }

  return values;
}

/**
 * [getSortArray description]
 * @param  {[type]} filename  [description]
 * @param  {[type]} colObject Each key represents a column header. Each value
 * should be either 'asc' or 'desc' indicating sort direction.
 * @return {array}           [description]
 */
function getSortArray( filename, colObject ) {

    var sortArray = [];
    var headers = getHeaders( filename );

    // file was not found or valid
    if ( headers.length === 0 ) {
        return sortArray;
    }

    for ( var header in colObject ) {
        if ( isNullOrEmptySpace( header ) === true ) {
            continue;
        }

        var colIndex = getColumnIndex( headers, header );

        if ( colIndex === -1 ) {
            log( 'index for header "' + header + '" could ' +
            'not be found for file "' + filename + '"', false, arguments );
            continue;
        }

        // add this object to the array of columns that will be used to sort
        // the specified file
        var sortObject = {};
        sortObject.column = colIndex;
        sortObject.ascending = getValidOrder( colObject[ header ] );
        sortArray.push( sortObject );
    }

    return sortArray;
}

/**
 * Returns a valid sort order for the sort array, which is used when retrieving
 * data from a Google Sheet.
 * @param  {string} direction Either 'ascending' or 'descending'.
 * @return {boolean}
 */
function getValidOrder( direction ) {

    direction = ( direction + '' ).toLowerCase().trim();

    return direction !== 'descending' && direction !== 'desc';
}

/**
* Changes a string to title case.
* @returns string
* @link https://gist.github.com/SonyaMoisset/b2606b3a7048cc5303f64a726a39e5fd#file-title-case-a-sentence-with-map-wc-js
*/
function titleCase( str ) {
  return str.toLowerCase().split( ' ' ).map( function( word ) {
    return ( word.charAt( 0 ).toUpperCase() + word.slice( 1 ) );
  } ).join( ' ' );
}

/**
 * Logs the text hopefully to the browser console and
 * Google Apps Script logging. Adds support for adding
 * the function name to the beginning of each log
 * entry for easier troubleshooting.
 * @param  {string|object} text  [description]
 * @param  {boolean}       error [description]
 * @param  {arguments}     fn    The function as a variable or a function's
 * "arguments" variable.
 * @return {boolean}
 */
function log( text, error, fn ) {

    // Stop here if there is nothing to log
    if ( isNullOrEmptySpace( text ) === true ) {
        return error === true;
    }

    // 2015.03.04 - if the parameter is not a string, then break down what it is
    if ( isValidStringObject( text ) === false ) {
        text = JSON.stringify( text );
    }

    // 2018.08.06 - add the function name to each log
    // so we can more easily track where errors
    // originated from
    var name = getFnName( fn );
    if ( isNullOrEmptySpace( name ) === false ) {
        text = name + '(): ' + text;
    }

    if ( typeof Logger !== 'undefined' ) {
        if ( error === true && Logger.error ) {
            Logger.error( text );
        }
        Logger.log( text );
    }
    if ( typeof console !== 'undefined' ) {
        if ( error === true && console.error ) {
            console.error( text );
        }
        console.log( text );
    }
    if ( error === true && SpreadsheetApp &&
      SpreadsheetApp.getUi ) {
       SpreadsheetApp.getUi().alert( text );
    }
    return error === true;
}

/**
 * Given an array of headers in a given file, give the
 * numeric column index (1-based).
 * @param  {array} headers
 * @param  {string} name
 * @return {int}
 */
function getColumnIndex( headers, name ) {
   if ( headers === null || headers.length === 0 ||
       isNullOrEmptySpace( name ) === true ) {
      return -1;
   }

   var count = headers.length;

  for ( var i = 0; i < count; i++ ) {
    if ( headers[ i ].toLowerCase() === name.toLowerCase() ) {
      return i + 1;
    }
  }
  return -1;
}

/**
 * Given an array of headers in a given file, get the numerical column index
 * (0-based). Useful when using range.getValues() for table data.
 * @param  {array} headers [description]
 * @param  {string} name    [description]
 * @return {int}         [description]
 */
function getColumnArrayIndex( headers, name ) {
    var colIndex = getColumnIndex( headers, name );

    return colIndex > 0 ? colIndex - 1 : colIndex;
}

/**
 * Each file has column headers. This function returns the array of column
 * headers for each file type. The headers themselves follow a few conventions:
 * Every header ending in '_ID' is a number representing a row ID. Every header
 * ending in '_AT' is a date/time. All dates are handled the same.
 * @param  {[type]} name [description]
 * @return {array}      [description]
 */
function getHeaders( name ) {
  if ( isNullOrEmptySpace( name ) === true ) {
     return [];
  }

  if ( name.toLowerCase() === 'donations' ) {
     return getDonationsHeaders();
  }

  if ( name.toLowerCase() === 'donation-types' ) {
     return getDonationTypesHeaders();
  }

  if ( name.toLowerCase() === 'donors' ) {
     return getDonorsHeaders();
  }

  if ( name.toLowerCase() === 'payment-methods' ) {
     return getPaymentMethodsHeaders();
  }

  return [];
}

/**
 * Returns true if the object is a Date and has a valid date.
 * @param  {Date} d [description]
 * @return {boolean}   [description]
 */
function isValidDateObject( d ) {
    return isNullOrEmptySpace( d ) === false &&
    Object.prototype.toString.call( d ) === '[object Date]' &&
    !isNaN( d.getTime() );
};

/**
 * This creates an object named "code" that will add all functions as properties
 * (remember that functions are technically variables) that will be used for
 * testing.
 * @param  {[type]} module [description]
 * @return {[type]}        [description]
 */
if ( typeof( module ) !== 'undefined' && module.exports ) {

    // module.exports exposes any functions so they can be used
    // when this file is required as a module
    module.exports = {
        'deleteData': deleteData,
        'fillPicker': fillPicker,
        'getDataRangeByFilename': getDataRangeByFilename,
        'getAllData': getAllData,
        'getCellValues': getCellValues,
        'getColumnIndex': getColumnIndex,
        'getFileByFilename': getFileByFilename,
        'getFnName': getFnName,
        'getHeaders': getHeaders,
        'getNextId': getNextId,
        'getObject': getObject,
        'getSortArray': getSortArray,
        'getValidOrder': getValidOrder,
        'hasProperty': hasProperty,
        'isBrowser': isBrowser,
        'isDateColumn': isDateColumn,
        'isNullOrEmpty': isNullOrEmpty,
        'isNullOrEmptySpace': isNullOrEmptySpace,
        'log': log,
        'printProperties': printProperties,
        'saveData': saveData,
        'setCurrencyFmt': setCurrencyFmt,
        'setEmailFmt': setEmailFmt,
        'titleCase': titleCase
    };
}
