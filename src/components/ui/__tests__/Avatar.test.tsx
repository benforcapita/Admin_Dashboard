import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders user initials when no image provided', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders image when src is provided', () => {
    render(<Avatar name="John Doe" src="https://example.com/avatar.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveAttribute('alt', 'John Doe');
  });

  it('applies correct size classes', () => {
    render(<Avatar name="John Doe" size="lg" />);
    expect(screen.getByText('JD')).toHaveClass('w-12', 'h-12', 'text-lg');
  });

  it('handles single name correctly', () => {
    render(<Avatar name="Madonna" />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });
});