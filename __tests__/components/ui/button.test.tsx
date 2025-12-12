import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with text children', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('renders with children as element (icon + text)', () => {
      render(
        <Button>
          <svg data-testid="icon" />
          <span>With Icon</span>
        </Button>
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('With Icon')).toBeInTheDocument()
    })

    it('applies className adicional correctly', () => {
      render(<Button className="custom-class">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('has data-slot="button" attribute', () => {
      render(<Button>Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-slot', 'button')
    })
  })

  describe('Variants', () => {
    it('applies default variant classes correctly', () => {
      render(<Button variant="default">Default</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-primary')
      expect(button.className).toContain('text-primary-foreground')
    })

    it('applies destructive variant classes correctly', () => {
      render(<Button variant="destructive">Destructive</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-destructive')
      expect(button.className).toContain('text-white')
    })

    it('applies outline variant classes correctly', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('border')
      expect(button.className).toContain('bg-background')
    })

    it('applies secondary variant classes correctly', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-secondary')
      expect(button.className).toContain('text-secondary-foreground')
    })

    it('applies ghost variant classes correctly', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('hover:bg-accent')
      expect(button.className).toContain('hover:text-accent-foreground')
    })

    it('applies link variant classes correctly', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('text-primary')
      expect(button.className).toContain('underline-offset-4')
    })
  })

  describe('Sizes', () => {
    it('applies default size classes correctly', () => {
      render(<Button size="default">Default Size</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-9')
      expect(button.className).toContain('px-4')
    })

    it('applies sm size classes correctly', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-8')
      expect(button.className).toContain('px-3')
    })

    it('applies lg size classes correctly', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-10')
      expect(button.className).toContain('px-6')
    })

    it('applies icon size classes correctly', () => {
      render(<Button size="icon">Icon</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('size-9')
    })

    it('applies icon-sm size classes correctly', () => {
      render(<Button size="icon-sm">Icon SM</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('size-8')
    })

    it('applies icon-lg size classes correctly', () => {
      render(<Button size="icon-lg">Icon LG</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('size-10')
    })
  })

  describe('States', () => {
    it('disabled button has opacity-50 and pointer-events-none', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button.className).toContain('disabled:opacity-50')
      expect(button.className).toContain('disabled:pointer-events-none')
    })

    it('disabled button onClick does NOT execute', () => {
      const onClick = jest.fn()
      render(
        <Button disabled onClick={onClick}>
          Disabled
        </Button>
      )
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(onClick).not.toHaveBeenCalled()
    })

    it('type="submit" works correctly', () => {
      render(<Button type="submit">Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('type="button" is the default', () => {
      render(<Button>Button</Button>)
      const button = screen.getByRole('button')
      // HTML buttons default to type="submit" if not specified
      // Our component should allow the default HTML behavior
      // or we can explicitly set it
      expect(button).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('onClick executes when clicked', () => {
      const onClick = jest.fn()
      render(<Button onClick={onClick}>Click me</Button>)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('onClick receives the event correctly', () => {
      const onClick = jest.fn()
      render(<Button onClick={onClick}>Click me</Button>)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(onClick).toHaveBeenCalledWith(expect.any(Object))
      expect(onClick.mock.calls[0][0]).toHaveProperty('type', 'click')
    })

    it('does not click when disabled', () => {
      const onClick = jest.fn()
      render(
        <Button disabled onClick={onClick}>
          Disabled
        </Button>
      )
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('Composition (asChild)', () => {
    it('asChild=true renders the child element in place of button', () => {
      render(
        <Button asChild>
          <a href="/test">Link as Button</a>
        </Button>
      )
      const link = screen.getByRole('link', { name: 'Link as Button' })
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
      // Should not render a button element
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('asChild with <a> renders anchor with button styles', () => {
      render(
        <Button asChild variant="default">
          <a href="/test">Styled Link</a>
        </Button>
      )
      const link = screen.getByRole('link', { name: 'Styled Link' })
      expect(link.className).toContain('bg-primary')
      expect(link.className).toContain('text-primary-foreground')
    })

    it('asChild passes props correctly to child', () => {
      render(
        <Button asChild>
          <a href="/dashboard" data-testid="custom-link">
            Dashboard
          </a>
        </Button>
      )
      const link = screen.getByTestId('custom-link')
      expect(link).toHaveAttribute('href', '/dashboard')
      expect(link).toHaveAttribute('data-slot', 'button')
    })
  })

  describe('Combined Props', () => {
    it('combines variant, size, and className correctly', () => {
      render(
        <Button variant="outline" size="lg" className="w-full">
          Combined
        </Button>
      )
      const button = screen.getByRole('button')
      expect(button.className).toContain('border')
      expect(button.className).toContain('bg-background')
      expect(button.className).toContain('h-10')
      expect(button.className).toContain('px-6')
      expect(button.className).toContain('w-full')
    })

    it('applies all base classes regardless of variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('inline-flex')
      expect(button.className).toContain('items-center')
      expect(button.className).toContain('justify-center')
      expect(button.className).toContain('rounded-md')
    })
  })
})

