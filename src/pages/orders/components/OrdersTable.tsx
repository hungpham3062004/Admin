import { type Order, orderHelpers } from '@/apis/orders.api';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	useCancelOrder,
	useUpdateOrderStatus,
} from '@/hooks/orders/useOrders';
import { CheckCircle, Eye, Package, Truck, XCircle, Ship, CreditCard, DollarSign } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OrdersTableProps {
	orders: Order[];
	isLoading?: boolean;
	onViewDetails: (order: Order) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
	orders,
	isLoading,
	onViewDetails,
}) => {
	const updateOrderStatus = useUpdateOrderStatus();
	const cancelOrder = useCancelOrder();

	const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
		updateOrderStatus.mutate({
			orderId,
			data: { status: newStatus },
		});
	};

	const handleCancelOrder = (orderId: string) => {
		cancelOrder.mutate({ orderId });
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

	const getPaymentMethodDisplay = (paymentMethod?: string) => {
		switch (paymentMethod) {
			case 'payos':
				return {
					icon: <CreditCard className="h-4 w-4 text-blue-600" />,
					text: 'PayOS',
					variant: 'default' as const,
					className: 'bg-blue-50 text-blue-700 border-blue-200',
				};
			case 'cash':
				return {
					icon: <DollarSign className="h-4 w-4 text-green-600" />,
					text: 'Tiền mặt',
					variant: 'secondary' as const,
					className: 'bg-green-50 text-green-700 border-green-200',
				};
			default:
				return {
					icon: <DollarSign className="h-4 w-4 text-green-600" />,
					text: 'Tiền mặt',
					variant: 'secondary' as const,
					className: 'bg-green-50 text-green-700 border-green-200',
				};
		}
	};

	const getNextStatus = (currentStatus: string): Order['status'][] => {
		switch (currentStatus) {
			case 'pending':
				return ['confirmed', 'failed'];
			case 'confirmed':
				return ['shipping', 'failed'];
			case 'shipping':
				return ['success', 'failed'];
			default:
				return [];
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[...Array(5)].map((_, i) => (
					<div key={i} className="h-16 bg-gray-200 animate-pulse rounded" />
				))}
			</div>
		);
	}

	if (!orders.length) {
		return (
			<div className="text-center py-8">
				<Package className="mx-auto h-12 w-12 text-gray-400" />
				<p className="mt-2 text-gray-500">Không có đơn hàng nào</p>
			</div>
		);
	}

	return (
		<>
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
							<TableHead className="text-right">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{orders.map((order) => {
							const paymentDisplay = getPaymentMethodDisplay(order.paymentMethod);
							
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
									<TableCell className="text-right">
										<div className="flex items-center gap-2 justify-end">
											<Button variant="outline" size="sm" onClick={() => onViewDetails(order)}>
												<Eye className="mr-2 h-4 w-4" /> Xem
											</Button>
											{order.status === 'confirmed' && (
												<Button 
													variant="outline" 
													size="sm" 
													onClick={() => handleStatusChange(order._id, 'shipping')}
												>
													<Ship className="mr-2 h-4 w-4" /> Giao hàng
												</Button>
											)}
											{order.status === 'shipping' && (
												<Button 
													variant="outline" 
													size="sm" 
													onClick={() => handleStatusChange(order._id, 'success')}
												>
													<CheckCircle className="mr-2 h-4 w-4" /> Hoàn thành
												</Button>
											)}
											{!['confirmed', 'shipping', 'success'].includes(order.status) && (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="outline" size="sm">Cập nhật</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														{getNextStatus(order.status).map((status) => (
															<DropdownMenuItem key={status} onClick={() => handleStatusChange(order._id, status)}>
																{orderHelpers.getStatusText(status)}
															</DropdownMenuItem>
														))}
														<DropdownMenuItem onClick={() => handleCancelOrder(order._id)}>
															Hủy đơn
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</>
	);
};
