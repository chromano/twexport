var oauthshim = require('oauth-shim'),
	express = require('express');

var app = express();

app.use(express.static('static'));
app.all('/auth', oauthshim);

var creds = require('./credentials.json');
oauthshim.init(creds);

var port = process.env.PORT || 9001;
app.listen(port);
console.info('Listening on ' + port);

