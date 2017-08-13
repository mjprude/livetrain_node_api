const express = require('express')
const mtaJsonFeedMessage = require('./utils/fetchFeed');
const mtaStatic = require('./utils/mtaStatic');
const app = express()
const _ = require('lodash');
let trips = {};

function fullUpdate(req, res) {
  Promise.all([
    mtaJsonFeedMessage(1).then(data => massageData(data)),
    mtaJsonFeedMessage(2).then(data => massageData(data))
  ]).then((data) => {
    res.send(Array.prototype.concat.apply([], data));
  }).catch((error) => res.send(error));
}

function getLine(req, res) {
  const line = mtaStatic.feedId[req.params.line];
  mtaJsonFeedMessage(line).then((data) => {
    res.send(massageData(data));
  });
}

app.listen(3001, function () {
  console.log('Example app listening on port 3001!')
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
    } = trip_update || {};

    if (!stop_time_update) {
      return;
    }

    const routeIdentifier = trip_id.split('..')[1];
    const direction = routeIdentifier ? routeIdentifier[0] : '';
    const updated = Math.floor(new Date().getTime() / 1000);

    const stopTimeUpdate = stop_time_update.map(_massageStopTimes) || [];

    const [
      {
        stopId: stop1,
        arrival: arrival1,
        departure: departure1,
      } = {},
      {
        stopId: stop2,
        arrival: arrival2,
        departure: departure2,
      } = {},
      {
        stopId: stop3,
        arrival: arrival3,
        departure: departure3,
      } = {}
    ] = _updateTrips(trips, trip_id, stopTimeUpdate, updated) || [];

    return {
      trip_id: trip_id.split('_')[0],
      route: route_id,
      direction,
      updated,
      stop1,
      arrival1,
      departure1,
      stop2,
      arrival2,
      departure2,
      stop3,
      arrival3,
      departure3
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

function _updateTrips(trips, tripId, stopTimeUpdate, updated) {
  const cachedTrip = trips[tripId];
  if (!cachedTrip || _.isEqual(cachedTrip, stopTimeUpdate)) {
    trips[tripId] = stopTimeUpdate;
    return stopTimeUpdate.slice(0, 3);
  }

  const oldStops = cachedTrip.filter(trip => {
    return (trip.arrival < updated || trip.departure < updated);
  });
  const allStops = oldStops.concat(stopTimeUpdate);
  trips[tripId] = allStops;
  const lastStop = oldStops[oldStops.length - 1];
  const threeStops = lastStop ?
    [lastStop].concat(stopTimeUpdate.slice(0, 2)) :
    stopTimeUpdate.slice(0, 3);
  return threeStops || [];
}

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
