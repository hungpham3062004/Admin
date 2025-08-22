import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
	Table, 
	TableBody, 
	TableCell, 
	TableHead, 
	TableHeader, 
	TableRow 
} from '@/components/ui/table';
// Removed AlertDialog imports as they are no longer used
import { 
	Heart, 
	Eye,
	Users,
	Package,
	TrendingUp,
	Star,
	ChevronLeft,
	ChevronRight,
	AlertCircle,
	RefreshCw
} from 'lucide-react';
import { useCustomerFavorites, useFavoriteStats, useRemoveFavorite } from '@/hooks/useFavorites';
import { useCategories } from '@/hooks/categories/useCategory';

// Mock data for favorites - replace with actual API calls
// const mockFavorites = [];

export default function FavoritesPage() {
	const [filters, setFilters] = useState({
		page: 1,
		limit: 10,
		search: '',
		customerId: '',
		productId: '',
		categoryId: 'all',
		sortBy: 'addedAt',
		sortOrder: 'desc' as 'asc' | 'desc'
	});

	// const [favorites, setFavorites] = useState(mockFavorites);

	const { data: statsData, error: statsError, isLoading: statsLoading, refetch: refetchStats } = useFavoriteStats();
	const { data: customerFavoritesData, isLoading: favoritesLoading, error: favoritesError, refetch: refetchFavorites } = useCustomerFavorites(
		filters.customerId || undefined,
		{
			page: filters.page,
			limit: filters.limit,
			search: filters.search || undefined,
			sortBy: filters.sortBy,
			sortOrder: filters.sortOrder,
		}
	);
	// const { data: categoriesData } = useCategories({ limit: 100 });
	const removeMutation = useRemoveFavorite();

	// const handleFilterChange = (key: string, value: string) => {
	// 	setFilters(prev => ({
	// 		...prev,
	// 		[key]: value,
	// 		page: 1 // Reset to first page when filtering
	// 	}));
	// };

	const handleRemoveFavorite = (customerId: string, productId: string) => {
		removeMutation.mutate({ customerId, productId });
	};

	// Calculate statistics from API stats
	const totalFavorites = statsData?.totalFavorites || 0;
	const uniqueCustomers = statsData?.uniqueCustomers || 0;
	const uniqueProducts = statsData?.uniqueProducts || 0;
	const totalValue = statsData?.totalValue || 0;

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN');
	};

	const sortedFavorites = useMemo(() => {
		const favorites = customerFavoritesData?.favorites || [];
		let filtered = favorites.filter((favorite) => {
			if (filters.productId && favorite.productId._id !== filters.productId) {
				return false;
			}
			// Lọc theo danh mục
			if (filters.categoryId !== 'all' && favorite.productId.categoryId?._id !== filters.categoryId) {
				return false;
			}
			return true;
		});

		// Sắp xếp theo tiêu chí
		const sorted = [...filtered].sort((a, b) => {
			switch (filters.sortBy) {
				case 'favoriteCount':
					// Sắp xếp theo số lượt yêu thích (sử dụng stats nếu có)
					const aCount = statsData?.mostPopularProducts?.find(p => p.productId === a.productId._id)?.favoriteCount || 0;
					const bCount = statsData?.mostPopularProducts?.find(p => p.productId === b.productId._id)?.favoriteCount || 0;
					return filters.sortOrder === 'desc' ? bCount - aCount : aCount - bCount;
				case 'price':
					const aPrice = (a.productId as any).effectivePrice ?? (a.productId as any).discountedPrice ?? a.productId.price;
					const bPrice = (b.productId as any).effectivePrice ?? (b.productId as any).discountedPrice ?? b.productId.price;
					return filters.sortOrder === 'desc' ? bPrice - aPrice : aPrice - bPrice;
				case 'addedAt':
				default:
					const aDate = new Date(a.addedAt).getTime();
					const bDate = new Date(b.addedAt).getTime();
					return filters.sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
			}
		});
		
		return sorted;
	}, [customerFavoritesData, filters.productId, filters.categoryId, filters.sortBy, filters.sortOrder, statsData]);

	const handlePageChange = (newPage: number) => {
		setFilters(prev => ({ ...prev, page: newPage }));
	};

	// Error handling component
	const ErrorDisplay = ({ error, onRetry }: { error: any; onRetry: () => void }) => (
		<div className="text-center py-8">
			<AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
			<h3 className="text-lg font-semibold text-gray-900 mb-2">Đã xảy ra lỗi</h3>
			<p className="text-gray-600 mb-4">
				{error?.response?.status === 404 
					? 'Không thể kết nối đến máy chủ API. Vui lòng kiểm tra xem máy chủ đã được khởi động chưa.'
					: error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi tải dữ liệu'
				}
			</p>
			<Button onClick={onRetry} className="flex items-center gap-2">
				<RefreshCw className="h-4 w-4" />
				Thử lại
			</Button>
		</div>
	);

	// Loading component
	const LoadingDisplay = () => (
		<div className="text-center py-8">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
			<p className="text-gray-500">Đang tải dữ liệu...</p>
		</div>
	);

	return (
		<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
			{/* Header đẹp hơn */}
			<div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-r from-pink-50 via-rose-50 to-orange-50">
				<div className="flex items-center gap-4 p-6">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
						<Heart className="h-6 w-6 text-rose-500" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm yêu thích</h1>
						<p className="text-sm text-gray-600">
							Quản lý sản phẩm được khách hàng yêu thích
						</p>
					</div>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tổng lượt yêu thích</CardTitle>
						<Heart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{statsLoading ? (
							<div className="animate-pulse">
								<div className="h-8 bg-gray-200 rounded mb-2"></div>
								<div className="h-4 bg-gray-200 rounded"></div>
							</div>
						) : statsError ? (
							<div className="text-red-500 text-sm">Lỗi tải dữ liệu</div>
						) : (
							<>
								<div className="text-2xl font-bold">{totalFavorites.toLocaleString()}</div>
								<p className="text-xs text-muted-foreground">
									Tất cả lượt yêu thích
								</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Khách hàng yêu thích</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{statsLoading ? (
							<div className="animate-pulse">
								<div className="h-8 bg-gray-200 rounded mb-2"></div>
								<div className="h-4 bg-gray-200 rounded"></div>
							</div>
						) : statsError ? (
							<div className="text-red-500 text-sm">Lỗi tải dữ liệu</div>
						) : (
							<>
								<div className="text-2xl font-bold">{uniqueCustomers.toLocaleString()}</div>
								<p className="text-xs text-muted-foreground">
									Số khách hàng có yêu thích
								</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sản phẩm được yêu thích</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{statsLoading ? (
							<div className="animate-pulse">
								<div className="h-8 bg-gray-200 rounded mb-2"></div>
								<div className="h-4 bg-gray-200 rounded"></div>
							</div>
						) : statsError ? (
							<div className="text-red-500 text-sm">Lỗi tải dữ liệu</div>
						) : (
							<>
								<div className="text-2xl font-bold">{uniqueProducts.toLocaleString()}</div>
								<p className="text-xs text-muted-foreground">
									Số sản phẩm được yêu thích
								</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{statsLoading ? (
							<div className="animate-pulse">
								<div className="h-8 bg-gray-200 rounded mb-2"></div>
								<div className="h-4 bg-gray-200 rounded"></div>
							</div>
						) : statsError ? (
							<div className="text-red-500 text-sm">Lỗi tải dữ liệu</div>
						) : (
							<>
								<div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
								<p className="text-xs text-muted-foreground">
									Tổng giá trị sản phẩm yêu thích
								</p>
							</>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Error display for stats */}
			{statsError && (
				<Card className="mb-8">
					<CardContent className="pt-6">
						<ErrorDisplay error={statsError} onRetry={() => refetchStats()} />
					</CardContent>
				</Card>
			)}

			{/* Top được yêu thích nhiều */}
			{statsData?.mostPopularProducts?.length ? (
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Star className="h-5 w-5 text-yellow-500" />
							Sản phẩm được yêu thích nhiều nhất
						</CardTitle>
						<CardDescription>
							Top sản phẩm có nhiều lượt yêu thích nhất
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
							{statsData.mostPopularProducts.slice(0, 8).map((p) => (
								<Card key={p.productId} className="border-gray-200 p-4">
									<CardContent className="p-0">
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
												<Heart className="h-5 w-5 text-rose-500" />
											</div>
											<div className="flex-1">
												<div className="font-semibold text-sm line-clamp-2">{p.productName}</div>
												<div className="text-xs text-gray-600">
													{p.favoriteCount} lượt yêu thích
												</div>
												<div className="text-xs text-gray-500">
													{formatCurrency(p.totalValue)}
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</CardContent>
				</Card>
			) : null}

			{/* Favorites Table */}
			<Card>
				<CardHeader>
					<CardTitle>Danh sách sản phẩm yêu thích</CardTitle>
					<CardDescription>
						Quản lý tất cả sản phẩm được khách hàng yêu thích
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!filters.customerId ? (
						<div className="text-center py-8">
							<Heart className="mx-auto h-12 w-12 text-gray-400" />
							<p className="mt-2 text-gray-500">Nhập Customer ID để xem danh sách yêu thích.</p>
						</div>
					) : favoritesError ? (
						<ErrorDisplay error={favoritesError} onRetry={() => refetchFavorites()} />
					) : favoritesLoading ? (
						<LoadingDisplay />
					) : sortedFavorites.length > 0 ? (
						<>
							{/* Stats */}
							<div className="mb-6 flex items-center gap-3">
								<div className="text-sm text-gray-600">
									{customerFavoritesData?.total} sản phẩm yêu thích
								</div>
							</div>

							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Sản phẩm</TableHead>
											<TableHead>Khách hàng</TableHead>
											<TableHead>Giá</TableHead>
											<TableHead>Danh mục</TableHead>
											<TableHead>Ngày yêu thích</TableHead>
											<TableHead className="text-right">Thao tác</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{sortedFavorites.map((favorite) => (
											<TableRow key={favorite.id}>
												<TableCell>
													<div className="flex items-center gap-3">
														{favorite.productId.images?.[0] && (
															<img 
																src={favorite.productId.images[0]} 
																alt={favorite.productId.productName}
																className="w-12 h-12 object-cover rounded"
																onError={(e) => {
																	const target = e.target as HTMLImageElement;
																	target.src = 'https://via.placeholder.com/300x300?text=No+Image';
																}}
															/>
														)}
														<div>
															<div className="font-medium">{favorite.productId.productName}</div>
															<div className="text-sm text-gray-500">
																ID: {favorite.productId._id}
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div>
														<div className="font-medium">{favorite.customerId.fullName}</div>
														<div className="text-sm text-gray-500">{favorite.customerId.email}</div>
														{favorite.customerId.phone && (
															<div className="text-sm text-gray-500">{favorite.customerId.phone}</div>
														)}
													</div>
												</TableCell>
												<TableCell>
													<div className="font-medium">
														{formatCurrency((favorite.productId as any).effectivePrice ?? (favorite.productId as any).discountedPrice ?? favorite.productId.price)}
													</div>
													{((favorite.productId as any).discountPercentage ?? 0) > 0 && (
														<div className="text-sm text-gray-500">
															<span className="line-through">
																{formatCurrency(favorite.productId.price)}
															</span>
															<span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
																-{(favorite.productId as any).discountPercentage}%
															</span>
														</div>
													)}
												</TableCell>
												<TableCell>
													{favorite.productId.categoryId ? (
														<div className="text-sm">
															{(favorite.productId.categoryId as any).categoryName}
														</div>
													) : (
														<div className="text-sm text-gray-500">Không có danh mục</div>
													)}
												</TableCell>
												<TableCell>
													<div className="text-sm">
														{formatDate(favorite.addedAt)}
													</div>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex items-center gap-2 justify-end">
														<Button variant="outline" size="sm">
															<Eye className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleRemoveFavorite(favorite.customerId._id, favorite.productId._id)}
															aria-label="Bỏ yêu thích"
															title="Bỏ yêu thích"
														>
															<Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* Phân trang */}
							{customerFavoritesData && customerFavoritesData.totalPages > 1 && (
								<div className="flex justify-center gap-2 mt-6">
									<Button
										variant="outline"
										onClick={() => handlePageChange(filters.page - 1)}
										disabled={filters.page === 1}
									>
										<ChevronLeft className="h-4 w-4 mr-1" />
										Trước
									</Button>
									<span className="flex items-center px-4 text-sm text-gray-600">
										Trang {filters.page} / {customerFavoritesData?.totalPages}
									</span>
									<Button
										variant="outline"
										onClick={() => handlePageChange(filters.page + 1)}
										disabled={filters.page === (customerFavoritesData?.totalPages || 1)}
									>
										Sau
										<ChevronRight className="h-4 w-4 ml-1" />
									</Button>
								</div>
							)}
						</>
					) : (
						<div className="text-center py-8">
							<Heart className="mx-auto h-12 w-12 text-gray-400" />
							<p className="mt-2 text-gray-500">Không có sản phẩm yêu thích nào</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
