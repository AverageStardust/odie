import { Vec3 } from "./vector3";

interface Verlet3Options {}

interface PointOptions {
	position: Vec3;
	mass?: number;
}

interface LinkOptions {
	pointA: Point;
	pointB: Point;
	idealLength?: number;
	springStrength?: number;
	breakingThreshold?: number;
}

export class Verlet3 {
	points: Set<Point> = new Set();
	links: Set<Link> = new Set();

	constructor(options: Verlet3Options) {}

	step() {
		for (const point of this.points) point._stepPosition();
		for (const link of this.links) link._updateForce();
		for (const point of this.points) point._applyForce();
	}

	addPoint(options: PointOptions) {
		return new Point(this, options);
	}

	addLink(options: LinkOptions) {
		return new Link(this, options);
	}
}

class Point {
	verlet: Verlet3;
	links: Set<Link> = new Set();

	position: Vec3;
	lastPosition: Vec3;
	force: Vec3 = Vec3.Zero;
	mass: number;

	constructor(verlet: Verlet3, options: PointOptions) {
		this.verlet = verlet;
		this.position = new Vec3(options.position);
		this.lastPosition = new Vec3(options.position);
		this.mass = options.mass ?? 1;

		this.verlet.points.add(this);
	}

	get velocity(): Vec3 {
		return this.position.sub(this.lastPosition);
	}

	set velocity(velocity: Vec3) {
		this.lastPosition = this.position.sub(velocity);
	}

	delete() {
		this.verlet.points.delete(this);
		for (const link of this.links) link.delete();
	}

	translate(displacement: Vec3) {
		this.position = this.position.add(displacement);
		this.lastPosition = this.lastPosition.add(displacement);
	}

	_stepPosition() {
		const velocity = this.velocity;
		this.lastPosition = this.position;
		this.position = this.lastPosition.add(velocity);
	}

	_applyForce() {
		this.position = this.position.add(this.force.div(this.mass));
		this.force = Vec3.Zero;
	}
}

class Link {
	verlet: Verlet3;
	pointA: Point;
	pointB: Point;

	idealLength: number;
	springStrength: number;
	breakingThreshold: number;

	constructor(verlet: Verlet3, options: LinkOptions) {
		this.verlet = verlet;
		this.pointA = options.pointA;
		this.pointB = options.pointB;

		this.idealLength = options.idealLength ?? this.pointA.lastPosition.dist(this.pointB.lastPosition);
		this.springStrength = options.springStrength ?? 0.25;
		this.breakingThreshold = options.breakingThreshold ?? 1;

		this.verlet.links.add(this);
		this.pointA.links.add(this);
		this.pointB.links.add(this);
	}

	get trueLength(): number {
		return this.pointA.position.dist(this.pointB.position);
	}

	delete() {
		this.verlet.links.delete(this);
		this.pointA.links.delete(this);
		this.pointB.links.delete(this);
	}

	_updateForce() {
		const deformation = this.trueLength - this.idealLength;
		const forceScalar = deformation * this.springStrength;

		if (forceScalar > this.breakingThreshold) {
			this.delete();
			return;
		}

		const force = this.pointB.position.sub(this.pointA.position).norm(forceScalar);
		this.pointA.force = this.pointA.force.add(force);
		this.pointB.force = this.pointB.force.sub(force);
	}
}