export interface Vec2Data {
	x: number;
	y: number;
}

export type Vec2Args = [number] | [Vec2Data] | [number, number];

export function vec2DataFromArgs(args: Vec2Args): Vec2Data {
	if (typeof args[0] === "number") return { x: args[0], y: args[1] ?? args[0] };
	return args[0];
}

abstract class Vec2Abstract {
	protected abstract getTarget(): Vec2;

	add(...args: Vec2Args): Vec2 {
		const addend = vec2DataFromArgs(args);
		const target = this.getTarget();
		target.x += addend.x;
		target.y += addend.y;
		return target;
	}

	sub(...args: Vec2Args): Vec2 {
		const subtrahend = vec2DataFromArgs(args);
		const target = this.getTarget();
		target.x -= subtrahend.x;
		target.y -= subtrahend.y;
		return target;
	}

	mul(...args: Vec2Args): Vec2 {
		const multiplier = vec2DataFromArgs(args);
		const target = this.getTarget();
		target.x *= multiplier.x;
		target.y *= multiplier.y;
		return target;
	}

	div(...args: Vec2Args): Vec2 {
		const divisor = vec2DataFromArgs(args);
		const target = this.getTarget();
		target.x /= divisor.x;
		target.y /= divisor.y;
		return target;
	}

	rem(...args: Vec2Args): Vec2 {
		const divisor = vec2DataFromArgs(args);
		const target = this.getTarget();
		target.x %= divisor.x;
		target.y %= divisor.y;
		return target;
	}

	mod(...args: Vec2Args): Vec2 {
		const divisor = vec2DataFromArgs(args);
		const target = this.getTarget();
		target.x = ((target.x % divisor.x) + divisor.x) % divisor.x;
		target.y = ((target.y % divisor.y) + divisor.y) % divisor.y;
		return target;
	}

	lerp(amount: number, ...args: Vec2Args): Vec2 {
		const value = vec2DataFromArgs(args);
		const target = this.getTarget();
		target.x = target.x + (value.x - target.x) * amount;
		target.y = target.y + (value.y - target.y) * amount;
		return target;
	}

	max(...args: Vec2Args): Vec2 {
		const value = vec2DataFromArgs(args);
		const target = this.getTarget();
		target.x = Math.max(target.x, value.x);
		target.y = Math.max(target.y, value.y);
		return target;
	}

	min(...args: Vec2Args): Vec2 {
		const value = vec2DataFromArgs(args);
		const target = this.getTarget();
		target.x = Math.min(target.x, value.x);
		target.y = Math.min(target.y, value.y);
		return target;
	}

	abs(): Vec2 {
		const target = this.getTarget();
		target.x = Math.abs(target.x);
		target.y = Math.abs(target.y);
		return target;
	}

	floor(): Vec2 {
		const target = this.getTarget();
		target.x = Math.floor(target.x);
		target.y = Math.floor(target.y);
		return target;
	}

	round(): Vec2 {
		const target = this.getTarget();
		target.x = Math.round(target.x);
		target.y = Math.round(target.y);
		return target;
	}

	ceil(): Vec2 {
		const target = this.getTarget();
		target.x = Math.ceil(target.x);
		target.y = Math.ceil(target.y);
		return target;
	}

	norm(magnitude = 1): Vec2 {
		const target = this.getTarget();
		const currentMagnitude = target.mag;
		if (currentMagnitude === 0) return target;
		const multiplier = magnitude / currentMagnitude;
		target.x *= multiplier;
		target.y *= multiplier;
		return target;
	}

	limit(magnitude = 1): Vec2 {
		const target = this.getTarget();
		const currentMagnitude = target.mag;
		if (currentMagnitude < magnitude) return target;
		const multiplier = magnitude / currentMagnitude;
		target.x *= multiplier;
		target.y *= multiplier;
		return target;
	}

	rotateTo(direction: number): Vec2 {
		const target = this.getTarget();
		const currentMagnitude = target.mag;
		target.x = Math.cos(direction) * currentMagnitude;
		target.y = Math.sin(direction) * currentMagnitude;
		return target;
	}

	rotate(angle: number): Vec2 {
		const target = this.getTarget();
		const cosAngle = Math.cos(angle);
		const sinAngle = Math.sin(angle);
		const x = target.x * cosAngle - target.y * sinAngle;
		target.y = target.x * sinAngle + target.y * cosAngle;
		target.x = x;
		return target;
	}

	equal(...args: Vec2Args): boolean {
		const value = vec2DataFromArgs(args);
		const target = this.getTarget();
		const wasEqual = target.x === value.x && target.y === value.y;
		target.x = value.x;
		target.y = value.y;
		return wasEqual;
	}
}

export class Vec2 extends Vec2Abstract implements Vec2Data {
	x: number;
	y: number;

	static fromDir(direction: number, magnitude = 1) {
		return new Vec2(Math.cos(direction) * magnitude, Math.sin(direction) * magnitude);
	}

	static fromRandom(magnitude?: number) {
		return Vec2.fromDir(Math.random() * Math.PI * 2, magnitude);
	}

	constructor(...args: [] | Vec2Args) {
		super();
		if (args.length === 0) {
			this.x = 0;
			this.y = 0;
			return;
		}
		const { x, y } = vec2DataFromArgs(args);
		this.x = x;
		this.y = y;
	}

	protected getTarget(): Vec2 {
		return new Vec2(this);
	}

	get set() {
		return new Vec2Mutable(this);
	}

	copy() {
		return new Vec2(this);
	}

	dist(...args: Vec2Args): number {
		const location = vec2DataFromArgs(args);
		return Math.hypot(location.x - this.x, location.y - this.y);
	}

	distSq(...args: Vec2Args): number {
		const location = vec2DataFromArgs(args);
		const xDist = location.x - this.x;
		const yDist = location.y - this.y;
		return xDist * xDist + yDist * yDist;
	}
	
	distTaxi(...args: Vec2Args): number {
		const location = vec2DataFromArgs(args);
		return Math.abs(location.x - this.x) + Math.abs(location.y - this.y);
	}

	dot(...args: Vec2Args): number {
		const multiplier = vec2DataFromArgs(args);
		return this.x * multiplier.x + this.y * multiplier.y;
	}

	cross(...args: Vec2Args): number {
		const multiplier = vec2DataFromArgs(args);
		return this.x * multiplier.y - this.y * multiplier.x;
	}

	toString() {
		return `Vec2(${this.x},${this.y})`;
	}

	get mag(): number {
		return Math.hypot(this.x, this.y);
	}

	set mag(magnitude: number) {
		this.set.norm(magnitude);
	}

	get magSq(): number {
		return this.x * this.x + this.y * this.y;
	}

	get dir(): number {
		return Math.atan2(this.y, this.x);
	}

	set dir(direction: number) {
		this.set.rotateTo(direction);
	}

	get area(): number {
		return this.x * this.y;
	}

	get array(): [number, number] {
		return [this.x, this.y];
	}

	set array([x, y]: [number, number]) {
		this.x = x;
		this.y = y;
	}

	get xy(): Vec2 {
		return new Vec2(this.x, this.y);
	}

	set xy(vector: Vec2) {
		this.x = vector.x;
		this.y = vector.y;
	}

	get yx(): Vec2 {
		return new Vec2(this.y, this.x);
	}

	set yz(vector: Vec2) {
		this.y = vector.x;
		this.x = vector.y;
	}
}

class Vec2Mutable extends Vec2Abstract {
	target: Vec2;

	constructor(target: Vec2) {
		super();
		this.target = target;
	}

	protected getTarget(): Vec2 {
		return this.target;
	}
}