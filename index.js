var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');

const host = 'http://datamine.mta.info';
const path = '/mta_esi.php';
const key = process.env.MTA_REALTIME_API_KEY;
const feed_id = 1;
const params = `?key=${ key }&feed_id=${ feed_id }`;
const url = host + path + params;

var requestSettings = {
  method: 'GET',
  url,
  encoding: null
};
request(requestSettings, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var feed = GtfsRealtimeBindings.FeedMessage.decode(body);
    feed.entity.forEach(function(entity) {
      if (entity.trip_update) {
        console.log(entity.trip_update);
      }
    });
  }
});
