import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import ProductsGrid from '../../app/components/ProductsGrid';
import { getProducts } from '../../lib/api';
import { useSearchParams } from 'next/navigation';

// Mock dependencies
jest.mock('isomorphic-dompurify', () => ({
  sanitize: (html: string) => html,
}));

jest.mock('../../lib/api', () => ({
  getProducts: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

describe('ProductsGrid Component', () => {
  beforeEach(() => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });
  });

  it('renders loading state initially', () => {
    (getProducts as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    
    const { container } = render(<ProductsGrid />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders products successfully', async () => {
    const mockProducts = [
      {
        title: 'Test Drone 1',
        shortDescription: 'Short desc 1',
        description: 'Full desc 1',
        images: ['/test1.jpg'],
      },
      {
        title: 'Test Drone 2',
        shortDescription: 'Short desc 2',
        description: 'Full desc 2',
        images: ['/test2.jpg'],
      },
    ];

    (getProducts as jest.Mock).mockResolvedValue(mockProducts);

    render(<ProductsGrid />);

    // Wait for the loading to finish and products to be rendered
    await waitFor(() => {
      expect(screen.getByText('Test Drone 1')).toBeInTheDocument();
      expect(screen.getByText('Test Drone 2')).toBeInTheDocument();
    });
  });

  it('renders error state on API failure', async () => {
    (getProducts as jest.Mock).mockRejectedValue(new Error('API failed'));

    render(<ProductsGrid />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load products. Please try again later.')).toBeInTheDocument();
    });
  });
});
