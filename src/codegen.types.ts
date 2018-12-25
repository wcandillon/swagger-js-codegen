import { TypeSpec } from './typescript';

export type GenerationTargetType = 'typescript' | 'custom';

export interface Header {

}

export interface Method {
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
    definitions: { name: string; description: string; tsType: TypeSpec}[];
}

export interface LatestMethodVersion {
    [index: string]: number;
}
