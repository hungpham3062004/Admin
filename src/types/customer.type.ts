export interface Customer {
	_id: string;
	fullName: string;
	phone: string;
	email: string;
	address: string;
	createdAt: string;
	updatedAt: string;
	isLocked?: boolean;
	isCommentLocked?: boolean;
}

export interface CreateCustomerRequest {
	fullName: string;
	phone: string;
	email: string;
	password: string;
	address: string;
}

export interface UpdateCustomerRequest {
	fullName?: string;
	phone?: string;
	address?: string;
}
