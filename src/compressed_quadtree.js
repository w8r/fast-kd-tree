class Node {

  constructor (midx, midy, radius) {
    this.midx = midx;
    this.midy = midy;
    this.radius = radius;
    //Node **nodes;       //children
    //Point mid;          //midpoint
    //double radius;      //half side length
    //Point *pt;          //point, if data stored
  }
}


class Quadtree {

  constructor (points, getX = d => d.x, getY = d => d.y) {
    let minX = Infinity,  minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = points[i];
      const x = getX(d);
      const y = getY(d);

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    //calculate mid point and half side length
    const midx = (maxX + minX) / 2;
    const midy = (maxY + minY) / 2;

    const sidex = (maxX - minX);
    const sidey = (maxY - minY);

    const radius = Math.max(sidex, sidey);
    
    this.build(midx, midy, radius, points, getX, getY);
  }
  

  // std::list<std::pair<Point *, double> > knn(size_t k, const Point &pt, double eps) 
  // {
  //     //setup query result vector
  //     std::list<std::pair<Point *, double> > qr; 

  //     //initialize priority queue for search
  //     std::vector<NodeDistance > pq; 
  //     pq.push_back(NodeDistance(root, 0.0));

  //     while (!pq.empty()) {

  //         std::pop_heap(pq.begin(), pq.end());
  //         Node *node = pq.back().node;
  //         double node_dist = pq.back().distance; 
  //         pq.pop_back();

  //         if (node->nodes == 0) { 
  //             //calculate distance from query point to this point
  //             double dist = 0.0; 
  //             for (size_t d = 0; d < dim; ++d) {
  //                 dist += ((*node->pt)[d]-pt[d]) * ((*node->pt)[d]-pt[d]); 
  //             }

  //             //insert point in result
  //             typename std::list<std::pair<Point *, double> >::iterator itor = qr.begin();
  //             while (itor != qr.end() && itor->second < dist) {
  //                 ++itor;
  //             }

  //             qr.insert(itor, std::make_pair<Point *, double>(node->pt, dist)); 

  //             if (qr.size() > k) qr.pop_back();

  //         } else {

  //             //find k-th distance
  //             double kth_dist = qr.size() < k? std::numeric_limits<double>::max() : qr.back().second;

  //             //stop searching, all further nodes farther away than k-th value
  //             if (kth_dist <= (1.0 + eps)*node_dist) {
  //                 break;
  //             }

  //             for (size_t n = 0; n < nnodes; ++n) { 
  //                 //calculate distance to each of the non-zero children
  //                 //if less than k-th distance, then visit 
  //                 if (node->nodes[n]) {

  //                     double min_dist = min_pt_dist_to_node(pt, node->nodes[n]);

  //                     //if closer than k-th distance, search
  //                     if (min_dist < kth_dist) { 
  //                         pq.push_back(NodeDistance(node->nodes[n], min_dist));
  //                         std::push_heap(pq.begin(), pq.end()); 
  //                     }
  //                 } 
  //             }
  //         }
  //     } 

  //     return qr;
  // }

  // Node *locate(const Point &pt) 
  // {

  //     Node *node = 0;

  //     //search for node containing the query point 
  //     if (in_node(root, pt)) { 
  //         node = root; 

  //         while (node) { 
  //             if (node->nodes) { 
  //                 size_t n = 0; 
  //                 for (size_t d = 0; d < dim; ++d) { 
  //                     if (pt[d] > node->mid[d]) n += 1 << d; 
  //                 } 

  //                 if (node->nodes[n] && in_node(node->nodes[n], pt)) node = node->nodes[n]; 
  //                 else break;

  //             } else {
  //                 break;
  //             } 
  //         } 
  //     } 

  //     return node; 
  // }

  // Node *root;
  // double locate_eps;


  build (midx, midy, radius, points, getX, getY) {
    let node = new Node(midx, midy, radius); 

    if (points.length === 1) {
      node.data = points[0];
    } else { 
      node.data = null;

      //divide points between the nodes 
      const nodes = new Array(points.length);
      //std::vector<Point *> *node_pts = new std::vector<Point *>[nnodes];
      for (let i = 0; i < points.length; i++) {
        //determine node index based upon which which side of midpoint for each dimension
        let n = 0;
        const p = points[i];
        const x = getX(p);
        const y = getY(p);
        
        if (x > midx) n += 1 << 2;
        if (y > midy) n += 1 << 2;

        nodes[n] = nodes[n] || [];
        nodes[n].push(p);
      }

      console.log(nodes);

      //create new nodes recursively
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j] && nodes[j].length !== 0) {
          const new_radius = radius / 2;
          const new_midx = (j & (1 << 0)) ? (midx + new_radius) : (midx - new_radius);
          const new_midy = (j & (1 << 1)) ? (midy + new_radius) : (midy - new_radius);

          console.log(new_midx, new_midy, new_radius);

          node[j] = this.build(new_midx, new_midy, new_radius, nodes[j], getX, getY);
        } else node[j] = null; 
      }
    }
    return node;
  } 

        // double min_pt_dist_to_node(const Point &pt, Node *node)
        // {
        //     bool inside = true; 
        //     double min_dist = std::numeric_limits<double>::max();
        //     for (size_t d = 0; d < dim; ++d) { 
        
        //         double dist; 
        //         if (pt[d] < node->mid[d] - node->radius) { 
        //             dist = node->mid[d] - node->radius - pt[d];
        //             inside = false;
        //         } else if (pt[d] > node->mid[d] + node->radius) {
        //             dist = pt[d] - (node->mid[d] + node->radius); 
        //             inside = false;
        //         }

        //         if (dist < min_dist) min_dist = dist; 
        //     } 

        //     if (inside) return 0.0;
        //     else return min_dist*min_dist;
        // }

        // bool in_node(const Node *node, const Point &pt)
        // {
        //     bool in = true;

        //     for (size_t d = 0; d < dim; ++d) { 
        //         if (root->mid[d] - root->radius - pt[d] > locate_eps || pt[d] - root->mid[d] - root->radius > locate_eps) { 
        //             in = false; 
        //             break; 
        //         } 
        //     } 

        //     return in; 
        // }

        // void delete_worker(Node *node)
        // {
        //     if (node->nodes) {
        //         for (size_t n = 0; n < nnodes; ++n) { 
        //             if (node->nodes[n]) delete_worker(node->nodes[n]); 
        //         }

        //         delete node->nodes;
        //     }

        //     delete node; 
        // }    

}