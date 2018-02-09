const express = require('express')
const mtaJsonFeedMessage = require('./utils/fetchFeed');
const mtaStatic = require('./utils/mtaStatic');
const v1Update = require('./utils/v1/v1Update');
const app = express()
const _ = require('lodash');

function fullUpdate(req, res) {
  v1Update(req, res);
}

function getLine(req, res) {
  const line = mtaStatic.feedId[req.params.line];
  mtaJsonFeedMessage(line).then((data) => {
    // res.send(massageData(data));
    res.send(data);
  });
}

app.set('port', (process.env.PORT || 3001));

app.listen(app.get('port'), function() {
  console.log('Livetrain API is running on port', app.get('port'));
});
// Versioning
const v1 = express.Router();
const v2 = express.Router();

v1.use('/lines', express.Router()
  .get('/:line', getLine));

v1.use('/', express.Router().get('/', fullUpdate));

v2.use('/lines', express.Router()
  .get('/:line', getLine));

app.use('/v1', v1);
app.use('/v2', v2);
app.use('/', v1); // Set the default version to latest.
