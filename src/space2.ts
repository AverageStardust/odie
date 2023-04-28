import { Bound2, Bound2Args } from "./bound2";
import { Vec2, Vec2Args, Vec2Data, vec2DataFromArgs } from "./vector2";

export interface SpaceItem2 {
	position: Vec2Data;
}

interface SpaceChildren2<T extends SpaceItem2> {
	lowXLowY: Space2<T>;
	highXLowY: Space2<T>;
	lowXHighY: Space2<T>;
	highXHighY: Space2<T>;
}

export class Space2<T extends SpaceItem2> {
	children: null | SpaceChildren2<T> = null;
	items: Set<T> = new Set();
	bound: Bound2;
	depthLimit: number;
	leafItemLimit: number;

	constructor(bound = new Bound2(), depthLimit = 8, leafItemLimit = 4) {
		this.bound = bound;
		this.depthLimit = depthLimit;
		if (depthLimit === 0) {
			this.leafItemLimit = Infinity;
		} else {
			this.leafItemLimit = leafItemLimit;
		}
	}

	inRadius(radius: number, ...args: Vec2Args) {
		const position = new Vec2(...args);
		const bound = new Bound2(
			position.x - radius, position.y - radius,
			position.x + radius, position.y + radius);
		const itemArray: T[] = [];
		this._inRadius(bound, radius ** 2, position, itemArray);
		return new Set(itemArray);
	}

	private _inRadius(bound: Bound2, radiusSq: number, position: Vec2, itemArray: T[]) {
		if (!this.bound.overlaps(bound)) return;

		if (this.children !== null) {
			this.children.lowXLowY._inRadius(bound, radiusSq, position, itemArray);
			this.children.highXLowY._inRadius(bound, radiusSq, position, itemArray);
			this.children.lowXHighY._inRadius(bound, radiusSq, position, itemArray);
			this.children.highXHighY._inRadius(bound, radiusSq, position, itemArray);
			return;
		}

		for (const item of this.items) {
			if (position.distSq(item.position) <= radiusSq) {
				itemArray.push(item);
			}
		}
	}

	inBounds(...args: Bound2Args): Set<T> {
		const itemArray: T[] = [];
		this._inBounds(new Bound2(...args), itemArray);
		return new Set(itemArray);
	}

	private _inBounds(bound: Bound2, itemArray: T[]) {
		if (!this.bound.overlaps(bound)) return;

		if (this.bound.fitsIn(bound)) {
			for (const item of this.items) {
				itemArray.push(item);
			}
			return;
		}

		if (this.children !== null) {
			this.children.lowXLowY._inBounds(bound, itemArray);
			this.children.highXLowY._inBounds(bound, itemArray);
			this.children.lowXHighY._inBounds(bound, itemArray);
			this.children.highXHighY._inBounds(bound, itemArray);
			return;
		}

		for (const item of this.items) {
			if (bound.contains(item.position)) {
				itemArray.push(item);
			}
		}
	}

	inCell(...args: Vec2Args): Set<T> {
		const position = vec2DataFromArgs(args);
		if (!this.bound.contains(position)) return new Set();
		return this._inCell(position);
	}

	private _inCell(position: Vec2Data): Set<T> {
		if (this.children === null) return this.items;
		return this._getChildContaining(position)._inCell(position);
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
			this.children.lowXLowY.delete(item);
			this.children.lowXHighY.delete(item);
			this.children.highXLowY.delete(item);
			this.children.highXHighY.delete(item);
		}

		if (this.items.size === 0) this.children = null;
		return true;
	}

	has(item: T): boolean {
		return this.items.has(item);
	}

	private _getChildContaining(position: Vec2Data) {
		const children = this.children as SpaceChildren2<T>;
		const { x: midX, y: midY } = this.bound.middle;
		if (position.y < midY) {
			if (position.x < midX) {
				return children.lowXLowY;
			} else {
				return children.highXLowY;
			}
		} else {
			if (position.x < midX) {
				return children.lowXHighY;
			} else {
				return children.highXHighY;
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
		const { x: lowX, y: lowY } = this.bound.low;
		const { x: midX, y: midY } = this.bound.middle;
		const { x: highX, y: highY } = this.bound.high;

		this.children = {
			lowXLowY: new Space2(new Bound2(lowX, lowY, midX, midY), this.depthLimit - 1, this.leafItemLimit),
			highXLowY: new Space2(new Bound2(midX, lowY, highX, midY), this.depthLimit - 1, this.leafItemLimit),
			lowXHighY: new Space2(new Bound2(lowX, midY, midX, highY), this.depthLimit - 1, this.leafItemLimit),
			highXHighY: new Space2(new Bound2(midX, midY, highX, highY), this.depthLimit - 1, this.leafItemLimit)
		}

		for (const item of this.items) {
			this._getChildContaining(item.position).add(item);
		}
	}
}