import { GenerationTargetType } from "../getViewForSwagger2";
import { lintCode, LintOptions } from "./lintCode";
import { beautifyCode, Beautify, BeautifyOptions } from "./beautify";

export interface EnhanceOptions extends LintOptions {
  beautify: Beautify;
  beautifyOptions: BeautifyOptions;
}

export function enhanceCode(
  source: string,
  opts: EnhanceOptions,
  type: GenerationTargetType
): string {
  if (opts.lint) {
    lintCode(opts, type, source);
  }

  return beautifyCode(opts.beautify, source, opts.beautifyOptions);
}
