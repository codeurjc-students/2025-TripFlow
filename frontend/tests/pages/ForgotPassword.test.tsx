import ForgotPasswordPage from "@pages/ForgotPassword";
import { fireEvent, render, screen, waitFor } from "@tests/utils/testUtils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock("@/services/authService", () => ({
  forgotPassword: vi.fn(),
}));

vi.mock("@/utils/localStorageUtils", () => ({
  saveToLocalStorage: vi.fn(),
  retrieveFromLocalStorage: vi.fn(),
  removeFromLocalStorage: vi.fn(),
}));

import { useNavigate } from "react-router";
import { forgotPassword } from "@/services/authService";
import { saveToLocalStorage } from "@/utils/localStorageUtils";
import { STORAGE_KEYS } from "@/constants/storageKeys";

describe("ForgotPasswordPage", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(forgotPassword).mockResolvedValue({ status: "SUCCESS" } as any);
  });

  it("renders forgot password form", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByLabelText("Usuario / Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar código" })).toBeInTheDocument();
  });

  it("shows error for empty identifier", async () => {
    render(<ForgotPasswordPage />);

    fireEvent.click(screen.getByRole("button", { name: "Enviar código" }));

    await waitFor(() => {
      expect(screen.getByText("El usuario o email es obligatorio.")).toBeInTheDocument();
    });

    expect(forgotPassword).not.toHaveBeenCalled();
  });

  it("sends OTP request and redirects to reset page", async () => {
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText("Usuario / Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar código" }));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith({ username: "user@example.com" });
      expect(saveToLocalStorage).toHaveBeenCalledWith(
        STORAGE_KEYS.RESET_PASSWORD_USERNAME,
        "user@example.com"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/reset-password");
    });
  });
});
