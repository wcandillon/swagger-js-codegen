import { GenerationTargetType } from '../getViewForSwagger2';

const lint: any = require('jshint').JSHINT;

export interface LintOptions {
    esnext: boolean;
    lint: boolean;
}

export interface LintError {
    reason: string;
    evidence: string;
    code: string;
}

export function lintCode(opts: LintOptions, type: GenerationTargetType, source: string): void {
    const lintOptions = {
        // TODO: This seems like a weird leftover from the typescript cleanup? We probably don't need to support lint at all?
        // Maybe run the result through tsc to make sure it's valid typescript and then beautify by providing a beautify function?
        browser: type === 'custom',
        undef: true,
        strict: true,
        trailing: true,
        smarttabs: true,
        maxerr: 999,
        esnext: false,
    };

    if (opts.esnext) {
        lintOptions.esnext = true;
    }

    lint(source, lintOptions);
        lint.errors.forEach((error: LintError) => {
            if (error.code[0] === 'E') {
                throw new Error(`${error.reason} in ${error.evidence} (${error.code})`);
            }
        });
}
