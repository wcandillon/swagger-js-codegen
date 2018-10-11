import * as request from "superagent";
import {
    SuperAgentStatic
} from "superagent";

type CallbackHandler = (err: any, res ? : request.Response) => void;
type xany = {};
type ObjectID = string;
type User = {
    'username' ? : string

    'id' ? : number

};

type Logger = {
    log: (line: string) => any
};

/**
 * 
 * @class TestApi
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export default class TestApi {

    private domain: string = "";
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

    User_exists__head_Users__id_URL(parameters: {
        'id': string,
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/Users/{id}';

        path = path.replace('{id}', `${parameters['id']}`);

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Check whether a model instance exists in the data source.
     * @method
     * @see {@link https://example.atlassian.net/wiki/pages/example|More info on the WIKI}
     * @name TestApi#User_exists__head_Users__id_
     * @param {string} id - Model id
     */
    User_exists__head_Users__id_(parameters: {
        'id': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/Users/{id}';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json, application/xml, text/xml, application/javascript, text/javascript';
            headers['Content-Type'] = 'application/json,application/x-www-form-urlencoded,application/xml,text/xml';

            path = path.replace('{id}', `${parameters['id']}`);

            if (parameters['id'] === undefined) {
                reject(new Error('Missing required  parameter: id'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                });
            }

            this.request('HEAD', domain + path, body, headers, queryParameters, form, reject, resolve);
        });
    }

}