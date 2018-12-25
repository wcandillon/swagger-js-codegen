import { convertType } from './typescript';

describe("convertType", () => {

    it('converts simple swagger type', () => {
        expect(typeof convertType).toBe('function');
    });
});