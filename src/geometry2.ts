import { Vec2, Vec2Data } from "./vector2";

// line p0 p1
// line p2 p3
export function lineLineIntersection(p0: Vec2Data, p1: Vec2Data, p2: Vec2Data, p3: Vec2Data) {
	const a = ((p3.x - p2.x) * (p0.y - p2.y) - (p3.y - p2.y) * (p0.x - p2.x))
		/ ((p3.y - p2.y) * (p1.x - p0.x) - (p3.x - p2.x) * (p1.y - p0.y));
	const b = ((p1.x - p0.x) * (p0.y - p2.y) - (p1.y - p0.y) * (p0.x - p2.x))
		/ ((p3.y - p2.y) * (p1.x - p0.x) - (p3.x - p2.x) * (p1.y - p0.y));

	if (a >= 0 && a <= 1 && b >= 0 && b <= 1) {
		return new Vec2(
			p0.x + (a * (p1.x - p0.x)),
			p0.y + (a * (p1.y - p0.y)));
	}

	return null;
}

// point p0
// line p1 p2
export function pointLocationAlongLine(p0: Vec2Data, p1: Vec2Data, p2: Vec2Data) {
	const atob = { x: p2.x - p1.x, y: p2.y - p1.y };
	const atop = { x: p0.x - p1.x, y: p0.y - p1.y };
	const len = (atob.x * atob.x) + (atob.y * atob.y);
	let dot = (atop.x * atob.x) + (atop.y * atob.y);
	return dot / len;
}