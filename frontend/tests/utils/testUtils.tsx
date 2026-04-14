import type { ReactElement } from "react";
import type { RenderOptions } from "@testing-library/react";

import { BrowserRouter } from "react-router";
import { render } from "@testing-library/react";

import { AuthProvider } from "@/providers/authProvider";
import { DemoProvider } from "@/providers/demoProvider";
import { OfflineProvider } from "@/providers/offlineProvider";

// Wrapper component that includes all necessary providers for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <DemoProvider>
      <OfflineProvider>
        <AuthProvider>{children}</AuthProvider>
      </OfflineProvider>
    </DemoProvider>
  </BrowserRouter>
);

// Custom render function that automatically includes the necessary providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: TestWrapper, ...options });

export * from "@testing-library/react";
export { customRender as render };
