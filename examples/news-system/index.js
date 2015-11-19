var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

//auth
app.use(function(req, res, next) {
    req.user = req.get('X-User');
    next();
});

//api
app.use('/api', require('./api'));

//frontend
app.use(express.static(__dirname + '/public'));

/* istanbul ignore next */
if (!module.parent) {
    app.listen(3000);
    console.log('Express started on port 3000');
}

exports = module.exports = app;
