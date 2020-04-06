import { CodeGenOptions } from "../options/options";
import { transformToCodeWithMustache } from "../transform/transformToCodeWithMustache";
import { getViewForSwagger2 } from "../getViewForSwagger2";
import { CodeGenerator } from "./codeGenerator";

function verifyThatWeAreGeneratingForSwagger2(opts: CodeGenOptions): void {
  if (opts.swagger.swagger !== "2.0") {
    throw new Error("Only Swagger 2 specs are supported");
  }
}

export const Swagger2Gen: CodeGenerator = {
  getViewData: opts => {
    verifyThatWeAreGeneratingForSwagger2(opts);

    return getViewForSwagger2(opts);
  },
  getCode: opts => {
    const data = Swagger2Gen.getViewData(opts);
    return transformToCodeWithMustache(data, opts.template, opts.mustache);
  }
};
