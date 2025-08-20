import "bootstrap/dist/css/bootstrap.css";
import 'react-toastify/dist/ReactToastify.css';
import "../src/index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

function createQueryClient() {
  return new QueryClient();
}

const queryClient = createQueryClient();

export const decorators = [
  (Story) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </QueryClientProvider>
  ),
];