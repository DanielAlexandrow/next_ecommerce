import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserForm } from './EditUserModal.hooks';
import { UserData } from '@/api/userApi';

describe('useUserForm', () => {
    const mockUser: UserData = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with correct default values', () => {
        const { result } = renderHook(() => useUserForm('edit', mockUser));
        
        expect(result.current.form.getValues()).toEqual({
            name: 'Test User',
            email: 'test@example.com',
            role: 'customer',
            password: '',
        });
    });

    it('initializes with empty values when user is null', () => {
        const { result } = renderHook(() => useUserForm('new', null));
        
        expect(result.current.form.getValues()).toEqual({
            name: '',
            email: '',
            role: 'customer',
            password: '',
        });
    });

    it('validates required fields', async () => {
        const { result } = renderHook(() => useUserForm('new', null));
        
        await act(async () => {
            const isValid = await result.current.form.trigger();
            expect(isValid).toBe(false);
        });

        const errors = result.current.form.formState.errors;
        expect(errors.name).toBeTruthy();
        expect(errors.email).toBeTruthy();
    });

    it('validates email format', async () => {
        const { result } = renderHook(() => useUserForm('new', null));
        
        await act(async () => {
            result.current.form.setValue('email', 'invalid-email');
            const isValid = await result.current.form.trigger('email');
            expect(isValid).toBe(false);
        });

        expect(result.current.form.formState.errors.email).toBeTruthy();
    });

    it('validates name length', async () => {
        const { result } = renderHook(() => useUserForm('new', null));
        
        await act(async () => {
            result.current.form.setValue('name', 'a'); // Too short
            const isValid = await result.current.form.trigger('name');
            expect(isValid).toBe(false);
        });

        expect(result.current.form.formState.errors.name).toBeTruthy();
    });

    it('handles form errors correctly', async () => {
        const { result } = renderHook(() => useUserForm('edit', mockUser));
        
        const mockError = {
            response: {
                data: {
                    errors: {
                        email: ['Email already taken']
                    }
                }
            }
        };

        await act(async () => {
            result.current.handleError(mockError);
        });

        expect(result.current.form.formState.errors.email?.message).toBe('Email already taken');
    });

    it('validates password when provided', async () => {
        const { result } = renderHook(() => useUserForm('edit', mockUser));
        
        await act(async () => {
            result.current.form.setValue('password', '123'); // Too short
            const isValid = await result.current.form.trigger('password');
            expect(isValid).toBe(false);
        });

        expect(result.current.form.formState.errors.password).toBeTruthy();
    });
});