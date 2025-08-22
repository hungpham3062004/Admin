import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reviewsApi, type ReviewQueryParams, type ApproveReviewDto } from '@/apis/reviews.api';

export const useReviews = (params?: ReviewQueryParams) => {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => reviewsApi.getReviews(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useReviewById = (id: string) => {
  return useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsApi.getReviewById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useApproveReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveReviewDto }) =>
      reviewsApi.approveReview(id, data),
    onSuccess: (response, variables) => {
      const review: any = (response as any)?.data ?? response;

      toast.success(
        review.status === 'approved'
          ? 'Đã duyệt đánh giá thành công'
          : 'Đã từ chối đánh giá thành công'
      );

      // Invalidate and refetch reviews list(s)
      queryClient.invalidateQueries({ queryKey: ['reviews'] });

      // Update specific review in cache if present
      queryClient.setQueryData(['reviews', variables.id], review);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
        'Có lỗi xảy ra khi cập nhật trạng thái đánh giá'
      );
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.deleteReview(id),
    onSuccess: () => {
      toast.success('Đã xóa đánh giá thành công');
      
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 
        'Có lỗi xảy ra khi xóa đánh giá'
      );
    },
  });
};

export const useMarkReviewHelpful = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.markReviewHelpful(id),
    onSuccess: (data, variables) => {
      toast.success('Đã đánh dấu đánh giá hữu ích');
      
      // Update specific review in cache
      queryClient.setQueryData(['reviews', variables], data);
      
      // Invalidate reviews list
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 
        'Có lỗi xảy ra khi đánh dấu đánh giá hữu ích'
      );
    },
  });
};

export const useProductReviewStats = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', 'stats', productId],
    queryFn: () => reviewsApi.getProductReviewStats(productId),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
