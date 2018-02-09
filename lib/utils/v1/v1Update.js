const mtaJsonFeedMessage = require('../fetchFeed');
const getLineShape = require('./getLineShape').getLineShape;
const _ = require('lodash');
// See http://datamine.mta.info/list-of-feeds for full list of feeds
// Feed 1 - 1, 2, 3, 4, 5, 6, S Lines
// Feed 2 - L Line
const V1_FEEDS = [1, 2];
let trips = {};

module.exports = function v1Update(req, res) {
  trips = trips;
  const updates = V1_FEEDS.map((line) => {
    return mtaJsonFeedMessage(line)
      .then(data => massageData(data))
      .catch(e => {
        // LOG FAILURE
        return [];
      });
  });
  Promise.all(updates)
    .then(data => res.send(Array.prototype.concat.apply([], data)))
    .catch(error => res.send(error));
};

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
        stopId: stop0,
      },
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

    let path1 = _getPath(stop0, stop1, route_id);
    let path2 = _getPath(stop1, stop2, route_id);
    let path3 = _getPath(stop2, stop3, route_id);

    return {
      trip_id: trip_id.split('_')[0],
      route: route_id,
      direction,
      updated,
      stop1,
      arrival1,
      departure1,
      path1,
      stop2,
      arrival2,
      departure2,
      path2,
      stop3,
      arrival3,
      departure3,
      path3
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
    return stopTimeUpdate.slice(0, 4);
  }

  const oldStops = cachedTrip.filter(trip => {
    return (trip.arrival < updated || trip.departure < updated);
  });
  const allStops = oldStops.concat(stopTimeUpdate);
  trips[tripId] = allStops;
  const lastStop = oldStops[oldStops.length - 1];
  const threeStops = lastStop ?
    [lastStop].concat(stopTimeUpdate.slice(0, 3)) :
    stopTimeUpdate.slice(0, 4);
  return threeStops || [];
}

function _getPath(stop1 = '', stop2 = '', routeId) {
  if (!stop1.length || !stop2.length) return;

  try {
    return getLineShape(stop1.slice(0, 3), stop2.slice(0, 3), routeId) || [];
  } catch(e) {
    debugger;
    return [];
  }
}
