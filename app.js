const express = require('express')
const mtaJsonFeedMessage = require('./utils/mtaFeed');
const app = express()

app.get('/', function (req, res) {
  mtaJsonFeedMessage(1).then((data) => {
    res.send(data)
  });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
