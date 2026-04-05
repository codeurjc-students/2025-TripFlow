import AttributionImage from "@components/shared/AttributionImage";

import { render, screen, fireEvent } from "@tests/utils/testUtils";
import { describe, it, expect, vi } from "vitest";

describe("AttributionImage Component", () => {
    const defaultProps = {
        src: "test-image.jpg",
        alt: "Test Image",
        attribution: "Test Author",
        attributionLink: "https://example.com/author",
    };

    it("renders image with correct src and alt", () => {
        render(<AttributionImage {...defaultProps} />);
        const image = screen.getByRole("img");
        expect(image).toHaveAttribute("src", defaultProps.src);
        expect(image).toHaveAttribute("alt", defaultProps.alt);
    });

    it("renders attribution text", () => {
        render(<AttributionImage {...defaultProps} />);
        const element = screen.getByText(defaultProps.attribution);
        expect(element).toBeInTheDocument();
        expect(element.tagName).toBe("SPAN");
    });

    it("opens attribution link in new tab on click", () => {
        const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
        render(<AttributionImage {...defaultProps} />);
        
        const element = screen.getByText(defaultProps.attribution);
        fireEvent.click(element);
        
        expect(openSpy).toHaveBeenCalledWith(
            defaultProps.attributionLink, 
            "_blank", 
            "noopener,noreferrer"
        );
        openSpy.mockRestore();
    });

    it("renders default attribution prefix", () => {
        render(<AttributionImage {...defaultProps} />);
        expect(screen.getByText("Foto de")).toBeInTheDocument();
    });

    it("renders custom attribution prefix", () => {
        render(<AttributionImage {...defaultProps} attributionPrefix="Credit: " />);
        expect(screen.getByText("Credit:")).toBeInTheDocument();
    });

    it("stops propagation when clicking attribution link", () => {
        const handleClick = vi.fn();
        const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

        render(
            <div onClick={handleClick}>
                <AttributionImage {...defaultProps} />
            </div>
        );

        const element = screen.getByText(defaultProps.attribution);
        fireEvent.click(element);
        
        expect(handleClick).not.toHaveBeenCalled();
        expect(openSpy).toHaveBeenCalled();
        
        openSpy.mockRestore();
    });

    it("applies additional class names", () => {
        render(<AttributionImage {...defaultProps} className="custom-class" />);
        const container = screen.getByRole("img").parentElement;
        expect(container).toHaveClass("custom-class");
    });

    it("renders children content", () => {
        render(
            <AttributionImage {...defaultProps}>
                <div data-testid="child-element">Child Content</div>
            </AttributionImage>
        );
        expect(screen.getByTestId("child-element")).toBeInTheDocument();
    });

    it("renders fallback template when image fails to load", () => {
        render(<AttributionImage {...defaultProps} />);

        const image = screen.getByRole("img");
        fireEvent.error(image);

        expect(screen.getByText(/imagen no disponible sin conexión/i)).toBeInTheDocument();
    });
});
