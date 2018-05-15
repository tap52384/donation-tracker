function fillDonationTypesPicker( showTrashed ) {
  var filename = 'donation-types';

  var columns = {
      'name': 'ascending'
  };

  var sortArray = getSortArray( filename, columns );

  // var headers = getHeaders( filename );
  // var nameColIndex = getColumnIndex( headers, 'name' );
  //
  // var sortArray = [
  //     { column: nameColIndex, ascending: true }
  // ];

  return fillPicker( filename, sortArray, showTrashed );
}
