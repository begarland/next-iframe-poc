import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import ContentfulForm from "./ContentfulForm";

it("resets the form after submit", async () => {
  const user = userEvent.setup();
  render(<ContentfulForm />);

  const englishTitle = screen.getByPlaceholderText(
    "Enter English title"
  );

  const frenchTitle = screen.getByPlaceholderText(
    "Entrez le titre français"
  );

  const englishDescription = screen.getByPlaceholderText(
    "Enter English description"
  );

  const frenchDescription = screen.getByPlaceholderText(
    "Entrez la description française"
  );

  await user.type(englishTitle, "Hello");
  await user.type(frenchTitle, "Bonjour");
  await user.type(englishDescription, "This works!");
  await user.type(frenchDescription, "Ça marche!");

  await user.click(
    screen.getByRole("button", { name: /save entry/i })
  );

  expect(englishTitle).toHaveValue("");
  expect(frenchTitle).toHaveValue("");
});