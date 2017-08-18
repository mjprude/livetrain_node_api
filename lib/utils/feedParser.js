module.exports = function feedParser({ entity = [] } = {}) {
  let feedUpdate = {}
  entity.forEach(function({ trip_update = {} }) {
    if (!trip_update) return;

    const {
      trip: {
        trip_id,
      } = {},
      stop_time_update
    } = trip_update || {};

    if (!stop_time_update) {
      return;
    }
    feedUpdate[trip_id] = stop_time_update.map(extractStopTime) || [];
  });
  return feedUpdate;
}

function extractStopTime(stopTime = {}) {
  const {
    stop_id: stopId,
    arrival: arrivalObj,
    departure: departureObj
  } = stopTime;
  const { time: { low: arrival = null } = {} } = arrivalObj || {};
  const { time: { low: departure = null } = {} } = departureObj || {};
  return { stopId, arrival, departure };
}
