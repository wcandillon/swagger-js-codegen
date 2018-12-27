"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("./type-mappers/object");
const reference_1 = require("./type-mappers/reference");
const enum_1 = require("./type-mappers/enum");
const string_1 = require("./type-mappers/string");
const number_1 = require("./type-mappers/number");
const boolean_1 = require("./type-mappers/boolean");
const array_1 = require("./type-mappers/array");
const dictionary_1 = require("./type-mappers/dictionary");
const any_1 = require("./type-mappers/any");
const schema_1 = require("./type-mappers/schema");
/**
 * Recursively converts a swagger type description into a typescript type, i.e., a model for our mustache
 * template.
 *
 * Not all type are currently supported, but they should be straightforward to add.
 *
 * @param swaggerType a swagger type definition, i.e., the right hand side of a swagger type definition.
 * @param swagger the full swagger spec object
 * @returns a recursive structure representing the type, which can be used as a template model.
 */
function convertType(swaggerType, swagger) {
    if (schema_1.isSchema(swaggerType)) {
        return convertType(swaggerType.schema, swagger);
    }
    else if (reference_1.isReference(swaggerType)) {
        return reference_1.makeReferenceTypeSpec(swaggerType);
    }
    else if (enum_1.isEnum(swaggerType)) {
        return enum_1.makeEnumTypeSpec(swaggerType);
    }
    else if (string_1.isString(swaggerType)) {
        return string_1.makeStringTypeSpec(swaggerType);
    }
    else if (number_1.isNumber(swaggerType)) {
        return number_1.makeNumberTypeSpec(swaggerType);
    }
    else if (boolean_1.isBoolean(swaggerType)) {
        return boolean_1.makeBooleanTypeSpec(swaggerType);
    }
    else if (array_1.isArray(swaggerType)) {
        return array_1.makeArrayTypeSpec(swaggerType, swagger);
    }
    else if (dictionary_1.isDictionary(swaggerType)) {
        // case where a it's a Dictionary<string, someType>
        return dictionary_1.makeDictionaryTypeSpec(swaggerType, swagger);
    }
    else if (swaggerType.minItems >= 0 && swaggerType.hasOwnProperty('title') && !swaggerType.$ref) {
        return any_1.makeAnyTypeSpec(swaggerType);
    }
    //remaining types are created as objects
    return object_1.makeObjectTypeSpec(swaggerType, swagger);
}
exports.convertType = convertType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90eXBlc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsa0RBQTJEO0FBQzNELHdEQUE4RTtBQUM5RSw4Q0FBK0Q7QUFFL0Qsa0RBQXFFO0FBQ3JFLGtEQUFxRTtBQUNyRSxvREFBd0U7QUFDeEUsZ0RBQWtFO0FBQ2xFLDBEQUFpRjtBQUNqRiw0Q0FBcUQ7QUFDckQsa0RBQWlEO0FBRWpEOzs7Ozs7Ozs7R0FTRztBQUNILFNBQWdCLFdBQVcsQ0FBQyxXQUF3QixFQUFFLE9BQWdCO0lBQ2xFLElBQUksaUJBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtRQUN2QixPQUFPLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ25EO1NBQ0ksSUFBSSx1QkFBVyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1FBQy9CLE9BQU8saUNBQXFCLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDN0M7U0FDSSxJQUFJLGFBQU0sQ0FBQyxXQUFXLENBQUMsRUFBRTtRQUMxQixPQUFPLHVCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3hDO1NBQ0ksSUFBSSxpQkFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1FBQzVCLE9BQU8sMkJBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDMUM7U0FDSSxJQUFJLGlCQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDNUIsT0FBTywyQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMxQztTQUNJLElBQUksbUJBQVMsQ0FBQyxXQUFXLENBQUMsRUFBRTtRQUM3QixPQUFPLDZCQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQzNDO1NBQ0ksSUFBSSxlQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDM0IsT0FBTyx5QkFBaUIsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDbEQ7U0FDSSxJQUFJLHlCQUFZLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDaEMsbURBQW1EO1FBQ25ELE9BQU8sbUNBQXNCLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3ZEO1NBQ0ksSUFBSSxXQUFXLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxXQUFXLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtRQUM1RixPQUFPLHFCQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDdkM7SUFFQSx3Q0FBd0M7SUFDekMsT0FBTywyQkFBa0IsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDcEQsQ0FBQztBQWhDRCxrQ0FnQ0MifQ==