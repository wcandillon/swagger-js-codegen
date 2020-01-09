import { CodeGenOptions } from "../options/options";
import { Swagger, HttpOperation, Parameter } from "../swagger/Swagger";
import {
  getSuccessfulResponseType,
  renderResponseTypes,
  defaultResponseTypeName
} from "./responseType";
import { getVersion, getIntVersion } from "./version";
import { getParametersForMethod, TypeSpecParameter } from "./parameter";
import { getHeadersForMethod, Header } from "./headers";
import { transform, camelCase } from "lodash";
import { values, groupBy, sortBy, isUndefined, filter, map } from "lodash/fp";
import { compose } from "lodash/fp";

export interface Method {
  readonly methodName: string;
  readonly intVersion: number;
  readonly isLatestVersion: boolean;
  readonly isSecure: boolean;
  readonly isSecureToken: boolean;
  readonly isSecureApiKey: boolean;
  readonly isSecureBasic: boolean;
  readonly path: string;
  readonly pathFormatString: string;
  readonly className: string;
  readonly version: string;
  readonly method: string;
  readonly isGET: boolean;
  readonly isPOST: boolean;
  readonly isDeprecated: boolean;
  readonly summary: string;
  readonly externalDocs: string;
  readonly parameters: TypeSpecParameter[];
  readonly headers: Header[];
  readonly responseTypes: string;

  /** @deprecated use responseTypes instead, this field will be removed in a future version. */
  readonly successfulResponseType: string;
  /** @deprecated use responseTypes instead, this field will be removed in a future version. */
  readonly successfulResponseTypeIsRef: boolean;
}

export function makeMethodName(
  path: string,
  httpVerb: string,
  op: HttpOperation
) {
  return op.operationId
    ? normalizeName(op.operationId)
    : getPathToMethodName(httpVerb, path);
}

export function makeMethod(
  path: string,
  opts: CodeGenOptions,
  swagger: Swagger,
  httpVerb: string,
  op: HttpOperation,
  secureTypes: string[],
  globalParams: ReadonlyArray<Parameter>
): Method {
  const methodName = makeMethodName(path, httpVerb, op);
  const [
    successfulResponseType,
    successfulResponseTypeIsRef
  ] = getSuccessfulResponseType(op, swagger);

  return {
    path,
    pathFormatString: path.replace(/{/g, "${parameters."),
    className: opts.className,
    methodName,
    version: getVersion(path),
    intVersion: getIntVersion(path),
    method: httpVerb.toUpperCase(),
    isGET: httpVerb.toUpperCase() === "GET",
    isPOST: httpVerb.toUpperCase() === "POST",
    isDeprecated: op.deprecated,
    summary: op.description || op.summary,
    externalDocs: op.externalDocs,
    isSecure: swagger.security !== undefined || op.security !== undefined,
    isSecureToken: secureTypes.indexOf("oauth2") !== -1,
    isSecureApiKey: secureTypes.indexOf("apiKey") !== -1,
    isSecureBasic: secureTypes.indexOf("basic") !== -1,
    parameters: getParametersForMethod(globalParams, op.parameters, swagger),
    headers: getHeadersForMethod(op, swagger),
    successfulResponseType,
    successfulResponseTypeIsRef,
    responseTypes: renderResponseTypes(defaultResponseTypeName, op, swagger),
    isLatestVersion: false
  };
}

const charactersToBeReplacedWithUnderscore = /\.|\-|\{|\}/g;

function normalizeName(id: string): string {
  return id.replace(charactersToBeReplacedWithUnderscore, "_");
}

function getPathToMethodName(httpVerb: string, path: string): string {
  // clean url path for requests ending with '/'
  const cleanPath = path.replace(/\/$/, "");

  let segments = cleanPath.split("/").slice(1);
  segments = transform(segments, (result, segment) => {
    if (segment[0] === "{" && segment[segment.length - 1] === "}") {
      segment = `by${segment[1].toUpperCase()}${segment.substring(
        2,
        segment.length - 1
      )}`;
    }
    result.push(segment);
  });

  const result = camelCase(segments.join("-"));
  const lowerCasedHttpVerb = httpVerb.toLowerCase();
  if (result.length > 0) {
    return `${lowerCasedHttpVerb}${result[0].toUpperCase()}${result.substring(
      1
    )}`;
  }

  // handle case when "/" is passed as a path
  return `RootEndpoint_${lowerCasedHttpVerb}`;
}

const groupMethodsByMethodName = (methods: Method[]): Method[][] =>
  values(groupBy("methodName", methods));
const sortByVersion = (methods: Method[]): Method[] =>
  sortBy("intVersion", methods);
const pickLast = (methods: Method[]): Method | undefined =>
  methods[methods.length - 1];
const isNotUndefined = (method: Method | undefined): method is Method =>
  !isUndefined(method);

const getLatestVersionOfMethod = map(
  compose(
    pickLast,
    sortByVersion
  )
);
export const getLatestVersionOfMethods = compose(
  filter(isNotUndefined),
  getLatestVersionOfMethod,
  groupMethodsByMethodName
);
