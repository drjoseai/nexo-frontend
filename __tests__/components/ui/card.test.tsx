import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

describe('Card System', () => {
  describe('Card', () => {
    it('renders with children', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('has data-slot="card" attribute', () => {
      const { container } = render(<Card>Content</Card>)
      const cardElement = container.querySelector('[data-slot="card"]')
      expect(cardElement).toBeInTheDocument()
    })

    it('applies additional className correctly', () => {
      const { container } = render(<Card className="custom-class">Content</Card>)
      const cardElement = container.querySelector('[data-slot="card"]')
      expect(cardElement).toHaveClass('custom-class')
    })

    it('applies base classes', () => {
      const { container } = render(<Card>Content</Card>)
      const cardElement = container.querySelector('[data-slot="card"]')
      expect(cardElement).toHaveClass('bg-card')
      expect(cardElement).toHaveClass('rounded-xl')
      expect(cardElement).toHaveClass('border')
      expect(cardElement).toHaveClass('shadow-sm')
    })
  })

  describe('CardHeader', () => {
    it('renders with children', () => {
      render(<CardHeader>Header content</CardHeader>)
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })

    it('has data-slot="card-header" attribute', () => {
      const { container } = render(<CardHeader>Header</CardHeader>)
      const headerElement = container.querySelector('[data-slot="card-header"]')
      expect(headerElement).toBeInTheDocument()
    })

    it('applies base classes', () => {
      const { container } = render(<CardHeader>Header</CardHeader>)
      const headerElement = container.querySelector('[data-slot="card-header"]')
      expect(headerElement).toHaveClass('grid')
      expect(headerElement).toHaveClass('px-6')
      expect(headerElement).toHaveClass('items-start')
    })
  })

  describe('CardTitle', () => {
    it('renders with text', () => {
      render(<CardTitle>Title text</CardTitle>)
      expect(screen.getByText('Title text')).toBeInTheDocument()
    })

    it('has data-slot="card-title" attribute', () => {
      const { container } = render(<CardTitle>Title</CardTitle>)
      const titleElement = container.querySelector('[data-slot="card-title"]')
      expect(titleElement).toBeInTheDocument()
    })

    it('applies base classes', () => {
      const { container } = render(<CardTitle>Title</CardTitle>)
      const titleElement = container.querySelector('[data-slot="card-title"]')
      expect(titleElement).toHaveClass('font-semibold')
      expect(titleElement).toHaveClass('leading-none')
    })
  })

  describe('CardDescription', () => {
    it('renders with text', () => {
      render(<CardDescription>Description text</CardDescription>)
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })

    it('has data-slot="card-description" attribute', () => {
      const { container } = render(<CardDescription>Description</CardDescription>)
      const descElement = container.querySelector('[data-slot="card-description"]')
      expect(descElement).toBeInTheDocument()
    })

    it('applies base classes', () => {
      const { container } = render(<CardDescription>Description</CardDescription>)
      const descElement = container.querySelector('[data-slot="card-description"]')
      expect(descElement).toHaveClass('text-muted-foreground')
      expect(descElement).toHaveClass('text-sm')
    })
  })

  describe('CardAction', () => {
    it('renders with children (button)', () => {
      render(
        <CardAction>
          <button>Action button</button>
        </CardAction>
      )
      expect(screen.getByRole('button', { name: 'Action button' })).toBeInTheDocument()
    })

    it('has data-slot="card-action" attribute', () => {
      const { container } = render(<CardAction>Action</CardAction>)
      const actionElement = container.querySelector('[data-slot="card-action"]')
      expect(actionElement).toBeInTheDocument()
    })

    it('applies base grid classes', () => {
      const { container } = render(<CardAction>Action</CardAction>)
      const actionElement = container.querySelector('[data-slot="card-action"]')
      expect(actionElement).toHaveClass('col-start-2')
      expect(actionElement).toHaveClass('row-span-2')
      expect(actionElement).toHaveClass('row-start-1')
    })
  })

  describe('CardContent', () => {
    it('renders with children', () => {
      render(<CardContent>Content text</CardContent>)
      expect(screen.getByText('Content text')).toBeInTheDocument()
    })

    it('has data-slot="card-content" attribute', () => {
      const { container } = render(<CardContent>Content</CardContent>)
      const contentElement = container.querySelector('[data-slot="card-content"]')
      expect(contentElement).toBeInTheDocument()
    })

    it('applies base padding classes', () => {
      const { container } = render(<CardContent>Content</CardContent>)
      const contentElement = container.querySelector('[data-slot="card-content"]')
      expect(contentElement).toHaveClass('px-6')
    })
  })

  describe('CardFooter', () => {
    it('renders with children', () => {
      render(<CardFooter>Footer text</CardFooter>)
      expect(screen.getByText('Footer text')).toBeInTheDocument()
    })

    it('has data-slot="card-footer" attribute', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>)
      const footerElement = container.querySelector('[data-slot="card-footer"]')
      expect(footerElement).toBeInTheDocument()
    })

    it('applies base classes', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>)
      const footerElement = container.querySelector('[data-slot="card-footer"]')
      expect(footerElement).toHaveClass('flex')
      expect(footerElement).toHaveClass('items-center')
      expect(footerElement).toHaveClass('px-6')
    })
  })

  describe('Full Composition', () => {
    it('renders full card with all sub-components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>Content here</CardContent>
          <CardFooter>Footer content</CardFooter>
        </Card>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Description')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
      expect(screen.getByText('Content here')).toBeInTheDocument()
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('all data-slots are present in full composition', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )

      expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-header"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-title"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-description"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-action"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-content"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-footer"]')).toBeInTheDocument()
    })
  })

  describe('Additional Props', () => {
    it('Card accepts and applies additional HTML attributes', () => {
      const { container } = render(
        <Card data-testid="custom-card" aria-label="Custom Card">
          Content
        </Card>
      )
      const cardElement = container.querySelector('[data-slot="card"]')
      expect(cardElement).toHaveAttribute('data-testid', 'custom-card')
      expect(cardElement).toHaveAttribute('aria-label', 'Custom Card')
    })

    it('CardHeader accepts and applies custom className', () => {
      const { container } = render(
        <CardHeader className="custom-header-class">Header</CardHeader>
      )
      const headerElement = container.querySelector('[data-slot="card-header"]')
      expect(headerElement).toHaveClass('custom-header-class')
      expect(headerElement).toHaveClass('grid') // keeps base classes
    })

    it('CardTitle accepts custom className', () => {
      const { container } = render(
        <CardTitle className="text-2xl">Title</CardTitle>
      )
      const titleElement = container.querySelector('[data-slot="card-title"]')
      expect(titleElement).toHaveClass('text-2xl')
      expect(titleElement).toHaveClass('font-semibold') // keeps base classes
    })
  })
})

