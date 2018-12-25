import { enhanceCode } from './';
import { beautifyCode } from './beautify';
import { lintCode } from './lintCode';

jest.mock('./beautify');
jest.mock('./lintCode');

describe('enhanceCode', () => {
    it('calls beautify with the correct arguments', () => {
        const code = `function helloWorld(){return'hello world'};`;
        
        enhanceCode(code, { beautify: undefined, beautifyOptions: {}, esnext: false, lint: false }, 'typescript');
        
        expect(beautifyCode).toBeCalledWith(undefined, code, {});
    });

    it('calls lintCode with the correct options when lint is set to true', () => {
        const enhanceOptions = {
            beautify: undefined,
            beautifyOptions: {},
            esnext: false,
            lint: true
        };
        const code = `function helloWorld(){return'hello world'};`;
        
        enhanceCode(code, enhanceOptions, 'typescript');
        
        expect(lintCode).toBeCalledWith(enhanceOptions, 'typescript', code);
    });
});
