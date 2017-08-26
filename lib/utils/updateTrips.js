module.exports = function updateTrips(trips, update = {}, currentTime = Date.now()) {
  if (!Object.keys(trips).length) return update;
  const updatedStopIds = Object.keys(update);
  if (!updatedStopIds) return trips;

  for (let updatedStopId of updatedStopIds) {
    const oldStops = trips[updatedStopId];
    if (!oldStops) {
      trips.updatedStopId = update[updatedStopId];
    } else {
      const combinedStops = combineStops(oldStops, update[updatedStopId], currentTime);
      trips[updatedStopId] = combinedStops;
    }
  }
  return trips;
}

function combineStops(oldStops, updatedStops, currentTime) {
  const oldNextStopIndex = oldStops.findIndex(({ arrival, departure }) => {
    return (arrival || departure) >= currentTime;
  });

  if (oldNextStopIndex > 0) {
    const lastStop = oldStops[oldNextStopIndex - 1];
    return [lastStop, ...updatedStops];
  } else if (oldNextStopIndex === -1) {
    const lastStop = oldStops[oldStops.length - 1];
    return [lastStop, ...updatedStops];
  } else {
    return updatedStops;
  }
}
