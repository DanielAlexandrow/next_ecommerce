import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function strLimit(value: string, limit: number, end = '...') {
	return value.length > limit ? value.substring(0, limit) + end : value;
}

export function getFirstWord(value: string) {
	return value.split(' ')[0];
}

export function formatDate(dateString: string): string {
	if (!dateString) return '';
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('en-US', { 
		year: 'numeric', 
		month: 'long', 
		day: 'numeric' 
	}).format(date);
}

export function updateLinks(links, sortKey, sortDirection) {
	if (!links) return [];
	return links.map((link) => {
		if (link.url === null) return link;
		try {
			const baseUrl = window.location.origin;
			const fullUrl = new URL(link.url, baseUrl);
			fullUrl.searchParams.append('sortkey', sortKey);
			fullUrl.searchParams.append('sortdirection', sortDirection);
			return { ...link, url: fullUrl.toString() };
		} catch (error) {
			console.warn('Invalid URL:', link.url);
			return link;
		}
	});
};

export function handleFormError(error, form) {
	const errorResponse = error.response;
	if (errorResponse) {
		const errorData = errorResponse.data;
		if (errorData.errors) {
			Object.entries(errorData.errors).forEach(([key, value]: [any, any]) => {
				form.setError(key, {
					type: 'manual',
					message: value[0],
				});
			});
		}
	}
}