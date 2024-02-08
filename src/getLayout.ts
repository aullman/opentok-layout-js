/// <reference path="../types/opentok-layout-js.d.ts" />

import { Element, Options, Box, GetLayoutRes } from 'opentok-layout-js';

const getBestDimensions = (minRatio: number, maxRatio: number, Width: number, Height: number, count: number, maxWidth: number, maxHeight: number, evenRows: boolean) => {
  let maxArea: number;
  let targetCols: number;
  let targetRows: number;
  let targetHeight: number;
  let targetWidth: number;
  let tWidth: number;
  let tHeight: number;
  let tRatio: number;

  // Iterate through every possible combination of rows and columns
  // and see which one has the least amount of whitespace
  for (let i = 1; i <= count; i += 1) {
    const cols = i;
    const rows = Math.ceil(count / cols);

    // Try taking up the whole height and width
    tHeight = Math.floor(Height / rows);
    tWidth = Math.floor(Width / cols);

    tRatio = tHeight / tWidth;
    if (tRatio > maxRatio) {
      // We went over decrease the height
      tRatio = maxRatio;
      tHeight = tWidth * tRatio;
    } else if (tRatio < minRatio) {
      // We went under decrease the width
      tRatio = minRatio;
      tWidth = tHeight / tRatio;
    }

    tWidth = Math.min(maxWidth, tWidth);
    tHeight = Math.min(maxHeight, tHeight);

    const area = (tWidth * tHeight) * count;

    // If this width and height takes up the most space then we're going with that
    if (maxArea === undefined || (area >= maxArea)) {
      if (evenRows && area === maxArea && ((cols * rows) % count) > ((targetRows * targetCols) % count)) {
        // We have the same area but there are more left over spots in the last row
        // Let's keep the previous one
        continue;
      }
      maxArea = area;
      targetHeight = tHeight;
      targetWidth = tWidth;
      targetCols = cols;
      targetRows = rows;
    }
  }
  return {
    maxArea,
    targetCols,
    targetRows,
    targetHeight,
    targetWidth,
    ratio: targetHeight / targetWidth,
  };
};

type Offsets = {
  offsetLeft: number;
  offsetTop: number;
}

type Row = {
  ratios: number[];
  elements: Element[];
  width: number;
  height: number;
}

type Areas = { small?: Box, big?: Box }

const getLayout = (opts: Options & Offsets, elements: Element[]): Box[] => {
  const {
    maxRatio,
    minRatio,
    fixedRatio,
    containerWidth,
    containerHeight,
    offsetLeft = 0,
    offsetTop = 0,
    alignItems = 'center',
    maxWidth = Infinity,
    maxHeight = Infinity,
    scaleLastRow = true,
    evenRows = true,
  } = opts;
  const ratios = elements.map(element => element.height / element.width);
  const count = ratios.length;


  let dimensions: ReturnType<typeof getBestDimensions>;

  if (!fixedRatio) {
    dimensions = getBestDimensions(minRatio, maxRatio, containerWidth, containerHeight, count,
      maxWidth, maxHeight, evenRows);
  } else {
    // Use the ratio of the first video element we find to approximate
    const ratio = ratios.length > 0 ? ratios[0] : null;
    dimensions = getBestDimensions(ratio, ratio, containerWidth, containerHeight, count,
      maxWidth, maxHeight, evenRows);
  }

  // Loop through each stream in the container and place it inside
  let x = 0;
  let y = 0;
  const rows: Row[] = [];
  let row: Row;
  const boxes: Box[] = [];
  // Iterate through the children and create an array with a new item for each row
  // and calculate the width of each row so that we know if we go over the size and need
  // to adjust
  for (let i = 0; i < ratios.length; i += 1) {
    if (i % dimensions.targetCols === 0) {
      // This is a new row
      row = {
        ratios: [],
        elements: [],
        width: 0,
        height: 0,
      };
      rows.push(row);
    }
    const ratio = ratios[i];
    const element = elements[i];
    row.elements.push(element);
    row.ratios.push(ratio);
    let targetWidth = dimensions.targetWidth;
    const targetHeight = dimensions.targetHeight;
    // If we're using a fixedRatio then we need to set the correct ratio for this element
    if (fixedRatio || element.fixedRatio) {
      targetWidth = targetHeight / ratio;
    }
    row.width += targetWidth;
    row.height = targetHeight;
  }
  // Calculate total row height adjusting if we go too wide
  let totalRowHeight = 0;
  let remainingShortRows = 0;
  for (let i = 0; i < rows.length; i += 1) {
    row = rows[i];
    if (row.width > containerWidth) {
      // Went over on the width, need to adjust the height proportionally
      row.height = Math.floor(row.height * (containerWidth / row.width));
      row.width = containerWidth;
    } else if (row.width < containerWidth && row.height < maxHeight) {
      remainingShortRows += 1;
    }
    totalRowHeight += row.height;
  }
  if (scaleLastRow && totalRowHeight < containerHeight && remainingShortRows > 0) {
    // We can grow some of the rows, we're not taking up the whole height
    let remainingHeightDiff = containerHeight - totalRowHeight;
    totalRowHeight = 0;
    for (let i = 0; i < rows.length; i += 1) {
      row = rows[i];
      if (row.width < containerWidth) {
        // Evenly distribute the extra height between the short rows
        let extraHeight = remainingHeightDiff / remainingShortRows;
        if ((extraHeight / row.height) > ((containerWidth - row.width) / row.width)) {
          // We can't go that big or we'll go too wide
          extraHeight = Math.floor(((containerWidth - row.width) / row.width) * row.height);
        }
        row.width += Math.floor((extraHeight / row.height) * row.width);
        row.height += extraHeight;
        remainingHeightDiff -= extraHeight;
        remainingShortRows -= 1;
      }
      totalRowHeight += row.height;
    }
  }
  switch (alignItems) {
    case 'start':
      y = 0;
      break;
    case 'end':
      y = containerHeight - totalRowHeight;
      break;
    case 'center':
    default:
      y = ((containerHeight - (totalRowHeight)) / 2);
      break;
  }
  // Iterate through each row and place each child
  for (let i = 0; i < rows.length; i += 1) {
    row = rows[i];
    let rowMarginLeft;
    switch (alignItems) {
      case 'start':
        rowMarginLeft = 0;
        break;
      case 'end':
        rowMarginLeft = containerWidth - row.width;
        break;
      case 'center':
      default:
        rowMarginLeft = ((containerWidth - row.width) / 2);
        break;
    }
    x = rowMarginLeft;
    let targetHeight;
    for (let j = 0; j < row.ratios.length; j += 1) {
      const ratio = row.ratios[j];
      const element = row.elements[j];

      let targetWidth = dimensions.targetWidth;
      targetHeight = row.height;
      // If we're using a fixedRatio then we need to set the correct ratio for this element
      if (fixedRatio || element.fixedRatio) {
        targetWidth = Math.floor(targetHeight / ratio);
      } else if ((targetHeight / targetWidth)
        !== (dimensions.targetHeight / dimensions.targetWidth)) {
        // We grew this row, we need to adjust the width to account for the increase in height
        targetWidth = Math.floor((dimensions.targetWidth / dimensions.targetHeight) * targetHeight);
      }

      boxes.push({
        left: x + offsetLeft,
        top: y + offsetTop,
        width: targetWidth,
        height: targetHeight,
      });
      x += targetWidth;
    }
    y += targetHeight;
  }
  return boxes;
};

const getVideoRatio = (element: Element) => element.height / element.width;

export default (opts: Options, elements: Element[]): GetLayoutRes => {
  const {
    maxRatio = 3 / 2,
    minRatio = 9 / 16,
    fixedRatio = false,
    bigPercentage = 0.8,
    minBigPercentage = 0,
    bigFixedRatio = false,
    bigMaxRatio = 3 / 2,
    bigMinRatio = 9 / 16,
    bigFirst = true,
    containerWidth = 640,
    containerHeight = 480,
    alignItems = 'center',
    bigAlignItems = 'center',
    smallAlignItems = 'center',
    maxWidth = Infinity,
    maxHeight = Infinity,
    smallMaxWidth = Infinity,
    smallMaxHeight = Infinity,
    bigMaxWidth = Infinity,
    bigMaxHeight = Infinity,
    scaleLastRow = true,
    bigScaleLastRow = true,
    evenRows = true,
  } = opts;

  const availableRatio = containerHeight / containerWidth;
  let offsetLeft = 0;
  let offsetTop = 0;
  let bigOffsetTop = 0;
  let bigOffsetLeft = 0;
  const bigIndices: number[] = [];
  const bigOnes = elements.filter((element, idx) => {
    if (element.big) {
      bigIndices.push(idx);
      return true;
    }
    return false;
  });
  const smallOnes = elements.filter(element => !element.big);
  let bigBoxes: Box[] = [];
  let smallBoxes: Box[] = [];
  const areas: Areas = {};
  if (bigOnes.length > 0 && smallOnes.length > 0) {
    let bigWidth: number;
    let bigHeight: number;
    let showBigFirst = bigFirst === true;

    if (availableRatio > getVideoRatio(bigOnes[0])) {
      // We are tall, going to take up the whole width and arrange small
      // guys at the bottom
      bigWidth = containerWidth;
      bigHeight = Math.floor(containerHeight * bigPercentage);
      if (minBigPercentage > 0) {
        // Find the best size for the big area
        let bigDimensions: ReturnType<typeof getBestDimensions>;
        if (!bigFixedRatio) {
          bigDimensions = getBestDimensions(bigMinRatio, bigMaxRatio, bigWidth,
            bigHeight, bigOnes.length, bigMaxWidth, bigMaxHeight, evenRows);
        } else {
          // Use the ratio of the first video element we find to approximate
          const ratio = bigOnes[0].height / bigOnes[0].width;
          bigDimensions = getBestDimensions(ratio, ratio, bigWidth, bigHeight,
            bigOnes.length, bigMaxWidth, bigMaxHeight, evenRows);
        }
        bigHeight = Math.max(containerHeight * minBigPercentage,
          Math.min(bigHeight, bigDimensions.targetHeight * bigDimensions.targetRows));
        // Don't awkwardly scale the small area bigger than we need to and end up with floating
        // videos in the middle
        const smallBoxes = getLayout({
          containerWidth: containerWidth,
          containerHeight: containerHeight - bigHeight,
          offsetLeft: 0,
          offsetTop: 0,
          fixedRatio,
          minRatio,
          maxRatio,
          alignItems: smallAlignItems,
          maxWidth: smallMaxWidth,
          maxHeight: smallMaxHeight,
          scaleLastRow,
          evenRows,
        }, smallOnes);
        let smallHeight = 0
        let currentTop = undefined
        smallBoxes.forEach(box => {
          if (currentTop !== box.top) {
            currentTop = box.top
            smallHeight += box.height
          }
        })
        bigHeight = Math.max(bigHeight, containerHeight - smallHeight);
      }
      offsetTop = bigHeight;
      bigOffsetTop = containerHeight - offsetTop;
      if (bigFirst === 'column') {
        showBigFirst = false;
      } else if (bigFirst === 'row') {
        showBigFirst = true;
      }
    } else {
      // We are wide, going to take up the whole height and arrange the small
      // guys on the right
      bigHeight = containerHeight;
      bigWidth = Math.floor(containerWidth * bigPercentage);
      if (minBigPercentage > 0) {
        // Find the best size for the big area
        let bigDimensions: ReturnType<typeof getBestDimensions>;
        if (!bigFixedRatio) {
          bigDimensions = getBestDimensions(bigMinRatio, bigMaxRatio, bigWidth,
            bigHeight, bigOnes.length, bigMaxWidth, bigMaxHeight, evenRows);
        } else {
          // Use the ratio of the first video element we find to approximate
          const ratio = bigOnes[0].height / bigOnes[0].width;
          bigDimensions = getBestDimensions(ratio, ratio, bigWidth, bigHeight,
            bigOnes.length, bigMaxWidth, bigMaxHeight, evenRows);
        }
        bigWidth = Math.max(containerWidth * minBigPercentage,
          Math.min(bigWidth, bigDimensions.targetWidth * bigDimensions.targetCols));
        // Don't awkwardly scale the small area bigger than we need to and end up with floating
        // videos in the middle
        const smallBoxes = getLayout({
          containerWidth: containerWidth - bigWidth,
          containerHeight: containerHeight,
          offsetLeft: 0,
          offsetTop: 0,
          fixedRatio,
          minRatio,
          maxRatio,
          alignItems: smallAlignItems,
          maxWidth: smallMaxWidth,
          maxHeight: smallMaxHeight,
          scaleLastRow,
          evenRows,
        }, smallOnes);
        let smallWidth = 0
        let currentWidth = 0
        let top = 0
        smallBoxes.forEach(box => {
          if (box.top !== top) {
            currentWidth = 0
            top = box.top
          }
          currentWidth += box.width
          smallWidth = Math.max(smallWidth, currentWidth)
        })
        bigWidth = Math.max(bigWidth, containerWidth - smallWidth);
      }
      offsetLeft = bigWidth;
      bigOffsetLeft = containerWidth - offsetLeft;
      if (bigFirst === 'column') {
        showBigFirst = true;
      } else if (bigFirst === 'row') {
        showBigFirst = false;
      }
    }
    if (showBigFirst) {
      areas.big = {
        top: 0,
        left: 0,
        width: bigWidth,
        height: bigHeight,
      };
      areas.small = {
        top: offsetTop,
        left: offsetLeft,
        width: containerWidth - offsetLeft,
        height: containerHeight - offsetTop,
      };
    } else {
      areas.big = {
        left: bigOffsetLeft,
        top: bigOffsetTop,
        width: bigWidth,
        height: bigHeight,
      };
      areas.small = {
        top: 0,
        left: 0,
        width: containerWidth - offsetLeft,
        height: containerHeight - offsetTop,
      };
    }
  } else if (bigOnes.length > 0 && smallOnes.length === 0) {
    // We only have one bigOne just center it
    areas.big = {
      top: 0,
      left: 0,
      width: containerWidth,
      height: containerHeight,
    };
  } else {
    areas.small = {
      top: offsetTop,
      left: offsetLeft,
      width: containerWidth - offsetLeft,
      height: containerHeight - offsetTop,
    };
  }

  if (areas.big) {
    bigBoxes = getLayout({
      containerWidth: areas.big.width,
      containerHeight: areas.big.height,
      offsetLeft: areas.big.left,
      offsetTop: areas.big.top,
      fixedRatio: bigFixedRatio,
      minRatio: bigMinRatio,
      maxRatio: bigMaxRatio,
      alignItems: bigAlignItems,
      maxWidth: bigMaxWidth,
      maxHeight: bigMaxHeight,
      scaleLastRow: bigScaleLastRow,
      evenRows,
    }, bigOnes);
  }
  if (areas.small) {
    smallBoxes = getLayout({
      containerWidth: areas.small.width,
      containerHeight: areas.small.height,
      offsetLeft: areas.small.left,
      offsetTop: areas.small.top,
      fixedRatio,
      minRatio,
      maxRatio,
      alignItems: areas.big ? smallAlignItems : alignItems,
      maxWidth: areas.big ? smallMaxWidth : maxWidth,
      maxHeight: areas.big ? smallMaxHeight : maxHeight,
      scaleLastRow,
      evenRows,
    }, smallOnes);
  }

  const boxes: Box[] = [];
  let bigBoxesIdx = 0;
  let smallBoxesIdx = 0;
  // Rebuild the array in the right order based on where the bigIndices should be
  elements.forEach((element, idx) => {
    if (bigIndices.indexOf(idx) > -1) {
      boxes[idx] = bigBoxes[bigBoxesIdx];
      bigBoxesIdx += 1;
    } else {
      boxes[idx] = smallBoxes[smallBoxesIdx];
      smallBoxesIdx += 1;
    }
  });
  return { boxes, areas };
};
