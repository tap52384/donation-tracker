/**
* . The states for the US state select form control.
* . @returns object
* . @link https://gist.github.com/mshafrir/2646763
*/
function getStates() {
   return {
AL: 'Alabama',
AK: 'Alaska',
AS: 'American Samoa',
AZ: 'Arizona',
AR: 'Arkansas',
CA: 'California',
CO: 'Colorado',
CT: 'Connecticut',
DE: 'Delaware',
DC: 'District Of Columbia',
FM: 'Federated States Of Micronesia',
FL: 'Florida',
GA: 'Georgia',
GU: 'Guam',
HI: 'Hawaii',
ID: 'Idaho',
IL: 'Illinois',
IN: 'Indiana',
IA: 'Iowa',
KS: 'Kansas',
KY: 'Kentucky',
LA: 'Louisiana',
ME: 'Maine',
MH: 'Marshall Islands',
MD: 'Maryland',
MA: 'Massachusetts',
MI: 'Michigan',
MN: 'Minnesota',
MS: 'Mississippi',
MO: 'Missouri',
MT: 'Montana',
NE: 'Nebraska',
NV: 'Nevada',
NH: 'New Hampshire',
NJ: 'New Jersey',
NM: 'New Mexico',
NY: 'New York',
NC: 'North Carolina',
ND: 'North Dakota',
MP: 'Northern Mariana Islands',
OH: 'Ohio',
OK: 'Oklahoma',
OR: 'Oregon',
PW: 'Palau',
PA: 'Pennsylvania',
PR: 'Puerto Rico',
RI: 'Rhode Island',
SC: 'South Carolina',
SD: 'South Dakota',
TN: 'Tennessee',
TX: 'Texas',
UT: 'Utah',
VT: 'Vermont',
VI: 'Virgin Islands',
VA: 'Virginia',
WA: 'Washington',
WV: 'West Virginia',
WI: 'Wisconsin',
WY: 'Wyoming'
};
}

/**
* . The headers for the "donors" file.
* . As an array, the keys are numeric.
* . @returns array
*/
function getDonorsHeaders() {
  return [
    'ID',
    'FIRSTNAME',
    'MI',
    'LASTNAME',
    'SUFFIX',
    'PHONE',
    'EMAIL',
    'ADDRESS1',
    'ADDRESS2',
    'CITY',
    'STATE',
    'ZIP',
    'DOB_AT',
    'SUBMITTER',
    'CREATED_AT',
    'UPDATED_AT',
    'DELETED_AT'
  ];
}

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

function getDonationsHeaders() {
  return [
    'ID',
    'DONOR_ID',
    'DONATIONTYPE_ID',
    'GIVEN_AT',
    'AMOUNT',
    'PAYMENTMETHOD_ID',
    'SUBMITTER',
    'CREATED_AT',
    'UPDATED_AT',
    'DELETED_AT'
  ];
}

function getDonationTypesHeaders() {
  return [
    'ID',
    'NAME',
    'SUBMITTER',
    'CREATED_AT',
    'UPDATED_AT',
    'DELETED_AT'
  ];
}

function getPaymentMethodsHeaders() {
   return getDonationTypesHeaders();
}


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
* . Given an array of headers in a given file, give the
* . numeric column index (1-based).
* @returns int
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
