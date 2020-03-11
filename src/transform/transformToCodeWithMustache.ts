import { readFileSync } from "fs";
import * as Mustache from "mustache";
import {} from "mustache";
import { assign, identity } from "lodash";
import { Template } from "../options/options";
import { join } from "path";

export const DEFAULT_TEMPLATE_PATH = join(__dirname, "..", "..", "templates");

export type Templates = Record<keyof Template, string>;

type Renderer = {
  readonly render: (
    template: string,
    view: any,
    partials?: any,
    tags?: string[]
  ) => string;
  escape?: (value: string) => string;
};

export function transformToCodeWithMustache<T, C extends {}>(
  data: T,
  templates: Partial<Templates>,
  additionalViewOptions: Partial<C> = {},
  codeRenderer: Renderer = Mustache
): string {
  // Ensure we don't encode special characters
  codeRenderer.escape = identity;

  const loadedTemplates = loadTemplates(templates);

  return codeRenderer.render(
    loadedTemplates.class,
    assign(data, additionalViewOptions),
    loadedTemplates
  );
}

function loadTemplates(template: Partial<Templates> = {}): Templates {
  return {
    class:
      template.class ||
      readFileSync(join(DEFAULT_TEMPLATE_PATH, "class.mustache"), "utf-8"),
    method:
      template.method ||
      readFileSync(join(DEFAULT_TEMPLATE_PATH, "method.mustache"), "utf-8"),
    type:
      template.type ||
      readFileSync(join(DEFAULT_TEMPLATE_PATH, "type.mustache"), "utf-8")
  };
}
