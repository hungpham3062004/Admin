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
	Trash2, 
	Search,
	Filter,
	Eye,
	ThumbsUp,
	ThumbsDown
} from 'lucide-react';

// Mock data for comments - replace with actual API calls
const mockComments = [
	{
		_id: '1',
		productId: { name: 'Nhẫn kim cương', images: ['https://via.placeholder.com/50'] },
		customerId: { fullName: 'Nguyễn Văn A', email: 'nguyenvana@email.com' },
		rating: 5,
		title: 'Sản phẩm rất đẹp',
		comment: 'Nhẫn rất đẹp, chất lượng tốt, giao hàng nhanh chóng.',
		isApproved: true,
		reviewDate: '2024-01-15T10:30:00Z'
	},
	{
		_id: '2',
		productId: { name: 'Dây chuyền vàng', images: ['https://via.placeholder.com/50'] },
		customerId: { fullName: 'Trần Thị B', email: 'tranthib@email.com' },
		rating: 4,
		title: 'Hài lòng với sản phẩm',
		comment: 'Dây chuyền đẹp, giá cả hợp lý.',
		isApproved: false,
		reviewDate: '2024-01-14T15:20:00Z'
	},
	{
		_id: '3',
		productId: { name: 'Bông tai ngọc trai', images: ['https://via.placeholder.com/50'] },
		customerId: { fullName: 'Lê Văn C', email: 'levanc@email.com' },
		rating: 3,
		title: 'Sản phẩm tạm được',
		comment: 'Chất lượng ổn nhưng giá hơi cao.',
		isApproved: true,
		reviewDate: '2024-01-13T09:15:00Z'
	}
];

export default function CommentsPage() {
	const [filters, setFilters] = useState({
		page: 1,
		limit: 10,
		search: '',
		rating: '',
		isApproved: '',
		sortBy: 'reviewDate',
		sortOrder: 'desc' as 'asc' | 'desc'
	});

	const [comments, setComments] = useState(mockComments);

	const handleFilterChange = (key: string, value: string) => {
		setFilters(prev => ({
			...prev,
			[key]: value,
			page: 1 // Reset to first page when filtering
		}));
	};

	const handleApproveComment = (commentId: string, isApproved: boolean) => {
		setComments(prev => prev.map(comment => 
			comment._id === commentId ? { ...comment, isApproved } : comment
		));
	};

	const handleDeleteComment = (commentId: string) => {
		setComments(prev => prev.filter(comment => comment._id !== commentId));
	};

	// Calculate statistics
	const totalComments = comments.length;
	const averageRating = comments.reduce((sum, comment) => sum + comment.rating, 0) / totalComments || 0;
	const pendingComments = comments.filter(comment => !comment.isApproved).length;
	const approvedComments = comments.filter(comment => comment.isApproved).length;

	const getRatingStars = (rating: number) => {
		return '★'.repeat(rating) + '☆'.repeat(5 - rating);
	};

	const getStatusText = (isApproved: boolean) => {
		return isApproved ? 'Đã duyệt' : 'Chờ duyệt';
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN');
	};

	// Filter comments based on current filters
	const filteredComments = comments.filter(comment => {
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			const matchesSearch = 
				comment.productId.name.toLowerCase().includes(searchLower) ||
				comment.customerId.fullName.toLowerCase().includes(searchLower) ||
				comment.title.toLowerCase().includes(searchLower) ||
				comment.comment.toLowerCase().includes(searchLower);
			if (!matchesSearch) return false;
		}

		if (filters.rating && comment.rating !== parseInt(filters.rating)) {
			return false;
		}

		if (filters.isApproved !== '' && comment.isApproved !== (filters.isApproved === 'true')) {
			return false;
		}

		return true;
	});

	// Sort comments
	const sortedComments = [...filteredComments].sort((a, b) => {
		const aDate = new Date(a.reviewDate).getTime();
		const bDate = new Date(b.reviewDate).getTime();
		return filters.sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
	});

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
						<CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
						<XCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{pendingComments.toLocaleString()}</div>
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
						<div className="text-2xl font-bold">{approvedComments.toLocaleString()}</div>
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

			{/* Comments Table */}
			<Card>
				<CardHeader>
					<CardTitle>Danh sách đánh giá</CardTitle>
					<CardDescription>
						Quản lý tất cả đánh giá từ khách hàng
					</CardDescription>
				</CardHeader>
				<CardContent>
					{sortedComments.length > 0 ? (
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
									{sortedComments.map((comment) => (
										<TableRow key={comment._id}>
											<TableCell>
												<div className="flex items-center gap-3">
													{comment.productId.images?.[0] && (
														<img 
															src={comment.productId.images[0]} 
															alt={comment.productId.name}
															className="w-12 h-12 object-cover rounded"
														/>
													)}
													<div>
														<div className="font-medium">{comment.productId.name}</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">{comment.customerId.fullName}</div>
													<div className="text-sm text-gray-500">{comment.customerId.email}</div>
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
													<div className="text-sm text-gray-600 line-clamp-2">
														{comment.comment}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={comment.isApproved ? "default" : "secondary"}>
													{getStatusText(comment.isApproved)}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													{formatDate(comment.reviewDate)}
												</div>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center gap-2 justify-end">
													<Button variant="outline" size="sm">
														<Eye className="h-4 w-4" />
													</Button>
													{!comment.isApproved ? (
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => handleApproveComment(comment._id, true)}
														>
															<ThumbsUp className="h-4 w-4" />
														</Button>
													) : (
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => handleApproveComment(comment._id, false)}
														>
															<ThumbsDown className="h-4 w-4" />
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
																	onClick={() => handleDeleteComment(comment._id)}
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

