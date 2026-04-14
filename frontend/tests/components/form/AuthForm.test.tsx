import AuthForm from "@components/form/AuthForm";
import type { Errors } from "@components/form/AuthForm";
import type { Field } from "@/types/form";

import { render, screen, fireEvent } from "@tests/utils/testUtils";
import { describe, it, expect, vi } from "vitest";
import { NavLink } from "react-router";

describe("AuthForm Component", () => {
  const mockFields: Field[] = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password",
    },
  ];

  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("renders form with fields", () => {
    render(
      <AuthForm
        active="login"
        fields={mockFields}
        buttonLabel="Sign In"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("renders logo button with link to home", () => {
    render(
      <AuthForm
        active="login"
        fields={mockFields}
        buttonLabel="Sign In"
        onSubmit={mockOnSubmit}
      />
    );

    const logoButton = screen.getByRole("link", { name: /TripFlow Logo/i });
    expect(logoButton).toBeInTheDocument();
    expect(logoButton).toHaveAttribute("href", "/");
  });

  it("renders input fields with correct attributes", () => {
    render(
      <AuthForm
        active="login"
        fields={mockFields}
        buttonLabel="Sign In"
        onSubmit={mockOnSubmit}
      />
    );

    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("name", "email");
    expect(emailInput).toHaveAttribute("placeholder", "Enter your email");

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("name", "password");
    expect(passwordInput).toHaveAttribute("placeholder", "Enter your password");
  });

  it("handles input changes correctly", () => {
    render(
      <AuthForm
        active="login"
        fields={mockFields}
        buttonLabel="Sign In"
        onSubmit={mockOnSubmit}
      />
    );

    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("calls onSubmit with form values when submitted", () => {
    render(
      <AuthForm
        active="login"
        fields={mockFields}
        buttonLabel="Sign In"
        onSubmit={mockOnSubmit}
      />
    );

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("renders field errors when provided", () => {
    const errors: Errors = {
      email: "Email is required",
      password: "Password is too short",
    };

    render(
      <AuthForm
        active="login"
        fields={mockFields}
        buttonLabel="Sign In"
        onSubmit={mockOnSubmit}
        errors={errors}
      />
    );

    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is too short")).toBeInTheDocument();
  });

  it("renders global error when provided", () => {
    const errors: Errors = {
      global: "Authentication failed",
    };

    render(
      <AuthForm
        active="login"
        fields={mockFields}
        buttonLabel="Sign In"
        onSubmit={mockOnSubmit}
        errors={errors}
      />
    );

    expect(screen.getByText("Authentication failed")).toBeInTheDocument();
  });


  it("renders offline warning when navigator is offline", () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    render(
      <AuthForm
        active="login"
        fields={mockFields}
        buttonLabel="Sign In"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/Estás desconectado/)).toBeInTheDocument();
  });

  it("does not render offline warning when navigator is online", () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });

    render(
      <AuthForm
        active="login"
        fields={mockFields}
        buttonLabel="Sign In"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.queryByText(/Estás desconectado/)).not.toBeInTheDocument();
  });

  it("renders form as form element", () => {
    const { container } = render(
      <AuthForm
        active="login"
        fields={mockFields}
        buttonLabel="Sign In"
        onSubmit={mockOnSubmit}
      />
    );

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("renders belowSubmit content when provided", () => {
    render(
      <AuthForm
        active="login"
        fields={mockFields}
        buttonLabel="Sign In"
        onSubmit={mockOnSubmit}
        belowSubmit={<NavLink to="/forgot-password">Forgot password</NavLink>}
      />
    );

    expect(screen.getByRole("link", { name: "Forgot password" })).toBeInTheDocument();
  });

  it("renders fields with default text type when type not specified", () => {
    const fieldsWithoutType: Field[] = [
      {
        name: "username",
        label: "Username",
      },
    ];

    render(
      <AuthForm
        active="login"
        fields={fieldsWithoutType}
        buttonLabel="Submit"
        onSubmit={mockOnSubmit}
      />
    );

    const input = screen.getByLabelText("Username");
    expect(input).toHaveAttribute("type", "text");
  });
});
