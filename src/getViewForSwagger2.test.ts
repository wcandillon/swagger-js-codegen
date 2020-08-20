import { makeOptions } from "./options/options";
import { Swagger, HttpOperation } from "./swagger/Swagger";
import { getViewForSwagger2, ViewData } from "./getViewForSwagger2";

describe("getViewForSwagger2", () => {
  let swagger: Swagger;

  beforeEach(() => {
    swagger = {
      swagger: "2.0",
      info: {
        description: "My cool Swagger schema"
      },
      host: "localhost:8080",
      schemes: ["https", "wss"],
      definitions: {},
      security: [],
      securityDefinitions: undefined,
      paths: {},
      basePath: "/api",
      produces: ["json"],
      consumes: ["json"],
      parameters: {}
    };
  });

  it("returns the default viewData for no additonal options", () => {
    const options = makeOptions({ swagger });

    expect(getViewForSwagger2(options)).toEqual(makeViewData());
  });

  it("adds imports from the options", () => {
    const options = makeOptions({
      swagger,
      imports: [`import * as _ from 'lodash'`]
    });

    expect(getViewForSwagger2(options)).toEqual(
      makeViewData({ imports: [`import * as _ from 'lodash'`] })
    );
  });

  it("can handle a single path", () => {
    const options = makeOptions({
      swagger: {
        ...swagger,
        paths: {
          "/user": {}
        }
      }
    });

    expect(getViewForSwagger2(options)).toEqual(makeViewData({}));
  });

  describe("should map objects correctly", () => {
    it("can handle required properties", () => {
      const options = makeOptions({
        swagger: {
          ...swagger,
          definitions: {
            typeWithRequiredProperties: {
              minItems: 0,
              required: ["anyProperty", "anotherProperty"],
              properties: {
                anyProperty: {
                  type: "string"
                },
                anotherProperty: {
                  type: "string"
                },
                notRequiredProperty: {
                  type: "string"
                }
              }
            }
          } as any
        }
      });
      const view = getViewForSwagger2(options);
      expect(view.definitions.length).toEqual(1);
      expect(view.definitions[0].tsType).toEqual(
        expect.objectContaining({ isRequired: true }) //this still confuses me
      );
      expect(view.definitions[0].tsType.properties).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "anyProperty",
            isRequired: true
          }),
          expect.objectContaining({
            name: "anotherProperty",
            isRequired: true
          }),
          expect.objectContaining({
            name: "notRequiredProperty",
            isRequired: false
          })
        ])
      );
    });
  });

  describe("should honor includeDeprecated option", () => {
    let deprecatedSwagger: Swagger;

    beforeEach(() => {
      deprecatedSwagger = {
        ...swagger,
        paths: {
          "/deprecated": {
            get: {
              ...makeOperation(),
              deprecated: true
            }
          },
          "/nonDeprecated": {
            get: {
              ...makeOperation(),
              deprecated: false
            }
          }
        }
      };
    });

    it("does not include deprecated methods by default", () => {
      const options = makeOptions({
        swagger: deprecatedSwagger
      });
      const view = getViewForSwagger2(options);
      expect(view.methods).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "/nonDeprecated",
            isDeprecated: false
          })
        ])
      );
    });
    it("includes deprecated methods if includeDeprecated is true", () => {
      const options = makeOptions({
        includeDeprecated: true,
        swagger: deprecatedSwagger
      });

      const view = getViewForSwagger2(options);
      expect(view.methods).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: "/deprecated", isDeprecated: true }),
          expect.objectContaining({
            path: "/nonDeprecated",
            isDeprecated: false
          })
        ])
      );
    });
  });
});

function makeOperation(): HttpOperation {
  return {
    security: false,
    responses: {},
    operationId: "operationId",
    description: "description",
    summary: "summary",
    externalDocs: "",
    produces: [""],
    consumes: [""],
    parameters: [],
    deprecated: false
  };
}

function makeViewData(partial: Partial<ViewData> = {}): ViewData {
  return {
    isES6: false,
    description: "My cool Swagger schema",
    isSecure: false,
    isSecureToken: false,
    isSecureApiKey: false,
    isSecureBasic: false,
    moduleName: "",
    className: "",
    imports: [],
    domain: "https://localhost:8080/api",
    methods: [],
    definitions: [],
    ...partial
  };
}
