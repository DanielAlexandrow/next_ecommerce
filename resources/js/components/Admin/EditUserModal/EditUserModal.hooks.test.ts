import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserForm } from './EditUserModal.hooks';
import { UserData } from '@/api/userApi';

describe('useUserForm', () => {
    const mockUser: UserData = {
        id: 1,
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
            await result.current.form.setValue('name', '');
            await result.current.form.setValue('email', '');
            const isValid = await result.current.form.trigger();
            expect(isValid).toBe(false);
        });

        const errors = result.current.form.formState.errors;
        expect(errors.name?.message).toBe('Name must be at least 2 characters');
        expect(errors.email?.message).toBe('Email is required');
    });

    it('validates email format', async () => {
        const { result } = renderHook(() => useUserForm('new', null));
        
        await act(async () => {
            await result.current.form.setValue('email', 'invalid-email');
            const isValid = await result.current.form.trigger('email');
            expect(isValid).toBe(false);
        });

        expect(result.current.form.formState.errors.email?.message).toBe('Invalid email address');
    });

    it('validates name length', async () => {
        const { result } = renderHook(() => useUserForm('new', null));
        
        await act(async () => {
            await result.current.form.setValue('name', 'a');
            const isValid = await result.current.form.trigger('name');
            expect(isValid).toBe(false);
        });

        expect(result.current.form.formState.errors.name?.message).toBe('Name must be at least 2 characters');
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
            await result.current.form.setValue('password', '123');
            const isValid = await result.current.form.trigger('password');
            expect(isValid).toBe(false);
        });

        expect(result.current.form.formState.errors.password?.message).toBe('Password must be at least 8 characters');
    });

    it('allows empty password in edit mode', async () => {
        const { result } = renderHook(() => useUserForm('edit', mockUser));
        
        await act(async () => {
            await result.current.form.setValue('password', '');
            const isValid = await result.current.form.trigger('password');
            expect(isValid).toBe(true);
        });

        expect(result.current.form.formState.errors.password).toBeUndefined();
    });
});