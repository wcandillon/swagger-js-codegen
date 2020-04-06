import { CodeGenOptions } from "../options/options";
import { ViewData } from "../getViewForSwagger2";

/**
 * Abstraction over a code generator.
 */
export interface CodeGenerator {
  /**
   * Returns the ViewData from the provided options.
   *
   * @param {CodeGenOptions} opts
   *
   * @returns {ViewData}
   */
  getViewData(opts: CodeGenOptions): ViewData;

  /**
   * Generate the code from the provided options.
   *
   * @param {CodeGenOptions} opts
   *
   * @returns {string}
   */
  getCode(opts: CodeGenOptions): string;
}
