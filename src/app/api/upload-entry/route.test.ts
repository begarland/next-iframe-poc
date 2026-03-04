jest.mock("next/server", () => ({
  NextRequest: class {
    private _body: unknown;
    constructor(_input: unknown, init?: { body?: string }) {
      this._body = init?.body ? JSON.parse(init.body) : {};
    }
    json() {
      return Promise.resolve(this._body);
    }
  },
  NextResponse: {
    json: jest.fn((data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    })),
  },
}));

import { POST } from "./route";

const { NextResponse } = jest.requireMock("next/server");

const makeRequest = (body: object) => ({
  json: async () => body,
});

const PAYLOAD = {
  contentId: "item",
  fields: {
    title: { "en-US": "Test Title" },
    description: { "en-US": "Test Description" },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockResolvedValue({
    text: () => Promise.resolve(JSON.stringify({ sys: { id: "new-entry" } })),
  });
});

describe("POST /api/upload-entry", () => {
  it("calls the Contentful Management API with the correct URL", async () => {
    await POST(makeRequest(PAYLOAD) as any);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("contentful.com"),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/spaces/"),
      expect.any(Object)
    );
  });

  it("sends a POST method", async () => {
    await POST(makeRequest(PAYLOAD) as any);
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.method).toBe("POST");
  });

  it("sets the correct Content-Type header", async () => {
    await POST(makeRequest(PAYLOAD) as any);
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.get("Content-Type")).toBe(
      "application/vnd.contentful.management.v1+json"
    );
  });

  it("sets the X-Contentful-Content-Type header from the payload contentId", async () => {
    await POST(makeRequest(PAYLOAD) as any);
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.get("X-Contentful-Content-Type")).toBe("item");
  });

  it("sends only the fields in the request body", async () => {
    await POST(makeRequest(PAYLOAD) as any);
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const sentBody = JSON.parse(options.body);
    expect(sentBody).toEqual({ fields: PAYLOAD.fields });
    expect(sentBody.contentId).toBeUndefined();
  });

  it("returns status 200 on success", async () => {
    const response = await POST(makeRequest(PAYLOAD) as any);
    expect(response.status).toBe(200);
  });

  it("returns status 500 when the upstream fetch throws", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    const response = await POST(makeRequest(PAYLOAD) as any);
    expect(response.status).toBe(500);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.any(Error),
      { status: 500 }
    );
  });
});
