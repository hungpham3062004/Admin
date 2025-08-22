import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, User, Package, Calendar, MessageSquare } from 'lucide-react';
import type { Review } from '@/apis/reviews.api';

interface ReviewDetailModalProps {
  review: Review | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (isApproved: boolean, response?: string) => void;
  isApproving: boolean;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  review,
  isOpen,
  onClose,
  onApprove,
  isApproving,
}) => {
  const [response, setResponse] = React.useState('');

  React.useEffect(() => {
    if (review) {
      setResponse(review.response || '');
    }
  }, [review]);

  const handleApprove = (isApproved: boolean) => {
    onApprove(isApproved, response.trim() || undefined);
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!review) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Chi tiết đánh giá
          </DialogTitle>
          <DialogDescription>
            Xem chi tiết đánh giá từ khách hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Information */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            {review.product?.images?.[0] && (
              <img
                src={review.product.images[0]}
                alt={review.product.productName}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{review.product?.productName || 'N/A'}</h3>
              <p className="text-sm text-gray-600">Sản phẩm</p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium">{review.customer?.fullName || 'N/A'}</h4>
              <p className="text-sm text-gray-600">{review.customer?.email || 'N/A'}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
            <Star className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-xl">
                  {getRatingStars(review.rating)}
                </span>
                <span className="text-lg font-medium">({review.rating}/5)</span>
              </div>
              <p className="text-sm text-gray-600">Điểm đánh giá</p>
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">{review.title}</h4>
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
          </div>

          {/* Review Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Ngày đánh giá: {formatDate(review.reviewDate || review.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span>Đơn hàng: {review.orderId}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge variant={review.status === 'approved' ? "default" : review.status === 'rejected' ? 'destructive' : "secondary"}>
              {review.status === 'approved' ? 'Đã phê duyệt' : review.status === 'rejected' ? 'Đã từ chối' : 'Chờ phê duyệt'}
            </Badge>
            {review.status === 'approved' && review.approvedAt && (
              <span className="text-sm text-gray-600">
                Duyệt lúc: {formatDate(review.approvedAt)}
              </span>
            )}
          </div>

          {/* Admin Response */}
          {review.response && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-800 mb-2">Phản hồi của admin:</h5>
              <p className="text-green-700">{review.response}</p>
              {review.responseDate && (
                <p className="text-sm text-green-600 mt-2">
                  Phản hồi lúc: {formatDate(review.responseDate)}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {review.status !== 'approved' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="response">Phản hồi (tùy chọn)</Label>
                <Textarea
                  id="response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Nhập phản hồi cho khách hàng..."
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {response.length}/500 ký tự
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(true)}
                  disabled={isApproving}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Duyệt đánh giá
                </Button>
                <Button
                  onClick={() => handleApprove(false)}
                  disabled={isApproving}
                  variant="outline"
                  className="flex-1"
                >
                  Từ chối
                </Button>
              </div>
            </div>
          )}

          {review.status === 'approved' && (
            <div className="flex gap-3">
              <Button
                onClick={() => handleApprove(false)}
                disabled={isApproving}
                variant="outline"
                className="flex-1"
              >
                Bỏ duyệt
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
