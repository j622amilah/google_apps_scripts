// add your Google API Project OAuth client ID and client secret here
var ClientID = '224463091033-okvre3a92sfrlk39inqfhjq33ma2t8dm.apps.googleusercontent.com';
var ClientSecret = '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';

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Google Fit')
      .addItem('Authorize if needed (does nothing if already authorized)', 'showSidebar')
      .addItem('Get Data', 'garde_jusqua_trigger')
      .addItem('Reset Settings', 'clearProps')
      .addToUi();
}



function garde_jusqua_trigger(){
  var finioupas = 0;

  var nom_de_mins = 10;
  //while (finioupas < 30){


    mettez_des_jours1(nom_de_mins)
    getData(dictt);

    finioupas = finioupas + 1;
  //}
}

function mettez_des_jours1(nom_de_mins){
  dictt = {};
  var end = new Date();
  end.setMinutes(end.getMinutes()-90);
  
  var start = new Date();
  start.setDate(end.getDate());
  start.setHours(end.getHours());
  start.setMinutes(end.getMinutes() - nom_de_mins);

  // On peut decider à quelle intervalle on veut des données!
  var un_min = new Date();
  un_min.setMinutes(end.getMinutes() - 10);
  un_min.setHours(end.getHours());
  dictt.samp_diff = end.getTime() - un_min.getTime(); // diff en milliseconds=84599999
  // OU
  //dictt.echan_jour = 86400000;
  //dictt.echan_h = Math.floor(dictt.echan_jour/24);
  //dictt.echan_30mins = Math.floor(dictt.echan_h/2);

  dictt.datetime_start = start.getTime();
  dictt.datetime_end = end.getTime();

  return dictt;
}


function mettez_des_jours2(){
  dictt = {};
  
  var end = new Date();
  end.setMinutes(end.getMinutes()-90);
  dictt.datetime_end = end.getTime();

  var start = new Date();
  //start.setMinutes(end.getDate() - 1);
  start.setMinutes(end.getMinutes() - 1);
  //start.setSeconds(end.getSeconds() - 1);
  dictt.datetime_start = start.getTime(); // c'est convert le temps-stamp dans milliseconds

  dictt.samp_diff = Math.floor(dictt.datetime_end - dictt.datetime_start);

  return dictt;
}




function unpack_des_donnes1(donnes_json, sheet){

  // --------------------------
  // Unpack

  var vec_len_des = donnes_json.bucket.length; // le length de vecteur imprimer chaque fois

  var pas;

  // each bucket in our response should be a day
  // var bucketDate = new Date(parseInt(JSON.bucket[b].startTimeMillis, 10));
  
  // temp: genere des données, c'est des donnes health fitness de montre
  var vec = []
  for (var b=0; b<vec_len_des; b++){
    if (donnes_json.bucket[b].dataset[0].point.length > 0) {
      pas = donnes_json.bucket[b].dataset[0].point[0].value[0].intVal;
    } else {
      pas = NaN;
    }
    vec.push([pas])
  }
  
  var start = vec_len_des + 1;
  var end = start + vec_len_des - 1;

  // créer un string
  var str_start = "D"
  var str_out = str_start.concat(start.toString(), ":D", end.toString());
  var range = sheet.getRange(str_out);
  
  // Il faut sortir des données dans des increments (ie: vecteurs des 10 valeures)
  range.setValues(vec)
  // --------------------------

}



// see step count example at https://developers.google.com/fit/scenarios/read-daily-step-total
function getData(dictt) {

  var fitService = getFitService();
  
  // Reference le spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];

  // --------------------------
  // Le requette
  // --------------------------
  // var start_jour = 1;
  // var fin_jour = 1;
  // var nom_de_jours = 30;
  // dictt = mettez_des_jours0(start_jour, fin_jour)
  // dictt = mettez_des_jours1(nom_de_jours);
  /*
  var request = {
    "aggregateBy": [
      {
        "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
      }
    ],
    "bucketByTime": { "durationMillis": dictt.samp_diff },
    "startTimeMillis": dictt.datetime_start,
    "endTimeMillis": dictt.datetime_end
  };
  let apiEndpoint = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';
  */
  // --------------------------

  var request = {
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
    },
    "bucketByTime": { "durationMillis": dictt.samp_diff },
    "startTimeMillis": dictt.datetime_start,
    "endTimeMillis": dictt.datetime_end
  };


  const apiKey = 'AIzaSyAcKX8CcdLEwlvDVfTSWNqThxIxPcAIwDI';
  let apiEndpoint = 'https://www.googleapis.com/fitness/v1/users/me/dataSources:aggregate?key=' + apiKey;


  // --------------------------
  // Modifié
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

  // Sortie *** Données 
  var donnes_json = JSON.parse(response.getContentText());

  // --------------------------


  // --------------------------
  // Unpack 0
  var length = donnes_json.bucket.length;

  for(var b = 0; b < donnes_json.bucket.length; b++) {
    var bucketDate = new Date(parseInt(donnes_json.bucket[b].startTimeMillis, 10));
    
    var pas = NaN;
    
    if (donnes_json.bucket[b].dataset[0].point.length > 0) {
      pas = donnes_json.bucket[b].dataset[0].point[0].value[0].intVal;
    }
    
    sheet.appendRow([bucketDate, pas == NaN ? ' ' : pas, length]);
  }
  // --------------------------


  // --------------------------
  // Unpack 1
  //unpack_des_donnes1(donnes_json, sheet);
  // --------------------------

  //var cell = sheet.getRange("H1");
  //cell.setValue(dictt.echan_jour1);

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