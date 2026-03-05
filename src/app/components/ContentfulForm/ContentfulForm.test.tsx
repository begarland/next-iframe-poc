import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import ContentfulForm from "./ContentfulForm";

jest.mock("@/app/fetches/uploadEntryToContentful", () => ({
  uploadEntryToContentful: jest.fn(() => jest.fn()),
}));

jest.mock("@/app/contexts/ProductContext", () => ({
  useProduct: () => ({ productId: "4" }),
}));

describe("ContentfulForm", () => {
  describe("Rendering", () => {
    it("renders the Create Content Entry heading", () => {
      render(<ContentfulForm />);
      expect(
        screen.getByRole("heading", { name: /create content entry/i })
      ).toBeInTheDocument();
    });

    it("renders all three language tabs", () => {
      render(<ContentfulForm />);
      expect(screen.getByRole("button", { name: /english/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /français/i })).toBeInTheDocument();
    });

    it("renders the Save Entry button", () => {
      render(<ContentfulForm />);
      expect(
        screen.getByRole("button", { name: /save entry/i })
      ).toBeInTheDocument();
    });

    it("renders Title and Description labels", () => {
      render(<ContentfulForm />);
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  });

  describe("Tab switching", () => {
    it("defaults to the English tab with English placeholders", () => {
      render(<ContentfulForm />);
      expect(
        screen.getByPlaceholderText("Enter English title")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter English description")
      ).toBeInTheDocument();
    });

    it("shows French placeholders when Français tab is clicked", async () => {
      const user = userEvent.setup();
      render(<ContentfulForm />);
      await user.click(screen.getByRole("button", { name: /français/i }));
      expect(
        screen.getByPlaceholderText("Entrez le titre français")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Entrez la description française")
      ).toBeInTheDocument();
    });

    it("preserves English field value when switching to another tab and back", async () => {
      const user = userEvent.setup();
      render(<ContentfulForm />);

      await user.type(screen.getByPlaceholderText("Enter English title"), "Hello");
      await user.click(screen.getByRole("button", { name: /français/i }));
      await user.click(screen.getByRole("button", { name: /english/i }));

      expect(screen.getByPlaceholderText("Enter English title")).toHaveValue("Hello");
    });

    it("preserves French field value when switching away and back", async () => {
      const user = userEvent.setup();
      render(<ContentfulForm />);

      await user.click(screen.getByRole("button", { name: /français/i }));
      await user.type(screen.getByPlaceholderText("Entrez le titre français"), "Bonjour");
      await user.click(screen.getByRole("button", { name: /français/i }));

      expect(screen.getByPlaceholderText("Entrez le titre français")).toHaveValue("Bonjour");
    });
  });

  describe("Form submission", () => {
    it("calls uploadEntryToContentful on submit", async () => {
      const { uploadEntryToContentful } = jest.requireMock(
        "@/app/fetches/uploadEntryToContentful"
      );
      const user = userEvent.setup();
      render(<ContentfulForm />);

      await user.type(screen.getByPlaceholderText("Enter English title"), "Test Title");
      await user.type(
        screen.getByPlaceholderText("Enter English description"),
        "Test Description"
      );
      await user.click(screen.getByRole("button", { name: /save entry/i }));

      expect(uploadEntryToContentful).toHaveBeenCalled();
    });

    it("resets English fields after submit", async () => {
      const user = userEvent.setup();
      render(<ContentfulForm />);

      await user.type(screen.getByPlaceholderText("Enter English title"), "Hello");
      await user.type(
        screen.getByPlaceholderText("Enter English description"),
        "World"
      );
      await user.click(screen.getByRole("button", { name: /save entry/i }));

      expect(screen.getByPlaceholderText("Enter English title")).toHaveValue("");
      expect(screen.getByPlaceholderText("Enter English description")).toHaveValue("");
    });

    it("resets French fields after submit", async () => {
      const user = userEvent.setup();
      render(<ContentfulForm />);

      await user.click(screen.getByRole("button", { name: /français/i }));
      await user.type(screen.getByPlaceholderText("Entrez le titre français"), "Bonjour");
      await user.type(
        screen.getByPlaceholderText("Entrez la description française"),
        "Une description"
      );
      await user.click(screen.getByRole("button", { name: /save entry/i }));

      expect(screen.getByPlaceholderText("Entrez le titre français")).toHaveValue("");
    });
  });
});
