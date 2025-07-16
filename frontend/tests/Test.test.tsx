import { render, screen } from "@testing-library/react"
import Test from "@components/Test"

test("Renders Test component with input", () => {
  render(<Test input="TripFlow" />)
  expect(screen.getByText("TripFlow")).toBeInTheDocument()
})