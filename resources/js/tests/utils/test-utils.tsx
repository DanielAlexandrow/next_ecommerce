import { render as testingLibraryRender } from '@testing-library/react';
import { InertiaApp } from '@inertiajs/react';
import { vi } from 'vitest';
import React from 'react';

// Mock Inertia's usePage hook
vi.mock('@inertiajs/react', async () => {
  const actual = await vi.importActual('@inertiajs/react');
  return {
    ...actual,
    usePage: vi.fn().mockReturnValue({
      props: { 
        auth: {
          user: {
            data: {
              name: 'Test User',
              email: 'test@example.com',
              role: 'admin'
            }
          }
        }
      }
    }),
    Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    router: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      visit: vi.fn(),
    }
  };
});

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  }
}));

export const render = (ui: React.ReactElement, options = {}) => {
  return testingLibraryRender(ui, {
    ...options,
  });
};