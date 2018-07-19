/**
  *  Add the years to the select menu.
  */
  function addStateHtml( output ) {
    document.getElementById( 'state' ).innerHTML = output;
  }

  function addUsersHtml( output ) {
    document.getElementById( 'users' ).innerHTML = output;

    // clear the fields first
    clearAllFields();

    // stop the spinner
    hideSpinner();
  }

  function printResult() {
    log( 'header for 800th column: ' + output );
  }

  function saveResult( result ) {
    if ( result === false ) {
      log( 'donors(); save failed.', true );

      // stop the spinner
      hideSpinner();

      return false;
    }

    // clear all fields
    clearAllFields();

    log( 'donors(); save worked!' );

    // reload the users menu
    google.script.run.withSuccessHandler( addUsersHtml )
    .fillUsersPicker();

    // document.getElementById('manage-donors-form').reset();
    return true;
  }

  /**
  * . Gets the headers for the "donors" file and saves the data.
  */
  function prepareSaveData( headers ) {
    log( 'submit(donors); headers: ' + headers );

    // get all of the data on the page using the headers
    var data = collect( headers );

    // add the id to the data
    var userId = getValue( 'users' );
    data.ID = userId;

    // remove all non-numeric characters from the phone number
    // https://stackoverflow.com/a/1098955/1620794
    if ( 'phone' in data ) {
      data.phone = data.phone.replace( /\D/g, '' );
    }

    log( 'submit(donors); data: ' + JSON.stringify( data ) );

    google.script.run.withSuccessHandler( saveResult )
    .withFailureHandler( hideSpinner )
    .saveData( 'donors', userId, data );
  }

  function clearAllFields() {

    // clear the fields
     document.getElementById( 'firstname' ).value =
     document.getElementById( 'mi' ).value =
     document.getElementById( 'lastname' ).value =
     document.getElementById( 'phone' ).value =
     document.getElementById( 'email' ).value =
     document.getElementById( 'address1' ).value =
     document.getElementById( 'address2' ).value =
     document.getElementById( 'city' ).value =
     document.getElementById( 'state' ).value =
     document.getElementById( 'zip' ).value =
     document.getElementById( 'dob_at' ).value =
     document.getElementById( 'suffix' ).value =
     '';

     document.getElementById( 'delete' ).disabled = true;
  }

  function validateInput() {
     var error = '';

     // strips all non-numeric characters
     // https://stackoverflow.com/a/1862219/1620794
     var phone = getValue( 'phone' ).replace( /\D/g, '' );
     var email = getValue( 'email' );
     var dob = getValue( 'dob_at' );
     var fullName = getValue( 'firstname' ) + ' ' + getValue( 'lastname' );
     var dobMoment = typeof moment === 'function' &&
     isNullOrEmptySpace( dob ) === false ? moment( dob, 'YYYY-MM-DD' ) : null;

     // for duplicate entry detection
     var displayInputs = [ 'firstname', 'lastname', 'suffix' ];
     var possibleDupeIds = exists( displayInputs, 'users' );

     // first name must be at least two characters
     if ( getValue( 'firstname' ).trim().length < 2 ) {
       error = 'First name must contain at least two characters.';
     } else if ( getValue( 'lastname' ).trim().length < 2 ) {
       error = 'Last name must contain at least two characters.';
     } else if ( isNullOrEmptySpace( phone ) === false && phone.trim().length < 10 ) {
       error = 'Phone number must be at least 10 digits, including area code.';
     } else if ( isNullOrEmptySpace( email ) === false && isValidEmail( email ) === false ) {
       error = 'Please enter a valid email address.';
     } else if ( dobMoment !== null && dobMoment.isValid() === false ) {
       error = 'Please enter a valid date (YYYY-MM-DD).';
     }

     /*
     get the text of the current item
     look through all of the items and return an array of ids for those that match
     pass the current id (if any); if the id of the current id is in the array of ids, leave it out
     if the count of the matches > 0, then present the confirm() dialog and only continue if positive
     */
     var okToAdd = possibleDupeIds.length > 0 ?
     window.confirm( 'A donor with the name "' + fullName + '" already exists; do you still ' +
     'want to add them?' ) :
     true;

     log( 'validateInput(); error: ' + error );
     log( 'validateInput(); okToAdd: ' + okToAdd );

     // return true if all required values are given and either the
     // data already exists, is brand new, or the user confirmed adding
     // a duplicate
     if ( isNullOrEmptySpace( error ) === true && okToAdd === true ) {
       return true;
     }

     // show an error if one is generated (not needed for exists since a confirm() is used already)
     if ( isNullOrEmptySpace( error ) === false ) {
       alert( error );
     }
     return false;
  }


  document.getElementById( 'users' ).onchange = function( event ) {
     var userId = event.target.value;

     // show the spinner
     showSpinner();

     // clear all fields
     clearAllFields();

     log( '#users (change): about to get donor object #' + userId );

     // asynchronously get the user details and fill the <select> menu
     google.script.run.withSuccessHandler( fillDetails )
     .withFailureHandler( getObjectFailed )
     .getObject( 'donors', userId );
  };

  document.getElementById( 'manage-donors-form' ).addEventListener( 'submit', function( event ) {
      event.preventDefault();

      // validate the form input
      if ( validateInput() === false ) {
        log( 'submit(); validate input failed.' );
        return false;
      }

      // show the spinner
      showSpinner();

      // get all headers which will also be the IDs of all inputs
      google.script.run.withSuccessHandler( prepareSaveData )
      .getHeaders( 'donors' );
  } );

  document.getElementById( 'delete' ).addEventListener( 'click', function( event ) {

      // get the current user id
      var userId = getValue( 'users' );

      if ( isNullOrEmptySpace( userId ) === true ) {
        return false;
      }

      // only proceed once you have confirmation
      if ( confirm( 'Are you sure you want to delete this donor?' ) === true ) {

        // show the spinner
        showSpinner();

        // disable the delete button
        disable( 'delete' );

        // delete the data for the current user
        google.script.run.withSuccessHandler( saveResult )
        .deleteData( 'donors', userId );
      }
  } );

  // https://developers.google.com/apps-script/guides/html/communication#success_handlers
  // fills in the select menu that allows the user to choose the year
  // it defaults to the current year
  google.script.run.withSuccessHandler( addStateHtml )
  .fillStatePicker();

  google.script.run.withSuccessHandler( addUsersHtml )
  .fillUsersPicker();

log( 'donors code completed.' );
