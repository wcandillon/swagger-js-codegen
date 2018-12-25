import { js_beautify } from 'js-beautify';
import * as _ from 'lodash';

const DEFAULT_BEAUTIFY_OPTIONS: JsBeautifyOptions = {
    indent_size: 4, 
    max_preserve_newlines: 2
};

export type Beautify = ((source: string) => string) | boolean | undefined; 

export type BeautifyOptions = JsBeautifyOptions;

export function beautifyCode(beautify: Beautify, source: string, options: BeautifyOptions = {}): string {
    // Backwards compatible js_beautify
    if (beautify === undefined || beautify === true) {
        return js_beautify(source, _.defaults(options, DEFAULT_BEAUTIFY_OPTIONS));
    }
    
    // Run the beautify function if it has been provided
    if (typeof beautify === 'function') {
        return beautify(source);
    }

    // Return original source if no beautify option was given
    return source;
}
