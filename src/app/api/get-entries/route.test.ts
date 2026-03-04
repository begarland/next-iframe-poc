const mockGetEntries = jest.fn();

jest.mock("contentful", () => ({
  createClient: jest.fn(() => ({
    getEntries: mockGetEntries,
  })),
}));

import { GET } from "./route";

beforeEach(() => {
  mockGetEntries.mockReset();
});

describe("GET /api/get-entries", () => {
  it("calls getEntries with content_type: item", async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });
    await GET();
    expect(mockGetEntries).toHaveBeenCalledWith({ content_type: "item" });
  });

  it("returns the entries collection as JSON", async () => {
    const mockEntries = {
      items: [
        {
          sys: { id: "entry-1", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
          fields: { title: "First Entry", description: "Desc", productId: "4" },
        },
      ],
      total: 1,
    };
    mockGetEntries.mockResolvedValueOnce(mockEntries);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual(mockEntries);
  });

  it("returns an empty items array when there are no entries", async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [], total: 0 });

    const response = await GET();
    const data = await response.json();

    expect(data.items).toHaveLength(0);
  });
});
