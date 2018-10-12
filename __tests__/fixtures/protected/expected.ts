import * as request from "superagent";
import {
    SuperAgentStatic
} from "superagent";

type CallbackHandler = (err: any, res ? : request.Response) => void;
type Authentication = {
    'token_type' ? : "bearer"

    'expiration_date' ? : {}

    'access_token' ? : string

    'refresh_token' ? : string

    'project_tokens' ? : {}

};
type Error = {
    'code' ? : string

    'message' ? : string

    'description' ? : string

    'module' ? : string

    'line-number' ? : string

    'column-number' ? : string

};

type Logger = {
    log: (line: string) => any
};

/**
 * 
 * @class ProtectedApi
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export default class ProtectedApi {

    private domain: string = "http://portal.28.io/api";
    private errorHandlers: CallbackHandler[] = [];

    constructor(domain ? : string, private logger ? : Logger) {
        if (domain) {
            this.domain = domain;
        }
    }

    getDomain() {
        return this.domain;
    }

    addErrorHandler(handler: CallbackHandler) {
        this.errorHandlers.push(handler);
    }

    private request(method: string, url: string, body: any, headers: any, queryParameters: any, form: any, reject: CallbackHandler, resolve: CallbackHandler) {
        if (this.logger) {
            this.logger.log(`Call ${method} ${url}`);
        }

        let req = (request as SuperAgentStatic)(method, url).query(queryParameters);

        Object.keys(headers).forEach(key => {
            req.set(key, headers[key]);
        });

        if (body) {
            req.send(body);
        }

        if (typeof(body) === 'object' && !(body.constructor.name === 'Buffer')) {
            req.set('Content-Type', 'application/json');
        }

        if (Object.keys(form).length > 0) {
            req.type('form');
            req.send(form);
        }

        req.end((error, response) => {
            if (error || !response.ok) {
                reject(error);
                this.errorHandlers.forEach(handler => handler(error));
            } else {
                resolve(response);
            }
        });
    }

    authURL(parameters: {
        'grantType': "client_credentials" | "refresh_token",
        'email' ? : string,
        'password' ? : string,
        'refreshToken' ? : string,
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/auth';
        if (parameters['grantType'] !== undefined) {
            queryParameters['grant_type'] = parameters['grantType'];
        }

        if (parameters['email'] !== undefined) {
            queryParameters['email'] = parameters['email'];
        }

        if (parameters['password'] !== undefined) {
            queryParameters['password'] = parameters['password'];
        }

        if (parameters['refreshToken'] !== undefined) {
            queryParameters['refresh_token'] = parameters['refreshToken'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        queryParameters = {};

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Get token
     * @method
     * @name ProtectedApi#auth
     * @param {string} grantType - Authorization grant type. Use <code>client_credentials</code> to create a token or <code>refresh_token</code> to refresh a token
     * @param {string} email - The account email. Mandatory if <code>grant_type=client_credentials</code>.
     * @param {string} password - The account password. Mandatory if <code>grant_type=client_credentials</code>.
     * @param {string} refreshToken - The <code>refresh_token</code> obtained in the last successful request to this endpoint.  Mandatory if <code>grant_type=refresh_token</code>.
     */
    auth(parameters: {
        'grantType': "client_credentials" | "refresh_token",
        'email' ? : string,
        'password' ? : string,
        'refreshToken' ? : string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/auth';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise((resolve, reject) => {

            if (parameters['grantType'] !== undefined) {
                queryParameters['grant_type'] = parameters['grantType'];
            }

            if (parameters['grantType'] === undefined) {
                reject(new Error('Missing required  parameter: grantType'));
                return;
            }

            if (parameters['email'] !== undefined) {
                queryParameters['email'] = parameters['email'];
            }

            if (parameters['password'] !== undefined) {
                queryParameters['password'] = parameters['password'];
            }

            if (parameters['refreshToken'] !== undefined) {
                queryParameters['refresh_token'] = parameters['refreshToken'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                });
            }

            form = queryParameters;
            queryParameters = {};

            this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve);
        });
    }

    getSecureURL(parameters: {
        'token' ? : string,
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/project';
        if (parameters['token'] !== undefined) {
            queryParameters['token'] = parameters['token'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Get secure
     * @method
     * @name ProtectedApi#getSecure
     * @param {string} token - Auth token
     */
    getSecure(parameters: {
        'token' ? : string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/project';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise((resolve, reject) => {

            if (parameters['token'] !== undefined) {
                queryParameters['token'] = parameters['token'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                });
            }

            this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
        });
    }

}