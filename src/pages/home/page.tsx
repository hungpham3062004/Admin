import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
	Table, 
	TableBody, 
	TableCell, 
	TableHead, 
	TableHeader, 
	TableRow 
} from '@/components/ui/table';
import { 
	BarChart, 
	Bar, 
	XAxis, 
	YAxis, 
	CartesianGrid, 
	Tooltip, 
	Legend, 
	ResponsiveContainer
} from 'recharts';
import { useOrderTimeSeries, useOrderStats, useOrders } from '@/hooks/orders/useOrders';
import { orderHelpers } from '@/apis/orders.api';
import { 
	Calendar, 
	TrendingUp, 
	Package, 
	DollarSign, 
	CheckCircle,
	Truck,
	CreditCard,
	XCircle,
	ShoppingCart
} from 'lucide-react';

export default function HomePage() {
	const [granularity, setGranularity] = useState<'day' | 'week' | 'month' | 'year'>('day');
	const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});

	// Get time series data
	const { data: timeSeriesData, isLoading: isLoadingTimeSeries } = useOrderTimeSeries({
		granularity,
		...dateRange
	});

	// Get order stats
	const { data: orderStats, isLoading: isLoadingStats } = useOrderStats();

	// Get recent orders for dashboard
	const { data: recentOrdersData, isLoading: isLoadingRecentOrders } = useOrders({
		page: 1,
		limit: 10,
		sortBy: 'orderDate',
		sortOrder: 'desc'
	});

	// Format data for chart
	const chartData = timeSeriesData?.map(item => ({
		date: new Date(item.date).toLocaleDateString('vi-VN', {
			day: granularity === 'day' ? '2-digit' : undefined,
			month: ['day', 'week', 'month'].includes(granularity) ? '2-digit' : undefined,
			year: 'numeric'
		}),
		totalAmount: item.revenue,
		successRate: item.successRate ? Math.round(item.successRate * 100) : 0,
		orderCount: item.orderCount,
		successCount: item.successCount || 0
	})) || [];

	// Calculate totals
	const totalOrders = orderStats?.totalOrders || 0;
	const totalRevenue = orderStats?.totalRevenue || 0;
	const successOrders = orderStats?.statusBreakdown?.find(s => s._id === 'success')?.count || 0;
	const successRate = totalOrders > 0 ? Math.round((successOrders / totalOrders) * 100) : 0;

	// Get date range options
	const getDateRangeOptions = () => {
		const options = [
			{ label: '7 ngày qua', value: '7days' },
			{ label: '30 ngày qua', value: '30days' },
			{ label: '3 tháng qua', value: '3months' },
			{ label: '1 năm qua', value: '1year' },
		];

		return options;
	};

	const handleDateRangeChange = (value: string) => {
		const now = new Date();
		let startDate: Date;

		switch (value) {
			case '7days':
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case '30days':
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case '3months':
				startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			case '1year':
				startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
				break;
			default:
				setDateRange({});
				return;
		}

		setDateRange({
			startDate: startDate.toISOString().split('T')[0],
			endDate: now.toISOString().split('T')[0]
		});
	};

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
					<p className="font-medium">{label}</p>
					<p className="text-blue-600">
						Tổng tiền: {orderHelpers.formatCurrency(payload[0]?.value || 0)}
					</p>
					<p className="text-green-600">
						Tỷ lệ thành công: {payload[1]?.value || 0}%
					</p>
					<p className="text-gray-600">
						Số đơn hàng: {payload[2]?.value || 0}
					</p>
				</div>
			);
		}
		return null;
	};

	const getPaymentMethodDisplay = (paymentMethod: string) => {
		switch (paymentMethod) {
			case 'payos':
				return { 
					text: 'PayOS', 
					icon: <CreditCard className="h-4 w-4 text-blue-600" />,
					variant: 'default' as const,
					className: 'bg-blue-50 text-blue-700 border-blue-200',
				};
			case 'cash':
				return { 
					text: 'Tiền mặt', 
					icon: <DollarSign className="h-4 w-4 text-green-600" />,
					variant: 'secondary' as const,
					className: 'bg-green-50 text-green-700 border-green-200',
				};
			default:
				return { 
					text: 'Tiền mặt', 
					icon: <DollarSign className="h-4 w-4 text-green-600" />,
					variant: 'secondary' as const,
					className: 'bg-green-50 text-green-700 border-green-200',
				};
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'pending':
				return <Package className="h-4 w-4" />;
			case 'confirmed':
				return <CheckCircle className="h-4 w-4" />;
			case 'shipping':
				return <Truck className="h-4 w-4" />;
			case 'success':
				return <CheckCircle className="h-4 w-4" />;
			case 'failed':
				return <XCircle className="h-4 w-4" />;
			default:
				return <Package className="h-4 w-4" />;
		}
	};

	return (
		<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Dashboard
				</h1>
				<p className="text-gray-600">
					Tổng quan về đơn hàng và doanh thu
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
						<ShoppingCart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Tất cả đơn hàng
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{orderHelpers.formatCurrency(totalRevenue)}</div>
						<p className="text-xs text-muted-foreground">
							Tổng doanh thu
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Đơn hàng thành công</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{successOrders.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Đã hoàn thành
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tỷ lệ thành công</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{successRate}%</div>
						<p className="text-xs text-muted-foreground">
							Tỷ lệ hoàn thành
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Chart Controls */}
			<div className="mb-6 flex flex-col sm:flex-row gap-4">
				<div className="flex items-center gap-2">
					<Calendar className="h-4 w-4 text-gray-500" />
					<span className="text-sm font-medium text-gray-700">Khoảng thời gian:</span>
					<Select onValueChange={handleDateRangeChange}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Chọn khoảng thời gian" />
						</SelectTrigger>
						<SelectContent>
							{getDateRangeOptions().map(option => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-gray-700">Đơn vị thời gian:</span>
					<Select value={granularity} onValueChange={(value: 'day' | 'week' | 'month' | 'year') => setGranularity(value)}>
						<SelectTrigger className="w-[120px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="day">Ngày</SelectItem>
							<SelectItem value="week">Tuần</SelectItem>
							<SelectItem value="month">Tháng</SelectItem>
							<SelectItem value="year">Năm</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Chart */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Biểu đồ đơn hàng</CardTitle>
					<CardDescription>
						Thống kê doanh thu và tỷ lệ thành công theo thời gian
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoadingTimeSeries ? (
						<div className="h-80 flex items-center justify-center">
							<div className="text-gray-500">Đang tải dữ liệu...</div>
						</div>
					) : chartData.length > 0 ? (
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis 
										dataKey="date" 
										tick={{ fontSize: 12 }}
										angle={-45}
										textAnchor="end"
										height={80}
									/>
									<YAxis 
										yAxisId="left"
										tick={{ fontSize: 12 }}
										tickFormatter={(value) => orderHelpers.formatCurrency(value)}
									/>
									<YAxis 
										yAxisId="right" 
										orientation="right"
										tick={{ fontSize: 12 }}
										tickFormatter={(value) => `${value}%`}
									/>
									<Tooltip content={<CustomTooltip />} />
									<Legend />
									<Bar 
										yAxisId="left"
										dataKey="totalAmount" 
										fill="#3b82f6" 
										name="Tổng tiền"
										radius={[4, 4, 0, 0]}
									/>
									<Bar 
										yAxisId="right"
										dataKey="successRate" 
										fill="#10b981" 
										name="Tỷ lệ thành công (%)"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					) : (
						<div className="h-80 flex items-center justify-center">
							<div className="text-gray-500">Không có dữ liệu</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Total Orders Summary */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Tổng quan đơn hàng</CardTitle>
					<CardDescription>
						Thống kê chi tiết về đơn hàng
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoadingStats ? (
						<div className="text-gray-500">Đang tải dữ liệu...</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
							{orderStats?.statusBreakdown?.map((status) => (
								<div key={status._id} className="text-center">
									<div className="text-2xl font-bold text-gray-900">
										{status.count.toLocaleString()}
									</div>
									<div className="text-sm text-gray-600">
										{orderHelpers.getStatusText(status._id)}
									</div>
									<Badge variant="outline" className="mt-1">
										{orderHelpers.formatCurrency(status.totalAmount)}
									</Badge>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Recent Orders Table */}
			<Card>
				<CardHeader>
					<CardTitle>Đơn hàng gần đây</CardTitle>
					<CardDescription>
						Danh sách 10 đơn hàng mới nhất
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoadingRecentOrders ? (
						<div className="text-gray-500">Đang tải dữ liệu...</div>
					) : recentOrdersData?.orders && recentOrdersData.orders.length > 0 ? (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[140px]">Mã đơn</TableHead>
										<TableHead>Khách hàng</TableHead>
										<TableHead>Tổng tiền</TableHead>
										<TableHead>Thanh toán</TableHead>
										<TableHead>Trạng thái</TableHead>
										<TableHead>Ngày đặt</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{recentOrdersData.orders.map((order) => {
										const paymentDisplay = getPaymentMethodDisplay(order.paymentMethod || 'cash');
										
										return (
											<TableRow key={order._id}>
												<TableCell className="font-mono">{order.orderCode}</TableCell>
												<TableCell>{order.customerId?.fullName || 'N/A'}</TableCell>
												<TableCell>{orderHelpers.formatCurrency(order.finalAmount)}</TableCell>
												<TableCell>
													<Badge variant="outline" className={`flex items-center gap-1 ${paymentDisplay.className}`}>
														{paymentDisplay.icon} {paymentDisplay.text}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge variant="secondary" className="flex items-center gap-1">
														{getStatusIcon(order.status)} {orderHelpers.getStatusText(order.status)}
													</Badge>
												</TableCell>
												<TableCell>{new Date(order.orderDate).toLocaleString('vi-VN')}</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					) : (
						<div className="text-center py-8">
							<Package className="mx-auto h-12 w-12 text-gray-400" />
							<p className="mt-2 text-gray-500">Không có đơn hàng nào</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
