import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
	Heart, 
	Trash2, 
	Search,
	Filter,
	Eye,
	Users,
	Package,
	TrendingUp,
	Star
} from 'lucide-react';

// Mock data for favorites - replace with actual API calls
const mockFavorites = [
	{
		_id: '1',
		productId: { 
			_id: 'p1',
			name: 'Nhẫn kim cương', 
			images: ['https://via.placeholder.com/50'],
			price: 15000000,
			categoryId: { name: 'Nhẫn' }
		},
		customerId: { 
			_id: 'c1',
			fullName: 'Nguyễn Văn A', 
			email: 'nguyenvana@email.com',
			phone: '0123456789'
		},
		addedAt: '2024-01-15T10:30:00Z'
	},
	{
		_id: '2',
		productId: { 
			_id: 'p2',
			name: 'Dây chuyền vàng', 
			images: ['https://via.placeholder.com/50'],
			price: 8000000,
			categoryId: { name: 'Dây chuyền' }
		},
		customerId: { 
			_id: 'c2',
			fullName: 'Trần Thị B', 
			email: 'tranthib@email.com',
			phone: '0987654321'
		},
		addedAt: '2024-01-14T15:20:00Z'
	},
	{
		_id: '3',
		productId: { 
			_id: 'p3',
			name: 'Bông tai ngọc trai', 
			images: ['https://via.placeholder.com/50'],
			price: 5000000,
			categoryId: { name: 'Bông tai' }
		},
		customerId: { 
			_id: 'c1',
			fullName: 'Nguyễn Văn A', 
			email: 'nguyenvana@email.com',
			phone: '0123456789'
		},
		addedAt: '2024-01-13T09:15:00Z'
	},
	{
		_id: '4',
		productId: { 
			_id: 'p1',
			name: 'Nhẫn kim cương', 
			images: ['https://via.placeholder.com/50'],
			price: 15000000,
			categoryId: { name: 'Nhẫn' }
		},
		customerId: { 
			_id: 'c3',
			fullName: 'Lê Văn C', 
			email: 'levanc@email.com',
			phone: '0555666777'
		},
		addedAt: '2024-01-12T14:45:00Z'
	}
];

export default function FavoritesPage() {
	const [filters, setFilters] = useState({
		page: 1,
		limit: 10,
		search: '',
		customerId: '',
		productId: '',
		sortBy: 'addedAt',
		sortOrder: 'desc' as 'asc' | 'desc'
	});

	const [favorites, setFavorites] = useState(mockFavorites);

	const handleFilterChange = (key: string, value: string) => {
		setFilters(prev => ({
			...prev,
			[key]: value,
			page: 1 // Reset to first page when filtering
		}));
	};

	const handleRemoveFavorite = (customerId: string, productId: string) => {
		setFavorites(prev => prev.filter(fav => 
			!(fav.customerId._id === customerId && fav.productId._id === productId)
		));
	};

	// Calculate statistics
	const totalFavorites = favorites.length;
	const uniqueCustomers = new Set(favorites.map(f => f.customerId._id)).size;
	const uniqueProducts = new Set(favorites.map(f => f.productId._id)).size;
	const totalValue = favorites.reduce((sum, fav) => sum + fav.productId.price, 0);

	// Get most popular products
	const productCounts = favorites.reduce((acc, fav) => {
		const productId = fav.productId._id;
		acc[productId] = (acc[productId] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	const mostPopularProduct = Object.entries(productCounts)
		.sort(([,a], [,b]) => b - a)[0];

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN');
	};

	// Filter favorites based on current filters
	const filteredFavorites = favorites.filter(favorite => {
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			const matchesSearch = 
				favorite.productId.name.toLowerCase().includes(searchLower) ||
				favorite.customerId.fullName.toLowerCase().includes(searchLower) ||
				favorite.customerId.email.toLowerCase().includes(searchLower);
			if (!matchesSearch) return false;
		}

		if (filters.customerId && favorite.customerId._id !== filters.customerId) {
			return false;
		}

		if (filters.productId && favorite.productId._id !== filters.productId) {
			return false;
		}

		return true;
	});

	// Sort favorites
	const sortedFavorites = [...filteredFavorites].sort((a, b) => {
		const aDate = new Date(a.addedAt).getTime();
		const bDate = new Date(b.addedAt).getTime();
		return filters.sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
	});

	return (
		<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Quản lý sản phẩm yêu thích
				</h1>
				<p className="text-gray-600">
					Quản lý sản phẩm được khách hàng yêu thích
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tổng lượt yêu thích</CardTitle>
						<Heart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalFavorites.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Tất cả lượt yêu thích
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Khách hàng yêu thích</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{uniqueCustomers.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Số khách hàng có yêu thích
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sản phẩm được yêu thích</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{uniqueProducts.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Số sản phẩm được yêu thích
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
						<p className="text-xs text-muted-foreground">
							Tổng giá trị sản phẩm yêu thích
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Popular Products Summary */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Sản phẩm phổ biến</CardTitle>
					<CardDescription>
						Sản phẩm được yêu thích nhiều nhất
					</CardDescription>
				</CardHeader>
				<CardContent>
					{mostPopularProduct ? (
						<div className="flex items-center gap-4">
							<Star className="h-8 w-8 text-yellow-500" />
							<div>
								<div className="text-lg font-semibold">
									{mostPopularProduct[0] === 'p1' ? 'Nhẫn kim cương' : 'Sản phẩm khác'}
								</div>
								<div className="text-sm text-gray-600">
									Được yêu thích {mostPopularProduct[1]} lần
								</div>
							</div>
						</div>
					) : (
						<div className="text-gray-500">Không có dữ liệu</div>
					)}
				</CardContent>
			</Card>

			{/* Filters */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Bộ lọc
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="relative">
							<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Tìm kiếm sản phẩm, khách hàng..."
								value={filters.search}
								onChange={(e) => handleFilterChange('search', e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
							<SelectTrigger>
								<SelectValue placeholder="Sắp xếp theo" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="addedAt">Ngày yêu thích</SelectItem>
								<SelectItem value="createdAt">Ngày tạo</SelectItem>
							</SelectContent>
						</Select>
						<Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
							<SelectTrigger>
								<SelectValue placeholder="Thứ tự" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="desc">Mới nhất</SelectItem>
								<SelectItem value="asc">Cũ nhất</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Favorites Table */}
			<Card>
				<CardHeader>
					<CardTitle>Danh sách sản phẩm yêu thích</CardTitle>
					<CardDescription>
						Quản lý tất cả sản phẩm được khách hàng yêu thích
					</CardDescription>
				</CardHeader>
				<CardContent>
					{sortedFavorites.length > 0 ? (
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
										<TableRow key={favorite._id}>
											<TableCell>
												<div className="flex items-center gap-3">
													{favorite.productId.images?.[0] && (
														<img 
															src={favorite.productId.images[0]} 
															alt={favorite.productId.name}
															className="w-12 h-12 object-cover rounded"
														/>
													)}
													<div>
														<div className="font-medium">{favorite.productId.name}</div>
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
													{formatCurrency(favorite.productId.price)}
												</div>
											</TableCell>
											<TableCell>
												{favorite.productId.categoryId ? (
													<div className="text-sm">
														{favorite.productId.categoryId.name}
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
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button variant="outline" size="sm">
																<Trash2 className="h-4 w-4" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>Xóa khỏi yêu thích</AlertDialogTitle>
																<AlertDialogDescription>
																	Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích của khách hàng? Hành động này không thể hoàn tác.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Hủy</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => handleRemoveFavorite(favorite.customerId._id, favorite.productId._id)}
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
							<Heart className="mx-auto h-12 w-12 text-gray-400" />
							<p className="mt-2 text-gray-500">Không có sản phẩm yêu thích nào</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
