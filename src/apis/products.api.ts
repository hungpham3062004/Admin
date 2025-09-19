import type { BaseResponse, PaginatedResponse } from '@/types/common.type';

import type { Product } from '@/types/product.type';
import axiosInstance from '@/configs/instances/axios';

export interface GetProductsParams {
	page?: number;
	limit?: number;
	includeHidden?: boolean;
}

export const productsApi = {
	getProducts: async (
		params?: GetProductsParams
	): Promise<BaseResponse<PaginatedResponse<Product>>> => {
		const mergedParams = { includeHidden: true, ...params };
		const response = await axiosInstance.get('/products', { params: mergedParams });
		return response.data;
	},

	getProduct: async (id: string): Promise<Product> => {
		const response = await axiosInstance.get(`/products/${id}`);
		return response.data;
	},

	createProduct: async (
		product: Partial<Product>
	): Promise<BaseResponse<Product>> => {
		const response = await axiosInstance.post('/products', product);
		return response.data;
	},

	updateProduct: async (
		id: string,
		product: Partial<Product>
	): Promise<BaseResponse<Product>> => {
		const response = await axiosInstance.patch(`/products/${id}`, product);
		return response.data;
	},

	lockProduct: async (id: string): Promise<BaseResponse<Product>> => {
		const response = await axiosInstance.patch(`/products/${id}/hide`);
		return response.data;
	},

	unlockProduct: async (id: string): Promise<BaseResponse<Product>> => {
		const response = await axiosInstance.patch(`/products/${id}/unhide`);
		return response.data;
	},
};
