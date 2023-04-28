import { Vec2 } from "./vector2";

export interface Vec3Data {
	x: number;
	y: number;
	z: number;
}

export type Vec3Args = [number] | [Vec3Data] | [number, number, number];

export function vec3DataFromArgs(args: Vec3Args): Vec3Data {
	if (typeof args[0] === "number") {
		return { x: args[0], y: args[1] ?? args[0], z: args[2] ?? args[0] };
	}
	return args[0];
}

abstract class Vec3Abstract {
	protected abstract getTarget(): Vec3;

	add(...args: Vec3Args): Vec3 {
		const addend = vec3DataFromArgs(args);
		const target = this.getTarget();
		target.x += addend.x;
		target.y += addend.y;
		target.z += addend.z;
		return target;
	}

	sub(...args: Vec3Args): Vec3 {
		const subtrahend = vec3DataFromArgs(args);
		const target = this.getTarget();
		target.x -= subtrahend.x;
		target.y -= subtrahend.y;
		target.z -= subtrahend.z;
		return target;
	}

	mul(...args: Vec3Args): Vec3 {
		const multiplier = vec3DataFromArgs(args);
		const target = this.getTarget();
		target.x *= multiplier.x;
		target.y *= multiplier.y;
		target.z *= multiplier.z;
		return target;
	}

	div(...args: Vec3Args): Vec3 {
		const divisor = vec3DataFromArgs(args);
		const target = this.getTarget();
		target.x /= divisor.x;
		target.y /= divisor.y;
		target.z /= divisor.z;
		return target;
	}

	rem(...args: Vec3Args): Vec3 {
		const divisor = vec3DataFromArgs(args);
		const target = this.getTarget();
		target.x %= divisor.x;
		target.y %= divisor.y;
		target.z %= divisor.z;
		return target;
	}

	mod(...args: Vec3Args): Vec3 {
		const divisor = vec3DataFromArgs(args);
		const target = this.getTarget();
		target.x = ((target.x % divisor.x) + divisor.x) % divisor.x;
		target.y = ((target.y % divisor.y) + divisor.y) % divisor.y;
		target.z = ((target.z % divisor.z) + divisor.z) % divisor.z;
		return target;
	}

	cross(...args: Vec3Args): Vec3 {
		const target = this.getTarget();
		const multiplier = vec3DataFromArgs(args);
		const newX = target.y * multiplier.z - target.z * multiplier.y;
		const newY = target.z * multiplier.x - target.x * multiplier.z;
		target.z = target.x * multiplier.y - target.y * multiplier.x;
		target.x = newX;
		target.y = newY;
		return target;
	}

	lerp(amount: number, ...args: Vec3Args): Vec3 {
		const value = vec3DataFromArgs(args);
		const target = this.getTarget();
		target.x = target.x + (value.x - target.x) * amount;
		target.y = target.y + (value.y - target.y) * amount;
		target.z = target.z + (value.z - target.z) * amount;
		return target;
	}

	max(...args: Vec3Args): Vec3 {
		const value = vec3DataFromArgs(args);
		const target = this.getTarget();
		target.x = Math.max(target.x, value.x);
		target.y = Math.max(target.y, value.y);
		target.z = Math.max(target.z, value.z);
		return target;
	}

	min(...args: Vec3Args): Vec3 {
		const value = vec3DataFromArgs(args);
		const target = this.getTarget();
		target.x = Math.min(target.x, value.x);
		target.y = Math.min(target.y, value.y);
		target.z = Math.min(target.z, value.z);
		return target;
	}

	abs(): Vec3 {
		const target = this.getTarget();
		target.x = Math.abs(target.x);
		target.y = Math.abs(target.y);
		target.z = Math.abs(target.z);
		return target;
	}

	floor(): Vec3 {
		const target = this.getTarget();
		target.x = Math.floor(target.x);
		target.y = Math.floor(target.y);
		target.z = Math.floor(target.z);
		return target;
	}

	round(): Vec3 {
		const target = this.getTarget();
		target.x = Math.round(target.x);
		target.y = Math.round(target.y);
		target.z = Math.round(target.z);
		return target;
	}

	ceil(): Vec3 {
		const target = this.getTarget();
		target.x = Math.ceil(target.x);
		target.y = Math.ceil(target.y);
		target.z = Math.ceil(target.z);
		return target;
	}

	norm(magnitude = 1): Vec3 {
		const target = this.getTarget();
		const currentMagnitude = target.mag;
		if (currentMagnitude === 0) return target;
		const multiplier = magnitude / currentMagnitude;
		target.x *= multiplier;
		target.y *= multiplier;
		target.z *= multiplier;
		return target;
	}

	limit(magnitude = 1): Vec3 {
		const target = this.getTarget();
		const currentMagnitude = target.mag;
		if (currentMagnitude < magnitude) return target;
		const multiplier = magnitude / currentMagnitude;
		target.x *= multiplier;
		target.y *= multiplier;
		target.z *= multiplier;
		return target;
	}

	equal(...args: Vec3Args): boolean {
		const value = vec3DataFromArgs(args);
		const target = this.getTarget();
		const wasEqual = (
			target.x === value.x &&
			target.y === value.y &&
			target.z === value.z);
		target.x = value.x;
		target.y = value.y;
		target.z = value.z;
		return wasEqual;
	}
}

export class Vec3 extends Vec3Abstract implements Vec3Data {
	x: number;
	y: number;
	z: number;

	static fromDir(theta: number, phi: number, magnitude = 1) {
		const z = Math.cos(theta) * magnitude;
		const xyRadius = Math.sin(theta) * magnitude;
		const x = Math.cos(phi) * xyRadius;
		const y = Math.sin(phi) * xyRadius;
		return new Vec3(x, y, z);
	}

	static fromRandom(magnitude?: number) {
		return Vec3.fromDir(Math.acos(Math.random() * 2 - 1), Math.random() * Math.PI * 2, magnitude);
	}

	constructor(...args: [] | Vec3Args) {
		super();
		if (args.length === 0) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
			return;
		}
		const { x, y, z } = vec3DataFromArgs(args);
		this.x = x;
		this.y = y;
		this.z = z;
	}

	protected getTarget(): Vec3 {
		return new Vec3(this);
	}

	get set() {
		return new Vec3Mutable(this);
	}

	copy() {
		return new Vec3(this);
	}

	dist(...args: Vec3Args): number {
		const location = vec3DataFromArgs(args);
		return Math.hypot(location.x - this.x, location.y - this.y, location.z - this.z);
	}

	distSq(...args: Vec3Args): number {
		const location = vec3DataFromArgs(args);
		const xDist = location.x - this.x;
		const yDist = location.y - this.y;
		const zDist = location.z - this.z;
		return xDist ** 2 + yDist ** 2 + zDist ** 2;
	}

	distTaxi(...args: Vec3Args): number {
		const location = vec3DataFromArgs(args);
		return Math.abs(location.x - this.x) + Math.abs(location.y - this.y) + Math.abs(location.z - this.z);
	}

	dot(...args: Vec3Args): number {
		const multiplier = vec3DataFromArgs(args);
		return this.x * multiplier.x + this.y * multiplier.y + this.z * multiplier.z;
	}

	toString() {
		return `Vec3(${this.x},${this.y},${this.z})`;
	}

	get mag(): number {
		return Math.hypot(this.x, this.y, this.z);
	}

	set mag(magnitude: number) {
		this.set.norm(magnitude);
	}

	get magSq(): number {
		return this.x ** 2 + this.y ** 2 + this.z ** 2;
	}

	get volume(): number {
		return this.x * this.y * this.z;
	}

	get array(): [number, number, number] {
		return [this.x, this.y, this.z];
	}

	set array([x, y, z]: [number, number, number]) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	get xyz(): Vec3 {
		return new Vec3(this.x, this.y, this.z);
	}

	set xyz(vector: Vec3) {
		this.x = vector.x;
		this.y = vector.y;
		this.z = vector.z;
	}

	get xzy(): Vec3 {
		return new Vec3(this.x, this.z, this.y);
	}

	set xzy(vector: Vec3) {
		this.x = vector.x;
		this.z = vector.y;
		this.y = vector.z;
	}

	get yxz(): Vec3 {
		return new Vec3(this.y, this.x, this.z);
	}

	set yxz(vector: Vec3) {
		this.y = vector.x;
		this.x = vector.y;
		this.z = vector.z;
	}

	get yzx(): Vec3 {
		return new Vec3(this.y, this.z, this.x);
	}

	set yzx(vector: Vec3) {
		this.y = vector.x;
		this.z = vector.y;
		this.x = vector.z;
	}

	get zxy(): Vec3 {
		return new Vec3(this.z, this.x, this.y);
	}

	set zxy(vector: Vec3) {
		this.z = vector.x;
		this.x = vector.y;
		this.y = vector.z;
	}

	get zyx(): Vec3 {
		return new Vec3(this.z, this.y, this.x);
	}

	set zyx(vector: Vec3) {
		this.z = vector.x;
		this.y = vector.y;
		this.x = vector.z;
	}

	get xy(): Vec2 {
		return new Vec2(this.x, this.y);
	}

	set xy(vector: Vec2) {
		this.x = vector.x;
		this.y = vector.y;
	}

	get xz(): Vec2 {
		return new Vec2(this.x, this.z);
	}

	set xz(vector: Vec2) {
		this.x = vector.x;
		this.z = vector.y;
	}

	get yx(): Vec2 {
		return new Vec2(this.y, this.x);
	}

	set yx(vector: Vec2) {
		this.y = vector.x;
		this.x = vector.y;
	}

	get yz(): Vec2 {
		return new Vec2(this.y, this.z);
	}

	set yz(vector: Vec2) {
		this.y = vector.x;
		this.z = vector.y;
	}

	get zx(): Vec2 {
		return new Vec2(this.z, this.x);
	}

	set zx(vector: Vec2) {
		this.z = vector.x;
		this.x = vector.y;
	}

	get zy(): Vec2 {
		return new Vec2(this.z, this.y);
	}

	set zy(vector: Vec2) {
		this.z = vector.x;
		this.y = vector.y;
	}
}

class Vec3Mutable extends Vec3Abstract {
	target: Vec3;

	constructor(target: Vec3) {
		super();
		this.target = target;
	}

	protected getTarget(): Vec3 {
		return this.target;
	}
}