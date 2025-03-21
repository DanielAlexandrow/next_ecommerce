import React, { useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { GuestLayout } from '@/layouts/guest-layout';
import { InputError } from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, useForm } from '@inertiajs/react';

interface LoginProps {
	status: string;
	canResetPassword: boolean;
}

export default function Login(args: LoginProps) {
	const { status } = args;
	const { data, setData, post, processing, errors, reset } = useForm({
		email: '',
		password: '',
		remember: false,
	});

	useEffect(() => {
		return () => {
			reset('password');
		};
	}, []);

	const onChange = (event: { target: { name: any; value: any } }) => {
		setData(event.target.name, event.target.value);
	};

	const submit = (e: { preventDefault: () => void }) => {
		e.preventDefault();

		post(route('admin.login'));
	};

	return (
		<>
			<Head title='Admin Login' />

			{status && <div className='mb-4 text-sm font-medium text-green-600 dark:text-green-400'>{status}</div>}
			
			{/* Add error message display */}
            {errors.email && (
                <div className="mb-4 text-sm font-medium text-red-600 dark:text-red-400">
                    {errors.email}
                </div>
            )}

			<form onSubmit={submit} data-testid="admin-login-form">
				<div>
					<Label htmlFor='email'>Email</Label>
					<Input
						id='email'
						type='email'
						name='email'
						value={data.email}
						className='mt-1 block w-full'
						autoComplete='username'
						autoFocus
						onChange={onChange}
						data-testid="email-input"
					/>
					<InputError message={errors.email} className='mt-2' />
				</div>

				<div className='mt-4'>
					<Label htmlFor='password'>Password</Label>
					<Input
						id='password'
						type='password'
						name='password'
						value={data.password}
						className='mt-1 block w-full'
						autoComplete='current-password'
						onChange={onChange}
						data-testid="password-input"
					/>
					<InputError message={errors.password} className='mt-2' />
				</div>

				<div className='mt-4 block'>
					<label className='flex items-center gap-2'>
						<Checkbox
							id='remember'
							name='remember'
							checked={data.remember}
							onCheckedChange={(checked: boolean) => setData('remember', checked)}
							data-testid="remember-checkbox"
						/>
						<span className='text-sm text-muted-foreground cursor-pointer select-none'>
							Remember me
						</span>
					</label>
				</div>

				<div className='mt-4 flex items-center justify-end'>
					<Button 
						className='ml-4' 
						disabled={processing} 
						type='submit'
						data-testid="login-button"
					>
						Log in
					</Button>
				</div>
			</form>
		</>
	);
}

Login.layout = (page: React.ReactNode) => {
	return <GuestLayout header='Admin Login' description='Log in to your account.' children={page} />;
};
