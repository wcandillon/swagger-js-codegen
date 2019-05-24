import { convertType } from "../typescript";
import { HttpOperation, Swagger, SwaggerType } from "../swagger/Swagger";
import { uniq, entries } from "lodash/fp";
import { TypeSpec } from "../typespec";

const defaultResponseType = "void";

export const defaultResponseTypeName = "ResponseWithBody";

interface ResponseType<T> {
  statusType: string;
  bodyType: T;
}

/**
 * Renders a swagger schema HttpOperation's response types to a pipe delimitered union type string.
 *
 * @param {string} responseTypeName - The desired response type name. ie "ResponseWithBody"
 * @param {HttpOperation} httpOperation - A Swagger HttpOperation
 * @param {Swagger} swagger - A Swagger schema
 * @returns {string} A string containing a pipe delimitered union type string. "ResponseWithBody<200, ThingBody> | ResponseWithBody<400, ErrorBody>"
 */
export const renderResponseTypes = (
  responseTypeName: string,
  httpOperation: HttpOperation,
  swagger: Swagger
): string =>
  uniq(
    responseTypesToStrings(
      responseTypeName,
      convertResponseTypes(responseTypes(httpOperation), swagger)
    )
  ).join(" | ");

/**
 * Extracts the response types from a HttpOperation.
 *
 * @param {HttpOperation} httpOperation - The HttpOperation.
 * @returns {ResponseType<SwaggerType>[]} The response types.
 */
const responseTypes = (
  httpOperation: HttpOperation
): ResponseType<SwaggerType>[] =>
  entries(httpOperation.responses).map(kvp => ({
    statusType: kvp[0],
    bodyType: kvp[1]
  }));

/**
 *
 * @param {ResponseType<SwaggerType>[]} swaggerTypes
 * @param {Swagger} swagger
 * @returns {ResponseType<TypeSpec>[]}
 */
const convertResponseTypes = (
  swaggerTypes: ResponseType<SwaggerType>[],
  swagger: Swagger
): ResponseType<TypeSpec>[] =>
  swaggerTypes.map(swaggerType => ({
    statusType: swaggerType.statusType,
    bodyType: convertType(swaggerType.bodyType, swagger)
  }));

/**
 *
 * @param {string} responseTypeName
 * @param {ResponseType<TypeSpec>[]} typeSpecs
 */
const responseTypesToStrings = (
  responseTypeName: string,
  typeSpecs: ResponseType<TypeSpec>[]
): string[] => typeSpecs.map(ts => responseTypeToString(responseTypeName, ts));

/**
 *
 * @param {string} responseTypeName
 * @param {ResponseType<TypeSpec>} typeSpec
 * @returns {string}
 */
const responseTypeToString = (
  responseTypeName: string,
  typeSpec: ResponseType<TypeSpec>
): string =>
  `${responseTypeName}<${typeSpec.statusType}, ${typeSpecToString(
    typeSpec.bodyType
  )}>`;

/**
 * Converts a TypeSpec to string representation.
 *
 * @param {TypeSpec} typeSpec - A TypeSpec
 * @returns {string} A string
 */
const typeSpecToString = (typeSpec: TypeSpec): string =>
  typeSpec.target || typeSpec.tsType || defaultResponseType;

// https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#2xx_Success
/** @deprecated use getResponseTypes instead, this function will be removed in a future version. */
const successfulCodes = [
  "200", // OK
  "201", // Created
  "202", // Accepted
  "203", // Non-Authoritative Information
  "204", // No Content
  "205", // Reset Content
  "206", // Partial Content
  "207", // Multi-Status
  "208", // Already Reported
  "226" // IM Used
];

/** @deprecated use getResponseTypes instead, this function will be removed in a future version. */
function onlySuccessful(statusCode: string) {
  return successfulCodes.includes(statusCode);
}

/** @deprecated use getResponseTypes instead, this function will be removed in a future version. */
function getSuccessfulResponse(op: HttpOperation): SwaggerType {
  const definedSuccessCodes = Object.keys(op.responses).filter(onlySuccessful);

  if (definedSuccessCodes.length === 0) {
    throw new Error("No success responses defined");
  }

  return op.responses[definedSuccessCodes[0]];
}

/** @deprecated use getResponseTypes instead, this function will be removed in a future version. */
export function getSuccessfulResponseType(
  op: HttpOperation,
  swagger: Swagger
): [string, boolean] {
  let successfulResponseTypeIsRef = false;
  let successfulResponseType;

  try {
    const successfulResponse = getSuccessfulResponse(op);
    const convertedType = convertType(successfulResponse, swagger);

    if (convertedType.target) {
      successfulResponseTypeIsRef = true;
    }

    successfulResponseType =
      convertedType.target || convertedType.tsType || defaultResponseType;
  } catch (error) {
    successfulResponseType = defaultResponseType;
  }

  return [successfulResponseType, successfulResponseTypeIsRef];
}
