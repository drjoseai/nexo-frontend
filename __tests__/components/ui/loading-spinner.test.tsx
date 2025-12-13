/**
 * Loading Spinner Component Tests
 * @module __tests__/components/ui/loading-spinner.test
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  LoadingSpinner,
  ButtonSpinner,
  PageLoading,
  SkeletonCard,
} from '@/components/ui/loading-spinner';

describe('LoadingSpinner', () => {
  describe('default rendering', () => {
    it('should render spinner with default props', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should have role="status" for accessibility', () => {
      render(<LoadingSpinner />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-label for screen readers', () => {
      render(<LoadingSpinner />);
      
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando');
    });
  });

  describe('size variants', () => {
    it('should render small spinner', () => {
      render(<LoadingSpinner size="sm" />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render medium spinner', () => {
      render(<LoadingSpinner size="md" />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render large spinner', () => {
      render(<LoadingSpinner size="lg" />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render extra large spinner', () => {
      render(<LoadingSpinner size="xl" />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('with text', () => {
    it('should display loading text', () => {
      render(<LoadingSpinner text="Loading data..." />);
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should update aria-label with text', () => {
      render(<LoadingSpinner text="Processing..." />);
      
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Processing...');
    });
  });

  describe('fullScreen mode', () => {
    it('should render fullScreen overlay', () => {
      render(<LoadingSpinner fullScreen />);
      
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });

    it('should contain spinner inside overlay', () => {
      render(<LoadingSpinner fullScreen text="Please wait..." />);
      
      const overlay = screen.getByTestId('loading-overlay');
      const spinner = screen.getByTestId('loading-spinner');
      
      expect(overlay).toContainElement(spinner);
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      render(<LoadingSpinner className="custom-class" />);
      
      expect(screen.getByTestId('loading-spinner')).toHaveClass('custom-class');
    });
  });
});

describe('ButtonSpinner', () => {
  it('should render compact spinner', () => {
    render(<ButtonSpinner />);
    
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
  });

  it('should have aria-hidden for accessibility', () => {
    render(<ButtonSpinner />);
    
    expect(screen.getByTestId('button-spinner')).toHaveAttribute('aria-hidden', 'true');
  });

  it('should apply custom className', () => {
    render(<ButtonSpinner className="ml-2" />);
    
    expect(screen.getByTestId('button-spinner')).toHaveClass('ml-2');
  });
});

describe('PageLoading', () => {
  it('should render page loading state', () => {
    render(<PageLoading />);
    
    expect(screen.getByTestId('page-loading')).toBeInTheDocument();
  });

  it('should display default loading text', () => {
    render(<PageLoading />);
    
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should display custom loading text', () => {
    render(<PageLoading text="Fetching data..." />);
    
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });
});

describe('SkeletonCard', () => {
  it('should render skeleton placeholder', () => {
    render(<SkeletonCard />);
    
    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
  });

  it('should have animation class', () => {
    render(<SkeletonCard />);
    
    expect(screen.getByTestId('skeleton-card')).toHaveClass('animate-pulse');
  });

  it('should apply custom className', () => {
    render(<SkeletonCard className="w-full" />);
    
    expect(screen.getByTestId('skeleton-card')).toHaveClass('w-full');
  });
});

