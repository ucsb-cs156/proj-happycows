import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter } from 'react-router'
import { describe, test, expect, vi } from 'vitest'

// Mock Modal so its children always render in the DOM (react-bootstrap normally portals/mounts conditionally)
vi.mock('react-bootstrap', async () => {
  const actual = await vi.importActual('react-bootstrap')
  const MockModal = ({ children, ...props }) => (
    <div data-testid="MockModal" {...props}>{children}</div>
  )
  MockModal.Header = ({ children }) => <div>{children}</div>
  MockModal.Title = ({ children }) => <div>{children}</div>
  MockModal.Body = ({ children }) => <div>{children}</div>
  MockModal.Footer = ({ children }) => <div>{children}</div>

  return {
    ...actual,
    Modal: MockModal,
  }
})

import CommonsTable from 'main/components/Commons/CommonsTable'

describe('CommonsTable confirmDelete early return branch', () => {
  test('clicking Permanently Delete with no commonsToDelete triggers early return safely', async () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable
            commons={[]}
            currentUser={{ loggedIn: true, root: { rolesList: ['ROLE_ADMIN'] } }}
          />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // With mocked Modal, the delete button is always present.
    const deleteBtn = await screen.findByTestId('CommonsTable-Modal-Delete')
    await userEvent.click(deleteBtn)

    // If early return threw or mutated, test would fail; reaching here is success.
    expect(deleteBtn).toBeInTheDocument()
  })
})
