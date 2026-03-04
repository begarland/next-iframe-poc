import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContentfulTable from "./ContentfulTable";

const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

jest.mock("@/app/contexts/ProductContext", () => ({
  useProduct: () => ({ productId: "4" }),
}));

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const ENTRY = {
  sys: {
    id: "entry-1",
    createdAt: "2026-01-12T18:37:03.950Z",
    updatedAt: "2026-01-12T21:10:30.012Z",
  },
  fields: { title: "Test Entry", description: "A description", productId: "4" },
};

const ENTRY_OTHER_PRODUCT = {
  sys: {
    id: "entry-2",
    createdAt: "2026-02-19T06:04:51.080Z",
    updatedAt: "2026-02-19T06:04:51.080Z",
  },
  fields: { title: "Other Product Entry", description: "Wrong product", productId: "99" },
};

const mockData = {
  data: {
    publishedData: { items: [] },
    previewData: { items: [ENTRY, ENTRY_OTHER_PRODUCT] },
  },
};

const mockEntryDetail = {
  fields: {
    title: {
      "en-US": "English Title",
      "fr-CA": "Titre Français",
      "es-MX": "Título Español",
    },
    description: {
      "en-US": "English Desc",
      "fr-CA": "Desc Française",
      "es-MX": "Desc Español",
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockResolvedValue({
    json: () => Promise.resolve(mockEntryDetail),
  });
});

describe("ContentfulTable", () => {
  describe("Table view", () => {
    it('renders the "Content Entries" heading', () => {
      render(<ContentfulTable {...mockData} />);
      expect(
        screen.getByRole("heading", { name: /content entries/i })
      ).toBeInTheDocument();
    });

    it("renders the delay hint text", () => {
      render(<ContentfulTable {...mockData} />);
      expect(screen.getByText(/changes may take up to 5 mins/i)).toBeInTheDocument();
    });

    it("renders the refresh button", () => {
      render(<ContentfulTable {...mockData} />);
      expect(
        screen.getByRole("button", { name: /refresh data/i })
      ).toBeInTheDocument();
    });

    it("has a tooltip element for the refresh button", () => {
      render(<ContentfulTable {...mockData} />);
      expect(screen.getByRole("tooltip")).toHaveTextContent(/refresh content/i);
    });

    it("renders all four table column headers", () => {
      render(<ContentfulTable {...mockData} />);
      expect(screen.getByRole("columnheader", { name: /title/i })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: /status/i })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: /created/i })).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: /last updated/i })
      ).toBeInTheDocument();
    });

    it("renders only rows matching the current productId", () => {
      render(<ContentfulTable {...mockData} />);
      expect(screen.getByText("Test Entry")).toBeInTheDocument();
      expect(screen.queryByText("Other Product Entry")).not.toBeInTheDocument();
    });

    it("shows a Published status badge for entries", () => {
      render(<ContentfulTable {...mockData} />);
      expect(screen.getByText("Published")).toBeInTheDocument();
    });

    it("renders formatted date strings", () => {
      render(<ContentfulTable {...mockData} />);
      expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0);
    });
  });

  describe("Detail view", () => {
    it('shows "Entry Details" heading after clicking a row', async () => {
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByText("Test Entry"));
      expect(
        await screen.findByRole("heading", { name: /entry details/i })
      ).toBeInTheDocument();
    });

    it("hides the table heading when detail view is active", async () => {
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByText("Test Entry"));
      await screen.findByRole("heading", { name: /entry details/i });
      expect(
        screen.queryByRole("heading", { name: /content entries/i })
      ).not.toBeInTheDocument();
    });

    it("calls fetch with the correct entry URL on row click", async () => {
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByText("Test Entry"));
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/get-entry/entry-1");
      });
    });

    it("shows a loading indicator while fetching", async () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByText("Test Entry"));
      expect(
        await screen.findByText(/loading localized content/i)
      ).toBeInTheDocument();
    });

    it("renders localized content after fetch resolves", async () => {
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByText("Test Entry"));
      expect(await screen.findByText("English Title")).toBeInTheDocument();
    });

    it("renders all three locale tabs in the detail view", async () => {
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByText("Test Entry"));
      await screen.findByText("English Title");
      expect(screen.getByRole("button", { name: /english/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /français/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /español/i })).toBeInTheDocument();
    });

    it("switches locale content when a tab is clicked", async () => {
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByText("Test Entry"));
      await screen.findByText("English Title");
      await user.click(screen.getByRole("button", { name: /français/i }));
      expect(screen.getByText("Titre Français")).toBeInTheDocument();
    });

    it("shows the Spanish locale content when Español tab is clicked", async () => {
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByText("Test Entry"));
      await screen.findByText("English Title");
      await user.click(screen.getByRole("button", { name: /español/i }));
      expect(screen.getByText("Título Español")).toBeInTheDocument();
    });

    it("shows the status badge and Back button in the detail header", async () => {
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByText("Test Entry"));
      await screen.findByRole("heading", { name: /entry details/i });
      expect(screen.getByRole("button", { name: /back to table/i })).toBeInTheDocument();
      expect(screen.getByText("Published")).toBeInTheDocument();
    });

    it("returns to table view when Back button is clicked", async () => {
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByText("Test Entry"));
      await screen.findByText("English Title");
      await user.click(screen.getByRole("button", { name: /back to table/i }));
      expect(
        screen.getByRole("heading", { name: /content entries/i })
      ).toBeInTheDocument();
    });

    it("resets locale to English after navigating back and re-entering detail", async () => {
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);

      await user.click(screen.getByText("Test Entry"));
      await screen.findByText("English Title");
      await user.click(screen.getByRole("button", { name: /français/i }));
      expect(screen.getByText("Titre Français")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /back to table/i }));
      await user.click(screen.getByText("Test Entry"));
      await screen.findByText("English Title");

      expect(screen.queryByText("Titre Français")).not.toBeInTheDocument();
    });

    it("shows Created and Last Updated labels in detail view", async () => {
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByText("Test Entry"));
      await screen.findByText("English Title");
      expect(screen.getByText(/created/i)).toBeInTheDocument();
      expect(screen.getByText(/last updated/i)).toBeInTheDocument();
    });
  });

  describe("Refresh button", () => {
    it("calls router.refresh when clicked in table view", async () => {
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByRole("button", { name: /refresh data/i }));
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("re-fetches the current entry when clicked in detail view", async () => {
      const user = userEvent.setup();
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByText("Test Entry"));
      await screen.findByText("English Title");
      expect(global.fetch).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole("button", { name: /refresh data/i }));
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(global.fetch).toHaveBeenLastCalledWith("/api/get-entry/entry-1");
      });
    });

    it("is disabled while on cooldown after a click", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByRole("button", { name: /refresh data/i }));
      expect(
        screen.getByRole("button", { name: /refresh on cooldown/i })
      ).toBeDisabled();
      jest.useRealTimers();
    });

    it("is re-enabled after the 5-second cooldown expires", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ContentfulTable {...mockData} />);
      await user.click(screen.getByRole("button", { name: /refresh data/i }));
      expect(
        screen.getByRole("button", { name: /refresh on cooldown/i })
      ).toBeDisabled();
      act(() => {
        jest.advanceTimersByTime(5001);
      });
      expect(
        await screen.findByRole("button", { name: /refresh data/i })
      ).not.toBeDisabled();
      jest.useRealTimers();
    });

    it("auto-refreshes the table every 30 seconds", () => {
      jest.useFakeTimers();
      render(<ContentfulTable {...mockData} />);
      act(() => {
        jest.advanceTimersByTime(30001);
      });
      expect(mockRefresh).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });
});
