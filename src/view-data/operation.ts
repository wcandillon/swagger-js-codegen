import {
  HttpOperation,
  Parameter,
  PathItemObject,
  HttpMethod,
  PathsObjectEntries,
  PathAndMethodTupleWithPathParams,
  PathsObject,
  schemaAllowedHttpMethods
} from "../swagger/Swagger";
import { entries, flatten } from "lodash/fp";

const getPathParameters = (api: PathItemObject): ReadonlyArray<Parameter> =>
  api.parameters || [];

const onlyHttpVerbEntries = (
  httpVerbAndOperation: [string, HttpOperation]
): httpVerbAndOperation is [HttpMethod, HttpOperation] => {
  // Since we're using a type predicate here to assert if the httpVerb is a valid HttpMethod and we want to keep the original
  // schemasAllowedHttpMethods a strongly typed list of HttpMethods we'll cast it here to a list of strings to make
  // sure we can call indexOf on it.
  return (
    (schemaAllowedHttpMethods as string[]).indexOf(httpVerbAndOperation[0]) > -1
  );
};

const addPathAndPathParams = ([
  path,
  api
]: PathsObjectEntries): PathAndMethodTupleWithPathParams[] =>
  entries<HttpOperation>(api)
    .filter(onlyHttpVerbEntries)
    .map(
      ([httpVerb, httpOperationDescription]: [
        HttpMethod,
        HttpOperation
      ]): PathAndMethodTupleWithPathParams => [
        path,
        httpVerb,
        httpOperationDescription,
        getPathParameters(api)
      ]
    );

const operationIsNotDeprecated = ([
  _path,
  _httpVerb,
  op
]: PathAndMethodTupleWithPathParams): boolean => !op.deprecated;

// TODO: This list seems too extensive. Leaving this for now to be backwards compatible, but this check can probably be removed and we can
// leave it up to the schema. This way we are verifying if the schema is valid which seems out of scope.
// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#path-item-object
const authorizedMethods = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "COPY",
  "HEAD",
  "OPTIONS",
  "LINK",
  "UNLINK",
  "PURGE",
  "LOCK",
  "UNLOCK",
  "PROPFIND"
];
export const isAuthorizedMethod = ([
  _path,
  httpVerb
]: PathAndMethodTupleWithPathParams): boolean =>
  authorizedMethods.indexOf(httpVerb.toUpperCase()) > -1;

export const isAuthorizedAndNotDeprecated = (
  httpOperationEntryWithPathParamsAndPath: PathAndMethodTupleWithPathParams
): boolean =>
  operationIsNotDeprecated(httpOperationEntryWithPathParamsAndPath) &&
  isAuthorizedMethod(httpOperationEntryWithPathParamsAndPath);

export const getHttpMethodTuplesFromSwaggerPathsObject = (paths: PathsObject) =>
  flatten(entries(paths).map(addPathAndPathParams));
