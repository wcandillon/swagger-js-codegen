// TODO: This file needs some love <3
import {
    transform,
    forEach,
    camelCase,
    merge,
    isArray,
    isString
} from 'lodash';
import { convertType } from './typescript';
import { CodeGenOptions } from './options/options';
import { TypeSpec } from './typespec';

export type GenerationTargetType = 'typescript' | 'custom';

interface Header {}

interface Method {
    methodName: string;
    intVersion: number;
    isLatestVersion: boolean;
    isSecure: boolean;
    isSecureToken: boolean;
    isSecureApiKey: boolean;
    isSecureBasic: boolean;
    path: string;
    pathFormatString: string;
    className: string;
    version: string;
    method: string;
    isGET: boolean;
    isPOST: boolean;
    summary: string;
    externalDocs: string;
    parameters: string[];
    headers: Header[];
    successfulResponseType: string;
    successfulResponseTypeIsRef: boolean;
}

interface Definition {
    name: string; 
    description: string | undefined;
    tsType: TypeSpec
}

export interface ViewData {
    isES6: boolean;
    description: string;
    isSecure: boolean;
    moduleName: string;
    className: string;
    imports: ReadonlyArray<string>;
    domain: string;
    isSecureToken: boolean;
    isSecureApiKey: boolean;
    isSecureBasic: boolean;
    methods: Method[];
    definitions: Definition[];
}

interface LatestMethodVersion {
    [index: string]: number;
}

const defaultSuccessfulResponseType = 'void';

const charactersToBeReplacedWithUnderscore = /\.|\-|\{|\}/g;
function normalizeName(id: string): string {
    return id.replace(charactersToBeReplacedWithUnderscore, '_');
};

function getPathToMethodName(__: CodeGenOptions, m: string, path: string): string {
    if(path === '/' || path === '') {
        return m;
    }

    // clean url path for requests ending with '/'
    const cleanPath = path.replace(/\/$/, '');

    let segments = cleanPath.split('/').slice(1);
    segments = transform(segments, (result, segment) => {
        if (segment[0] === '{' && segment[segment.length - 1] === '}') {
            segment = `by${segment[1].toUpperCase()}${segment.substring(2, segment.length - 1)}`;
        }
        result.push(segment);
    });

    const result = camelCase(segments.join('-'));
    return `${m.toLowerCase()}${result[0].toUpperCase()}${result.substring(1)}`;
};

const versionRegEx = /\/api\/(v\d+)\//;

function getVersion(path: string){
    const version = versionRegEx.exec(path);
    // TODO: This only supports versions until v9, v10 will return 1?
    return (version && version[1]) || 'v0';
};

export function getViewForSwagger2(opts: CodeGenOptions): ViewData{
    const swagger = opts.swagger;
    const authorizedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'COPY', 'HEAD', 'OPTIONS', 'LINK', 'UNLINK', 'PURGE', 'LOCK', 'UNLOCK', 'PROPFIND'];
    const data: ViewData = {
        isES6: opts.isES6,
        description: swagger.info.description,
        isSecure: swagger.securityDefinitions !== undefined,
        isSecureToken: false,
        isSecureApiKey: false,
        isSecureBasic: false,
        moduleName: opts.moduleName,
        className: opts.className,
        imports: opts.imports,
        domain: (swagger.schemes && swagger.schemes.length > 0 && swagger.host && swagger.basePath) ? `${swagger.schemes[0]}://${swagger.host}${swagger.basePath.replace(/\/+$/g,'')}` : '',
        methods: [],
        definitions: []
    };

    const latestMethodVersion: LatestMethodVersion = {}; /* Maps method name => max version */

    function isParameter(__: any, m: string): __ is ReadonlyArray<any> {
        return m.toLowerCase() === 'parameters';
    }

    forEach(swagger.paths, function(api, path){
        let globalParams: ReadonlyArray<any> = [];
        /**
         * @param {Object} op - meta data for the request
         * @param {string} m - HTTP method name - eg: 'get', 'post', 'put', 'delete'
         */
        forEach(api, function(op, m){
            if(isParameter(op, m)) {
                globalParams = op;
            }
        });

        forEach(api, function (op, m){
            const M = m.toUpperCase();
            if(M === '' || authorizedMethods.indexOf(M) === -1) {
                return;
            }

            // Ignore deprecated endpoints
            if (op.deprecated) {
                return;
            }

            const secureTypes = [];
            if(swagger.securityDefinitions !== undefined || op.security !== undefined) {
                const mergedSecurity = merge([], swagger.security, op.security).map((security) => {
                    return Object.keys(security);
                });
                if(swagger.securityDefinitions) {
                    for(const sk in swagger.securityDefinitions) {
                        if (mergedSecurity.join(',').indexOf(sk) !== -1){
                            secureTypes.push(swagger.securityDefinitions[sk].type);
                        }
                    }
                }
            }

            let successfulResponseTypeIsRef = false;
            let successfulResponseType;
            try {
                const convertedType = convertType(op.responses['200'], swagger);

                if(convertedType.target){
                    successfulResponseTypeIsRef = true;
                }
    
                successfulResponseType = convertedType.target || convertedType.tsType || defaultSuccessfulResponseType;
            } catch (error) {
                successfulResponseType = defaultSuccessfulResponseType;
            }

            const version = getVersion(path);
            const intVersion = parseInt(version.substr(1));

            const method: Method = {
                path: path,
                pathFormatString: path.replace(/{/g, '${parameters.'),
                className: opts.className,
                methodName:  op.operationId ? normalizeName(op.operationId) : getPathToMethodName(opts, m, path),
                version: version,
                intVersion: intVersion,
                method: M,
                isGET: M === 'GET',
                isPOST: M === 'POST',
                summary: op.description || op.summary,
                externalDocs: op.externalDocs,
                isSecure: swagger.security !== undefined || op.security !== undefined,
                isSecureToken: secureTypes.indexOf('oauth2') !== -1,
                isSecureApiKey: secureTypes.indexOf('apiKey') !== -1,
                isSecureBasic: secureTypes.indexOf('basic') !== -1,
                parameters: [],
                headers: [],
                successfulResponseType,
                successfulResponseTypeIsRef,
                isLatestVersion: false,
            };

            latestMethodVersion[method.methodName] = Math.max(latestMethodVersion[method.methodName] || 0, intVersion);

            if(method.isSecure && method.isSecureToken) {
                data.isSecureToken = method.isSecureToken;
            }

            if(method.isSecure && method.isSecureApiKey) {
                data.isSecureApiKey = method.isSecureApiKey;
            }

            if(method.isSecure && method.isSecureBasic) {
                data.isSecureBasic = method.isSecureBasic;
            }

            const produces = op.produces || swagger.produces;
            if(produces) {
                method.headers.push({
                  name: 'Accept',
                  value: `'${produces.join(', ')}'`,
                });
            }

            const consumes = op.consumes || swagger.consumes;
            if(consumes) {
                const preferredContentType = consumes[0] || '';
                method.headers.push({name: 'Content-Type', value: `'${preferredContentType}'`});
            }

            let params = [];
            if(isArray(op.parameters)) {
                params = op.parameters;
            }

            params = params.concat(globalParams);
            forEach(params, (parameter) => {
                //Ignore parameters which contain the x-exclude-from-bindings extension
                if(parameter['x-exclude-from-bindings'] === true) {
                    return;
                }

                // Ignore headers which are injected by proxies & app servers
                // eg: https://cloud.google.com/appengine/docs/go/requests#Go_Request_headers
                if (parameter['x-proxy-header']) {
                    return;
                }

                if (isString(parameter.$ref)) {
                    const segments = parameter.$ref.split('/');
                    parameter = swagger.parameters[segments.length === 1 ? segments[0] : segments[2] ];
                }

                parameter.camelCaseName = camelCase(parameter.name);

                if(parameter.enum && parameter.enum.length === 1) {
                    parameter.isSingleton = true;
                    parameter.singleton = parameter.enum[0];
                }

                if(parameter.in === 'body'){
                    parameter.isBodyParameter = true;
                } else if(parameter.in === 'path'){
                    parameter.isPathParameter = true;
                } else if(parameter.in === 'query'){
                    if(parameter['x-name-pattern']){
                        parameter.isPatternType = true;
                        parameter.pattern = parameter['x-name-pattern'];
                    }
                    parameter.isQueryParameter = true;
                } else if(parameter.in === 'header'){
                    parameter.isHeaderParameter = true;
                } else if(parameter.in === 'formData'){
                    parameter.isFormParameter = true;
                }
                parameter.tsType = convertType(parameter, swagger);
                parameter.cardinality = parameter.required ? '' : '?';
                method.parameters.push(parameter);
            });

            data.methods.push(method);
        });
    });

    forEach(data.methods, function(method){
        method.isLatestVersion = (method.intVersion === latestMethodVersion[method.methodName]);
    });

    forEach(swagger.definitions, function(definition, name){
        data.definitions.push({
            name: name,
            description: definition.description,
            tsType: convertType(definition, swagger)
        });
    });

    return data;
};
