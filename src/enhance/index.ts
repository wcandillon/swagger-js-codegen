import { beautifyCode, Beautify, BeautifyOptions } from "./beautify";

export interface EnhanceOptions {
  beautify: Beautify;
  beautifyOptions: BeautifyOptions;
}

export function enhanceCode(source: string, opts: EnhanceOptions): string {
  return beautifyCode(opts.beautify, source, opts.beautifyOptions);
}
