import "@testing-library/jest-dom";

global.fetch = jest.fn();

// Polyfill Response.json() for jsdom environments (jsdom 20 lacks the Fetch API)
if (!global.Response) {
  class MockResponse {
    private _body: string;
    constructor(body: string) {
      this._body = body;
    }
    async json() {
      return JSON.parse(this._body);
    }
    static json(data: unknown) {
      return new MockResponse(JSON.stringify(data));
    }
  }
  global.Response = MockResponse as unknown as typeof Response;
}
