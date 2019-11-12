import { convertType } from "./typescript";
import {
  makeFakeSwagger,
  makeSwaggerType,
  makeEmptyTypeSpec
} from "./test-helpers/testHelpers";
import { Swagger } from "./swagger/Swagger";
import { SwaggerType } from "./swagger/Swagger";
import { TypeSpec } from "./typespec";

describe("convertType", () => {
  let swagger: Swagger;
  let swaggerType: SwaggerType;
  let emptyTypeSpecWithDefaults: TypeSpec;

  beforeEach(() => {
    swagger = makeFakeSwagger();
    emptyTypeSpecWithDefaults = makeEmptyTypeSpec();
  });

  describe("reference", () => {
    it("returns a reference object", () => {
      swaggerType = makeSwaggerType({
        $ref: "https://microsoft.com/api/users",
        type: "reference"
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        target: "users",
        tsType: "ref",
        isRef: true
      });
    });
  });

  describe("enum", () => {
    it("correctly converts an enum type", () => {
      swaggerType = makeSwaggerType({
        enum: ["Marius", "Mark", "Mathieu"],
        type: "enum"
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: '"Marius" | "Mark" | "Mathieu"',
        isAtomic: true,
        isEnum: true,
        enum: ["Marius", "Mark", "Mathieu"]
      });
    });

    it("correctly passes through typespec properties", () => {
      swaggerType = makeSwaggerType({
        description: "namesStartingWithM",
        required: true,
        enum: ["Marius", "Mark", "Mathieu"],
        type: "enum"
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        description: "namesStartingWithM",
        isRequired: true,
        isNullable: false,
        tsType: '"Marius" | "Mark" | "Mathieu"',
        isAtomic: true,
        isEnum: true,
        enum: ["Marius", "Mark", "Mathieu"]
      });
    });
  });

  describe("string", () => {
    it("correctly converts an string type", () => {
      swaggerType = makeSwaggerType({ type: "string" });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "string",
        isAtomic: true
      });
    });

    it("correctly passes through typespec properties", () => {
      swaggerType = makeSwaggerType({
        description: "The description of a string property",
        required: false,
        type: "string"
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        description: "The description of a string property",
        isRequired: false,
        isNullable: true,
        tsType: "string",
        isAtomic: true
      });
    });
  });

  describe("number", () => {
    it("correctly converts an number type", () => {
      swaggerType = makeSwaggerType({ type: "number" });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "number",
        isAtomic: true
      });
    });

    it("correctly passes through typespec properties", () => {
      swaggerType = makeSwaggerType({
        description: "The description of a number property",
        required: false,
        type: "number"
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        description: "The description of a number property",
        isRequired: false,
        isNullable: true,
        tsType: "number",
        isAtomic: true
      });
    });
  });

  describe("boolean", () => {
    it("correctly converts an boolean type", () => {
      swaggerType = makeSwaggerType({ type: "boolean" });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "boolean",
        isAtomic: true
      });
    });

    it("correctly passes through typespec properties", () => {
      swaggerType = makeSwaggerType({
        description: "The description of a boolean property",
        required: false,
        type: "boolean"
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        description: "The description of a boolean property",
        isRequired: false,
        isNullable: true,
        tsType: "boolean",
        isAtomic: true
      });
    });
  });

  describe("array", () => {
    it("correctly converts an array type", () => {
      swaggerType = makeSwaggerType({
        type: "array",
        items: makeSwaggerType({ type: "number" })
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "Array<number>",
        isAtomic: false,
        isArray: true,
        collectionFormat: "multi",
        elementType: {
          ...emptyTypeSpecWithDefaults,
          tsType: "number",
          isAtomic: true
        }
      });
    });

    it("correctly passes through typespec properties", () => {
      swaggerType = makeSwaggerType({
        description: "The description of a array property",
        required: false,
        type: "array",
        collectionFormat: "csv",
        items: makeSwaggerType({
          type: "object",
          required: false,
          additionalProperties: false
        })
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        description: "The description of a array property",
        isRequired: false,
        isNullable: true,
        isArray: true,
        collectionFormat: "csv",
        tsType: "Array<object>",
        isAtomic: false,
        elementType: {
          ...emptyTypeSpecWithDefaults,
          isRequired: false,
          isNullable: true,
          isObject: true,
          properties: [],
          tsType: "object",
          requiredPropertyNames: []
        }
      });
    });
  });

  describe("dictionary", () => {
    it("correctly converts an dictionary type", () => {
      swaggerType = makeSwaggerType({
        type: "object",
        additionalProperties: makeSwaggerType({ type: "number" })
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "object",
        isAtomic: false,
        isObject: true,
        properties: [],
        requiredPropertyNames: [],
        hasAdditionalProperties: true,
        additionalPropertiesType: {
          ...emptyTypeSpecWithDefaults,
          isAtomic: true,
          tsType: "number"
        }
      });
    });

    it("correctly passes through typespec properties", () => {
      swaggerType = makeSwaggerType({
        description: "The description of a dictionary property",
        required: false,
        type: "object",
        additionalProperties: makeSwaggerType({ type: "number" })
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        description: "The description of a dictionary property",
        tsType: "object",
        isAtomic: false,
        isObject: true,
        isNullable: true,
        isRequired: false,
        properties: [],
        requiredPropertyNames: [],
        hasAdditionalProperties: true,
        additionalPropertiesType: {
          ...emptyTypeSpecWithDefaults,
          isAtomic: true,
          tsType: "number"
        }
      });
    });
  });

  describe("any", () => {
    it("correctly converts an any type", () => {
      swaggerType = makeSwaggerType({
        type: "object",
        minItems: 10,
        title: "Een mooie titel"
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "any",
        isAtomic: true
      });
    });

    it("correctly passes through typespec properties", () => {
      swaggerType = makeSwaggerType({
        description: "The description of a any property",
        required: false,
        type: "object",
        minItems: 10,
        title: "Een mooie titel"
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        description: "The description of a any property",
        isRequired: false,
        isNullable: true,
        tsType: "any",
        isAtomic: true
      });
    });
  });

  describe("object", () => {
    it("correctly converts an object type", () => {
      swaggerType = makeSwaggerType({
        type: "object",
        additionalProperties: false
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "object",
        isAtomic: false,
        isObject: true,
        properties: [],
        requiredPropertyNames: []
      });
    });

    it("correctly passes through typespec properties", () => {
      swaggerType = makeSwaggerType({
        description: "The description of a any property",
        required: false,
        type: "object"
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        description: "The description of a any property",
        isRequired: false,
        isNullable: true,
        tsType: "object",
        isAtomic: false,
        isObject: true,
        properties: [],
        requiredPropertyNames: [],
        hasAdditionalProperties: true,
        additionalPropertiesType: {
          ...emptyTypeSpecWithDefaults,
          isAtomic: true,
          tsType: "any"
        }
      });
    });

    it("correctly converts an object type with properties", () => {
      swaggerType = makeSwaggerType({
        type: "object",
        properties: {
          age: makeSwaggerType({ type: "number" })
        },
        additionalProperties: false
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "object",
        isAtomic: false,
        isObject: true,
        properties: [
          {
            ...emptyTypeSpecWithDefaults,
            tsType: "number",
            isAtomic: true,
            name: "age",
            isRequired: false
          }
        ],
        requiredPropertyNames: []
      });
    });

    it("correctly converts an object type with additionalProperties: false", () => {
      swaggerType = makeSwaggerType({
        type: "object",
        additionalProperties: false
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "object",
        isAtomic: false,
        isObject: true,
        properties: [],
        requiredPropertyNames: []
      });
    });

    it("correctly converts an object type with additionalProperties: true", () => {
      swaggerType = makeSwaggerType({
        type: "object",
        additionalProperties: true
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "object",
        isAtomic: false,
        isObject: true,
        properties: [],
        requiredPropertyNames: [],
        hasAdditionalProperties: true,
        additionalPropertiesType: {
          ...emptyTypeSpecWithDefaults,
          isAtomic: true,
          tsType: "any"
        }
      });
    });

    it("correctly converts an object type with a missing additionalProperties field", () => {
      // this needs to be treated exactly the same as with "additionalProperties = true"
      // see: https://support.reprezen.com/support/solutions/articles/6000162892-support-for-additionalproperties-in-swagger-2-0-schemas
      swaggerType = makeSwaggerType({
        type: "object",
        additionalProperties: undefined
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "object",
        isAtomic: false,
        isObject: true,
        properties: [],
        requiredPropertyNames: [],
        hasAdditionalProperties: true,
        additionalPropertiesType: {
          ...emptyTypeSpecWithDefaults,
          isAtomic: true,
          tsType: "any"
        }
      });
    });

    it("handles required properties", () => {
      swaggerType = makeSwaggerType({
        type: "object",
        properties: {
          age: makeSwaggerType({ type: "number" })
        },
        required: ["age"],
        additionalProperties: false
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "object",
        isAtomic: false,
        isObject: true,
        properties: [
          {
            ...emptyTypeSpecWithDefaults,
            tsType: "number",
            isAtomic: true,
            name: "age",
            isRequired: true
          }
        ],
        requiredPropertyNames: ["age"]
      });
    });

    // TODO: This behaviour seems kind of weird? There is an object in an object but we seem flatten them in the resulting typedef?
    // TODO: It also seems weird that the requiredPropertiesNames does not take into account the flattening
    it("handles allOf properties of non $ref properties", () => {
      swaggerType = makeSwaggerType({
        type: "object",
        allOf: [
          makeSwaggerType({
            type: "object",
            properties: {
              age: makeSwaggerType({ type: "number" })
            },
            additionalProperties: false
          })
        ],
        required: ["age"],
        additionalProperties: false
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "object",
        isAtomic: false,
        isObject: true,
        properties: [
          {
            ...emptyTypeSpecWithDefaults,
            tsType: "number",
            isAtomic: true,
            name: "age",
            isRequired: false
          }
        ],
        requiredPropertyNames: ["age"]
      });
    });

    it("handles allOf properties of $ref properties", () => {
      swagger = {
        ...swagger,
        definitions: {
          person: makeSwaggerType({
            type: "object",
            properties: {
              age: makeSwaggerType({ type: "number" })
            },
            additionalProperties: false
          })
        }
      };

      swaggerType = makeSwaggerType({
        type: "object",
        allOf: [
          makeSwaggerType({
            $ref: "api/person",
            type: "reference"
          })
        ],
        required: ["age"],
        additionalProperties: false
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "object",
        isAtomic: false,
        isObject: true,
        properties: [
          {
            ...emptyTypeSpecWithDefaults,
            tsType: "number",
            isAtomic: true,
            name: "age",
            isRequired: false
          }
        ],
        requiredPropertyNames: ["age"]
      });
    });

    it("does not handle allOf properties of $ref properties that do not have a definition", () => {
      swagger = {
        ...swagger,
        definitions: {
          person: makeSwaggerType({
            type: "object",
            properties: {
              age: makeSwaggerType({ type: "number" })
            },
            additionalProperties: false
          })
        }
      };

      swaggerType = makeSwaggerType({
        type: "object",
        allOf: [
          makeSwaggerType({
            $ref: "api/location",
            type: "reference"
          })
        ],
        required: ["age"],
        additionalProperties: false
      });

      expect(convertType(swaggerType, swagger)).toEqual({
        ...emptyTypeSpecWithDefaults,
        tsType: "object",
        isAtomic: false,
        isObject: true,
        properties: [],
        requiredPropertyNames: ["age"]
      });
    });
  });
});
