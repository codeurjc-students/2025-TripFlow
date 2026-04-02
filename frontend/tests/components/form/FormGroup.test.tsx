import FormGroup from "@components/form/FormGroup";

import type { Field } from "@components/form/FormGroup";

import { render, screen, fireEvent } from "@tests/utils/testUtils";
import { describe, it, expect, vi } from "vitest";

const mockField: Field = {
    name: "username",
    label: "Username",
    placeholder: "Enter username",
    type: "text",
    value: "",
    required: true,
};

describe("FormGroup Component", () => {
    it("renders form group", () => {
        const { container } = render(
            <FormGroup field={mockField} handleChange={vi.fn()} />
        );

        expect(container.firstChild).toBeInTheDocument();
    });

    it("renders label with correct text", () => {
        render(<FormGroup field={mockField} handleChange={vi.fn()} />);

        expect(screen.getByText("Username")).toBeInTheDocument();
    });

    it("renders label with htmlFor attribute", () => {
        render(<FormGroup field={mockField} handleChange={vi.fn()} />);

        const label = screen.getByText("Username").closest("label");
        expect(label).toHaveAttribute("for", "username");
    });

    it("renders required indicator when field is required", () => {
        render(<FormGroup field={mockField} handleChange={vi.fn()} />);

        expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("does not render required indicator when field is not required", () => {
        const optionalField = { ...mockField, required: false };
        render(<FormGroup field={optionalField} handleChange={vi.fn()} />);

        expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("renders input with correct name", () => {
        render(<FormGroup field={mockField} handleChange={vi.fn()} />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("name", "username");
    });

    it("renders input with correct id", () => {
        render(<FormGroup field={mockField} handleChange={vi.fn()} />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("id", "username");
    });

    it("renders input with placeholder", () => {
        render(<FormGroup field={mockField} handleChange={vi.fn()} />);

        expect(
            screen.getByPlaceholderText("Enter username")
        ).toBeInTheDocument();
    });

    it("renders input with value", () => {
        const fieldWithValue = { ...mockField, value: "john_doe" };
        render(<FormGroup field={fieldWithValue} handleChange={vi.fn()} />);

        const input = screen.getByRole("textbox") as HTMLInputElement;
        expect(input.value).toBe("john_doe");
    });

    it("calls handleChange when input value changes", () => {
        const mockHandleChange = vi.fn();
        render(<FormGroup field={mockField} handleChange={mockHandleChange} />);

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "new value" } });

        expect(mockHandleChange).toHaveBeenCalledTimes(1);
    });

    it("renders text input by default", () => {
        const fieldWithoutType = { ...mockField, type: undefined };
        render(<FormGroup field={fieldWithoutType} handleChange={vi.fn()} />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("type", "text");
    });

    it("renders email input", () => {
        const emailField: Field = { ...mockField, type: "email" };
        render(<FormGroup field={emailField} handleChange={vi.fn()} />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("type", "email");
    });

    it("renders password input", () => {
        const passwordField: Field = { ...mockField, type: "password" };
        const { container } = render(
            <FormGroup field={passwordField} handleChange={vi.fn()} />
        );

        const input = container.querySelector('input[type="password"]');
        expect(input).toBeInTheDocument();
    });

    it("renders number input with min, max, and step", () => {
        const numberField: Field = {
            ...mockField,
            type: "number",
            min: 0,
            max: 100,
            step: 5,
        };
        const { container } = render(
            <FormGroup field={numberField} handleChange={vi.fn()} />
        );

        const input = container.querySelector('input[type="number"]');
        expect(input).toHaveAttribute("min", "0");
        expect(input).toHaveAttribute("max", "100");
        expect(input).toHaveAttribute("step", "5");
    });

    it("renders textarea", () => {
        const textareaField: Field = { ...mockField, type: "textarea" };
        render(<FormGroup field={textareaField} handleChange={vi.fn()} />);

        const textarea = screen.getByRole("textbox");
        expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("renders date input", () => {
        const dateField: Field = { ...mockField, type: "date" };
        const { container } = render(
            <FormGroup field={dateField} handleChange={vi.fn()} />
        );

        const input = container.querySelector('input[type="date"]');
        expect(input).toBeInTheDocument();
    });

    it("renders time input", () => {
        const timeField: Field = { ...mockField, type: "time" };
        const { container } = render(
            <FormGroup field={timeField} handleChange={vi.fn()} />
        );

        const input = container.querySelector('input[type="time"]');
        expect(input).toBeInTheDocument();
    });

    it("renders icon when provided", () => {
        const fieldWithIcon: Field = {
            ...mockField,
            icon: <span data-testid="icon">👤</span>,
        };
        render(<FormGroup field={fieldWithIcon} handleChange={vi.fn()} />);

        expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("renders error message when errors are provided", () => {
        const errors = { username: "Username is required" };
        render(
            <FormGroup
                field={mockField}
                handleChange={vi.fn()}
                errors={errors}
            />
        );

        expect(screen.getByText("Username is required")).toBeInTheDocument();
    });

    it("does not render error message when no errors", () => {
        render(<FormGroup field={mockField} handleChange={vi.fn()} />);

        const { container } = render(
            <FormGroup field={mockField} handleChange={vi.fn()} />
        );

        const error = container.querySelector('[class*="error"]');
        expect(error).not.toBeInTheDocument();
    });

    it("does not render error for different field", () => {
        const errors = { email: "Email is required" };
        render(
            <FormGroup
                field={mockField}
                handleChange={vi.fn()}
                errors={errors}
            />
        );

        expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
    });

    it("applies fullWidth class when fullWidth prop is true", () => {
        const { container } = render(
            <FormGroup
                field={mockField}
                handleChange={vi.fn()}
                fullWidth={true}
            />
        );

        const fieldDiv = container.firstChild as HTMLElement;
        expect(fieldDiv.className).toMatch(/fullWidth/);
    });

    it("does not apply fullWidth class when fullWidth is false", () => {
        const { container } = render(
            <FormGroup
                field={mockField}
                handleChange={vi.fn()}
                fullWidth={false}
            />
        );

        const fieldDiv = container.firstChild as HTMLElement;
        expect(fieldDiv.className).not.toMatch(/fullWidth/);
    });

    it("handles empty placeholder", () => {
        const fieldWithoutPlaceholder = {
            ...mockField,
            placeholder: undefined,
        };
        render(
            <FormGroup field={fieldWithoutPlaceholder} handleChange={vi.fn()} />
        );

        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("placeholder", "");
    });

    it("renders with numeric value", () => {
        const fieldWithNumber: Field = {
            ...mockField,
            type: "number",
            value: 42,
        };
        const { container } = render(
            <FormGroup field={fieldWithNumber} handleChange={vi.fn()} />
        );

        const input = container.querySelector("input") as HTMLInputElement;
        expect(input.value).toBe("42");
    });

    it("renders custom select for select field", () => {
        const selectField: Field = {
            name: "trip-status",
            label: "Estado",
            type: "select",
            value: "PLANNED",
            options: [
                { value: "DRAFT", label: "Borrador" },
                { value: "PLANNED", label: "Planificado" },
            ],
        };

        render(<FormGroup field={selectField} handleChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: /planificado/i })).toBeInTheDocument();
    });

    it("calls handleChange when selecting custom select option", () => {
        const mockHandleChange = vi.fn();
        const selectField: Field = {
            name: "trip-status",
            label: "Estado",
            type: "select",
            value: "DRAFT",
            options: [
                { value: "DRAFT", label: "Borrador" },
                { value: "PLANNED", label: "Planificado" },
            ],
        };

        render(<FormGroup field={selectField} handleChange={mockHandleChange} />);

        fireEvent.click(screen.getByRole("button", { name: /borrador/i }));
        fireEvent.click(screen.getByRole("menuitem", { name: /planificado/i }));

        expect(mockHandleChange).toHaveBeenCalledTimes(1);
        expect(mockHandleChange.mock.calls[0][0]).toMatchObject({
            target: {
                name: "trip-status",
                value: "PLANNED",
            },
        });
    });
});
