import * as Mustache from 'mustache';
import { Swagger } from '../Swagger';

// TODO: Make readonly
export interface TemplateLocations {
    class: string;
    method: string;
    type: string;
}

interface Options {
    isES6: boolean;
    moduleName: string;
    imports: ReadonlyArray<string>;
    className: string;
    template: Partial<TemplateLocations>;
    mustache: typeof Mustache;
    esnext: boolean;
    lint: boolean;
    beautify: ((source: string) => string) | boolean;
    beautifyOptions: JsBeautifyOptions;
}

interface SwaggerOption {
    swagger: Swagger;
}

const DEFAULT_OPTIONS: Options = {
    isES6: false,
    moduleName: '',
    imports: [],
    className: '',
    template: {},
    mustache: Mustache,
    // TODO: This esnext option is actually a lint option. We should probably add lintOptions like we have beautifyOptions
    esnext: false,
    lint: true,
    beautify: true,
    beautifyOptions: {},
};

// This is the internal interface we use to reference to the Options that 
export interface CodeGenOptions extends Options, SwaggerOption {}
// All options except the swagger object are optional
export interface ProvidedCodeGenOptions extends Partial<Options>, SwaggerOption {}

export function makeOptions(options: ProvidedCodeGenOptions): CodeGenOptions {
    return {
        ...DEFAULT_OPTIONS,
        ...options
    };
}
