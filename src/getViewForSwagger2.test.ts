import { makeOptions } from "./options/options";
import { Swagger } from "./swagger/Swagger";
import { getViewForSwagger2, ViewData } from "./getViewForSwagger2";

describe('getViewForSwagger2', () => {
    let swagger: Swagger;

    beforeEach(() => {
        swagger = {
            swagger: '2.0',
            info: {
                description: 'My cool Swagger schema',
            },
            host: 'localhost:8080',
            schemes: ['https', 'wss'],
            definitions: {

            },
            security: [],
            securityDefinitions: undefined,
            paths: {},
            basePath: '/api',
            produces: ['json'],
            consumes: ['json'],
            parameters: []
        };
    });

    it('returns the default viewData for no additonal options', () => {
        const options = makeOptions({ swagger });

        expect(getViewForSwagger2(options)).toEqual(makeViewData());
    });

    it('adds imports from the options', () => {
        const options = makeOptions({ swagger, imports: [`import * as _ from 'lodash'`] });

        expect(getViewForSwagger2(options)).toEqual(makeViewData({ imports: [`import * as _ from 'lodash'`] }));
    });

    it('can handle a single path', () => {
        const options = makeOptions({
            swagger: {
                ...swagger,
                paths: {
                    user: {}
                }
            },
        });

        expect(getViewForSwagger2(options)).toEqual(makeViewData({}));
    });
});

function makeViewData(partial: Partial<ViewData> = {}): ViewData {
    return {
        isES6: false,
        description: 'My cool Swagger schema',
        isSecure: false,
        isSecureToken: false,
        isSecureApiKey: false,
        isSecureBasic: false,
        moduleName: "",
        className: "",
        imports: [],
        domain: 'https://localhost:8080/api',
        methods: [],
        definitions: [],
        ...partial,
    };
}