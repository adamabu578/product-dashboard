import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductsPage from "./ProductsPage";
import { mockProductsData } from "../data/mockProducts";
import userEvent from "@testing-library/user-event";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe("ProductsPage", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it("renders the product list", async () => {
    renderWithProviders(<ProductsPage />);
    
    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument();
    
    // Wait for the mock data to load and display the product title
    const titleElement = await screen.findAllByText(/Essence/i);
    expect(titleElement.length).toBeGreaterThan(0);
  });

  it("can interact with the search filter", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    
    const searchInput = screen.getByPlaceholderText(/Search products…/i);
    expect(searchInput).toBeInTheDocument();
    
    await user.type(searchInput, "Essence");
    
    // Because it's controlled state, we can verify the input value changed
    expect(searchInput).toHaveValue("Essence");
  });
});
