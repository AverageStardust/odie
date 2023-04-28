import { Bound3, Bound3Args } from "./bound3";
import { Vec3, Vec3Args, Vec3Data, vec3DataFromArgs } from "./vector3";

export interface SpaceItem3 {
	position: Vec3Data;
}

interface SpaceChildren3<T extends SpaceItem3> {
	lowXLowYLowZ: Space3<T>;
	highXLowYLowZ: Space3<T>;
	lowXHighYLowZ: Space3<T>;
	highXHighYLowZ: Space3<T>;
	lowXLowYHighZ: Space3<T>;
	highXLowYHighZ: Space3<T>;
	lowXHighYHighZ: Space3<T>;
	highXHighYHighZ: Space3<T>;
}

export class Space3<T extends SpaceItem3> {
	children: null | SpaceChildren3<T> = null;
	items: Set<T> = new Set();
	bound: Bound3;
	depthLimit: number;
	leafItemLimit: number;

	constructor(bound = new Bound3(), depthLimit = 8, leafItemLimit = 4) {
		this.bound = bound;
		this.depthLimit = depthLimit;
		if (depthLimit === 0) {
			this.leafItemLimit = Infinity;
		} else {
			this.leafItemLimit = leafItemLimit;
		}
	}

	inRadius(radius: number, ...args: Vec3Args) {
		const position = new Vec3(...args);
		const bound = new Bound3(
			position.x - radius, position.y - radius, position.z - radius,
			position.x + radius, position.y + radius, position.z + radius);
		const itemArray: T[] = [];
		this._inRadius(bound, radius ** 2, position, itemArray);
		return new Set(itemArray);
	}

	private _inRadius(bound: Bound3, radiusSq: number, position: Vec3, itemArray: T[]) {
		if (!this.bound.overlaps(bound)) return;

		if (this.children !== null) {
			this.children.lowXLowYLowZ._inRadius(bound, radiusSq, position, itemArray);
			this.children.highXLowYLowZ._inRadius(bound, radiusSq, position, itemArray);
			this.children.lowXHighYLowZ._inRadius(bound, radiusSq, position, itemArray);
			this.children.highXHighYLowZ._inRadius(bound, radiusSq, position, itemArray);
			this.children.lowXLowYHighZ._inRadius(bound, radiusSq, position, itemArray);
			this.children.highXLowYHighZ._inRadius(bound, radiusSq, position, itemArray);
			this.children.lowXHighYHighZ._inRadius(bound, radiusSq, position, itemArray);
			this.children.highXHighYHighZ._inRadius(bound, radiusSq, position, itemArray);
			return;
		}

		for (const item of this.items) {
			if (position.distSq(item.position) <= radiusSq) {
				itemArray.push(item);
			}
		}
	}

	inBounds(...args: Bound3Args): Set<T> {
		const itemArray: T[] = [];
		this._inBounds(new Bound3(...args), itemArray);
		return new Set(itemArray);
	}

	private _inBounds(bound: Bound3, itemArray: T[]) {
		if (!this.bound.overlaps(bound)) return;

		if (this.bound.fitsIn(bound)) {
			for (const item of this.items) {
				itemArray.push(item);
			}
			return;
		}

		if (this.children !== null) {
			this.children.lowXLowYLowZ._inBounds(bound, itemArray);
			this.children.highXLowYLowZ._inBounds(bound, itemArray);
			this.children.lowXHighYLowZ._inBounds(bound, itemArray);
			this.children.highXHighYLowZ._inBounds(bound, itemArray);
			this.children.lowXLowYHighZ._inBounds(bound, itemArray);
			this.children.highXLowYHighZ._inBounds(bound, itemArray);
			this.children.lowXHighYHighZ._inBounds(bound, itemArray);
			this.children.highXHighYHighZ._inBounds(bound, itemArray);
			return;
		}

		for (const item of this.items) {
			if (bound.contains(item.position)) {
				itemArray.push(item);
			}
		}
	}

	near(...args: Vec3Args): Set<T> {
		const position = vec3DataFromArgs(args);
		if (!this.bound.contains(position)) return new Set();
		return this._near(position);
	}

	private _near(position: Vec3Data): Set<T> {
		if (this.children === null) return this.items;
		return this._getChildContaining(position)._near(position);
	}

	move(item: T): boolean {
		if (!this.delete(item)) return false;
		this.items.add(item);
		this._adjustSize();
		if (this.children === null) return true;
		this._getChildContaining(item.position).add(item);
		return true;
	}

	add(item: T): boolean {
		if (this.items.has(item)) return false;
		this.items.add(item);
		this._adjustSize();
		if (this.children === null) return true;
		this._getChildContaining(item.position).add(item);
		return true;
	}

	delete(item: T): boolean {
		if (!this.items.delete(item)) return false;
		this._adjustSize();
		if (this.children === null) return true;

		const child = this._getChildContaining(item.position);
		if (!child.delete(item)) {
			this.children.lowXLowYLowZ.delete(item);
			this.children.highXLowYLowZ.delete(item);
			this.children.lowXHighYLowZ.delete(item);
			this.children.highXHighYLowZ.delete(item);
			this.children.lowXLowYHighZ.delete(item);
			this.children.highXLowYHighZ.delete(item);
			this.children.lowXHighYHighZ.delete(item);
			this.children.highXHighYHighZ.delete(item);
		}

		if (this.items.size === 0) this.children = null;
		return true;
	}

	has(item: T): boolean {
		return this.items.has(item);
	}

	private _getChildContaining(position: Vec3Data) {
		const children = this.children as SpaceChildren3<T>;
		const { x: midX, y: midY, z: midZ } = this.bound.middle;
		if (position.z < midZ) {
			if (position.y < midY) {
				if (position.x < midX) {
					return children.lowXLowYLowZ;
				} else {
					return children.highXLowYLowZ;
				}
			} else {
				if (position.x < midX) {
					return children.lowXHighYLowZ;
				} else {
					return children.highXHighYLowZ;
				}
			}
		} else {
			if (position.y < midY) {
				if (position.x < midX) {
					return children.lowXLowYHighZ;
				} else {
					return children.highXLowYHighZ;
				}
			} else {
				if (position.x < midX) {
					return children.lowXHighYHighZ;
				} else {
					return children.highXHighYHighZ;
				}
			}
		}
	}

	private _adjustSize() {
		if (this.children === null) {
			if (this.items.size >= this.leafItemLimit) {
				this._divide();
			}
		} else {
			if (this.items.size < this.leafItemLimit * 0.5) {
				this.children = null; // shrink
			}
		}
	}

	private _divide() {
		const { x: lowX, y: lowY, z: lowZ } = this.bound.low;
		const { x: midX, y: midY, y: midZ } = this.bound.middle;
		const { x: highX, y: highY, z: highZ } = this.bound.high;

		this.children = {
			lowXLowYLowZ: new Space3(new Bound3(lowX, lowY, lowZ, midX, midY, midZ), this.depthLimit - 1, this.leafItemLimit),
			highXLowYLowZ: new Space3(new Bound3(midX, lowY, lowZ, highX, midY, midZ), this.depthLimit - 1, this.leafItemLimit),
			lowXHighYLowZ: new Space3(new Bound3(lowX, midY, lowZ, midX, highY, midZ), this.depthLimit - 1, this.leafItemLimit),
			highXHighYLowZ: new Space3(new Bound3(midX, midY, lowZ, highX, highY, midZ), this.depthLimit - 1, this.leafItemLimit),
			lowXLowYHighZ: new Space3(new Bound3(lowX, lowY, midZ, midX, midY, highZ), this.depthLimit - 1, this.leafItemLimit),
			highXLowYHighZ: new Space3(new Bound3(midX, lowY, midZ, highX, midY, highZ), this.depthLimit - 1, this.leafItemLimit),
			lowXHighYHighZ: new Space3(new Bound3(lowX, midY, midZ, midX, highY, highZ), this.depthLimit - 1, this.leafItemLimit),
			highXHighYHighZ: new Space3(new Bound3(midX, midY, midZ, highX, highY, highZ), this.depthLimit - 1, this.leafItemLimit)
		}

		for (const item of this.items) {
			this._getChildContaining(item.position).add(item);
		}
	}
}