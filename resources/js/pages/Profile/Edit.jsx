import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
}

interface Props {
    auth: {
        user: User;
    };
    mustVerifyEmail: boolean;
    status?: string;
}

export default function Edit({ auth, mustVerifyEmail, status }: Props) {
    const user = auth.user;

    const { data, setData, patch, errors, processing } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <div className="max-w-xl">
                        <section>
                            <header>
                                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Update your account's profile information and email address.
                                </p>
                            </header>

                            <form onSubmit={submit} className="mt-6 space-y-6">
                                <div>
                                    <label htmlFor="name" className="block font-medium text-sm text-gray-700">
                                        Name
                                    </label>

                                    <Input
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        autoComplete="name"
                                    />

                                    {errors.name && (
                                        <div className="mt-2 text-sm text-red-600">{errors.name}</div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block font-medium text-sm text-gray-700">
                                        Email
                                    </label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoComplete="username"
                                    />

                                    {errors.email && (
                                        <div className="mt-2 text-sm text-red-600">{errors.email}</div>
                                    )}
                                </div>

                                {mustVerifyEmail && user.email_verified_at === null && (
                                    <div>
                                        <p className="text-sm mt-2 text-gray-800">
                                            Your email address is unverified.
                                            <button
                                                type="button"
                                                className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                onClick={() => route('verification.send')}
                                            >
                                                Click here to re-send the verification email.
                                            </button>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 font-medium text-sm text-green-600">
                                                A new verification link has been sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={processing}>
                                        Save
                                    </Button>

                                    {status === 'profile-updated' && (
                                        <p className="text-sm text-gray-600">Saved.</p>
                                    )}
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
} 