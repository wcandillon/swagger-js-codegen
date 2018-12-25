"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const options_1 = require("./options/options");
const getViewForSwagger2_1 = require("./getViewForSwagger2");
const transformToCodeWithMustache_1 = require("./transform/transformToCodeWithMustache");
const enhance_1 = require("./enhance");
function getCode(opts) {
    verifyThatWeAreGeneratingForSwagger2(opts);
    const data = getViewForSwagger2_1.getViewForSwagger2(opts);
    return transformToCodeWithMustache_1.transformToCodeWithMustache(data, opts.template, opts.mustache);
}
;
exports.CodeGen = {
    transformToViewData: getViewForSwagger2_1.getViewForSwagger2,
    transformToCodeWithMustache: transformToCodeWithMustache_1.transformToCodeWithMustache,
    getTypescriptCode: function (opts) {
        const options = options_1.makeOptions(opts);
        return enhance_1.enhanceCode(getCode(options), options, 'typescript');
    },
    getCustomCode: function (opts) {
        verifyThatWeHaveRequiredTemplatesForCustomGenerationTarget(opts);
        const options = options_1.makeOptions(opts);
        return enhance_1.enhanceCode(getCode(options), options, 'custom');
    }
};
function verifyThatWeHaveRequiredTemplatesForCustomGenerationTarget(opts) {
    // TODO: Why do we not check for the existence of the type template?
    if (!opts.template || !_.isObject(opts.template) || !_.isString(opts.template.class) || !_.isString(opts.template.method)) {
        throw new Error('Unprovided custom template. Please use the following template: template: { class: "...", method: "...", request: "..." }');
    }
}
function verifyThatWeAreGeneratingForSwagger2(opts) {
    if (opts.swagger.swagger !== '2.0') {
        throw new Error('Only Swagger 2 specs are supported');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWdlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2RlZ2VuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNEJBQTRCO0FBQzVCLCtDQUF3RjtBQUN4Riw2REFBMEQ7QUFDMUQseUZBQXNGO0FBQ3RGLHVDQUF3QztBQUV4QyxTQUFTLE9BQU8sQ0FBQyxJQUFvQjtJQUNqQyxvQ0FBb0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUUzQyxNQUFNLElBQUksR0FBRyx1Q0FBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QyxPQUFPLHlEQUEyQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzRSxDQUFDO0FBQUEsQ0FBQztBQUdXLFFBQUEsT0FBTyxHQUFHO0lBQ25CLG1CQUFtQixFQUFFLHVDQUFrQjtJQUN2QywyQkFBMkIsRUFBM0IseURBQTJCO0lBQzNCLGlCQUFpQixFQUFFLFVBQVMsSUFBNEI7UUFDcEQsTUFBTSxPQUFPLEdBQUcscUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsQyxPQUFPLHFCQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBQ0QsYUFBYSxFQUFFLFVBQVMsSUFBNEI7UUFDaEQsMERBQTBELENBQUMsSUFBSSxDQUFDLENBQUM7UUFFakUsTUFBTSxPQUFPLEdBQUcscUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsQyxPQUFPLHFCQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1RCxDQUFDO0NBQ0osQ0FBQztBQUVGLFNBQVMsMERBQTBELENBQUMsSUFBNEI7SUFDNUYsb0VBQW9FO0lBQ3BFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDeEgsTUFBTSxJQUFJLEtBQUssQ0FBQywwSEFBMEgsQ0FBQyxDQUFDO0tBQy9JO0FBQ0wsQ0FBQztBQUVELFNBQVMsb0NBQW9DLENBQUMsSUFBb0I7SUFDOUQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sS0FBSyxLQUFLLEVBQUU7UUFDaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0tBQ3pEO0FBQ0wsQ0FBQyJ9