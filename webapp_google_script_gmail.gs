// ------------ Code.gs ------------
function doGet(e) {
    return HtmlService.createHtmlOutputFromFile('Gmail_webapp');
}

async function automated_task0_getSpamMail() {
  var spam_emails = GmailApp.getSpamThreads();
  if (spam_emails.length == 0) {
    spam_emails = 'No spam messages.'
  }
  return spam_emails
}

async function automated_task1_createAdraft_email() {
  var now = new Date();
  var out = GmailApp.createDraft('your_email_username@gmail.com', "subject text: hello", "body text: Data Science notes")

  var created_draft = `Draft email created! Draft email is: ${out.getMessage().getBody()}`
  return created_draft
}

async function authorize_gmail_access() {
  var nameService = getService();

  return 'Finished authorization! Select an automated task.'
}

function authCallback(request) {
  var nameService = getService();
  var isAuthorized = nameService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

function getService() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.

  var ClientID = 'XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com';
  var ClientSecret = 'XXXXXX-XXXXXXXXXXXXXXXXXX_XXXXXXXXX';

  return OAuth2.createService('gmail')

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
      .setScope('https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile')
    
      // Sets the login hint, which will prevent the account chooser screen
      // from being shown to users logged in with multiple accounts.
      .setParam('login_hint', Session.getActiveUser().getEmail())

      // Requests offline access.
      .setParam('access_type', 'offline')
}





// ------------ Gmail_webapp.html ------------
<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <title>Gmail API</title>
    
    <script>

      async function updateButton() {
        google.script.run.withSuccessHandler(function(result){document.getElementById("outData").innerHTML = result}).authorize_gmail_access();
      }


      async function run_automation(){
        
        var automation_example = document.getElementById("automation_example_list").value;

        if (automation_example == 'automated_task0_getSpamMail') {
          vec = [];   // Create an array
          var spam_emails = await google.script.run.withSuccessHandler(function(result){document.getElementById("outData2").innerHTML = result; vec.push(result); return result}).automated_task0_getSpamMail();
          var spam_emails = vec[0];

        } else {
          vec = [];
          var created_draft = await google.script.run.withSuccessHandler(function(result){document.getElementById("outData2").innerHTML = result; vec.push(result); return result}).automated_task1_createAdraft_email();
          var created_draft = vec[0];

        } 

      }

    </script>



    <h1>Gmail API</h1>
    
    <button id="myBtn" onclick="updateButton()">Authorize</button>

    <br><br>

    <textarea id="outData" rows="4" cols="100" placeholder="Autorization output"></textarea>

    <br><br>

    <!--Drop down menu-->
     <label for="automation_example">Select a desired Gmail automation example:</label>
      <select name="automation_example_list" id="automation_example_list">
        <option value="automated_task0_getSpamMail">automated_task0_getSpamMail</option>
        <option value="automated_task1_createAdraft_email">automated_task1_createAdraft_email</option>
      </select> 

    <br><br>

    <button id="runAutomation" onclick="run_automation()">Run Selection</button>

    <textarea id="outData2" rows="4" cols="100" placeholder="Automation output"></textarea>

  </body>
</html>
