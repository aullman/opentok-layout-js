const getBestDimensions = (minRatio, maxRatio, Width, Height, count) => {
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

    const area = (tWidth * tHeight) * count;

    // If this width and height takes up the most space then we're going with that
    if (maxArea === undefined || (area > maxArea)) {
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

module.exports = (opts, ratios) => {
  const {
    maxRatio = 3 / 2,
    minRatio = 9 / 16,
    fixedRatio = false,
    containerWidth = 640,
    containerHeight = 480,
  } = opts;
  const count = ratios.length;
  let dimensions;

  if (!fixedRatio) {
    dimensions = getBestDimensions(minRatio, maxRatio, containerWidth, containerHeight, count);
  } else {
    // Use the ratio of the first video element we find to approximate
    const ratio = ratios.length > 0 ? ratios[0] : null;
    dimensions = getBestDimensions(ratio, ratio, containerWidth, containerHeight, count);
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
    } else if (row.width < containerWidth) {
      remainingShortRows += 1;
    }
    totalRowHeight += row.height;
  }
  if (totalRowHeight < containerHeight && remainingShortRows > 0) {
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
  // vertical centering
  y = ((containerHeight - (totalRowHeight)) / 2);
  // Iterate through each row and place each child
  for (let i = 0; i < rows.length; i += 1) {
    row = rows[i];
    // center the row
    const rowMarginLeft = ((containerWidth - row.width) / 2);
    x = rowMarginLeft;
    let targetHeight;
    for (let j = 0; j < row.ratios.length; j += 1) {
      const ratio = row.ratios[j];

      let targetWidth = dimensions.targetWidth;
      targetHeight = row.height;
      // If we're using a fixedRatio then we need to set the correct ratio for this element
      if (fixedRatio) {
        targetWidth = Math.floor(targetHeight / ratio);
      }

      boxes.push({
        aspectRatio: ratio,
        left: x,
        top: y,
        width: targetWidth,
        height: targetHeight,
      });
      x += targetWidth;
    }
    y += targetHeight;
  }
  return boxes;
};
