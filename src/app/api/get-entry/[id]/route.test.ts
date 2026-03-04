const mockGetEntry = jest.fn();

jest.mock("contentful", () => ({
  createClient: jest.fn(() => ({
    withAllLocales: { getEntry: mockGetEntry },
  })),
}));

import { GET } from "./route";

beforeEach(() => {
  mockGetEntry.mockReset();
});

describe("GET /api/get-entry/[id]", () => {
  it("calls withAllLocales.getEntry with the correct entry id", async () => {
    mockGetEntry.mockResolvedValueOnce({ sys: { id: "entry-123" }, fields: {} });
    await GET({} as Request, { params: Promise.resolve({ id: "entry-123" }) });
    expect(mockGetEntry).toHaveBeenCalledWith("entry-123");
  });

  it("returns the fetched entry as JSON", async () => {
    const mockEntry = {
      sys: { id: "entry-abc" },
      fields: { title: { "en-US": "Hello" } },
    };
    mockGetEntry.mockResolvedValueOnce(mockEntry);

    const response = await GET({} as Request, {
      params: Promise.resolve({ id: "entry-abc" }),
    });
    const data = await response.json();

    expect(data).toEqual(mockEntry);
  });

  it("passes a different id each time", async () => {
    mockGetEntry.mockResolvedValue({ sys: { id: "xyz" }, fields: {} });

    await GET({} as Request, { params: Promise.resolve({ id: "xyz" }) });
    expect(mockGetEntry).toHaveBeenCalledWith("xyz");
  });
});
