// function doGet(e) {
//  return HtmlService.createHtmlOutputFromFile('Gmail_webapp');
//}


/**
 * Lists all labels in the user's mailbox
 * @see https://developers.google.com/gmail/api/reference/rest/v1/users.labels/list
 */
function listLabels() {
  try {
    // Gmail.Users.Labels.list() API returns the list of all Labels in user's mailbox
    const response = Gmail.Users.Labels.list('me');
    if (!response || response.labels.length === 0) {
      // TODO (developer) - No labels are returned from the response
      console.log('No labels found.');
      return;
    }
    // Print the Labels that are available.
    console.log('Labels:');
    for (const label of response.labels ) {
      console.log('- %s', label.name);
    }
  } catch (err) {
    // TODO (developer) - Handle exception on Labels.list() API
    console.log('Labels.list() API failed with error %s', err.toString());
  }
}

// In an appscript.json file, put the following
// {
//   "oauthScopes": [
//     "https://www.googleapis.com/auth/gmail.addons.execute",
//     "https://www.googleapis.com/auth/gmail.addons.current.message.metadata",
//     "https://www.googleapis.com/auth/gmail.modify" 
//   ],
//   "timeZone": "Europe/Paris",
//   "dependencies": {},
//   "exceptionLogging": "STACKDRIVER",
//   "runtimeVersion": "V8",
//   "webapp": {
//     "executeAs": "USER_DEPLOYING",
//     "access": "MYSELF"
//   }
// }
