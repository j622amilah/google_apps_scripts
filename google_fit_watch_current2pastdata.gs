
// add your Google API Project OAuth client ID and client secret here
var ClientID = 'XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com';
var ClientSecret = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Google Fit')
      .addItem('Authorize if needed (does nothing if already authorized)', 'showSidebar')
      .addItem('Get Data', 'getData')
      .addItem('Reset Settings', 'clearProps')
      .addToUi();
}




function selectDATA_interval1(num_of_days){
  dictt = {};
  var end = new Date();
  var offset = 0;  // 90
  end.setMinutes(end.getMinutes()-offset);
  
  var start = new Date();
  start.setDate(end.getDate() - num_of_days);
  start.setHours(end.getHours());

  // One can decide which time interval to use
  var one_day = new Date();
  one_day.setDate(end.getDate() - 1);
  one_day.setHours(end.getHours());
  dictt.echan_jour1 = end.getTime() - one_day.getTime(); // diff en milliseconds=84599999
  // OU
  dictt.echan_jour = 86400000;
  dictt.echan_h = Math.floor(dictt.echan_jour/24);
  dictt.echan_30mins = Math.floor(dictt.echan_h/2);

  dictt.datetime_start = start.getTime();
  dictt.datetime_end = end.getTime();

  return dictt;
}

function selectDATA_interval0(start_jour, end_day){
  dictt = {};
  var start = new Date();
  start.setHours(0,0,0,0);
  start.setDate(start.getDate() - start_jour); 

  var end = new Date();
  end.setHours(23,59,59,999);
  end.setDate(end.getDate() - end_day);

  dictt.echan_jour = 86400000;
  dictt.echan_h = Math.floor(dictt.echan_jour/24);
  dictt.echan_30mins = Math.floor(dictt.echan_h/2);

  dictt.datetime_start = start.getTime();
  dictt.datetime_end = end.getTime();

  return dictt;
}




// see step count example at https://developers.google.com/fit/scenarios/read-daily-step-total
function getData() {

  var fitService = getFitService();
  
  // Reference le spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  // ------------------------
  
  //var start_day = 1;
  //var end_day = 1;
  //dictt = selectDATA_interval0(start_jour, end_day)
  // OU
  var num_of_days = 15;
  dictt = selectDATA_interval1(num_of_days);

  // ------------------------

  var laquelle = 1;
  if (laquelle == 0){
    console.log("Créer une source de données");

    let request = {
      "dataStreamName": "top_level",
      "type": "derived",
      "application": {
        "detailsUrl": "https://docs.google.com/spreadsheets/d/1Qolusg7xVkQEUg_WUdX0DkU0pQGe0E61-NePJ9wB02o/edit#gid=0",
        "name": "Google Scripts Apps",
        "version": "1"
      },
      "dataType": {
        "field": [
          {
            "name": "steps",
            "format": "integer"
          }
        ],
        "name": "com.google.step_count.delta"
      },
      "device": {
        "manufacturer": "MobiWire",
        "model": "E54",
        "type": "phone",
        "uid": "d86d56ca",
        "version": ""
      }
    };
    let apiEndpoint = 'https://www.googleapis.com/fitness/v1/users/me/dataSources:aggregate';
  } else if (laquelle == 1) {
    console.log("Des données aggregaté");

    var request = {
      "aggregateBy": [
        {
          "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
        }
      ],
      "bucketByTime": { "durationMillis": 86400000 },
      "startTimeMillis": 1454284800000,
      "endTimeMillis": 1455062400000
    };
    let apiEndpoint = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';
  } else {
    console.log("Option 3");
  }


 
  var request = {
    "aggregateBy": [
      {
        "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
      }
    ],
    "bucketByTime": { "durationMillis": dictt.echan_jour },
    "startTimeMillis": dictt.datetime_start,
    "endTimeMillis": dictt.datetime_end
  };
  let apiEndpoint = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';
  // --------------------------



  let options = {
    headers: {
      Authorization: 'Bearer ' + fitService.getAccessToken()
    },
    method : 'post',
    contentType: 'application/json',  
    payload : JSON.stringify(request, null, 2),
    // 'muteHttpExceptions': true,
    project : 'fitnesstracker-376521'
  };

  let response = UrlFetchApp.fetch(apiEndpoint, options);
  // --------------------------

  // Output data 
  var donnes_json = JSON.parse(response.getContentText());

  // --------------------------


  // --------------------------
  // Unpack 0
  var length = donnes_json.bucket.length;

  for(var b = 0; b < donnes_json.bucket.length; b++) {
    var bucketDate = new Date(parseInt(donnes_json.bucket[b].startTimeMillis, 10));
    
    var steps = NaN;
    
    if (donnes_json.bucket[b].dataset[0].point.length > 0) {
      steps = donnes_json.bucket[b].dataset[0].point[0].value[0].intVal;
    }
    
    sheet.appendRow([bucketDate, steps == NaN ? ' ' : steps, length]);
  }
  // --------------------------

}


// function function getService_ from Google OAuth example at https://github.com/googlesamples/apps-script-oauth2
function getFitService() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth2.createService('fit')

      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')

      // Set the client ID and secret, from the Google Developers Console.
      .setClientId(ClientID)
      .setClientSecret(ClientSecret)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())

      // Set the scopes to request (space-separated for Google services).
      // see https://developers.google.com/fit/rest/v1/authorization for a list of Google Fit scopes
      .setScope('https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.location.read')
      //.setScope('https://www.googleapis.com/auth/drive')
      
      // Below are Google-specific OAuth2 parameters.
      
      //.setParam('prompt', 'consent')
    
      // Sets the login hint, which will prevent the account chooser screen
      // from being shown to users logged in with multiple accounts.
      .setParam('login_hint', Session.getActiveUser().getEmail())

      // Requests offline access.
      .setParam('access_type', 'offline')

      // Forces the approval prompt every time. This is useful for testing,
      // but not desirable in a production application.
      //.setParam('approval_prompt', 'force');
}

// Il utilise php obtenir le code d'authorization : il faut un setup additionalle (??)
function showSidebar() {
  var fitService = getFitService();
  if (!fitService.hasAccess()) {
    var authorizationUrl = fitService.getAuthorizationUrl();
    var template = HtmlService.createTemplate(
        '<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
        'Close this after you have finished.');
    template.authorizationUrl = authorizationUrl;
    var page = template.evaluate();
    SpreadsheetApp.getUi().showSidebar(page);
  } else {
  // ...
  }
}

function authCallback(request) {
  var fitService = getFitService();
  var isAuthorized = fitService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

function clearProps() {
  PropertiesService.getUserProperties().deleteAllProperties();
}
