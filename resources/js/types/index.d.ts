export type DateTime = string;

export type Nullable<T> = T | null;

export interface User {
	id: number;
	name: string;
	username: string;
	email: string;
	email_verified_at: DateTime;
	acronym: string;
	avatar: string;
	status: string;
	joined: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
	auth: {
		user: User;
	};
};

export interface Brand {
	id: number;
	name: string;

}

export type PaginateProps<T> = {
	data?: T[];
	links: {
		first: string | null;
		last: string | null;
		prev: string | null;
		next: string | null;
	};
	meta: {
		current_page: number;
		from: number;
		last_page: number;
		to: number;
		total: number;
	};
};


export interface Subproduct {
	id: number;
	name: string;
	product_id: number;
	price: number;
	available: boolean;
}


interface StoreSubproduct extends Subproduct {
	product: Product;
}

export interface ProductImage {
	id?: number;
	name: string;
	path: string;
	pivot: ProductImageRel;
}

export interface ProductImageRel {
	id?: number;
	image_id: number;
	order_num?: number;
}

export interface ProductCategory {
	id?: number;
	name: string;
	pivot: ProductCategoryRel;
}

export interface NavigationCategory {
	id?: number;
	name: string;
	pivot: NavigationCategoryRel;
}

export interface ProductCategoryRel {
	category_id: number;
}

export interface NavigationCategoryRel {
	category_id: number;
}


export interface Category {
	id: number;
	name: string;
}

export interface Product {
	id: number;
	name: string;
	description: string;
	images: ProductImage[];
	categories: ProductCategory[];
	available: boolean;
	brand: Brand | null;
}

export interface Review {
	id: number;
	rating: number;
	comment: string;
	user_id: number;
	product_id: number;
	created_at: string;
	updated_at: string;
}

export interface StoreProduct extends Product {
	subproducts: Subproduct[];
	reviews?: Review[];
	average_rating?: number;
}

export interface CustomImage {
	id: number;
	name: string;
	path: string;
	full_path: string;
	created_at?: string;
	pivot?: ProductImageRel;


}

export interface NavigationHeader {
	id: number;
	name: string;
	order_num: number;
	navigation_items: NavigationIt[];
}

export interface BaseNavigationIt {
	name: string;
	order_num: number;
	header_id: number;
	categories: NavigationCategory[];
}

export interface PermanentNavigationIt extends BaseNavigationIt {
	id: number;
	isTemporary?: false;
}

export interface TemporaryNavigationIt extends BaseNavigationIt {
	id: number;
	isTemporary: true;
}

export type NavigationIt = PermanentNavigationIt | TemporaryNavigationIt;

export interface AddressInfo {
	id: number;
	postcode: string;
	city: string;
	town: string;
	country: string;
	street: string;
	created_at: string;
	updated_at: string;
}

export interface Guest {
	id: number;
	id_address_info: number;
	created_at: string;
	updated_at: string;
	address_info: AddressInfo;
}

export interface CartItem {
	id: number;
	cart_id: number;
	subproduct_id: number;
	created_at: string;
	updated_at: string;
	quantity: number;
	subproduct: StoreSubproduct;
}

interface Customer {
	id: number;
	id_address_info: number;
	created_at: string;
	updated_at: string;
	address_info: AddressInfo;
}

export interface OrderDetails {
	items: Array<{
		id: number;
		order_id: number;
		subproduct_id: number;
		quantity: number;
		created_at: string;
		updated_at: string;
		subproduct: {
			id: number;
			name: string;
			price: number;
			product: Product;
		};
	}>;
	customer: Customer;
	customerRegistered: boolean;
}
