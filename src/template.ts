export interface TemplateData {
	// members
};

export type TemplateArgs = [TemplateData];

export function templateDataFromArgs(args: TemplateArgs): TemplateData {
	// build members
	return {};
}

export class Template implements TemplateData {
	// members

	constructor(...args: [] | TemplateArgs) {
		if (args.length === 0) {
			// assign members
		} else {
			const { } = templateDataFromArgs(args);
			// assign members
		}
	}

	// toString
}