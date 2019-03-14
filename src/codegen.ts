import { isObject, isString } from "lodash";
import {
  CodeGenOptions,
  ProvidedCodeGenOptions,
  makeOptions
} from "./options/options";
import { getViewForSwagger2 } from "./getViewForSwagger2";
import { transformToCodeWithMustache } from "./transform/transformToCodeWithMustache";
import { enhanceCode } from "./enhance";

function getCode(opts: CodeGenOptions): string {
  verifyThatWeAreGeneratingForSwagger2(opts);

  const data = getViewForSwagger2(opts);
  return transformToCodeWithMustache(data, opts.template, opts.mustache);
}

export const CodeGen = {
  transformToViewData: getViewForSwagger2,
  transformToCodeWithMustache,
  getTypescriptCode: function(opts: ProvidedCodeGenOptions) {
    const options = makeOptions(opts);

    return enhanceCode(getCode(options), options);
  },
  getCustomCode: function(opts: ProvidedCodeGenOptions) {
    verifyThatWeHaveRequiredTemplatesForCustomGenerationTarget(opts);

    const options = makeOptions(opts);

    return enhanceCode(getCode(options), options);
  },
  getDataAndOptionsForGeneration: function(opts: ProvidedCodeGenOptions) {
    const options = makeOptions(opts);
    verifyThatWeAreGeneratingForSwagger2(options);
    const data = getViewForSwagger2(options);
    return { data, options };
  }
};

function verifyThatWeHaveRequiredTemplatesForCustomGenerationTarget(
  opts: ProvidedCodeGenOptions
) {
  // TODO: Why do we not check for the existence of the type template?
  if (
    !opts.template ||
    !isObject(opts.template) ||
    !isString(opts.template.class) ||
    !isString(opts.template.method)
  ) {
    throw new Error(
      'Unprovided custom template. Please use the following template: template: { class: "...", method: "...", request: "..." }'
    );
  }
}

function verifyThatWeAreGeneratingForSwagger2(opts: CodeGenOptions): void {
  if (opts.swagger.swagger !== "2.0") {
    throw new Error("Only Swagger 2 specs are supported");
  }
}
