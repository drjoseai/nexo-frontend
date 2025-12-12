import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'

describe('Dialog System', () => {
  describe('Open/Close Behavior', () => {
    it('is closed by default (content not visible)', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            <p>Test content</p>
          </DialogContent>
        </Dialog>
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.queryByText('Test content')).not.toBeInTheDocument()
    })

    it('opens when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            <p>Test content</p>
          </DialogContent>
        </Dialog>
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      await user.click(screen.getByText('Open Dialog'))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('closes when close button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            <p>Test content</p>
          </DialogContent>
        </Dialog>
      )

      await user.click(screen.getByText('Open Dialog'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('closes when Escape key is pressed', async () => {
      const user = userEvent.setup()
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            <p>Test content</p>
          </DialogContent>
        </Dialog>
      )

      await user.click(screen.getByText('Open Dialog'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('DialogContent', () => {
    it('renders children correctly', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            <p>Child content here</p>
            <span>Multiple children</span>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('Child content here')).toBeInTheDocument()
      expect(screen.getByText('Multiple children')).toBeInTheDocument()
    })

    it('has data-slot="dialog-content"', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent data-testid="dialog-content">
            <DialogTitle>Test</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveAttribute('data-slot', 'dialog-content')
    })

    it('shows close button by default (showCloseButton=true)', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })

    it('does not show close button when showCloseButton is false', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent showCloseButton={false}>
            <DialogTitle>Test</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
    })

    it('applies additional className', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent className="custom-dialog-class" data-testid="dialog-content">
            <DialogTitle>Test</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('custom-dialog-class')
    })
  })

  describe('DialogHeader & DialogFooter', () => {
    it('DialogHeader renders with children', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Header Title</DialogTitle>
              <DialogDescription>Header description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('Header Title')).toBeInTheDocument()
      expect(screen.getByText('Header description')).toBeInTheDocument()
    })

    it('DialogHeader has data-slot="dialog-header"', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader data-testid="dialog-header">
              <DialogTitle>Test</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )

      const header = screen.getByTestId('dialog-header')
      expect(header).toHaveAttribute('data-slot', 'dialog-header')
    })

    it('DialogFooter renders with children', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test</DialogTitle>
            <DialogFooter>
              <button>Cancel</button>
              <button>Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('DialogFooter has data-slot="dialog-footer"', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test</DialogTitle>
            <DialogFooter data-testid="dialog-footer">
              <button>Action</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      const footer = screen.getByTestId('dialog-footer')
      expect(footer).toHaveAttribute('data-slot', 'dialog-footer')
    })
  })

  describe('DialogTitle & DialogDescription', () => {
    it('DialogTitle renders text', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>My Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('My Dialog Title')).toBeInTheDocument()
    })

    it('DialogTitle has data-slot="dialog-title"', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle data-testid="dialog-title">Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const title = screen.getByTestId('dialog-title')
      expect(title).toHaveAttribute('data-slot', 'dialog-title')
    })

    it('DialogDescription renders text', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>This is a description of the dialog</DialogDescription>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('This is a description of the dialog')).toBeInTheDocument()
    })

    it('DialogDescription has data-slot="dialog-description"', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription data-testid="dialog-description">
              Description text
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )

      const description = screen.getByTestId('dialog-description')
      expect(description).toHaveAttribute('data-slot', 'dialog-description')
    })
  })

  describe('Accessibility', () => {
    it('Dialog has role="dialog"', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('Dialog content is properly rendered in a modal context', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const dialog = screen.getByRole('dialog')
      // Radix UI Dialog is modal by default and renders content appropriately
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('data-slot', 'dialog-content')
    })

    it('DialogTitle is associated with dialog via aria-labelledby', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Accessible Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const dialog = screen.getByRole('dialog')
      const title = screen.getByText('Accessible Title')
      
      // Radix UI automatically connects the title to the dialog
      const ariaLabelledBy = dialog.getAttribute('aria-labelledby')
      expect(ariaLabelledBy).toBeTruthy()
      expect(title.id).toBe(ariaLabelledBy)
    })
  })

  describe('Full Composition', () => {
    it('renders complete dialog with all sub-components correctly', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Dialog</DialogTitle>
              <DialogDescription>This dialog has all components</DialogDescription>
            </DialogHeader>
            <div>Main content area</div>
            <DialogFooter>
              <button>Cancel</button>
              <button>Submit</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Complete Dialog')).toBeInTheDocument()
      expect(screen.getByText('This dialog has all components')).toBeInTheDocument()
      expect(screen.getByText('Main content area')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })

    it('complete interaction: open → view content → close', async () => {
      const user = userEvent.setup()
      const onOpenChange = jest.fn()

      render(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger>Open Complete Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Interactive Dialog</DialogTitle>
              <DialogDescription>Testing full interaction</DialogDescription>
            </DialogHeader>
            <div>Content visible when open</div>
            <DialogFooter>
              <DialogClose asChild>
                <button>Close Footer Button</button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      // Initially closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.queryByText('Content visible when open')).not.toBeInTheDocument()

      // Open dialog
      await user.click(screen.getByText('Open Complete Dialog'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Interactive Dialog')).toBeInTheDocument()
      expect(screen.getByText('Testing full interaction')).toBeInTheDocument()
      expect(screen.getByText('Content visible when open')).toBeInTheDocument()
      expect(onOpenChange).toHaveBeenCalledWith(true)

      // Close via footer button
      await user.click(screen.getByText('Close Footer Button'))
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('DialogClose Component', () => {
    it('DialogClose closes the dialog when clicked', async () => {
      const user = userEvent.setup()
      render(
        <Dialog defaultOpen>
          <DialogContent showCloseButton={false}>
            <DialogTitle>Test</DialogTitle>
            <DialogClose asChild>
              <button>Custom Close</button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      await user.click(screen.getByText('Custom Close'))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('DialogClose has data-slot="dialog-close"', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent showCloseButton={false}>
            <DialogTitle>Test</DialogTitle>
            <DialogClose data-testid="custom-close">
              <button>Close</button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )

      const closeElement = screen.getByTestId('custom-close')
      expect(closeElement).toHaveAttribute('data-slot', 'dialog-close')
    })
  })
})

