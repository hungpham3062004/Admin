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
import { useReviews, useUpdateReview, useDeleteReview, useReviewStats } from '@/hooks/reviews/useReviews';
import { reviewHelpers } from '@/apis/reviews.api';
import { 
	MessageSquare, 
	Star, 
	CheckCircle, 
	XCircle, 
	Trash2, 
	Search,
	Filter,
	Eye
} from 'lucide-react';

export default function ReviewsPage() {
	const [filters, setFilters] = useState({
		page: 1,
		limit: 10,
		search: '',
		rating: '',
		isApproved: '',
		sortBy: 'reviewDate',
		sortOrder: 'desc' as 'asc' | 'desc'
	});

	const { data: reviewsData, isLoading } = useReviews(filters);
	const { data: reviewStats } = useReviewStats();
	const updateReview = useUpdateReview();
	const deleteReview = useDeleteReview();

	const handleFilterChange = (key: string, value: string) => {
		setFilters(prev => ({
			...prev,
			[key]: value,
			page: 1 // Reset to first page when filtering
		}));
	};

	const handleApproveReview = (reviewId: string, isApproved: boolean) => {
		updateReview.mutate({
			reviewId,
			data: { isApproved }
		});
	};

	const handleDeleteReview = (reviewId: string) => {
		deleteReview.mutate(reviewId);
	};

	const totalReviews = reviewStats?.totalReviews || 0;
	const averageRating = reviewStats?.averageRating || 0;
	const pendingReviews = reviewStats?.pendingReviews || 0;
	const approvedReviews = reviewStats?.approvedReviews || 0;

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
						<div className="text-2xl font-bold">{totalReviews.toLocaleString()}</div>
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
						<CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
						<XCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{pendingReviews.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Đánh giá chờ duyệt
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{approvedReviews.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Đánh giá đã duyệt
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
								className="pl-10"
							/>
						</div>
						<Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
							<SelectTrigger>
								<SelectValue placeholder="Điểm đánh giá" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">Tất cả</SelectItem>
								<SelectItem value="5">5 sao</SelectItem>
								<SelectItem value="4">4 sao</SelectItem>
								<SelectItem value="3">3 sao</SelectItem>
								<SelectItem value="2">2 sao</SelectItem>
								<SelectItem value="1">1 sao</SelectItem>
							</SelectContent>
						</Select>
						<Select value={filters.isApproved} onValueChange={(value) => handleFilterChange('isApproved', value)}>
							<SelectTrigger>
								<SelectValue placeholder="Trạng thái" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">Tất cả</SelectItem>
								<SelectItem value="true">Đã duyệt</SelectItem>
								<SelectItem value="false">Chờ duyệt</SelectItem>
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

			{/* Reviews Table */}
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
							<div className="text-gray-500">Đang tải dữ liệu...</div>
						</div>
					) : reviewsData?.reviews?.length > 0 ? (
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
									{reviewsData.reviews.map((review) => (
										<TableRow key={review._id}>
											<TableCell>
												<div className="flex items-center gap-3">
													{review.productId.images?.[0] && (
														<img 
															src={review.productId.images[0]} 
															alt={review.productId.name}
															className="w-12 h-12 object-cover rounded"
														/>
													)}
													<div>
														<div className="font-medium">{review.productId.name}</div>
														<div className="text-sm text-gray-500">
															{review.orderId.orderCode}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">{review.customerId.fullName}</div>
													<div className="text-sm text-gray-500">{review.customerId.email}</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<span className="text-yellow-500 text-lg">
														{reviewHelpers.getRatingStars(review.rating)}
													</span>
													<span className="text-sm text-gray-600">
														({review.rating}/5)
													</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="max-w-xs">
													<div className="font-medium text-sm">{review.title}</div>
													<div className="text-sm text-gray-600 line-clamp-2">
														{review.comment}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={review.isApproved ? "default" : "secondary"}>
													{reviewHelpers.getStatusText(review.isApproved)}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													{reviewHelpers.formatDate(review.reviewDate)}
												</div>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center gap-2 justify-end">
													<Button variant="outline" size="sm">
														<Eye className="h-4 w-4" />
													</Button>
													{!review.isApproved ? (
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => handleApproveReview(review._id, true)}
															disabled={updateReview.isPending}
														>
															<CheckCircle className="h-4 w-4" />
														</Button>
													) : (
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => handleApproveReview(review._id, false)}
															disabled={updateReview.isPending}
														>
															<XCircle className="h-4 w-4" />
														</Button>
													)}
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button variant="outline" size="sm">
																<Trash2 className="h-4 w-4" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>Xóa đánh giá</AlertDialogTitle>
																<AlertDialogDescription>
																	Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Hủy</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => handleDeleteReview(review._id)}
																	className="bg-red-600 hover:bg-red-700"
																>
																	Xóa
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
					) : (
						<div className="text-center py-8">
							<MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
							<p className="mt-2 text-gray-500">Không có đánh giá nào</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
