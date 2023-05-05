import { Vec3, Vec3Args, Vec3Data, vec3DataFromArgs } from "./vector3";

export interface Bound3Data {
	low: Vec3Data;
	high: Vec3Data;
}

export type Bound3Args = [Bound3Data] | [Vec3Data] | [number] | [Vec3Data, Vec3Data] | [number, number, number] | [number, number, number, number, number, number];

export function bound3DataFromArgs(args: Bound3Args): Bound3Data {
	if (args.length === 1) {
		if (typeof args[0] !== "number") {
			if ("low" in args[0]) {
				return args[0];
			} else {
				return {
					low: { x: 0, y: 0, z: 0 },
					high: args[0]
				};
			}
		} else {
			return {
				low: { x: 0, y: 0, z: 0 },
				high: { x: args[0], y: args[0], z: args[0] }
			};
		}
	} else if (args.length === 2) {
		return {
			low: args[0],
			high: args[1]
		};
	} else if (args.length === 3) {
		return {
			low: { x: 0, y: 0, z: 0 },
			high: { x: args[0], y: args[1], z: args[2] }
		};
	} else {
		return {
			low: { x: args[0], y: args[1], z: args[2] },
			high: { x: args[3], y: args[4], z: args[5] }
		};
	}
}

export class Bound3 implements Bound3Data {
	low: Vec3;
	high: Vec3;

	constructor(...args: [] | Bound3Args) {
		if (args.length === 0) {
			this.low = new Vec3(0, 0, 0);
			this.high = new Vec3(1, 1, 1);
		} else {
			const { low, high } = bound3DataFromArgs(args);
			this.low = new Vec3(low);
			this.high = new Vec3(high);
		}
	}

	minBound(...args: Bound3Args): null | Bound3 {
		const target = new Bound3(this);
		const value = bound3DataFromArgs(args);
		if (target.low.x >= value.high.x || target.high.x <= value.low.x) return null;
		if (target.low.y >= value.high.y || target.high.y <= value.low.y) return null;
		if (target.low.z >= value.high.z || target.high.z <= value.low.z) return null;

		target.low.x = Math.max(target.low.x, value.low.x);
		target.low.y = Math.max(target.low.y, value.low.y);
		target.low.z = Math.max(target.low.z, value.low.z);
		target.high.x = Math.min(target.high.x, value.high.x);
		target.high.y = Math.min(target.high.y, value.high.y);
		target.high.z = Math.min(target.high.z, value.high.z);
		return target;
	}

	hasVec(...args: Vec3Args): boolean {
		const position = vec3DataFromArgs(args);
		return (
			position.x >= this.low.x && position.x <= this.high.x &&
			position.y >= this.low.y && position.y <= this.high.y &&
			position.z >= this.low.z && position.z <= this.high.z);
	}

	hasBound(...args: Bound3Args): boolean {
		const bound = bound3DataFromArgs(args);
		if (bound.low.x > this.low.x || bound.high.x < this.high.x) return false;
		if (bound.low.y > this.low.y || bound.high.y < this.high.y) return false;
		if (bound.low.z > this.low.z || bound.high.z < this.high.z) return false;
		return true;
	}

	hasPartialBound(...args: Bound3Args): boolean {
		const value = bound3DataFromArgs(args);
		if (this.low.x >= value.high.x || this.high.x <= value.low.x) return false;
		if (this.low.y >= value.high.y || this.high.y <= value.low.y) return false;
		if (this.low.z >= value.high.z || this.high.z <= value.low.z) return false;
		return true;
	}

	toString() {
		return `Bound3(${this.low.x},${this.low.y},${this.low.z},${this.high.x},${this.high.y},${this.high.z})`;
	}

	get middle() {
		return new Vec3(
			(this.low.x + this.high.x) / 2,
			(this.low.y + this.high.y) / 2,
			(this.low.z + this.high.z) / 2);
	}

	get volume() {
		return (this.high.x - this.low.x) * (this.high.y - this.low.y) * (this.high.z - this.low.z);
	}
}