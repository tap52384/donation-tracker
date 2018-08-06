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
