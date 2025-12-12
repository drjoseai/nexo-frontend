import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'

describe('DropdownMenu System', () => {
  describe('Open/Close Behavior', () => {
    it('is closed by default (content not visible)', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })

    it('opens when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()

      await user.click(screen.getByText('Open Menu'))

      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('closes when clicking outside', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <div data-testid="outside">Outside Element</div>
          <DropdownMenu>
            <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Item 1</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )

      // Open menu
      await user.click(screen.getByText('Open Menu'))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Click outside using fireEvent to bypass pointer-events
      fireEvent.pointerDown(document.body)
      fireEvent.mouseDown(document.body)
      fireEvent.click(document.body)

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })

    it('closes when pressing Escape key', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      // Open menu
      await user.click(screen.getByText('Open Menu'))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Press Escape
      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })
  })

  describe('DropdownMenuContent', () => {
    it('renders children correctly when opened', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>First Item</DropdownMenuItem>
            <DropdownMenuItem>Second Item</DropdownMenuItem>
            <DropdownMenuItem>Third Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      expect(screen.getByText('First Item')).toBeInTheDocument()
      expect(screen.getByText('Second Item')).toBeInTheDocument()
      expect(screen.getByText('Third Item')).toBeInTheDocument()
    })

    it('has data-slot="dropdown-menu-content"', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const content = screen.getByRole('menu')
      expect(content).toHaveAttribute('data-slot', 'dropdown-menu-content')
    })

    it('applies additional className', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent className="custom-class">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const content = screen.getByRole('menu')
      expect(content).toHaveClass('custom-class')
    })
  })

  describe('DropdownMenuItem', () => {
    it('renders with text content', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Menu Item Text</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const item = screen.getByRole('menuitem')
      expect(item).toHaveTextContent('Menu Item Text')
    })

    it('has data-slot="dropdown-menu-item"', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const item = screen.getByRole('menuitem')
      expect(item).toHaveAttribute('data-slot', 'dropdown-menu-item')
    })

    it('applies destructive variant classes correctly', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem variant="destructive">
              Delete Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const item = screen.getByRole('menuitem')
      expect(item).toHaveAttribute('data-variant', 'destructive')
    })

    it('applies inset padding when inset prop is true', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const item = screen.getByRole('menuitem')
      expect(item).toHaveAttribute('data-inset', 'true')
    })
  })

  describe('DropdownMenuCheckboxItem', () => {
    it('renders correctly', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem>
              Checkbox Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const checkbox = screen.getByRole('menuitemcheckbox')
      expect(checkbox).toHaveTextContent('Checkbox Item')
    })

    it('shows check icon when checked is true', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked>
              Checked Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const checkbox = screen.getByRole('menuitemcheckbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('has correct data-slot attribute', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem>
              Checkbox Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const checkbox = screen.getByRole('menuitemcheckbox')
      expect(checkbox).toHaveAttribute('data-slot', 'dropdown-menu-checkbox-item')
    })
  })

  describe('DropdownMenuRadioItems', () => {
    it('renders RadioGroup with RadioItems correctly', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem value="option1">
                Option 1
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">
                Option 2
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const radioItems = screen.getAllByRole('menuitemradio')
      expect(radioItems).toHaveLength(2)
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('shows indicator on selected RadioItem', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option2">
              <DropdownMenuRadioItem value="option1">
                Option 1
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">
                Option 2
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const option2 = screen.getByText('Option 2').closest('[role="menuitemradio"]')
      expect(option2).toHaveAttribute('aria-checked', 'true')

      const option1 = screen.getByText('Option 1').closest('[role="menuitemradio"]')
      expect(option1).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('Layout Components', () => {
    it('renders DropdownMenuLabel with text', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Label</DropdownMenuLabel>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const label = screen.getByText('My Label')
      expect(label).toBeInTheDocument()
      expect(label).toHaveAttribute('data-slot', 'dropdown-menu-label')
    })

    it('renders DropdownMenuSeparator as divider', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator data-testid="separator" />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveAttribute('data-slot', 'dropdown-menu-separator')
    })

    it('renders DropdownMenuShortcut with text', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Save
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const shortcut = screen.getByText('⌘S')
      expect(shortcut).toBeInTheDocument()
      expect(shortcut).toHaveAttribute('data-slot', 'dropdown-menu-shortcut')
    })
  })

  describe('Full Composition', () => {
    it('renders complete menu with multiple items correctly', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>
              Notifications
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Actions'))

      expect(screen.getByText('My Account')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Notifications')).toBeInTheDocument()
      expect(screen.getByText('Log out')).toBeInTheDocument()
    })

    it('closes menu after clicking an item', async () => {
      const user = userEvent.setup()
      const handleSelect = jest.fn()
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleSelect}>
              Action Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      // Open menu
      await user.click(screen.getByText('Open Menu'))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Click item
      await user.click(screen.getByText('Action Item'))

      // Verify handler was called
      expect(handleSelect).toHaveBeenCalledTimes(1)

      // Menu should close
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })
  })

  describe('Additional Coverage', () => {
    it('DropdownMenuGroup renders with correct data-slot', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup data-testid="menu-group">
              <DropdownMenuItem>Item 1</DropdownMenuItem>
              <DropdownMenuItem>Item 2</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const group = screen.getByTestId('menu-group')
      expect(group).toHaveAttribute('data-slot', 'dropdown-menu-group')
    })

    it('DropdownMenuLabel with inset applies correct attribute', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const label = screen.getByText('Inset Label')
      expect(label).toHaveAttribute('data-inset', 'true')
    })

    it('DropdownMenuTrigger has correct data-slot', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="trigger">
            Open Menu
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('data-slot', 'dropdown-menu-trigger')
    })

    it('handles disabled menu items correctly', async () => {
      const user = userEvent.setup()
      const handleSelect = jest.fn()

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled onSelect={handleSelect}>
              Disabled Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const item = screen.getByText('Disabled Item')
      expect(item).toHaveAttribute('data-disabled')

      // Clicking disabled item should not trigger handler
      await user.click(item)
      expect(handleSelect).not.toHaveBeenCalled()
    })

    it('can be controlled with open and onOpenChange props', async () => {
      const user = userEvent.setup()
      const handleOpenChange = jest.fn()

      const { rerender } = render(
        <DropdownMenu open={false} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()

      await user.click(screen.getByText('Open Menu'))
      expect(handleOpenChange).toHaveBeenCalledWith(true)

      // Rerender with open=true
      rerender(
        <DropdownMenu open={true} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('applies custom className to DropdownMenuItem', async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="custom-item-class">
              Custom Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText('Open Menu'))

      const item = screen.getByRole('menuitem')
      expect(item).toHaveClass('custom-item-class')
    })
  })
})

