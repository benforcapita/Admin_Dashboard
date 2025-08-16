import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { Plus } from 'lucide-react';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with icon', () => {
    render(<Button icon={Plus}>Add Item</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});