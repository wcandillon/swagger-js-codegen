import { CodeGen } from "./codegen";
import { Swagger } from "./Swagger";
import { Templates } from "./transform/transformToCodeWithMustache";

describe("CodeGen", () => {
  const swagger = {
    swagger: "2.0"
  } as Swagger;

  describe('getTypescriptCode', () => {
    it('throws when the swagger version is not 2.0', () => {
        swagger.swagger = '3.0';

        expect(() =>
            CodeGen.getTypescriptCode({ swagger })
        ).toThrow('Only Swagger 2 specs are supported');
    });
  });

  describe("getCustomCode", () => {
    it('throws when the swagger version is not 2.0', () => {
        const customTemplates = {
            class: "class <className> {<classContent>}",
            method: "function <methodName>() {<methodContent}}"
          };

        swagger.swagger = '3.0';

        expect(() =>
            CodeGen.getCustomCode({ swagger, template: customTemplates })
        ).toThrow('Only Swagger 2 specs are supported');
    });

    it("throws when the template option is not provided", () => {
      const customTemplates = (undefined as any) as Templates;

      expect(() =>
        CodeGen.getCustomCode({ swagger, template: customTemplates })
      ).toThrow(
        'Unprovided custom template. Please use the following template: template: { class: "...", method: "...", request: "..." }'
      );
    });

    it("throws when the class template is not provided", () => {
      const customTemplates = {
        method: "function <methodName>() {}",
        type: "type <typeName>"
      };

      expect(() =>
        CodeGen.getCustomCode({ swagger, template: customTemplates })
      ).toThrow(
        'Unprovided custom template. Please use the following template: template: { class: "...", method: "...", request: "..." }'
      );
    });

    it("throws when the method template is not provided", () => {
      const customTemplates = {
        class: "class <className> {<classContent>}",
        type: "type <typeName>"
      };

      expect(() =>
        CodeGen.getCustomCode({ swagger, template: customTemplates })
      ).toThrow(
        'Unprovided custom template. Please use the following template: template: { class: "...", method: "...", request: "..." }'
      );
    });
  });
});
