import ResetPasswordPage from "@pages/ResetPassword";
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
  resetPassword: vi.fn(),
}));

vi.mock("@/providers/notificationProvider", () => ({
  useNotification: () => ({
    notify: vi.fn(),
  }),
}));

vi.mock("@/utils/localStorageUtils", () => ({
  saveToLocalStorage: vi.fn(),
  retrieveFromLocalStorage: vi.fn(() => "user@example.com"),
  removeFromLocalStorage: vi.fn(),
}));

import { useNavigate } from "react-router";
import { forgotPassword, resetPassword } from "@/services/authService";
import { retrieveFromLocalStorage } from "@/utils/localStorageUtils";

describe("ResetPasswordPage", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(forgotPassword).mockResolvedValue({ status: "SUCCESS" } as any);
    vi.mocked(resetPassword).mockResolvedValue({ status: "SUCCESS" } as any);
  });

  it("renders reset password fields", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByLabelText("Usuario / Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Nueva contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(7);
  });

  it("validates OTP length", async () => {
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
      target: { value: "Abcd1234" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
      target: { value: "Abcd1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Actualizar contraseña" }));

    await waitFor(() => {
      expect(screen.getByText("El código debe tener 6 dígitos.")).toBeInTheDocument();
    });
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("submits reset data and redirects", async () => {
    render(<ResetPasswordPage />);

    const codeInputs = screen.getAllByRole("textbox").slice(1, 7);
    codeInputs.forEach((input, i) => {
      fireEvent.change(input, { target: { value: `${i + 1}` } });
    });

    fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
      target: { value: "Abcd1234" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
      target: { value: "Abcd1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Actualizar contraseña" }));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith({
        username: "user@example.com",
        code: "123456",
        password: "Abcd1234",
        confirmPassword: "Abcd1234",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("resends code using identifier from input", async () => {
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("Usuario / Email"), {
      target: { value: "another@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Reenviar código" }));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith({ username: "another@example.com" });
    });
  });

  it("redirects to forgot-password when identifier is empty on resend", async () => {
    vi.mocked(retrieveFromLocalStorage).mockReturnValue("");
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("Usuario / Email"), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Reenviar código" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
    });
    expect(forgotPassword).not.toHaveBeenCalled();
  });
});
