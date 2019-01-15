import { makeOptions } from "./options";
import * as Mustache from "mustache";
import { Swagger } from "../swagger/Swagger";

const defaultOptions = {
  isES6: false,
  moduleName: "",
  imports: [],
  className: "",
  template: {},
  mustache: Mustache,
  esnext: false,
  lint: true,
  beautify: true,
  beautifyOptions: {}
};

describe("makeOptions", () => {
  it("returns the default options when no options are passed", () => {
    const partialOptions = {
      swagger: {} as Swagger
    };

    expect(makeOptions(partialOptions)).toEqual({
      ...defaultOptions,
      swagger: {}
    });
  });

  it("merges in the options that are passed with higher priority", () => {
    const partialOptions = {
      swagger: {} as Swagger,
      lint: false,
      className: "GeneratedDataLayer"
    };

    const options = makeOptions(partialOptions);

    expect(options.lint).toBe(false);
    expect(options.className).toBe("GeneratedDataLayer");
  });
});
