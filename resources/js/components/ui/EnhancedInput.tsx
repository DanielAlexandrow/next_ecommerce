import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
    helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, label, helperText, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={props.id}
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        className={cn(
                            'block w-full rounded-lg border-gray-300 shadow-sm',
                            'focus:border-primary-500 focus:ring-primary-500',
                            'disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200',
                            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                            className
                        )}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={
                            error
                                ? `${props.id}-error`
                                : helperText
                                    ? `${props.id}-description`
                                    : undefined
                        }
                        {...props}
                    />
                </div>
                {error && (
                    <p
                        className="mt-1 text-sm text-red-600"
                        id={`${props.id}-error`}
                        role="alert"
                    >
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p
                        className="mt-1 text-sm text-gray-500"
                        id={`${props.id}-description`}
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input'; 