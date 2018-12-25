import * as fs from 'fs';
import * as Mustache from 'mustache';
import {  } from 'mustache';
import * as _ from 'lodash';
import { TemplateLocations } from '../options/options';
import * as path from 'path';

export const DEFAULT_TEMPLATE_PATH = path.join(__dirname, '..', '..', 'templates');

export type Templates = Record<keyof TemplateLocations, string>;

type Renderer = {
    render: (template: string, view: any, partials?: any, tags?: string[]) => string;
    escape?: (value: string) => string;
}

export function transformToCodeWithMustache<T, C extends {}>(data: T, templates: Partial<Templates>, additionalViewOptions: Partial<C> = {}, codeRenderer: Renderer = Mustache): string {
    // Ensure we don't encode special characters
    codeRenderer.escape = _.identity;

    const loadedTemplates = loadTemplates(templates);

    return codeRenderer.render(loadedTemplates.class, _.assign(data, additionalViewOptions), loadedTemplates);
}

function loadTemplates(templateLocations: Partial<Templates> = {}): Templates {
    return {
        class: templateLocations.class || fs.readFileSync(path.join(DEFAULT_TEMPLATE_PATH, 'class.mustache'), 'utf-8'),
        method: templateLocations.method || fs.readFileSync(path.join(DEFAULT_TEMPLATE_PATH, 'method.mustache'), 'utf-8'),
        type: templateLocations.type || fs.readFileSync(path.join(DEFAULT_TEMPLATE_PATH, 'type.mustache'), 'utf-8'),
    }
}
