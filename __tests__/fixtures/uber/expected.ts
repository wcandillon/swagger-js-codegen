import * as request from "superagent";
import {
    SuperAgentStatic
} from "superagent";

type CallbackHandler = (err: any, res ? : request.Response) => void;
type Product = {
    'product_id' ? : string

    'description' ? : string

    'display_name' ? : string

    'capacity' ? : string

    'image' ? : string

};
type PriceEstimate = {
    'product_id' ? : string

    'currency_code' ? : string

    'display_name' ? : string

    'estimate' ? : string

    'low_estimate' ? : number

    'high_estimate' ? : number

    'surge_multiplier' ? : number

};
type Profile = {
    'first_name' ? : string

    'last_name' ? : string

    'email' ? : string

    'picture' ? : string

    'promo_code' ? : string

};
type Activity = {
    'uuid' ? : string

};
type Activities = {
    'offset' ? : number

    'limit' ? : number

    'count' ? : number

    'history' ? : Activity

};
type Error = {
    'code' ? : number

    'message' ? : string

    'fields' ? : string

};

type Logger = {
    log: (line: string) => any
};

/**
 * Move your app forward with the Uber API
 * @class UberApi
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export default class UberApi {

    private domain: string = "https://api.uber.com/v1";
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

    getProductsURL(parameters: {
        'latitude': number,
        'longitude': number,
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/products';
        if (parameters['latitude'] !== undefined) {
            queryParameters['latitude'] = parameters['latitude'];
        }

        if (parameters['longitude'] !== undefined) {
            queryParameters['longitude'] = parameters['longitude'];
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
     * The Products endpoint returns information about the Uber products offered at a given location. The response includes the display name and other details about each product, and lists the products in the proper display order.
     * @method
     * @name UberApi#getProducts
     * @param {number} latitude - Latitude component of location.
     * @param {number} longitude - Longitude component of location.
     */
    getProducts(parameters: {
        'latitude': number,
        'longitude': number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/products';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            if (parameters['latitude'] !== undefined) {
                queryParameters['latitude'] = parameters['latitude'];
            }

            if (parameters['latitude'] === undefined) {
                reject(new Error('Missing required  parameter: latitude'));
                return;
            }

            if (parameters['longitude'] !== undefined) {
                queryParameters['longitude'] = parameters['longitude'];
            }

            if (parameters['longitude'] === undefined) {
                reject(new Error('Missing required  parameter: longitude'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                });
            }

            this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
        });
    }

    getProductsByIdURL(parameters: {
        'id': number,
        'latitude': number,
        'longitude': number,
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/products/{id}';

        path = path.replace('{id}', `${parameters['id']}`);
        if (parameters['latitude'] !== undefined) {
            queryParameters['latitude'] = parameters['latitude'];
        }

        if (parameters['longitude'] !== undefined) {
            queryParameters['longitude'] = parameters['longitude'];
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
     * The Products endpoint returns information about the Uber products offered at a given location. The response includes the display name and other details about each product, and lists the products in the proper display order.
     * @method
     * @name UberApi#getProductsById
     * @param {integer} id - Move your app forward with the Uber API
     * @param {number} latitude - Latitude component of location.
     * @param {number} longitude - Longitude component of location.
     */
    getProductsById(parameters: {
        'id': number,
        'latitude': number,
        'longitude': number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/products/{id}';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            path = path.replace('{id}', `${parameters['id']}`);

            if (parameters['id'] === undefined) {
                reject(new Error('Missing required  parameter: id'));
                return;
            }

            if (parameters['latitude'] !== undefined) {
                queryParameters['latitude'] = parameters['latitude'];
            }

            if (parameters['latitude'] === undefined) {
                reject(new Error('Missing required  parameter: latitude'));
                return;
            }

            if (parameters['longitude'] !== undefined) {
                queryParameters['longitude'] = parameters['longitude'];
            }

            if (parameters['longitude'] === undefined) {
                reject(new Error('Missing required  parameter: longitude'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                });
            }

            this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
        });
    }

    getEstimatesPriceURL(parameters: {
        'startLatitude': number,
        'startLongitude': number,
        'endLatitude': number,
        'endLongitude': number,
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/estimates/price';
        if (parameters['startLatitude'] !== undefined) {
            queryParameters['start_latitude'] = parameters['startLatitude'];
        }

        if (parameters['startLongitude'] !== undefined) {
            queryParameters['start_longitude'] = parameters['startLongitude'];
        }

        if (parameters['endLatitude'] !== undefined) {
            queryParameters['end_latitude'] = parameters['endLatitude'];
        }

        if (parameters['endLongitude'] !== undefined) {
            queryParameters['end_longitude'] = parameters['endLongitude'];
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
     * The Price Estimates endpoint returns an estimated price range for each product offered at a given location. The price estimate is provided as a formatted string with the full price range and the localized currency symbol.<br><br>The response also includes low and high estimates, and the [ISO 4217](http://en.wikipedia.org/wiki/ISO_4217) currency code for situations requiring currency conversion. When surge is active for a particular product, its surge_multiplier will be greater than 1, but the price estimate already factors in this multiplier.
     * @method
     * @name UberApi#getEstimatesPrice
     * @param {number} startLatitude - Latitude component of start location.
     * @param {number} startLongitude - Longitude component of start location.
     * @param {number} endLatitude - Latitude component of end location.
     * @param {number} endLongitude - Longitude component of end location.
     */
    getEstimatesPrice(parameters: {
        'startLatitude': number,
        'startLongitude': number,
        'endLatitude': number,
        'endLongitude': number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/estimates/price';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            if (parameters['startLatitude'] !== undefined) {
                queryParameters['start_latitude'] = parameters['startLatitude'];
            }

            if (parameters['startLatitude'] === undefined) {
                reject(new Error('Missing required  parameter: startLatitude'));
                return;
            }

            if (parameters['startLongitude'] !== undefined) {
                queryParameters['start_longitude'] = parameters['startLongitude'];
            }

            if (parameters['startLongitude'] === undefined) {
                reject(new Error('Missing required  parameter: startLongitude'));
                return;
            }

            if (parameters['endLatitude'] !== undefined) {
                queryParameters['end_latitude'] = parameters['endLatitude'];
            }

            if (parameters['endLatitude'] === undefined) {
                reject(new Error('Missing required  parameter: endLatitude'));
                return;
            }

            if (parameters['endLongitude'] !== undefined) {
                queryParameters['end_longitude'] = parameters['endLongitude'];
            }

            if (parameters['endLongitude'] === undefined) {
                reject(new Error('Missing required  parameter: endLongitude'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                });
            }

            this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
        });
    }

    getEstimatesTimeURL(parameters: {
        'startLatitude': number,
        'startLongitude': number,
        'customerUuid' ? : string,
        'productId' ? : string,
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/estimates/time';
        if (parameters['startLatitude'] !== undefined) {
            queryParameters['start_latitude'] = parameters['startLatitude'];
        }

        if (parameters['startLongitude'] !== undefined) {
            queryParameters['start_longitude'] = parameters['startLongitude'];
        }

        if (parameters['customerUuid'] !== undefined) {
            queryParameters['customer_uuid'] = parameters['customerUuid'];
        }

        if (parameters['productId'] !== undefined) {
            queryParameters['product_id'] = parameters['productId'];
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
     * The Time Estimates endpoint returns ETAs for all products offered at a given location, with the responses expressed as integers in seconds. We recommend that this endpoint be called every minute to provide the most accurate, up-to-date ETAs.
     * @method
     * @name UberApi#getEstimatesTime
     * @param {number} startLatitude - Latitude component of start location.
     * @param {number} startLongitude - Longitude component of start location.
     * @param {string} customerUuid - Unique customer identifier to be used for experience customization.
     * @param {string} productId - Unique identifier representing a specific product for a given latitude & longitude.
     */
    getEstimatesTime(parameters: {
        'startLatitude': number,
        'startLongitude': number,
        'customerUuid' ? : string,
        'productId' ? : string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/estimates/time';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            if (parameters['startLatitude'] !== undefined) {
                queryParameters['start_latitude'] = parameters['startLatitude'];
            }

            if (parameters['startLatitude'] === undefined) {
                reject(new Error('Missing required  parameter: startLatitude'));
                return;
            }

            if (parameters['startLongitude'] !== undefined) {
                queryParameters['start_longitude'] = parameters['startLongitude'];
            }

            if (parameters['startLongitude'] === undefined) {
                reject(new Error('Missing required  parameter: startLongitude'));
                return;
            }

            if (parameters['customerUuid'] !== undefined) {
                queryParameters['customer_uuid'] = parameters['customerUuid'];
            }

            if (parameters['productId'] !== undefined) {
                queryParameters['product_id'] = parameters['productId'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                });
            }

            this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
        });
    }

    getMeURL(parameters: {
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/me';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * The User Profile endpoint returns information about the Uber user that has authorized with the application.
     * @method
     * @name UberApi#getMe
     */
    getMe(parameters: {
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/me';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                });
            }

            this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
        });
    }

    getHistoryURL(parameters: {
        'offset' ? : number,
        'limit' ? : number,
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/history';
        if (parameters['offset'] !== undefined) {
            queryParameters['offset'] = parameters['offset'];
        }

        if (parameters['limit'] !== undefined) {
            queryParameters['limit'] = parameters['limit'];
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
     * The User Activity endpoint returns data about a user's lifetime activity with Uber. The response will include pickup locations and times, dropoff locations and times, the distance of past requests, and information about which products were requested.<br><br>The history array in the response will have a maximum length based on the limit parameter. The response value count may exceed limit, therefore subsequent API requests may be necessary.
     * @method
     * @name UberApi#getHistory
     * @param {integer} offset - Offset the list of returned results by this amount. Default is zero.
     * @param {integer} limit - Number of items to retrieve. Default is 5, maximum is 100.
     */
    getHistory(parameters: {
        'offset' ? : number,
        'limit' ? : number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/history';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            if (parameters['offset'] !== undefined) {
                queryParameters['offset'] = parameters['offset'];
            }

            if (parameters['limit'] !== undefined) {
                queryParameters['limit'] = parameters['limit'];
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