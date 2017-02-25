const express = require('express')
const mtaJsonFeedMessage = require('./utils/mtaFeed');
const app = express()

app.get('/', function (req, res) {
  mtaJsonFeedMessage(1).then((data) => {
    res.send(massageData(data));
  });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

function massageData(data) {
  return data.entity.map(update => {
    const { trip_update } = update || {};

    if (!trip_update) {
      return;
    }

    const {
      trip: {
        trip_id,
        route_id
      } = {},
      stop_time_update
    } = trip_update;

    if (!stop_time_update) {
      return;
    }

    const routeIdentifier = trip_id.split('..')[1];
    const direction = routeIdentifier ? routeIdentifier[0] : '';
    const updated = Math.floor(new Date().getTime() / 1000);

    const stopTimeUpdate = stop_time_update.map(_massageStopTimes);

    return {
      trip_id: trip_id.split('_')[0],
      route: route_id,
      direction,
      updated,
      stopTimeUpdate
    };
  }).filter(e => e);
}

function _massageStopTimes(stopTime) {
  const {
    stop_id: stopId,
    arrival: arrivalObj,
    departure: departureObj
  } = stopTime || {};
  const { time: { low: arrival = null } = {} } = arrivalObj || {};
  const { time: { low: departure = null } = {} } = departureObj || {};
  return { stopId, arrival, departure };
}
