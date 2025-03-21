import { vi } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock API handlers
export const handlers = [
    rest.post('/products', (req, res, ctx) => {
        return res(ctx.status(201), ctx.json({ id: 1, name: 'Test Product' }));
    }),
    rest.put('/products/:id', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ id: 1, name: 'Updated Product' }));
    }),
    rest.get('/brands', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: [] }));
    }),
    rest.get('/categories', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: [] }));
    })
];

// Setup MSW server
export const server = setupServer(...handlers);

// Setup and teardown
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock window.URL.createObjectURL
window.URL.createObjectURL = vi.fn();