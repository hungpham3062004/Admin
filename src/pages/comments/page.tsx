import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
	Table, 
	TableBody, 
	TableCell, 
	TableHead, 
	TableHeader, 
	TableRow 
} from '@/components/ui/table';
import { 
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
	MessageSquare, 
	Star, 
	CheckCircle, 
	XCircle, 
	Search,
	Filter,
	Eye,
	Loader2,
	RefreshCw,
	Check,
	X
} from 'lucide-react';
import { useReviews, useApproveReview, useDeleteReview } from '@/hooks/useReviews';
// import { toast } from 'sonner';
import { ReviewDetailModal } from '@/components/ReviewDetailModal';
import type { Review } from '@/apis/reviews.api';

export default function CommentsPage() {
	const [filters, setFilters] = useState({
		page: 1,
		limit: 10,
		search: '',
		rating: 'all',
		status: 'all',
		sortBy: 'reviewDate',
		sortOrder: 'desc' as 'asc' | 'desc'
	});

	// Use real API hooks
	const { data: reviewsData, isLoading, error } = useReviews({
		page: filters.page,
		limit: filters.limit,
		rating: filters.rating !== 'all' ? parseInt(filters.rating) : undefined,
		status: filters.status !== 'all' ? (filters.status as any) : undefined,
		sortBy: filters.sortBy,
		sortOrder: filters.sortOrder,
		search: filters.search || undefined,
	});

	const approveReviewMutation = useApproveReview();
	const deleteReviewMutation = useDeleteReview();

	// Modal state
	const [selectedReview, setSelectedReview] = useState<Review | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleFilterChange = (key: string, value: string) => {
		setFilters(prev => ({
			...prev,
			[key]: value,
			page: 1 // Reset to first page when filtering
		}));
	};

	const handlePageChange = (newPage: number) => {
		setFilters(prev => ({
			...prev,
			page: newPage
		}));
	};

	const handleApproveComment = async (commentId: string, isApproved: boolean) => {
		try {
			await approveReviewMutation.mutateAsync({
				id: commentId,
				data: { isApproved }
			});
		} catch (error) {
			console.error('Failed to approve/reject review:', error);
		}
	};

	const handleViewReview = (review: Review) => {
		setSelectedReview(review);
		setIsModalOpen(true);
	};

	const handleModalApprove = async (isApproved: boolean, response?: string) => {
		if (!selectedReview) return;
		
		try {
			await approveReviewMutation.mutateAsync({
				id: selectedReview._id,
				data: { isApproved, response }
			});
			setIsModalOpen(false);
			setSelectedReview(null);
		} catch (error) {
			console.error('Failed to approve/reject review:', error);
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		try {
			await deleteReviewMutation.mutateAsync(commentId);
		} catch (error) {
			console.error('Failed to delete review:', error);
		}
	};

	// Calculate statistics from API data
	const totalComments = reviewsData?.data?.total || 0;
	const averageRating = (reviewsData?.data?.reviews?.reduce((sum: number, comment: Review) => sum + comment.rating, 0) || 0) / (reviewsData?.data?.reviews?.length || 1);
	const pendingComments = reviewsData?.data?.reviews?.filter((comment: Review) => comment.status === 'pending').length || 0;
	const approvedComments = reviewsData?.data?.reviews?.filter((comment: Review) => comment.status === 'approved').length || 0;

	const getRatingStars = (rating: number) => {
		return '★'.repeat(rating) + '☆'.repeat(5 - rating);
	};

	const getStatusText = (status: Review['status']) => {
		if (status === 'approved') return 'Đã phê duyệt';
		if (status === 'rejected') return 'Đã từ chối';
		return 'Chờ phê duyệt';
	};

	const formatDate = (dateString: string | Date) => {
		return new Date(dateString).toLocaleDateString('vi-VN');
	};

	// Get comments from API data
	const comments = reviewsData?.data?.reviews || [];

	return (
		<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Quản lý đánh giá
				</h1>
				<p className="text-gray-600">
					Quản lý đánh giá và bình luận từ khách hàng
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tổng đánh giá</CardTitle>
						<MessageSquare className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalComments.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Tất cả đánh giá
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
						<Star className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
						<p className="text-xs text-muted-foreground">
							Trên 5 sao
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Chờ phê duyệt</CardTitle>
						<XCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{pendingComments.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Đánh giá chờ phê duyệt
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Đã phê duyệt</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{approvedComments.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Đánh giá đã phê duyệt
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Bộ lọc
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="relative">
							<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Tìm kiếm sản phẩm, khách hàng..."
								value={filters.search}
								onChange={(e) => handleFilterChange('search', e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										// Trigger search on Enter key
										handleFilterChange('search', e.currentTarget.value);
									}
								}}
								className="pl-10"
							/>
						</div>
						<Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
							<SelectTrigger>
								<SelectValue placeholder="Điểm đánh giá" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả</SelectItem>
								<SelectItem value="5">5 sao</SelectItem>
								<SelectItem value="4">4 sao</SelectItem>
								<SelectItem value="3">3 sao</SelectItem>
								<SelectItem value="2">2 sao</SelectItem>
								<SelectItem value="1">1 sao</SelectItem>
							</SelectContent>
						</Select>
						<Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
							<SelectTrigger>
								<SelectValue placeholder="Trạng thái" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả</SelectItem>
								<SelectItem value="approved">Đã phê duyệt</SelectItem>
								<SelectItem value="pending">Chờ phê duyệt</SelectItem>
								<SelectItem value="rejected">Đã từ chối</SelectItem>
							</SelectContent>
						</Select>
						<Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
							<SelectTrigger>
								<SelectValue placeholder="Sắp xếp" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="desc">Mới nhất</SelectItem>
								<SelectItem value="asc">Cũ nhất</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Comments Table */}
			<Card>
				<CardHeader>
					<CardTitle>Danh sách đánh giá</CardTitle>
					<CardDescription>
						Quản lý tất cả đánh giá từ khách hàng
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8">
							<Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
							<p className="text-gray-600">Đang tải dữ liệu...</p>
						</div>
					) : error ? (
						<div className="text-center py-8">
							<XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
							<p className="text-red-600">Có lỗi xảy ra khi tải dữ liệu</p>
							<Button 
								variant="outline" 
								onClick={() => window.location.reload()}
								className="mt-2"
							>
								Thử lại
							</Button>
						</div>
					) : comments.length > 0 ? (
						<>
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Sản phẩm</TableHead>
											<TableHead>Khách hàng</TableHead>
											<TableHead>Đánh giá</TableHead>
											<TableHead>Nội dung</TableHead>
											<TableHead>Trạng thái</TableHead>
											<TableHead>Ngày đánh giá</TableHead>
											<TableHead className="text-right">Thao tác</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{comments.map((comment: Review) => (
											<TableRow key={comment._id}>
												<TableCell>
													<div className="flex items-center gap-3">
														{comment.product?.images?.[0] && (
															<img 
																src={comment.product.images[0]} 
																alt={comment.product.productName}
																className="w-12 h-12 object-cover rounded"
															/>
														)}
														<div>
															<div className="font-medium">{comment.product?.productName || 'N/A'}</div>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div>
														<div className="font-medium">{comment.customer?.fullName || 'N/A'}</div>
														<div className="text-sm text-gray-500">{comment.customer?.email || 'N/A'}</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<span className="text-yellow-500 text-lg">
															{getRatingStars(comment.rating)}
														</span>
														<span className="text-sm text-gray-600">
															({comment.rating}/5)
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="max-w-xs">
														<div className="font-medium text-sm">{comment.title}</div>
														<div className="text-sm text-gray-600 line-clamp-2">{comment.comment}</div>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant={comment.status === 'approved' ? "default" : comment.status === 'rejected' ? 'destructive' : "secondary"}>
														{getStatusText(comment.status)}
													</Badge>
												</TableCell>
												<TableCell>
													<div className="text-sm">
														{formatDate(comment.reviewDate || comment.createdAt)}
													</div>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex items-center gap-2 justify-end">
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => handleViewReview(comment)}
														>
															<Eye className="h-4 w-4" />
														</Button>
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<Button variant="secondary" size="sm" className="gap-2">
																	<RefreshCw className="h-4 w-4" />
																	Cập nhật
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>Cập nhật trạng thái đánh giá</AlertDialogTitle>
																	<AlertDialogDescription>
																		Chọn hành động cho đánh giá này. Phê duyệt để hiển thị đánh giá trên trang sản phẩm, hoặc Không phê duyệt để ẩn.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>Hủy</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() => handleApproveComment(comment._id, true)}
																		disabled={approveReviewMutation.isPending}
																		className="bg-green-600 hover:bg-green-700 gap-2"
																	>
																		{approveReviewMutation.isPending ? (
																			<Loader2 className="w-4 h-4 animate-spin" />
																		) : (
																			<Check className="w-4 h-4" />
																		)}
																		Phê duyệt
																	</AlertDialogAction>
																	<AlertDialogAction
																		onClick={() => handleApproveComment(comment._id, false)}
																		disabled={approveReviewMutation.isPending}
																		className="bg-red-600 hover:bg-red-700 gap-2"
																	>
																		{approveReviewMutation.isPending ? (
																			<Loader2 className="w-4 h-4 animate-spin" />
																		) : (
																			<X className="w-4 h-4" />
																		)}
																		Không phê duyệt
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
							
							{/* Pagination */}
							{reviewsData?.data && reviewsData.data.totalPages > 1 && (
								<div className="flex items-center justify-between mt-6">
									<div className="text-sm text-gray-700">
										Hiển thị {((filters.page - 1) * filters.limit) + 1} đến{' '}
										{Math.min(filters.page * filters.limit, reviewsData.data.total)} trong tổng số{' '}
										{reviewsData.data.total} đánh giá
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePageChange(filters.page - 1)}
											disabled={filters.page <= 1}
										>
											Trước
										</Button>
										<span className="text-sm text-gray-700">
											Trang {filters.page} / {reviewsData.data.totalPages}
										</span>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePageChange(filters.page + 1)}
											disabled={filters.page >= reviewsData.data.totalPages}
										>
											Sau
										</Button>
									</div>
								</div>
							)}
						</>
					) : (
						<div className="text-center py-8">
							<MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
							<p className="mt-2 text-gray-500">Không có đánh giá nào</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Review Detail Modal */}
			<ReviewDetailModal
				review={selectedReview}
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setSelectedReview(null);
				}}
				onApprove={handleModalApprove}
				isApproving={approveReviewMutation.isPending}
			/>
		</div>
	);
}

