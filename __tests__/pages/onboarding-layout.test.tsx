// __tests__/pages/onboarding-layout.test.tsx
// Tests para Onboarding Layout de NEXO v2.0

import { render, screen } from '@testing-library/react';
import OnboardingLayout from '@/app/onboarding/layout';

describe('OnboardingLayout', () => {
  it('renders children correctly', () => {
    render(
      <OnboardingLayout>
        <div data-testid="child-content">Hello Onboarding</div>
      </OnboardingLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Hello Onboarding')).toBeInTheDocument();
  });
});
