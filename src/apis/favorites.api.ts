import axiosInstance from '@/configs/instances/axios';

export type FavoritesListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type FavoriteItem = {
  id: string;
  productId: {
    _id: string;
    productName: string;
    images: string[];
    price: number;
    discountedPrice?: number;
    effectivePrice?: number;
    discountPercentage?: number;
    categoryId?: { _id: string; categoryName: string } | null;
  };
  customerId: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  addedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FavoritesResponse = {
  favorites: FavoriteItem[];
  total: number;
  totalPages: number;
  currentPage: number;
};

export type FavoriteStats = {
  totalFavorites: number;
  uniqueCustomers: number;
  uniqueProducts: number;
  totalValue: number;
  mostPopularProducts: Array<{
    productId: string;
    productName: string;
    favoriteCount: number;
    totalValue: number;
  }>;
};

export const getFavoriteStats = async (): Promise<FavoriteStats> => {
  const { data } = await axiosInstance.get('/favorites/stats');
  return data;
};

export const getCustomerFavorites = async (
  customerId: string,
  params?: FavoritesListParams,
): Promise<FavoritesResponse> => {
  const { data } = await axiosInstance.get(`/favorites/customer/${customerId}` , { params });
  return data;
};

export const removeFavorite = async (payload: { customerId: string; productId: string }): Promise<void> => {
  await axiosInstance.delete('/favorites', { data: payload });
};


