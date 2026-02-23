import React from "react";
import { render, screen } from "@testing-library/react";
import ContentfulTable from "./ContentfulTable";

jest.mock("@/app/fetches/uploadEntryToContentful", () => ({
  uploadEntryToContentful: jest.fn(),
}));

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockData = {
  data: {
    publishedData: {
      items: [
        {
          sys: {
            id: "published-1",
            createdAt: "2026-01-12T18:37:03.950Z",
            updatedAt: "2026-01-12T21:10:30.012Z",
          },
          fields: {
            title: "Testing 123",
            description: "this description is in English!",
          },
        },
      ],
    },
    previewData: {
      items: [
        {
          sys: {
            id: "draft-1",
            createdAt: "2026-02-19T06:04:51.080Z",
            updatedAt: "2026-02-19T06:04:51.080Z",
          },
          fields: {
            title: "Hello, World!",
            description: "this is working! woohoo!",
          },
        },
        {
          sys: {
            id: "published-1",
            createdAt: "2026-01-12T18:37:03.950Z",
            updatedAt: "2026-01-12T21:10:30.012Z",
          },
          fields: {
            title: "Testing 123",
            description: "this description is in English!",
          },
        },
      ],
    },
  },
};
describe("ContentfulTable", () => {
  it("renders titles correctly", () => {
    render(<ContentfulTable {...mockData} />);

    expect(screen.getByText("Hello, World!")).toBeInTheDocument();
    expect(screen.getByText("Testing 123")).toBeInTheDocument();
  });

  it("displays correct status for draft and published entries", () => {
    render(<ContentfulTable {...mockData} />);

    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("renders created and updated dates", () => {
    render(<ContentfulTable {...mockData} />);

    // We check partial date string because locale formatting may vary
    expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0);
  });

  it("renders correct number of rows (excluding header)", () => {
    render(<ContentfulTable {...mockData} />);

    const rows = screen.getAllByRole("row");

    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3);
  });
});
