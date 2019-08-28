# Headless Berry

Headles berry registers users into slack so they can join the community faster.
## Installation
In index.js set the following variables:

```
* slackInvitationLink: where the user can ask for slack channel invite link accordint to his locale
* slackAccountSettingsPage: settings page of the channel
* codeberryAddress: temporarly used email address for registration
* userRealName: users's real name used for registration
* userDisplayName: users's displayable name used in slack
* userPassword: users's password
* userAddress: users's email address
* clientSecretPath: client_secret.json in gmail-api.js
```
## Usage
* You should register your app on https://developers.google.com/ to get a client secret for authorization
* Run index.js
* At part II it will ask you to authorize yourself