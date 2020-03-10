import { makeOptions, validateOptions } from "./options";
import * as Mustache from "mustache";
import { Swagger } from "../swagger/Swagger";

const defaultOptions = {
  isES6: false,
  moduleName: "",
  includeDeprecated: false,
  imports: [],
  className: "",
  template: {},
  mustache: Mustache,
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
      className: "GeneratedDataLayer"
    };

    const options = makeOptions(partialOptions);

    expect(options.className).toBe("GeneratedDataLayer");
  });
});

describe("validateOptions", () => {
  it("with valid options", () => {
    const partialOptions = {
      swagger: {} as Swagger,
      template: {
        class: "class-template",
        method: "method-template"
      }
    };

    const options = makeOptions(partialOptions);

    expect(() => validateOptions(options));
  });

  it("throws when class template is not provided", () => {
    const partialOptions = {
      swagger: {} as Swagger,
      template: {
        class: "class-template",
        method: undefined
      }
    };

    const options = makeOptions(partialOptions);

    expect(() => validateOptions(options)).toThrow(
      'Unprovided custom template. Please use the following template: template: { class: "...", method: "...", request: "..." }'
    );
  });

  it("throws when method template is not provided", () => {
    const partialOptions = {
      swagger: {} as Swagger,
      template: {
        class: undefined,
        method: "method-template"
      }
    };

    const options = makeOptions(partialOptions);

    expect(() => validateOptions(options)).toThrow(
      'Unprovided custom template. Please use the following template: template: { class: "...", method: "...", request: "..." }'
    );
  });
});
