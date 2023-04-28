export interface TemplateData {
	// members
};

export type TemplateArgs = [TemplateData];

export function templateDataFromArgs(args: TemplateArgs): TemplateData {
	// build members
	return {};
}

abstract class TemplateAbstract {
	protected abstract getTarget(): Template;
	
	// equal
}

export class Template extends TemplateAbstract implements TemplateData {
	// members

	constructor(...args: [] | TemplateArgs) {
		super();
		// construct
	}

	protected getTarget(): Template {
		return new Template(this);
	}

	get set() {
		return new TemplateMutable(this);
	}

	copy() {
		return new Template(this);
	}

	// toString
}

class TemplateMutable extends TemplateAbstract {
	target: Template;

	constructor(target: Template) {
		super();
		this.target = target;
	}

	protected getTarget(): Template {
		return this.target;
	}
}