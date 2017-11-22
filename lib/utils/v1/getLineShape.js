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
    const [...lineShape] = lineShapes[line];
    const startIndex = lineShape.indexOf(startLocation);
    const endIndex = lineShape.indexOf(endLocation);

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

function getCachedShape(start, end) {
  return cachedShapes[`${start}${end}`];
}

function setCachedShape(start, end, shape) {
  cachedShapes[`${start}${end}`] = shape;
}
