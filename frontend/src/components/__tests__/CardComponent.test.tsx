import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardComponent from '../CardComponent';

describe('CardComponent', () => {
  const mockCard = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  };

  it('should render card with user information', () => {
    render(<CardComponent card={mockCard} />);
    
    expect(screen.getByText('ID: 1')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(<CardComponent card={mockCard} />);
    
    const cardDiv = container.firstChild;
    expect(cardDiv).toHaveClass('bg-white', 'shadow-lg', 'rounded-lg', 'p-2', 'mb-2', 'hover:bg-gray-100');
  });

  it('should render ID with correct styling', () => {
    render(<CardComponent card={mockCard} />);
    
    const idElement = screen.getByText('ID: 1');
    expect(idElement).toHaveClass('text-sm', 'text-gray-600');
  });

  it('should render name with correct styling', () => {
    render(<CardComponent card={mockCard} />);
    
    const nameElement = screen.getByText('John Doe');
    expect(nameElement).toHaveClass('text-lg', 'font-semibold', 'text-gray-800');
  });

  it('should render email with correct styling', () => {
    render(<CardComponent card={mockCard} />);
    
    const emailElement = screen.getByText('john@example.com');
    expect(emailElement).toHaveClass('text-md', 'text-gray-700');
  });

  it('should handle different user data', () => {
    const differentCard = {
      id: 999,
      name: 'Jane Smith',
      email: 'jane.smith@test.com'
    };

    render(<CardComponent card={differentCard} />);
    
    expect(screen.getByText('ID: 999')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@test.com')).toBeInTheDocument();
  });
});