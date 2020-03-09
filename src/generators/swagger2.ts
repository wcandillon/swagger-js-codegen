import { CodeGenOptions } from "../options/options";
import { transformToCodeWithMustache } from "../transform/transformToCodeWithMustache";
import { getViewForSwagger2, ViewData } from "../getViewForSwagger2";

interface CodeGenerator {
  getViewData(opts: CodeGenOptions): ViewData;
  getCode(opts: CodeGenOptions): string;
}

function verifyThatWeAreGeneratingForSwagger2(opts: CodeGenOptions): void {
  if (opts.swagger.swagger !== "2.0") {
    throw new Error("Only Swagger 2 specs are supported");
  }
}

export const Swagger2Gen: CodeGenerator = {
  getViewData: function(opts: CodeGenOptions): ViewData {
    verifyThatWeAreGeneratingForSwagger2(opts);

    return getViewForSwagger2(opts);
  },
  getCode: function(opts: CodeGenOptions): string {
    const data = this.getViewData(opts);
    return transformToCodeWithMustache(data, opts.template, opts.mustache);
  }
};
