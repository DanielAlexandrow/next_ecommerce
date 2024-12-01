import { type ClassValue, clsx } from 'clsx';
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

export function updateLinks(links, sortKey, sortDirection) {
	return links.map((link) => {
		if (link.url === null) return link;
		const url = new URL(link.url);
		url.searchParams.append('sortkey', sortKey);
		url.searchParams.append('sortdirection', sortDirection);
		return { ...link, url: url.toString() };
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