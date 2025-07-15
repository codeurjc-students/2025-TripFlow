import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import IndexPage from "@/pages/Index";
import NotFound from "@/pages/NotFound";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route index element={<IndexPage />} />

        {/* Catch-all route for 404 Not Found */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}