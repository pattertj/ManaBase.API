var express = require('express'); // create our app w/ express
var bodyParser = require('body-parser'); // body-parser to help deal with JSON requests

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: true }));

require('./app/routes')(app, {});

app.listen(port, () => {
  console.log('We are live on ' + port);
});