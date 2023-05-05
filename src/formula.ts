export interface FormulaData {
	terms: number[];
}

export type FormulaArgs = number[] | [number[]] | [{ terms: number[] }];

export function formulaDataFromArgs(args: FormulaArgs): FormulaData {
	let terms: number[];
	if (typeof args[0] === "number") {
		terms = args as number[];
	} else if ("terms" in args[0]) {
		terms = args[0].terms;
	} else {
		terms = args[0];
	}
	return { terms };
}

export class Formula implements FormulaData {
	terms: number[];

	add(...args: FormulaArgs) {
		const addend = formulaDataFromArgs(args);
		const target = new Formula(this);
		for (let i = 0; i < addend.terms.length; i++) {
			if (i < target.terms.length) {
				target.terms[i] += addend.terms[i];
			} else {
				target.terms[i] = addend.terms[i];
			}
		}
		return target.simplify();
	}

	sub(...args: FormulaArgs) {
		const subtrahend = formulaDataFromArgs(args);
		const target = new Formula(this);
		for (let i = 0; i < subtrahend.terms.length; i++) {
			if (i < target.terms.length) {
				target.terms[i] -= subtrahend.terms[i];
			} else {
				target.terms[i] = -subtrahend.terms[i];
			}
		}
		return target.simplify();
	}

	mul(...args: FormulaArgs) {
		const multiplier = formulaDataFromArgs(args);
		const target = new Formula(this);
		const productTerms = Array(
			Math.max(0, target.terms.length + multiplier.terms.length - 1)).fill(0);

		for (let i = 0; i < multiplier.terms.length; i++) {
			for (let j = 0; j < target.terms.length; j++) {
				productTerms[i + j] += multiplier.terms[i] * target.terms[j];
			}
		}

		target.terms = productTerms;
		return target.simplify();
	}

	divWithRem(...args: FormulaArgs): { quotient: Formula, remainder: Formula } {
		const divisor = formulaDataFromArgs(args);
		const target = new Formula(this);
		const quotientTerms = Array(
			Math.max(0, target.terms.length - divisor.terms.length + 1));

		for (let i = target.terms.length - 1; i >= divisor.terms.length - 1; i--) {
			const termQuotient = target.terms[i] / divisor.terms[divisor.terms.length - 1];
			quotientTerms[i - divisor.terms.length + 1] = termQuotient;
			for (let j = divisor.terms.length - 1; j >= 0; j--) {
				target.terms[i - divisor.terms.length + 1 + j] -= divisor.terms[j] * termQuotient;
			}
			target.terms.pop();
		}

		target.simplify();
		const remainder = new Formula(target);
		target.terms = quotientTerms;
		return {
			quotient: target.simplify(),
			remainder
		}
	}

	div(...args: FormulaArgs): Formula {
		return this.divWithRem(...args as any).quotient;
	}

	rem(...args: FormulaArgs): Formula {
		const target = new Formula(this);
		const remainder = this.divWithRem(...args as any).remainder;
		target.terms = remainder.terms;
		return remainder;
	}

	constructor(...args: [] | FormulaArgs) {
		if (args.length === 0) {
			this.terms = [0];
		} else {
			this.terms = formulaDataFromArgs(args).terms;
		}
		this.simplify();
	}

	protected getTarget(): Formula {
		return new Formula(this);
	}
	
	simplify() {
		while (Math.abs(this.terms[this.terms.length - 1]) === 0 && this.terms.length > 1) {
			this.terms.pop();
		}
		return this;
	}

	evaluate(x: number = 0) {
		let sum = 0;
		for (let i = 0; i < this.terms.length; i++) {
			const coefficient = this.terms[i];
			sum += coefficient * (x ** i);
		}
		return sum;
	}

	evaluateDerivative(x: number = 0) {
		let sum = 0;
		for (let i = 1; i < this.terms.length; i++) {
			const coefficient = this.terms[i];
			sum += coefficient * (x ** (i - 1));
		}
		return sum;
	}

	hasFactor(...args: FormulaArgs): boolean {
		return this.rem(...args as any).isZero;
	}

	getEquationString(variable?: string) {
		return `f(${variable}) = ${this.getExpressionString(variable)}`;
	}

	getExpressionString(variable = "x") {
		const termsStrs: string[] = [];

		for (let i = this.terms.length - 1; i >= 0; i--) {
			const coefficient = this.terms[i];
			if (i > 1) {
				termsStrs.push(`${coefficient}${variable}^${i}`);
			} else if (i === 1) {
				termsStrs.push(`${coefficient}${variable}`);
			} else {
				termsStrs.push(String(coefficient));
			}
		}

		return termsStrs.join(" + ");
	}

	toString() {
		return `Formula(${this.terms})`;
	}

	get roots(): Set<number> {
		if (this.terms.length === 0) throw Error("Can't find roots of formula y = 0");
		if (this.terms.length === 1) return new Set();
		if (this.terms.length === 2) return new Set([-this.terms[0] / this.terms[1]]);
		if (this.terms.length === 3) {
			const discriminant = this.terms[1] ** 2 - 4 * this.terms[2] * this.terms[0];
			if (discriminant < 0) return new Set();
			if (discriminant === 0) return new Set([-this.terms[1] / 2 / this.terms[2]]);
			return new Set([
				(-this.terms[1] + Math.sqrt(discriminant)) / 2 / this.terms[2],
				(-this.terms[1] - Math.sqrt(discriminant)) / 2 / this.terms[2]
			]);
		}
		throw Error("Can't find roots of formulas past degree two");
	}

	get degree() {
		return this.terms.length - 1;
	}

	get isZero() {
		this.simplify();
		return this.terms.length === 1 && this.terms[0] === 0;
	}
}