import * as Mustache from 'mustache';
import * as path from 'path';
import { readFileSync } from 'fs';
import { transformToCodeWithMustache, Templates, DEFAULT_TEMPLATE_PATH } from './transformToCodeWithMustache';
import { ViewData } from '../getViewForSwagger2';

// jest.mock('mustache');

describe('transformToCodeWithMustache', (): void => {
    let viewData: ViewData;
    let templates: Templates;

    beforeAll(() => {
        jest.spyOn(Mustache, 'render');     

        templates = {
            class: readFileSync(path.join(DEFAULT_TEMPLATE_PATH, 'class.mustache'), 'utf-8'),
            method: readFileSync(path.join(DEFAULT_TEMPLATE_PATH, 'method.mustache'), 'utf-8'),
            type: readFileSync(path.join(DEFAULT_TEMPLATE_PATH, 'type.mustache'), 'utf-8'),
        };
    });
    

    beforeEach(() => {
        viewData = {
            isES6: false,
            description: '',
            isSecure: false,
            isSecureToken: false,
            isSecureApiKey: false,
            isSecureBasic: false,
            moduleName: '',
            className: '',
            imports: [],
            domain: '', // (swagger.schemes && swagger.schemes.length > 0 && swagger.host && swagger.basePath) ? swagger.schemes[0] + '://' + swagger.host + swagger.basePath.replace(/\/+$/g,'') : '',
            methods: [],
            definitions: []
        };

        (Mustache.render as jest.Mock).mockReset();
    });

    it('calls Mustache.render with the default templates for the typescript target', () => {
        transformToCodeWithMustache(viewData, {});

        expect(Mustache.render).toBeCalledWith(templates.class, viewData, templates);
    });

    it('calls Mustache.render with the partially specified class template when it is provided', () => {
        const expectedTemplates = {
            class: 'This is my custom template',
            method: templates.method,
            type: templates.type
        };

        transformToCodeWithMustache(viewData, {
            class: 'This is my custom template'
        });

        expect(Mustache.render).toBeCalledWith(expectedTemplates.class, viewData, expectedTemplates);
    });

    it('calls Mustache.render with the partially specified method template when it is provided', () => {
        const expectedTemplates = {
            class: templates.class,
            method: 'function <methodName>() {}',
            type: templates.type
        };

        transformToCodeWithMustache(viewData, { method: 'function <methodName>() {}' });

        expect(Mustache.render).toBeCalledWith(templates.class, viewData, expectedTemplates);
    });

    it('calls Mustache.render with the partially specified type template when it is provided', () => {
        const expectedTemplates = {
            class: templates.class,
            method: templates.method,
            type: 'type <typeName>',
        };

        transformToCodeWithMustache(viewData, { type: 'type <typeName>' });

        expect(Mustache.render).toBeCalledWith(templates.class, viewData, expectedTemplates);
    });

    it('uses the provided templates for the custom target', () => {
        const customTemplates = {
            class: 'class <className> {<classContent>}',
            method: 'function <methodName>() {}',
            type: 'type <typeName>'
        };

        transformToCodeWithMustache(viewData, customTemplates);

        expect(Mustache.render).toBeCalledWith(customTemplates.class, viewData, customTemplates);
    });

    it('adds passed mustache options to the viewData when calling render', () => {
        transformToCodeWithMustache(viewData, {}, {  name: 'MyCustomName' });

        expect((Mustache.render as jest.Mock).mock.calls[0][1].name).toBe('MyCustomName');
    });

    it('overrides the escape method with the identity function', () => {
        transformToCodeWithMustache(viewData, {}, { name: 'MyCustomName' }, Mustache);

        expect(Mustache.escape('<div>')).toBe('<div>'); 
    });
});
