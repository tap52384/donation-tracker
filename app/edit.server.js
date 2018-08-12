/* eslint-env node */
/* global SpreadsheetApp, ScriptApp, DriveApp, PropertiesService, Logger, HtmlService */

/**
 * [getDonationFilterCriteria description]
 * @param  {string} userId  [description]
 * @param  {string} startAt [description]
 * @param  {string} endAt   [description]
 * @return {array}         [description]
 */
function getDonationFilterCriteria( userId, startAt, endAt ) {

    // 1. Validate the userId, startAt and endAt dates.
    if ( isNullOrEmptySpace( userId ) === true ||
    parseInt( userId, 10 ) <= 0 ) {
        log( 'invalid user id: "' + userId + '"', true, arguments );
        return [];
    }

    // change the userId into an integer
    userId = parseInt( userId, 10 );

    var filename = 'donations';

    // is midnight by default
    var startDate = new Date( startAt );

    // through the end of the day
    var endDate = new Date( endAt + 'T23:59:59.999Z' );
    if ( isValidDateObject( startDate ) === false ||
    isValidDateObject( endDate ) === false ) {
        log( 'invalid start and/or end date. start: "' + startAt + '", ' +
        'end: "' + endAt + '"', true, arguments );
        return [];
    }

    // 2. Get the spreadsheet with the donations
    var spreadsheet = getFileByFilename( filename );

    if ( isNullOrEmpty( spreadsheet ) === true ) {
        log( 'spreadsheet "' + filename + '" could not be found', true,
        arguments );
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
        log( 'a filter currently exists on "' + filename + '"; clearing...',
        false, arguments );
        sheet.getFilter().remove();
    }

    // 5. Get the actual data range without retrieving the file a second time
    var range = getDataRangeFromSheet( sheet );

    log( '# of all rows originally: ' + range.getNumRows(), false, arguments );

    // 6. Filter and return the correct data
    return filterDonations( range, filename, userId, startDate, endDate );


    // // 6. To create a new filter for this range, use Range.createFilter()
    // // https://developers.google.com/apps-script/reference/spreadsheet/filter
    // var filter = range.createFilter();
    //
    // // 7. Create the filter criteria for finding all rows where:
    // // DONOR_ID = userId
    // // DELETED_AT = null
    // // GIVEN_AT >= startAt
    // // GIVEN_AT <= endAt
    // var headers = getHeaders( filename );
    //
    // // Numerical column indexes (1-based) for columns needed for filter
    // var donorIdColIndex = getColumnIndex( headers, 'donor_id' );
    // var deletedAtColIndex = getColumnIndex( headers, 'deleted_at' );
    // var givenAtColIndex = getColumnIndex( headers, 'given_at' );
    //
    // // https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newFilterCriteria()
    // // Return FilterCriteriaBuilder
    // var userCriteria = SpreadsheetApp.newFilterCriteria();
    // userCriteria.whenNumberEqualTo( parseInt( userId, 10 ) );
    //
    // // https://developers.google.com/apps-script/reference/spreadsheet/filter#setColumnFilterCriteria(Integer,FilterCriteria)
    // filter.setColumnFilterCriteria( donorIdColIndex, userCriteria.build() );
    //
    // log( 'filter includes when "donor_id" = "' + userId + '"', false, arguments );
    // log( '# of filtered rows: ' + filter.getRange().getNumRows(), false, arguments );
    //
    //
    // // 8. Loop through the rows and see if there is something unique about it
    // // to tell you what data is visible
    //
    // // 5. Sort the data and return it; let the client-side script handle
    // // building the UI
    // var columns = {
    //     'donor_id': 'ascending',
    //     'given_at': 'descending'
    // };
    //
    // var sortArray = getSortArray( filename, columns );
    //
    // // Depending on how fast filtering is, we may be able to clear filters
    // // after the data range is collected, we'll see.
    // var sortedRange = filter.getRange().sort( sortArray );
    // log( '# of sorted filtered rows: ' + sortedRange.getNumRows(), false, arguments );
    //
    // // https://developers.google.com/apps-script/reference/spreadsheet/range#getvalues
    // return sortedRange.getValues();
}

/**
 * Manually filters the donations based on user ID and date range.
 * There is a way to specify filter criteria but I have yet to figure out how
 * to return just the filtered rows. Even if I had to manually check behind
 * just the filtered rows that would be faster than looping through ALL of them
 * @param  {Range}  range     [description]
 * @param  {String} filename  [description]
 * @param  {int}    userId    [description]
 * @param  {Date}   startDate [description]
 * @param  {Date}   endDate   [description]
 * @return {array}           [description]
 */
function filterDonations( range, filename, userId, startDate, endDate ) {

    // 1. Create the filter criteria for finding all rows where:
    // DONOR_ID = userId
    // DELETED_AT = null
    // GIVEN_AT >= startAt
    // GIVEN_AT <= endAt
    var headers = getHeaders( filename );

    // Numerical column indexes (1-based) for columns needed for filter
    // Therefore, subtract 1 in order to get the index in the array returned
    // from getValues()
    var donorIdColIndex = getColumnIndex( headers, 'donor_id' ) - 1;
    var deletedAtColIndex = getColumnIndex( headers, 'deleted_at' ) - 1;
    var givenAtColIndex = getColumnIndex( headers, 'given_at' ) - 1;

    log( 'donorIdColIndex: "' + donorIdColIndex + '"', false, arguments );
    log( 'deletedAtColIndex: "' + deletedAtColIndex + '"', false, arguments );
    log( 'givenAtColIndex: "' + givenAtColIndex + '"', false, arguments );
    log( 'userId: "' + userId + '"', false, arguments );

    // https://developers.google.com/apps-script/reference/spreadsheet/range#getvalues
    // Returns a two-dimensional array of values, indexed by row, then by
    // column. The values may be of type Number, Boolean, Date, or String,
    // depending on the value of the cell. Empty cells are represented by an
    // empty string in the array. Remember that while a range index starts at
    // 1, 1, the JavaScript array is indexed from [0][0].
    var original = range.getValues();
    var filtered = [];

    // Note: in the multi-dimensional array representing the range values,
    // the column and row indexes are 0-based
    for ( var index in original ) {

        var row = original[ index ];
        log( 'row: ' + JSON.stringify( row ), false, arguments );

        if ( row[ donorIdColIndex ] !== userId ) {
            log( 'donor_id: "' + row[ donorIdColIndex ] + '", type: "' +
            typeof row[ donorIdColIndex ], false, arguments );
            continue;
        }

        if ( isValidDateObject( row[ deletedAtColIndex ] ) === true ) {
            log( 'deletedAtColIndex: "' + row[ deletedAtColIndex ] + '", type: "' +
            typeof row[ deletedAtColIndex ], false, arguments );
            continue;
        }

        if ( row[ givenAtColIndex ] > endDate ) {
            log( 'given_at: "' + row[ givenAtColIndex ].toISOString() + '", ' +
            'type: "' + typeof row[ givenAtColIndex ] + '", endDate: "' +
            endDate.toISOString() + '"', false, arguments );
            continue;
        }

        if ( row[ givenAtColIndex ] < startDate ) {
            log( 'given_at: "' + row[ givenAtColIndex ].toISOString() + '", ' +
            'type: "' + typeof row[ givenAtColIndex ] + '", startDate: "' +
            startDate.toISOString() + '"', false, arguments );
            continue;
        }

        // if ( row[ donorIdColIndex ] !== userId ||
        // isNullOrEmpty( row[ deletedAtColIndex ] ) === false ||
        // row[ givenAtColIndex ] > endDate ||
        // row[ givenAtColIndex ] < startDate ) {
        //     continue;
        // }
        filtered.push( original[ index ] );
        log( 'a filtered row has been added...', false, arguments );
    }

    log( '# of all rows filtered: ' + filtered.length, false, arguments );

    return filtered;
}
