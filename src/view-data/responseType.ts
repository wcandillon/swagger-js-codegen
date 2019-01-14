import { convertType } from "../typescript";
import { HttpOperation, Swagger } from "../swagger/Swagger";

const defaultSuccessfulResponseType = 'void';

export function getSuccessfulResponseType(op: HttpOperation, swagger: Swagger): [string, boolean] {
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

    return [successfulResponseType, successfulResponseTypeIsRef];
}