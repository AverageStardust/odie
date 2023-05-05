import { Bound2 } from "./bound2";
import { Vec2, Vec2Data } from "./vector2";

interface VerletOptions {}

interface PointOptions {
	position: Vec2;
	mass?: number;
}

interface LinkOptions {
	pointA: Point;
	pointB: Point;
	idealLength?: number;
	stiffness?: number;
	breakingForce?: number;
}

interface LinkPoint {
	position: Vec2Data,
	link: Link
}

export class Verlet {
	points: Set<Point> = new Set();
	links: Set<Link> = new Set();

	constructor(options: VerletOptions) {}

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
	verlet: Verlet;
	links: Set<Link> = new Set();

	position: Vec2;
	lastPosition: Vec2;
	force: Vec2 = Vec2.Zero;
	mass: number;

	constructor(verlet: Verlet, options: PointOptions) {
		this.verlet = verlet;
		this.position = new Vec2(options.position);
		this.lastPosition = new Vec2(options.position);
		this.mass = options.mass ?? 1;

		this.verlet.points.add(this);
	}

	get velocity(): Vec2 {
		return this.position.sub(this.lastPosition);
	}

	set velocity(velocity: Vec2) {
		this.lastPosition = this.position.sub(velocity);
	}

	delete() {
		this.verlet.points.delete(this);
		for (const link of this.links) link.delete();
	}

	translate(displacement: Vec2) {
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
		this.force = Vec2.Zero;
	}
}

class Link {
	verlet: Verlet;
	points: LinkPoint[] = [];
	pointA: Point;
	pointB: Point;

	idealLength: number;
	stiffness: number;
	breakingForce: number;

	constructor(verlet: Verlet, options: LinkOptions) {
		this.verlet = verlet;
		this.pointA = options.pointA;
		this.pointB = options.pointB;

		this.idealLength = options.idealLength ?? this.pointA.lastPosition.dist(this.pointB.lastPosition);
		this.stiffness = options.stiffness ?? 1;
		this.breakingForce = options.breakingForce ?? 1;

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
		const deformation = (this.trueLength - this.idealLength) / this.idealLength * this.stiffness;
		const forceScalar = deformation * 0.2 + deformation * Math.abs(deformation);

		if (forceScalar > this.breakingForce) {
			this.delete();
			return;
		}

		const force = this.pointB.position.sub(this.pointA.position).norm(forceScalar);
		this.pointA.force = this.pointA.force.add(force);
		this.pointB.force = this.pointB.force.sub(force);
	}
}