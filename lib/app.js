const express = require('express')
const mtaJsonFeedMessage = require('./utils/fetchFeed');
const mtaStatic = require('./utils/mtaStatic');
const { getLineShape } = require('./utils/v1/getLineShape');
const app = express()
const _ = require('lodash');
let trips = {};

// For full list of feeds, see http://datamine.mta.info/list-of-feeds
function fullUpdate(req, res) {
  // TODO: catch & log if one of these fails
  Promise.all([
    mtaJsonFeedMessage(1)
    .then(massageData)
  ]).then((data) => {
    res.send(Array.prototype.concat.apply([], data));
  }).catch((error) => res.send(error));
}

function getLine(req, res) {
  const line = mtaStatic.feedId[req.params.line];
  mtaJsonFeedMessage(line).then((data) => {
    // res.send(massageData(data));
    res.send(data);
  });
}

function massageData(data) {
  const massagedData = data.entity.map(update => {
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
        stopId: lastStop
      } = {},
      {
        stopId: stop1,
        arrival: arrival1,
        departure: departure1,
      } = {},
      {
        stopId: stop2,
        arrival: arrival2,
        departure: departure2,
      } = {}
    ] = _updateTrips(trips, trip_id, stopTimeUpdate, updated) || [];

    const path1 = stop1 ? getLineShape(lastStop.slice(0,3), stop1.slice(0,3), route_id) : [];
    const path2 = stop2 ? getLineShape(stop1.slice(0,3), stop2.slice(0,3), route_id) : [];
    return {
      trip_id: trip_id.split('_')[0],
      route: route_id,
      direction,
      updated,
      stop1,
      path1,
      arrival1,
      departure1,
      stop2,
      path2,
      arrival2,
      departure2
    };
  }).filter(Boolean);
  debugger;
  return massagedData;
}

        // route_obj = {
        //   trip_id: stop1['id'],
        //   route: stop1['route'],
        //   direction: stop1['direction'],
        //   updated: stop1['mta_timestamp'],
        //
        //   lastStop: last_stop['stop_id'],
        //   lastDeparture: last_stop['departure_time'],
        //
        //   stop1: stop1['stop_id'],
        //   path1: Shapes.get_path(stop1['route'], last_stop['stop_id'], stop1['stop_id'], master_stops, master_routes),
        //   arrival1: stop1['arrival_time'],
        //   departure1: stop1['departure_time'],
        //
        //   trip1Complete: false,
        //   trip2Complete: trip2Complete,
        //   trip3Complete: trip3Complete
        // }
        //
        // if stop2
        //   route_obj[:stop2] = stop2['stop_id']
        //   route_obj[:path2] = Shapes.get_path(stop1['route'], stop1['stop_id'], stop2['stop_id'], master_stops, master_routes)
        //   route_obj[:arrival2] = stop2['arrival_time']
        //   route_obj[:departure2] = stop2['departure_time']
        // end
        //
        // if stop3
        //   route_obj[:stop3] = stop3['stop_id']
        //   route_obj[:path3] = Shapes.get_path(stop1['route'], stop2['stop_id'], stop3['stop_id'], master_stops, master_routes)
        //   route_obj[:arrival3] = stop3['arrival_time']
        //   route_obj[:departure3] = stop3['departure_time']
        // end
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
