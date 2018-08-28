export declare type Code = number;
interface Node {
    key: Code;
}
export declare class InternalNode implements Node {
    key: Code;
    left: Node;
    right: Node;
    constructor(key: Code, left?: Node, right?: Node);
}
export declare class Leaf implements Node {
    key: Code;
    data: any;
    constructor(key: Code, data: any);
}
export declare class BucketLeaf implements Node {
    key: Code;
    data: Array<any>;
    constructor(key: Code, data: Array<any>);
}
export declare type CoordinateGetter = (data: any) => number;
export default class Tree {
    private _x;
    private _y;
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    private _nodeSize;
    private _root;
    private _project;
    constructor(data: Array<any>, getX?: CoordinateGetter, getY?: CoordinateGetter, nodeSize?: number);
}
export {};
