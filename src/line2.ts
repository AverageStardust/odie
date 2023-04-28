import { Vec2, Vec2Data } from "./vector2";

export interface Line2Data {
	start: Vec2Data;
	end: Vec2Data;
};

export type Line2Args = [Line2Data] | [Vec2Data] | [Vec2Data, Vec2Data] | [number, number] | [number, number, number, number];

export function line2DataFromArgs(args: Line2Args): Line2Data {
	if (args.length === 1) {
		if ("start" in args[0]) {
			return args[0];
		} else {
			return {
				start: { x: 0, y: 0 },
				end: args[0]
			};
		}
	} else if (args.length === 2) {
		if (typeof args[0] !== "number") {
			return {
				start: args[0],
				end: args[1] as Vec2Data
			};
		} else {
			return {
				start: { x: 0, y: 0 },
				end: { x: args[0], y: args[1] as number }
			};
		}
	} else {
		return {
			start: { x: args[0], y: args[1] },
			end: { x: args[2], y: args[3] }
		};
	}
}

abstract class Line2Abstract {
	protected abstract getTarget(): Line2;

	equal(...args: Line2Args): boolean {
		const value = line2DataFromArgs(args);
		const target = this.getTarget();
		const wasEqual =
			target.start.x === value.start.x && target.start.y === value.start.y &&
			target.end.x === value.end.x && target.end.y === value.end.y;
		target.start.x = value.start.x;
		target.start.y = value.start.y;
		target.end.x = value.end.x;
		target.end.y = value.end.y;
		return wasEqual;
	}
}

export class Line2 extends Line2Abstract implements Line2Data {
	start: Vec2;
	end: Vec2;

	constructor(...args: [] | Line2Args) {
		super();
		if (args.length === 0) {
			this.start = new Vec2(0, 0);
			this.end = new Vec2(1, 0);
		} else {
			const { start, end } = line2DataFromArgs(args);
			this.start = new Vec2(start);
			this.end = new Vec2(end);
		}
	}

	protected getTarget(): Line2 {
		return new Line2(this);
	}

	get set() {
		return new Line2Mutable(this);
	}

	get length(): number {
		return Math.hypot(this.start.x - this.end.x, this.start.y - this.end.y);
	}

	get lengthSq(): number {
		const distX = this.start.x - this.end.x;
		const distY = this.start.y - this.end.y;
		return distX * distX + distY * distY;
	}
	
	get taxiLength(): number {
		return Math.abs(this.start.x - this.end.x) + Math.abs(this.start.y - this.end.y);
	}

	copy() {
		return new Line2(this);
	}

	toString() {
		return `Line2(${this.start.x},${this.start.y},${this.end.x},${this.end.y})`;
	}
}

class Line2Mutable extends Line2Abstract {
	target: Line2;

	constructor(target: Line2) {
		super();
		this.target = target;
	}

	protected getTarget(): Line2 {
		return this.target;
	}
}