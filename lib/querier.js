const _ = require('lodash');

const specialKeys = ['Add', 'Create', 'Delete', 'Disable', 'Update', 'Assign', 'Unassign'];

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getPropertiesForMSSQL(params) {
    let inputsJSONParameters = "";
    const variables = [];
    params.forEach((param) => {
        if (param.name) {
            variables.push('@' + param.name);
            if(param.in === 'body') inputsJSONParameters += `${param.name}: ${param.name}.data`;
            else inputsJSONParameters += `${param.name}`;
        }
    });
    return {
        inputs: `{${inputsJSONParameters}}`,
        variables: variables.join(', '),
    }
}

/**
 * Get the required properties for the query
 * @param params {array} - array of the method parameters
 * @returns {object} - { parameters: {string}, questions: {string} }
 */
function getProperties(params) {
    const parameters = [];
    const questions = [];
    params.forEach((param) => {
        if (param.name) {
            if(param.in === 'body')
                parameters.push(param.name + '.data');
            else
                parameters.push(param.name);
        }
        questions.push('?');
    });
    return {
        parameters: parameters.join(', '),
        questions: questions.join(', '),
    }
}

/**
 * Create SQL query for the method
 * @param data {object} - object with definitions & methods
 * @returns {object} - same as data, but with updated methods
 */
function querier(data) {
    try {
        const mutable = _.cloneDeep(data);
        const { methods, definitions } = mutable;

        if (!(methods && methods.length > 0 && definitions && definitions.length > 0)) {
            return new Error('Methods and definitions should not be empty!');
        }

        methods.forEach((method, m) => {
            let special = false;
            specialKeys.forEach((key) => {
                if (method.methodName.includes(key)) {
                    special = true;
                }
            });

            const { inputs, variables } = getPropertiesForMSSQL(method.parameters, special);
            let query ='';
            if(special){
                query = `CALL SP_${method.methodName}(${variables})`;
            } else {
                query = `SELECT FN_${method.methodName}(${variables}) as Response`;
            }

            mutable.methods[m].query = `const results = await dal.query("${query}", { inputs: ${inputs} } , { redis: ${!special} });`;

            /*
            const { parameters, questions } = getProperties(method.parameters, special);
            let query ='';
            if(special){
                query = `CALL SP_${method.methodName}(${questions})`;
            }else{
                query = `SELECT FN_${method.methodName}(${questions}) as Response`;
            }
            mutable.methods[m].query = `const results = await dal.query("${query}", `
                + `[${parameters}], { redis: ${!special} });`;

             */
        });

        return mutable;
    } catch (err) {
        throw new Error(err.message || err);
    }
}

module.exports = querier;
