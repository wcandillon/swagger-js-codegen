import { beautifyCode } from "./beautify";

const beautified = `function helloWorld() {
    return 'hello world'
};`;

describe("beautify", (): void => {
  it("returns the beautified code when no beautify param was specified", () => {
    const code = `function helloWorld(){return'hello world'};`;

    expect(beautifyCode(undefined, code)).toBe(beautified);
  });

  it("returns the beautified code when true was specified", () => {
    const code = `function helloWorld(){return'hello world'};`;

    expect(beautifyCode(true, code)).toBe(beautified);
  });

  it("returns the original code when false was specified", () => {
    const code = `function helloWorld(){return'hello world'};`;

    expect(beautifyCode(false, code)).toBe(code);
  });

  it("runs the function that was specified", () => {
    const code = `function helloWorld(){return'hello world'};`;
    const prettify = jest.fn();

    beautifyCode(prettify, code);

    expect(prettify).toBeCalledWith(code);
  });
});
