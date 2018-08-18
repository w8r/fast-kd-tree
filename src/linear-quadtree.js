export default function build (points, getX = (p) => p.x, getY = (p) => p.y) {
  const NODE = 0,
        CENTER_X = 1,
        CENTER_Y = 2,
        SIZE = 3,
        NEXT_SIBLING = 4,
        FIRST_CHILD = 5,
        MASS = 6,
        MASS_CENTER_X = 7,
        MASS_CENTER_Y = 8;

  const SUBDIVISION_ATTEMPTS = 3, PPR = 9;
  const Q = [];
  // Setting up
  let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity,
      q, w, g, q2, subdivisionAttempts;

  const N = points.length;

  const X = points.map(getX);
  const Y = points.map(getY);

  // Computing min and max values
  for (let i = 0; i < N; i++) {
    const x = X[i], y = Y[i];
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  // squarify bounds, it's a quadtree
  let dx = maxX - minX, dy = maxY - minY;
  if (dx > dy) {
    minY -= (dx - dy) / 2;
    maxY = minY + dx;
  } else {
    minX -= (dy - dx) / 2;
    maxX = minX + dy;
  }

    // Build the Barnes Hut root region
  Q[0 + NODE] = -1;
  Q[0 + CENTER_X] = (minX + maxX) / 2;
  Q[0 + CENTER_Y] = (minY + maxY) / 2;
  Q[0 + SIZE] = Math.max(maxX - minX, maxY - minY);
  Q[0 + NEXT_SIBLING] = -1;
  Q[0 + FIRST_CHILD] = -1;
  Q[0 + MASS] = 0;
  Q[0 + MASS_CENTER_X] = 0;
  Q[0 + MASS_CENTER_Y] = 0;

  // Add each node in the tree
  let l = 1;
  for (let n = 0; n < N; n++) {

    // Current region, starting with root
    let r = 0;
    subdivisionAttempts = SUBDIVISION_ATTEMPTS;

    while (true) {
      // Are there sub-regions?

      // We look at first child index
      if (Q[r + FIRST_CHILD] >= 0) {
        // There are sub-regions

        // We just iterate to find a "leaf" of the tree
        // that is an empty region or a region with a single node
        // (see next case)

        // Find the quadrant of n
        if (X[n] < Q[r + CENTER_X]) {
          if (Y[n] < Q[r + CENTER_Y]) {
            // Top Left quarter
            q = Q[r + FIRST_CHILD];
          } else {
              // Bottom Left quarter
            q = Q[r + FIRST_CHILD] + PPR;
          }
        } else {
          if (Y[n] < Q[r + CENTER_Y]) {
              // Top Right quarter
            q = Q[r + FIRST_CHILD] + PPR * 2;
          } else {
            // Bottom Right quarter
            q = Q[r + FIRST_CHILD] + PPR * 3;
          }
        }

        // Update center of mass and mass (we only do it for non-leave regions)
        // Q[r + MASS_CENTER_X] =
        //   (Q[r + MASS_CENTER_X] * Q[r + MASS] +
        //    NodeMatrix[n + NODE_X] * NodeMatrix[n + NODE_MASS]) /
        //   (Q[r + MASS] + NodeMatrix[n + NODE_MASS]);

        // Q[r + MASS_CENTER_Y] =
        //   (Q[r + MASS_CENTER_Y] * Q[r + MASS] +
        //    NodeMatrix[n + NODE_Y] * NodeMatrix[n + NODE_MASS]) /
        //   (Q[r + MASS] + NodeMatrix[n + NODE_MASS]);

        // Q[r + MASS] += NodeMatrix[n + NODE_MASS];

        // Iterate on the right quadrant
        r = q;
        continue;
      } else {
        // There are no sub-regions: we are in a "leaf"
        //
        // Is there a node in this leave?
        if (Q[r + NODE] < 0) {
          // There is no node in region:
          // we record node n and go on
          Q[r + NODE] = n;
          break;
        } else {
          // There is a node in this region

          // We will need to create sub-regions, stick the two
          // nodes (the old one r[0] and the new one n) in two
          // subregions. If they fall in the same quadrant,
          // we will iterate.

          // Create sub-regions
          Q[r + FIRST_CHILD] = l * PPR;
          w = Q[r + SIZE] / 2; // new size (half)

          // NOTE: we use screen coordinates
          // from Top Left to Bottom Right

          // Top Left sub-region
          g = Q[r + FIRST_CHILD];

          Q[g + NODE] = -1;
          Q[g + CENTER_X] = Q[r + CENTER_X] - w;
          Q[g + CENTER_Y] = Q[r + CENTER_Y] - w;
          Q[g + SIZE] = w;
          Q[g + NEXT_SIBLING] = g + PPR;
          Q[g + FIRST_CHILD] = -1;
          Q[g + MASS] = 0;
          Q[g + MASS_CENTER_X] = 0;
          Q[g + MASS_CENTER_Y] = 0;

          // Bottom Left sub-region
          g += PPR;
          Q[g + NODE] = -1;
          Q[g + CENTER_X] = Q[r + CENTER_X] - w;
          Q[g + CENTER_Y] = Q[r + CENTER_Y] + w;
          Q[g + SIZE] = w;
          Q[g + NEXT_SIBLING] = g + PPR;
          Q[g + FIRST_CHILD] = -1;
          Q[g + MASS] = 0;
          Q[g + MASS_CENTER_X] = 0;
          Q[g + MASS_CENTER_Y] = 0;

          // Top Right sub-region
          g += PPR;
          Q[g + NODE] = -1;
          Q[g + CENTER_X] = Q[r + CENTER_X] + w;
          Q[g + CENTER_Y] = Q[r + CENTER_Y] - w;
          Q[g + SIZE] = w;
          Q[g + NEXT_SIBLING] = g + PPR;
          Q[g + FIRST_CHILD] = -1;
          Q[g + MASS] = 0;
          Q[g + MASS_CENTER_X] = 0;
          Q[g + MASS_CENTER_Y] = 0;

          // Bottom Right sub-region
          g += PPR;
          Q[g + NODE] = -1;
          Q[g + CENTER_X] = Q[r + CENTER_X] + w;
          Q[g + CENTER_Y] = Q[r + CENTER_Y] + w;
          Q[g + SIZE] = w;
          Q[g + NEXT_SIBLING] = Q[r + NEXT_SIBLING];
          Q[g + FIRST_CHILD] = -1;
          Q[g + MASS] = 0;
          Q[g + MASS_CENTER_X] = 0;
          Q[g + MASS_CENTER_Y] = 0;

          l += 4;

          // Now the goal is to find two different sub-regions
          // for the two nodes: the one previously recorded (r[0])
          // and the one we want to add (n)

          // Find the quadrant of the old node
          if (X[Q[r + NODE]] < Q[r + CENTER_X]) {
            if (Y[Q[r + NODE]] < Q[r + CENTER_Y]) {
              // Top Left quarter
              q = Q[r + FIRST_CHILD];
            } else {
                // Bottom Left quarter
              q = Q[r + FIRST_CHILD] + PPR;
            }
          } else {
            if (Y[Q[r + NODE]] < Q[r + CENTER_Y]) {
              // Top Right quarter
              q = Q[r + FIRST_CHILD] + PPR * 2;
            } else {
              // Bottom Right quarter
              q = Q[r + FIRST_CHILD] + PPR * 3;
            }
          }

          // We remove r[0] from the region r, add its mass to r and record it in q
          // Q[r + MASS] = NodeMatrix[Q[r + NODE] + NODE_MASS];
          // Q[r + MASS_CENTER_X] = NodeMatrix[Q[r + NODE] + NODE_X];
          // Q[r + MASS_CENTER_Y] = NodeMatrix[Q[r + NODE] + NODE_Y];

          Q[q + NODE] = Q[r + NODE];
          Q[r + NODE] = -1;

          // Find the quadrant of n
          if (X[n] < Q[r + CENTER_X]) {
            if (Y[n] < Q[r + CENTER_Y]) {
              // Top Left quarter
              q2 = Q[r + FIRST_CHILD];
            } else {
              // Bottom Left quarter
              q2 = Q[r + FIRST_CHILD] + PPR;
            }
          } else {
            if (Y[n] < Q[r + CENTER_Y]) {
              // Top Right quarter
              q2 = Q[r + FIRST_CHILD] + PPR * 2;
            } else {
              // Bottom Right quarter
              q2 = Q[r + FIRST_CHILD] + PPR * 3;
            }
          }

          if (q === q2) {
            // If both nodes are in the same quadrant,
            // we have to try it again on this quadrant
            if (subdivisionAttempts--) {
              r = q;
              continue; // while
            } else {
              // we are out of precision here, and we cannot subdivide anymore
              // but we have to break the loop anyway
              subdivisionAttempts = SUBDIVISION_ATTEMPTS;
              break; // while
            }
          }

          // If both quadrants are different, we record n
          // in its quadrant
          Q[q2 + NODE] = n;
          break;
        }
      }
    }
  }
  return Q;
}
