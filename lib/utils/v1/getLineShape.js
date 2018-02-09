const stops = require('../../mtaAssets/stopCoordinates');
const lineShapes = require('../../mtaAssets/lineShapes');

let cachedShapes = {};
module.exports = {
  getLineShape(start, end, line) {
    const cachedShape = getCachedShape(start, end);
    if (cachedShape) {
      return cachedShape;
    } 
    const startLocation = stops[start];
    const endLocation = stops[end];
    const { startIndex, endIndex, lineShape = [] } = findStops(line, startLocation, endLocation) || {};

    let sectionShape;
    if (endIndex > startIndex) {
      sectionShape = lineShape.slice(startIndex, endIndex + 1);
    } else {
      sectionShape = lineShape.slice(endIndex, startIndex + 1).reverse();
    }
    setCachedShape(start, end, sectionShape);
    return sectionShape;
  },
  _resetCache() {
    cachedShapes = {};
  }
};

function findStops(line, startLocation, endLocation) {
  const [...lineShape] = lineShapes[line];
  const startIndex = lineShape.indexOf(startLocation);
  const endIndex = lineShape.indexOf(endLocation);
  if (startIndex < 0 || endIndex < 0) {
    return searchInAllLines(startLocation, endLocation);
  } else {
    return { startIndex, endIndex, lineShape };
  }
}

function searchInAllLines(start, end) {
  for (let line of Object.keys(lineShapes)) {
    if (lineShapes[line] && lineShapes[line].includes(start)) {
      return findStops(line, start, end);
    }
  }
}

function getCachedShape(start, end) {
  return cachedShapes[`${start}${end}`];
}

function setCachedShape(start, end, shape) {
  cachedShapes[`${start}${end}`] = shape;
}
