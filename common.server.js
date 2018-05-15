/* global DriveApp, SpreadsheetApp */

/**
* . Returns a single row of data as an associative array of values
* . where the column names are the keys for the specific object.
* . @param  string filename
* . @param  int    rowId
* . @return object
*/
function getObject( filename, rowId ) {

  var data = getAllData( filename );

  // empty case: no row ID specified
  if ( isNullOrEmptySpace( rowId ) === true ||
     data === null ) {
    log( 'getObject(); no object was returned. rowId: ' + rowId +
        ' data is null? ' + ( data === null ? 'true' : 'false' ) );
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

    log( 'getObject(); found the row for userId ' + rowId );

    for ( var key in headers ) {
        var header = headers[ key ];
        var colIndex = getColumnIndex( headers, header );
        var value = data.getCell( row, colIndex ).getValue();

      log( 'getObject(); current header: ' + header );

        // dates cannot be returned with success handlers for some reason
        // was able to confirm that Date objects are not handled properly.
        // this is mitigated by converting all Date objects to a string, yuck
        // Date.getTime() is not supported in this environment
        // https://developers.google.com/apps-script/guides/html/reference/run#myFunction(...)
        // https://developers.google.com/apps-script/reference/utilities/utilities#formatdatedate-timezone-format
      if ( isDateColumn( header ) === true && typeof value === typeof new Date() ) {
         log( 'getObject(); ' + header + ' is a Date object ' + value + '; converting to string...' );

         // https://developers.google.com/apps-script/reference/utilities/utilities#formatdatedate-timezone-format
         value = Utilities.formatDate( value, 'GMT', 'yyyy-MM-dd' ); // "yyyy-MM-dd mm:hh:ss a"
        log( 'getObject(); formatDate value: ' + value );
      }

        // save the value in the object
        object[ header ] = value;
        log( header + ': ' + object[ header ] );
    }

    // stop here since we found the object we are looking for
    break;
  }

  log( 'getObject(); row ' + rowId + ' of ' + filename + ': ' +
  JSON.stringify( object ) );
  return object;
}

function isDateColumn( header ) {
   return isNullOrEmptySpace( header ) === false && header.endsWith( '_AT' ) === true;
}

/**
* . Returns a single row of data as an associative array of values
* . where the column names are the keys for the specific object.
* . @param  string filename
* . @param  int    rowId
* . @return object
*/
function getObject2( filename, rowId ) {

  // 1. Get the first sheet of the specified Spreadsheet
  var spreadsheet = getFileByFilename( filename );
  var sheet = spreadsheet.getSheets()[ 0 ];

  // 2. The ID is always in the first column. Search just
  // that column for the value. When it's found, return the 1-based
  // row number
  // Offset should skip the first row (row with the column headers)
  var column = sheet.getRange( 'A:A' ).offset( 1, 0 );

  // https://developers.google.com/apps-script/reference/spreadsheet/range#getValues()
  var values = column.getValues();
  var rowCount = values.length;

  // 3. Using the values in the column, loop until you find the
  // value you are looking for.
  for ( var row = 1; row <= rowCount; row++ ) {

  }

  return {};
}

function getActualDataRange( filename ) {
   var spreadsheet = getFileByFilename( filename );

  if ( spreadsheet === null ) {
     log( 'getActualDataRange(); the spreadsheet ' + filename + ' was not found or loaded...' );
     return null;
  }

  // get the range of cells with actual data there
  // https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getDataRange()
  // returns Range
  // https://developers.google.com/apps-script/reference/spreadsheet/range
  // offset should skip the first row (row with the column headers)
  return spreadsheet.getDataRange().offset( 1, 0 );
}

/**
* . Returns all data for the specified file as a Range.
* . @param  string filename Either "donors," "donation-types," "donations", or "payment-methods"
* . @return Range|null
*/
function getAllData( filename ) {

  // get the data range for the specified spreadsheet
  var data = getActualDataRange( filename );

  if ( data === null ) {
     return null;
  }

  // var rowCount = data.getNumRows();
  // var colCount = data.getNumColumns();
  var headers = getHeaders( filename );
  var idColIndex = getColumnIndex( headers, 'id' );

  // sort the data by id
  data = data.sort(
    [
      { column: idColIndex, ascending: true }
    ]
  );

  return data;
}

/**
* . Returns a file by filename if it exists.
* . @return Spreadsheet|null
*/
function getFileByFilename( filename ) {

    filename = ( filename + '' ).toLowerCase();

    return getFile( filename );
}

function getFile( propertyName ) {

  // 1. Get the filename for the spreadsheet based on the script property
  var name = PropertiesService.getScriptProperties().getProperty( propertyName );

  // stop here if the string is null or empty space
  if ( isNullOrEmptySpace( name ) === true ) {
     Logger.log( 'getFile(); Could not retrieve the filename for the "' +
                propertyName + '" spreadsheet from the PropertiesService.' );
     return null;
  }

  // If the file already exists, then return true
  // Class DriveApp - https://developers.google.com/apps-script/reference/drive/drive-app
  var appFolder = getDataFolder();

  if ( appFolder === null ) {
     Logger.log( 'getFile(); the app folder does not exist and could not be created.' );
     return null;
  }

  // returns FileIterator
  // https://developers.google.com/apps-script/reference/drive/file-iterator
  var files = appFolder.getFilesByName( name );

  if ( files.hasNext() === false ) {
     Logger.log( 'getFile(); the \'' + name + '\' file does not exist. will attempt creation.' );
     var spreadsheet = createFile( appFolder, name );
     var headers = getHeaders( name );

     Logger.log( 'getFile(); the \'' + name + '\' file has been created. initializing...' );
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
  // app folder
  var fileId = spreadsheet.getId();
  var file = DriveApp.getFileById( fileId );

  // change the parent folder of the file (apparently a file can
  // have multiple parents) by adding the file to the app
  // folder and removing it from root
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

   return spreadsheet === null ?
     null :
     spreadsheet.getSheets()[ 0 ];
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
  var formula = '=COUNTIF($' + columnLetter + ':$' + columnLetter + ',"="&' + columnLetter + '1) + ' +
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
* . Formats the column to only accept email addresses if applicable.
* . @param . sheet
* . @param . header
* . @param   columnLetter
* . @return .boolean
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
* . Adds the column headers to the spreadsheet needed for storing data.
* . @param  Spreadsheet spreadsheet The spreadsheet to add the header row to.
* . @param  array       headers     The headers to add to the Spreadsheet.
* . @return Spreadsheet
*/
function initializeFile( spreadsheet, headers ) {
  if ( spreadsheet === null ) {
    return null;
  }

  // get the first sheet of the spreadsheet
  var sheet = spreadsheet.getSheets()[ 0 ];

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

  // stop here if the string is null or empty space
  if ( isNullOrEmptySpace( appFolderName ) === true ) {
     log( 'getAppFolder(); could not retrieve the folder name for this add-on from the PropertiesService.' );
     return null;
  }

  // "apps" folder within root Google Drive folder
  var appsRoot = 'apps';

  // create the apps folder
  var rootAppsFolder = dirGetOrCreate( root, appsRoot );

  // create the apps/donation-tracker folder
  var donationTrackerFolder = dirGetOrCreate( rootAppsFolder, appFolderName );

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
        log( 'isEmptyObject(): object is null or undefined.' );
        return true;
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

  // set the updated_at date
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

  return true;
}

function cleanPhoneNumber( value ) {
   return ( '' + value ).replace( /\D+/g, '' );
}

/**
* . Soft deletes the data with ID = rowID from the
* . specified filename.
* . @param  string filename
* . @param  int    rowId
* . @return boolean
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
   var data = getActualDataRange( filename );

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
   var data = getActualDataRange( filename );
   return data !== null ? data.getNumRows() + 1 : -1;
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
        var order = getValidOrder( colObject[ header ] );

        if ( colIndex === -1 ) {
            log( 'getSortArray(); index for header "' + header + '" could ' +
            'not be found for file "' + filename + '"' );
            continue;
        }

        // add this object to the array of columns that will be used to sort
        // the specified file
        var sortObject = {};
        sortObject.column = colIndex;
        sortObject[ order ] = true;
        sortArray.push( sortObject );
    }

    return sortArray;
}

/**
 * Returns a valid sort order for the sort array, which is used when retrieving
 * data from a Google Sheet.
 * @param  {string} direction Either 'ascending' or 'descending'.
 * @return {string}
 */
function getValidOrder( direction ) {

    direction = ( direction + '' ).toLowerCase().trim();

    if ( direction === 'descending' || direction === 'desc' ) {
        return 'descending';
    }

    return 'ascending';
}
