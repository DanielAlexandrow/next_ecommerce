import React from 'react';
import { vi } from 'vitest';

export const Form = ({ children, ...props }: any) => {
    const { control, formState, trigger, register, watch, reset, unregister, setValue, getValues, resetField, clearErrors, setError, setFocus, getFieldState, handleSubmit, ...rest } = props;
    return <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit?.(e);
    }} {...rest}>{children}</form>;
};

export const FormField = ({ children, render, control, name, ...props }: any) => {
    const field = {
        value: control?._formValues?.[name] || '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        name: name,
        ref: vi.fn()
    };
    return <div {...props}>{render({ field })}</div>;
};

export const FormItem = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const FormLabel = ({ children, ...props }: any) => <label {...props}>{children}</label>;
export const FormControl = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const FormMessage = ({ children, ...props }: any) => <div {...props}>{children || 'This field is required'}</div>; 