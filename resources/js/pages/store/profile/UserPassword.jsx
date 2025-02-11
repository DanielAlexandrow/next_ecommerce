import { StoreLayout } from '@/layouts/store-layout';
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { toast } from 'react-toastify';
import { handleFormError } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ProfileTabs from './ProfileTabs';
import { profileApi } from '@/api/profileApi';




export default function UserPassword() {
	const formSchema = z.object({
		current_password: z.string().min(10).max(500),
		new_password: z.string().min(10).max(500),
		new_password_repeated: z.string().min(10).max(500),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			current_password: '',
			new_password: '',
			new_password_repeated: '',
		}
	});


	const onSubmit = async (data: any) => {
		if (data.new_password !== data.new_password_repeated) {
			toast.error("Passwords don't match");
			return;
		}

		try {
			const message = await profileApi.updatePassword(data);
			toast.success(message);
		} catch (error) {
			handleFormError(error, form);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<ProfileTabs selected="Password" />
			<div className="max-w-2xl mx-auto mt-8">
				<div className="bg-card rounded-lg shadow-sm p-6">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className='flex-1 pr-4'>
								<FormField
									control={form.control}
									name='current_password'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Current Password</FormLabel>
											<FormControl>
												<Input placeholder='' {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>


								<FormField
									control={form.control}
									name='new_password'
									render={({ field }) => (
										<FormItem>
											<FormLabel>New Password</FormLabel>
											<FormControl>
												<Input placeholder='' {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>


								<FormField
									control={form.control}
									name='new_password_repeated'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Repeat New Password</FormLabel>
											<FormControl>
												<Input placeholder='' {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<Button type="submit" className="w-full">Submit</Button>
						</form>
					</Form>
				</div>
			</div>
		</div>
	);
}

UserPassword.layout = (page: any) => <StoreLayout children={page} />;