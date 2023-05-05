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

export class Bound2 implements Bound2Data {
	low: Vec2;
	high: Vec2;

	constructor(...args: [] | Bound2Args) {
		if (args.length === 0) {
			this.low = new Vec2(0, 0);
			this.high = new Vec2(1, 1);
		} else {
			const { low, high } = bound2DataFromArgs(args);
			this.low = new Vec2(low);
			this.high = new Vec2(high);
		}
	}

	minBound(...args: Bound2Args): null | Bound2 {
		const target = new Bound2(this);
		const value = bound2DataFromArgs(args);
		if (target.low.x >= value.high.x || target.high.x <= value.low.x) return null;
		if (target.low.y >= value.high.y || target.high.y <= value.low.y) return null;
		target.low.x = Math.max(target.low.x, value.low.x),
		target.low.y = Math.max(target.low.y, value.low.y),
		target.high.x = Math.min(target.high.x, value.high.x),
		target.high.y = Math.min(target.high.y, value.high.y);
		return target;
	}


	hasVec(...args: Vec2Args): boolean {
		const position = vec2DataFromArgs(args);
		return (
			position.x >= this.low.x && position.x <= this.high.x &&
			position.y >= this.low.y && position.y <= this.high.y);
	}

	hasBound(...args: Bound2Args): boolean {
		const bound = bound2DataFromArgs(args);
		if (bound.low.x > this.low.x || bound.high.x < this.high.x) return false;
		if (bound.low.y > this.low.y || bound.high.y < this.high.y) return false;
		return true;
	}

	hasPartialBound(...args: Bound2Args): boolean {
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