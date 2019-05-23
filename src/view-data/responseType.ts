import { convertType, convertTypes } from "../typescript";
import { HttpOperation, Swagger, SwaggerType } from "../swagger/Swagger";
import { values, uniq } from "lodash/fp";
import { TypeSpec } from "../typespec";

const defaultResponseType = "void";

/**
 * Converts a swagger schema HttpOperation's response types to a pipe delimitered union type string.
 *
 * @param {HttpOperation} op - A Swagger HttpOperation
 * @param {Swagger} swagger - A Swagger schema
 * @returns {string} A string containing a pipe delimitered union type string.
 */
export const getResponseTypes = (
  httpOperation: HttpOperation,
  swagger: Swagger
): string =>
  uniq(
    typeSpecsToStrings(convertTypes(responseTypes(httpOperation), swagger))
  ).join(" | ");

/**
 * Extracts the response body types from a HttpOperation.
 *
 * @param {HttpOperation} httpOperation - The HttpOperation.
 * @returns {SwaggerType[]} The response body types.
 */
const responseTypes = (httpOperation: HttpOperation): SwaggerType[] =>
  values(httpOperation.responses);

/**
 * Converts a TypeSpec to string representation.
 *
 * @param {TypeSpec} typeSpec - A TypeSpec
 * @returns {string} A string
 */
const typeSpecToString = (typeSpec: TypeSpec): string =>
  typeSpec.target || typeSpec.tsType || defaultResponseType;

/**
 * Converts an array of TypeSpec to an array of string representations.
 *
 * @param {TypeSpec[]} typeSpecs - A TypeSpec array
 * @returns {string[]} A string array
 */
const typeSpecsToStrings = (typeSpecs: TypeSpec[]): string[] =>
  typeSpecs.map(typeSpecToString);

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
