import { HttpOperation, Swagger } from "../swagger/Swagger";

export interface Header {}

export function getHeadersForMethod(
  op: HttpOperation,
  swagger: Swagger
): Header[] {
  const headers: Header[] = [];
  const produces = op.produces || swagger.produces;

  if (produces) {
    headers.push({
      name: "accept",
      value: `'${produces.join(", ")}'`
    });
  }

  const consumes = op.consumes || swagger.consumes;
  if (consumes) {
    const preferredContentType = consumes[0] || "";
    headers.push({ name: "content-type", value: `'${preferredContentType}'` });
  }

  return headers;
}
