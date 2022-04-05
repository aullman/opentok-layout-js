const getBestDimensions = (minRatio, maxRatio, Width, Height, count, maxWidth, maxHeight) => {
  let maxArea;
  let targetCols;
  let targetRows;
  let targetHeight;
  let targetWidth;
  let tWidth;
  let tHeight;
  let tRatio;

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
      if (!(area === maxArea && (count % (cols * rows)) > (count % (targetRows * targetCols)))) {
        // Favour even numbers of participants in each row, eg. 2 on each row
        // instead of 3 in one row and then 1 on the next
        maxArea = area;
        targetHeight = tHeight;
        targetWidth = tWidth;
        targetCols = cols;
        targetRows = rows;
      }
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

const getLayout = (opts, elements) => {
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
  } = opts;
  const ratios = elements.map(element => element.height / element.width);
  const count = ratios.length;


  let dimensions;

  if (!fixedRatio) {
    dimensions = getBestDimensions(minRatio, maxRatio, containerWidth, containerHeight, count,
      maxWidth, maxHeight);
  } else {
    // Use the ratio of the first video element we find to approximate
    const ratio = ratios.length > 0 ? ratios[0] : null;
    dimensions = getBestDimensions(ratio, ratio, containerWidth, containerHeight, count,
      maxWidth, maxHeight);
  }

  // Loop through each stream in the container and place it inside
  let x = 0;
  let y = 0;
  const rows = [];
  let row;
  const boxes = [];
  // Iterate through the children and create an array with a new item for each row
  // and calculate the width of each row so that we know if we go over the size and need
  // to adjust
  for (let i = 0; i < ratios.length; i += 1) {
    if (i % dimensions.targetCols === 0) {
      // This is a new row
      row = {
        ratios: [],
        width: 0,
        height: 0,
      };
      rows.push(row);
    }
    const ratio = ratios[i];
    row.ratios.push(ratio);
    let targetWidth = dimensions.targetWidth;
    const targetHeight = dimensions.targetHeight;
    // If we're using a fixedRatio then we need to set the correct ratio for this element
    if (fixedRatio) {
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

      let targetWidth = dimensions.targetWidth;
      targetHeight = row.height;
      // If we're using a fixedRatio then we need to set the correct ratio for this element
      if (fixedRatio) {
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

const getVideoRatio = element => element.height / element.width;

module.exports = (opts, elements) => {
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
  } = opts;

  const availableRatio = containerHeight / containerWidth;
  let offsetLeft = 0;
  let offsetTop = 0;
  let bigOffsetTop = 0;
  let bigOffsetLeft = 0;
  const bigIndices = [];
  const bigOnes = elements.filter((element, idx) => {
    if (element.big) {
      bigIndices.push(idx);
      return true;
    }
    return false;
  });
  const smallOnes = elements.filter(element => !element.big);
  let bigBoxes = [];
  let smallBoxes = [];
  const areas = {};
  if (bigOnes.length > 0 && smallOnes.length > 0) {
    let bigWidth;
    let bigHeight;
    let showBigFirst = bigFirst === true;

    if (availableRatio > getVideoRatio(bigOnes[0])) {
      // We are tall, going to take up the whole width and arrange small
      // guys at the bottom
      bigWidth = containerWidth;
      bigHeight = Math.floor(containerHeight * bigPercentage);
      if (minBigPercentage > 0) {
        // Find the best size for the big area
        let bigDimensions;
        if (!bigFixedRatio) {
          bigDimensions = getBestDimensions(bigMinRatio, bigMaxRatio, bigWidth,
            bigHeight, bigOnes.length, bigMaxWidth, bigMaxHeight);
        } else {
          // Use the ratio of the first video element we find to approximate
          const ratio = bigOnes[0].height / bigOnes[0].width;
          bigDimensions = getBestDimensions(ratio, ratio, bigWidth, bigHeight,
            bigOnes.length, bigMaxWidth, bigMaxHeight);
        }
        bigHeight = Math.max(containerHeight * minBigPercentage,
          Math.min(bigHeight, bigDimensions.targetHeight * bigDimensions.targetRows));
        // Don't awkwardly scale the small area bigger than we need to and end up with floating
        // videos in the middle
        const smallDimensions = getBestDimensions(minRatio, maxRatio, containerWidth,
          containerHeight - bigHeight, smallOnes.length, smallMaxWidth, smallMaxHeight);
        bigHeight = Math.max(bigHeight, containerHeight
          - (smallDimensions.targetRows * smallDimensions.targetHeight));
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
        let bigDimensions;
        if (!bigFixedRatio) {
          bigDimensions = getBestDimensions(bigMinRatio, bigMaxRatio, bigWidth,
            bigHeight, bigOnes.length, bigMaxWidth, bigMaxHeight);
        } else {
          // Use the ratio of the first video element we find to approximate
          const ratio = bigOnes[0].height / bigOnes[0].width;
          bigDimensions = getBestDimensions(ratio, ratio, bigWidth, bigHeight,
            bigOnes.length, bigMaxWidth, bigMaxHeight);
        }
        bigWidth = Math.max(containerWidth * minBigPercentage,
          Math.min(bigWidth, bigDimensions.targetWidth * bigDimensions.targetCols));
        // Don't awkwardly scale the small area bigger than we need to and end up with floating
        // videos in the middle
        const smallDimensions = getBestDimensions(minRatio, maxRatio, containerWidth - bigWidth,
          containerHeight, smallOnes.length, smallMaxWidth, smallMaxHeight);
        bigWidth = Math.max(bigWidth, containerWidth
          - (smallDimensions.targetCols * smallDimensions.targetWidth));
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
    }, smallOnes);
  }

  const boxes = [];
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
