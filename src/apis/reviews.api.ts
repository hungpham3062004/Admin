import { api } from '@/configs';

export interface Review {
  _id: string;
  productId: string;
  customerId: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  reviewDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  response?: string;
  responseDate?: Date;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    _id: string;
    fullName: string;
    email: string;
  };
  product?: {
    _id: string;
    productName: string;
    images: string[];
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewQueryParams {
  search?: string;
  productId?: string;
  customerId?: string;
  rating?: number;
  status?: 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApproveReviewDto {
  isApproved: boolean;
  response?: string;
}

export const reviewsApi = {
  // GET /reviews - Get all reviews with filters
  getReviews: (params?: ReviewQueryParams) => {
    return api.get<ReviewsResponse>('/reviews', { params });
  },

  // GET /reviews/:id - Get a specific review
  getReviewById: (id: string) => {
    return api.get<Review>(`/reviews/${id}`);
  },

  // PATCH /reviews/:id/approve - Approve or reject a review
  approveReview: (id: string, data: ApproveReviewDto) => {
    return api.patch<Review>(`/reviews/${id}/approve`, data);
  },

  // PATCH /reviews/:id/reject - Reject a review
  rejectReview: (id: string, data?: { response?: string }) => {
    return api.patch<Review>(`/reviews/${id}/reject`, data || {} as any);
  },

  // DELETE /reviews/:id/admin - Delete a review (Admin only)
  deleteReview: (id: string) => {
    return api.delete(`/reviews/${id}/admin`);
  },

  // GET /reviews/product/:productId/stats - Get product review statistics
  getProductReviewStats: (productId: string) => {
    return api.get(`/reviews/product/${productId}/stats`);
  },

  // PATCH /reviews/:id/helpful - Mark review as helpful
  markReviewHelpful: (id: string) => {
    return api.patch<Review>(`/reviews/${id}/helpful`);
  },
};
