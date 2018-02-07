const stops = require('../../mtaAssets/stopCoordinates');
const lineShapes = require('../../mtaAssets/lineShapes');
const _ = require('lodash');

const { isEmpty, pull } = _;

let cachedShapes = {};

function getLineShape(start, end, line) {
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

  if (isEmpty(sectionShape)) {
    return findShapeOnOtherLines(start, end, line);
  } else {
    setCachedShape(start, end, sectionShape);
  };

  return sectionShape;
}

function findShapeOnOtherLines(start, end, failedLine) {
  const lines = ['1', '2', '3', '4', '5', '6', 'GS', 'L'];
  const remainingLines = _.pull(lines, failedLine);
  for (let line of remainingLines) {
    const shape = getLineShape(start, end, line);
    if (!isEmpty(shape)) return shape;
  }
}

function getCachedShape(start, end) {
  return cachedShapes[`${start}${end}`];
}

function setCachedShape(start, end, shape) {
  cachedShapes[`${start}${end}`] = shape;
}

module.exports = {
  getLineShape,
  _resetCache() {
    cachedShapes = {};
  }
};

