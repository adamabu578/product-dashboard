# Product Management SPA

This is a single-page application built with React, Vite, and TypeScript. It serves as an operations dashboard for a product catalog, offering comprehensive listing, filtering, and data visualization features.

## Requirements Fullfilled
- **Routing**: `react-router` handles `/products`, `/products/:id`, `/products/new` and a protected `/login` flow.
- **Data Fetching**: Data fetching is handled by `@tanstack/react-query` to provide excellent caching, background refetching, and deduping logic.
- **List Page**:
  - Pagination (page size 10)
  - Text search by product title
  - Filters by category and brand
  - Sorting (Newest, Oldest, Highest ID, Price, Rating, Name)
- **Details Page**: Displays core fields natively (title, description, price, rating, stock, createdAt).
- **Error/Loading States**: thoughtful skeletons and error handling/retry states implemented using Lucide icons.
- **Accessibility**: ARIA labels, semantic HTML (tables, dls), clear keyboard focus.
- **Add Product Form**: Uses `react-hook-form` for complex client-side validation.
- **Charts**: A trend chart displays the number of products by Brand (using Recharts).
- **Auth Mock**: Fake auth via Zustand store that manages a token and protects the `/products` route.
- **Tests**: React Testing Library with Vitest ensuring lists render and filters function optimally.

## Setup & Run Scripts

Ensure you have Node.js 18+ installed.

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```
   *The server will start on http://localhost:5173*
   
   **Demo Credentials for Login:**
   - **Username:** `demo`
   - **Password:** `password`

3. **Run Tests:**
   ```bash
   npm run test
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

## Design Decisions
- **React Query + Fetch API Mock**: React Query acts as the data management layer. To accommodate local/custom JSON data payloads without a real backend, a local interceptor layer was built over the native `fetchJson` function. This provides robust offline pagination, filtering, and sorting without needing complex backend rewrites.
- **Tailwind CSS**: Chosen for rapid utility-first styling ensuring consistency across the app.
- **Zustand**: A very lightweight global state management library is used for managing the Fake Auth token instead of Redux, which would be overkill.
- **React-Hook-Form**: Forms are handled natively with `react-hook-form` reducing re-renders on every keystroke and making validation declarations simpler.

## Trade-offs
- **Mock Data Layer vs Real API**: Since the app relies on a hardcoded JSON block, the add/update/delete mutations are optimistic and don't persist after page reloads.
- **Client-Side Pagination**: Because the mock data layer intercepts the API requests, pagination and sorting are calculated fully on the client for the 30 loaded items rather than via a paginated database cursor.

## Next Steps (With More Time)
- Implement full E2E testing using Cypress or Playwright for critical paths like Auth and Add Product.
- Use `localStorage` or `IndexedDB` in the mock API interceptor to persist newly added products across browser sessions.
- Enhance accessibility by conducting an audit using `axe-core`.
- Include internationalization (`i18next`) for global scale.

## Deployed Preview
This project can be automatically deployed to Vercel or Netlify out-of-the-box.
*Deploying to Vercel:* Simply connect the GitHub repo on Vercel. The `vite build` command will automatically generate the `dist` directory which Vercel will host seamlessly.