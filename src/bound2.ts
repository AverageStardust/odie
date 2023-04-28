import { Vec2, Vec2Args, Vec2Data, vec2DataFromArgs } from "./vector2";

export interface Bound2Data {
	low: Vec2Data;
	high: Vec2Data;
}

export type Bound2Args = [Bound2Data] | [Vec2Data] | [number] | [Vec2Data, Vec2Data] | [number, number] | [number, number, number, number];

export function bound2DataFromArgs(args: Bound2Args): Bound2Data {
	if (args.length === 1) {
		if (typeof args[0] !== "number") {
			if ("low" in args[0]) {
				return args[0];
			} else {
				return {
					low: { x: 0, y: 0 },
					high: args[0]
				};
			}
		} else {
			return {
				low: { x: 0, y: 0 },
				high: { x: args[0], y: args[0] }
			};
		}
	} else if (args.length === 2) {
		if (typeof args[0] !== "number") {
			return {
				low: args[0],
				high: args[1] as Vec2Data
			};
		} else {
			return {
				low: { x: 0, y: 0 },
				high: { x: args[0], y: args[1] as number }
			};
		}
	} else {
		return {
			low: { x: args[0], y: args[1] },
			high: { x: args[2], y: args[3] }
		};
	}
}

abstract class Bound2Abstract {
	protected abstract getTarget(): Bound2;
}

export class Bound2 extends Bound2Abstract implements Bound2Data {
	low: Vec2;
	high: Vec2;

	constructor(...args: [] | Bound2Args) {
		super();
		if (args.length === 0) {
			this.low = new Vec2(0, 0);
			this.high = new Vec2(1, 1);
		} else {
			const { low, high } = bound2DataFromArgs(args);
			this.low = new Vec2(low);
			this.high = new Vec2(high);
		}
	}

	protected getTarget(): Bound2 {
		return new Bound2(this);
	}

	get set() {
		return new Bound2Mutable(this);
	}

	copy() {
		return new Bound2(this);
	}

	equal(...args: Bound2Args): boolean {
		const value = bound2DataFromArgs(args);
		const target = this.getTarget();
		const wasEqual =
			target.low.x === value.low.x && target.low.y === value.low.y &&
			target.high.x === value.high.x && target.high.y === value.high.y;
		target.low.x = value.low.x;
		target.low.y = value.low.y;
		target.high.x = value.high.x;
		target.high.y = value.high.y;
		return wasEqual;
	}

	contains(...args: Vec2Args): boolean {
		const position = vec2DataFromArgs(args);
		return (
			position.x >= this.low.x && position.x <= this.high.x &&
			position.y >= this.low.y && position.y <= this.high.y);
	}

	fitsIn(...args: Bound2Args): boolean {
		const bound = bound2DataFromArgs(args);
		if (bound.low.x > this.low.x || bound.high.x < this.high.x) return false;
		if (bound.low.y > this.low.y || bound.high.y < this.high.y) return false;
		return true;
	}

	overlap(...args: Bound2Args): null | Bound2 {
		const value = bound2DataFromArgs(args);
		if (this.low.x >= value.high.x || this.high.x <= value.low.x) return null;
		if (this.low.y >= value.high.y || this.high.y <= value.low.y) return null;
		return new Bound2(
			Math.max(this.low.x, value.low.x),
			Math.max(this.low.y, value.low.y),
			Math.min(this.high.x, value.high.x),
			Math.min(this.high.y, value.high.y)
		);
	}

	overlaps(...args: Bound2Args): boolean {
		const value = bound2DataFromArgs(args);
		if (this.low.x >= value.high.x || this.high.x <= value.low.x) return false;
		if (this.low.y >= value.high.y || this.high.y <= value.low.y) return false;
		return true
	}

	toString() {
		return `Bound2(${this.low.x},${this.low.y},${this.high.x},${this.high.y})`;
	}

	get middle() {
		return new Vec2(
			(this.low.x + this.high.x) / 2,
			(this.low.y + this.high.y) / 2);
	}

	get area() {
		return (this.high.x - this.low.x) * (this.high.y - this.low.y);
	}
}

class Bound2Mutable extends Bound2Abstract {
	target: Bound2;

	constructor(target: Bound2) {
		super();
		this.target = target;
	}

	protected getTarget(): Bound2 {
		return this.target;
	}
}