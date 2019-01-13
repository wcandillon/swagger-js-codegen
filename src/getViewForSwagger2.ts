// TODO: This file needs some love <3
import {
    transform,
    forEach,
    camelCase,
    merge,
    map,
    entries,
    first,
    identity
} from 'lodash';
import * as fp from 'lodash/fp';
import { convertType } from './typescript';
import { CodeGenOptions } from './options/options';
import { TypeSpec } from './typespec';
import { SwaggerType, Swagger, HttpOperation, Parameter } from './swagger/Swagger';
import { TypeSpecParameter, makeTypeSpecTypeParameter } from './view-data/Parameter';

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
    parameters: TypeSpecParameter[];
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

// interface LatestMethodVersion {
//     [index: string]: number;
// }

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

const getVersion = (path: string): string => {
    const version = versionRegEx.exec(path);
    // TODO: This only supports versions until v9, v10 will return 1?
    return (version && version[1]) || 'v0';
};

const groupMethodsByMethodName = (methods: Method[]): Method[][] => fp.values(fp.groupBy('methodName', methods));
const sortByVersion = (methods: Method[]): Method[] => fp.sortBy('intVersion', methods);
const pickLast = (methods: Method[]): Method | undefined => methods[methods.length - 1];
const isNotUndefined = (method: Method | undefined): method is Method => !fp.isUndefined(method);

const getValuesFromList = fp.filter(isNotUndefined);

const getLatestVersionOfMethod = fp.map(fp.compose(pickLast, sortByVersion));
const getLatestVersionOfMethods = fp.compose(
    fp.compose(getValuesFromList, getLatestVersionOfMethod),
    groupMethodsByMethodName,
);

export function getViewForSwagger2(opts: CodeGenOptions): ViewData{
    const swagger = opts.swagger;
    
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

    makeMethodsFromPaths(data, opts, swagger);

    const latestVersionsOfMethods = getLatestVersionOfMethods(data.methods);

    latestVersionsOfMethods.forEach((method: Method) => {
        method.isLatestVersion = true;
    });

    data.definitions = makeDefinitionsFromSwaggerDefinitions(swagger.definitions, swagger);

    return {
        ...data,
    };
};

function makeDefinitionsFromSwaggerDefinitions(swaggerDefinitions: { [index: string]: SwaggerType }, swagger: Swagger): Definition[] {
    return map(entries(swaggerDefinitions), ([name, swaggerDefinition]) => ({
        name,
        description: swaggerDefinition.description,
        tsType: convertType(swaggerDefinition, swagger)
    })); 
}

const isParameters = (value: [string, HttpOperation | ReadonlyArray<ReadonlyArray<Parameter>>]): value is [string, ReadonlyArray<ReadonlyArray<Parameter>>] => value[0].toLowerCase() === 'parameters';

const getGlobalParams = <T>(api: { [index: string]: HttpOperation | ReadonlyArray<ReadonlyArray<T>>}): ReadonlyArray<T> => fp.compose(
    fp.filter<T>(identity),
    fp.map(([_, value]) => first(value)),
    fp.filter(isParameters),
    fp.entries
)(api);

const authorizedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'COPY', 'HEAD', 'OPTIONS', 'LINK', 'UNLINK', 'PURGE', 'LOCK', 'UNLOCK', 'PROPFIND'];
const isAuthorizedMethod = (method: string) => authorizedMethods.indexOf(method.toUpperCase()) > -1 

function getIntVersion(path: string): number {
    return parseInt(getVersion(path).substr(1));
}

function makeMethod(path: string, opts: CodeGenOptions, swagger: Swagger, httpVerb: string, op: HttpOperation, secureTypes: string[]): Method {
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

    return {
        path: path,
        pathFormatString: path.replace(/{/g, '${parameters.'),
        className: opts.className,
        methodName:  op.operationId ? normalizeName(op.operationId) : getPathToMethodName(opts, httpVerb, path),
        version: getVersion(path),
        intVersion: getIntVersion(path),
        method: httpVerb.toUpperCase(),
        isGET: httpVerb.toUpperCase() === 'GET',
        isPOST: httpVerb.toUpperCase() === 'POST',
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
}

//Ignore parameters which contain the x-exclude-from-bindings extension
const isExcludeFromBindingHeader = (parameter: Parameter) => parameter['x-exclude-from-bindings'] === true;

// Ignore headers which are injected by proxies & app servers
// eg: https://cloud.google.com/appengine/docs/go/requests#Go_Request_headers
const isProxyHeader = (parameter: Parameter) => parameter['x-exclude-from-bindings'] === true;

const isNotParameterToBeIgnored = (parameter: Parameter) => !isExcludeFromBindingHeader(parameter) && !isProxyHeader(parameter);

// TODO: Remove any
const getParams = (globalParams: ReadonlyArray<any>, params: any = []): TypeSpecParameter[] => params.concat(globalParams)
        .filter(isNotParameterToBeIgnored);

function makeMethodsFromPaths(data: ViewData, opts: CodeGenOptions, swagger: Swagger) {
    // const latestMethodVersion: LatestMethodVersion = {}; /* Maps method name => max version */

    forEach(swagger.paths, function(api, path){
        const globalParams = getGlobalParams(api);

        forEach(api, function (op, httpVerb){
            if(!isAuthorizedMethod(httpVerb)) {
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


            const method: Method = makeMethod(path, opts, swagger, httpVerb, op, secureTypes);

            // latestMethodVersion[method.methodName] = Math.max(latestMethodVersion[method.methodName] || 0, getIntVersion(path));

            // TODO: It seems the if statements below are pretty weird... 
            // This runs in a for loop which is run for every "method"
            // in every "api" but we modify the parameter passed in to the
            // function, therefore changing the global state by setting it to
            // the last api + method combination?
            // No test covers this scenario at the moment.
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

            const params = getParams(globalParams, op.parameters);

            forEach(params, (parameter: Parameter) => {
                let typeSpecParameter = makeTypeSpecTypeParameter(parameter, swagger);

                if(parameter.enum && parameter.enum.length === 1) {
                    typeSpecParameter.isSingleton = true;
                    typeSpecParameter.singleton = parameter.enum[0];
                }

                method.parameters.push(typeSpecParameter);
            });

            data.methods.push(method);
        });
    });
}
