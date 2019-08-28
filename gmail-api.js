const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const clientSecretPath = 'client_secret.json';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

/**
 * Main function for getting conformation link from email
 */
function getConformationLink(){
    return fs.readFile(clientSecretPath, function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        return authorize(JSON.parse(content), listMessages);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);

    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Gets the emails from codeberryAddress account from:feedback@slack.com.
 * The first email in the queu is latest.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listMessages(auth) {
    let gmail = google.gmail('v1');
    gmail.users.messages.list({
        auth: auth,
        userId: 'me',
        q: 'from:feedback@slack.com'
    }, function(err, response){
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        let messages = response.data.messages;
        if (messages.length == 0) {
            console.log('No messages found.');
        } else {
            let message = messages[0];
            console.log('- %s', message.id);
            return getLink(message.id, auth);
        }
    });
}

/**
 * Gets conformation link from the last email from:feedback@slack.com
 * @param messageID id of the latest email
 * @param auth
 */
function getLink(messageID, auth) {
    let gmail = google.gmail('v1');
    gmail.users.messages.get({
        auth: auth,
        userId: 'me',
        id:messageID,
        format: 'full'
    }, function(err, response){
        if(typeof response !== 'undefined' && response){
            console.log(response.data.snippet);
            let bytes_full_html = Buffer.from(response.data.payload.parts[1].body.data, 'base64');
            let msg_html = bytes_full_html.toString('ascii');
            const dom = new JSDOM(msg_html);

            let confirm_link = dom.window.document.querySelector(".button_link").getAttribute("href");
            console.log(confirm_link);
            console.log("done");

            return confirm_link;
        }
    });
}
