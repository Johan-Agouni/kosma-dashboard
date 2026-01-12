const { buildPagination, paginatedResponse } = require('../../src/utils/pagination');

describe('Pagination', () => {
    describe('buildPagination', () => {
        test('uses defaults when no query params', () => {
            const result = buildPagination({});
            expect(result.page).toBe(1);
            expect(result.limit).toBe(20);
            expect(result.skip).toBe(0);
            expect(result.sort).toEqual({ createdAt: -1 });
        });

        test('parses page and limit from query', () => {
            const result = buildPagination({ page: '3', limit: '10' });
            expect(result.page).toBe(3);
            expect(result.limit).toBe(10);
            expect(result.skip).toBe(20);
        });

        test('clamps limit to max 100', () => {
            const result = buildPagination({ limit: '500' });
            expect(result.limit).toBe(100);
        });

        test('clamps page to min 1', () => {
            const result = buildPagination({ page: '-1' });
            expect(result.page).toBe(1);
        });

        test('uses custom sort', () => {
            const result = buildPagination({ sort: 'price', order: 'asc' });
            expect(result.sort).toEqual({ price: 1 });
        });

        test('uses defaults overrides', () => {
            const result = buildPagination({}, { limit: 50, sort: 'name' });
            expect(result.limit).toBe(50);
            expect(result.sort).toEqual({ name: -1 });
        });
    });

    describe('paginatedResponse', () => {
        test('builds correct response', () => {
            const result = paginatedResponse(['a', 'b'], 50, { page: 2, limit: 10 });
            expect(result.data).toEqual(['a', 'b']);
            expect(result.pagination.page).toBe(2);
            expect(result.pagination.limit).toBe(10);
            expect(result.pagination.total).toBe(50);
            expect(result.pagination.pages).toBe(5);
            expect(result.pagination.hasNext).toBe(true);
            expect(result.pagination.hasPrev).toBe(true);
        });

        test('hasNext is false on last page', () => {
            const result = paginatedResponse([], 20, { page: 2, limit: 10 });
            expect(result.pagination.hasNext).toBe(false);
        });

        test('hasPrev is false on first page', () => {
            const result = paginatedResponse([], 20, { page: 1, limit: 10 });
            expect(result.pagination.hasPrev).toBe(false);
        });
    });
});
