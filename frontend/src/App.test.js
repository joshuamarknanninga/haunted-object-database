import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Haunted Map header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Haunted Objects and Places Map/i);
  expect(headerElement).toBeInTheDocument();
});
