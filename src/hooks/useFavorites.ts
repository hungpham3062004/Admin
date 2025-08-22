import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  getFavoriteStats,
  getCustomerFavorites,
  removeFavorite,
  type FavoriteStats,
  type FavoritesResponse,
} from '@/apis/favorites.api';

export const favoritesKeys = {
  all: ['favorites'] as const,
  stats: () => [...favoritesKeys.all, 'stats'] as const,
  customer: (customerId: string) => [...favoritesKeys.all, 'customer', customerId] as const,
};

export const useFavoriteStats = () => {
  return useQuery<FavoriteStats>({
    queryKey: favoritesKeys.stats(),
    queryFn: getFavoriteStats,
  });
};

export const useCustomerFavorites = (
  customerId?: string,
  params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' },
) => {
  return useQuery<FavoritesResponse>({
    queryKey: favoritesKeys.customer(customerId || ''),
    queryFn: () => getCustomerFavorites(customerId!, params),
    enabled: !!customerId,
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFavorite,
    onSuccess: (_, variables) => {
      toast.success('Đã xóa khỏi sản phẩm yêu thích');
      // invalidate all customer queries since we don't know which page it was on
      queryClient.invalidateQueries({ queryKey: favoritesKeys.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Xóa khỏi yêu thích thất bại');
    },
  });
};



