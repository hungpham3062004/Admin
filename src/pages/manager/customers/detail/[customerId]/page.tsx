import { ArrowLeftIcon, LockIcon, PencilIcon, UnlockIcon } from 'lucide-react';
import { useCustomerDetail, useLockCustomer, useUnlockCustomer } from '@/hooks/customers/useCustomer';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function CustomerDetailPage() {
	const navigate = useNavigate();
	const { customer, isLoading, error } = useCustomerDetail();
	const { mutate: lockCustomer, isPending: isLocking } = useLockCustomer();
	const { mutate: unlockCustomer, isPending: isUnlocking } = useUnlockCustomer();
	const [processing, setProcessing] = useState(false);

	const handleToggleLock = () => {
		if (!customer) return;
		setProcessing(true);
		if ((customer as any).isLocked) {
			unlockCustomer(customer._id, { onSettled: () => setProcessing(false) });
		} else {
			lockCustomer(customer._id, { onSettled: () => setProcessing(false) });
		}
	};

	if (isLoading) {
		return (
			<div className="py-8 px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					<div className="text-gray-500">Đang tải dữ liệu...</div>
				</div>
			</div>
		);
	}

	if (error || !customer) {
		return (
			<div className="py-8 px-4 sm:px-6 lg:px-8">
				<div className="text-center text-red-600">
					<h2 className="text-2xl font-bold">Lỗi tải dữ liệu</h2>
					<p>Không thể tải thông tin khách hàng. Vui lòng thử lại.</p>
					<Button
						variant="outline"
						onClick={() => navigate('/customers')}
						className="mt-4"
					>
						Quay lại danh sách
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="py-8 px-4 sm:px-6 lg:px-8">
			<div className="flex items-center justify-between mb-6">
				<Button
					variant="ghost"
					onClick={() => navigate('/customers')}
					className="flex items-center"
				>
					<ArrowLeftIcon className="w-4 h-4 mr-2" /> Quay lại
				</Button>
				<div className="flex gap-2">
					<Button
						onClick={() => navigate(`/customers/edit/${customer._id}`)}
						className="justify-start"
						variant="outline"
					>
						<PencilIcon className="w-4 h-4 mr-2" />
						Chỉnh sửa thông tin
					</Button>
					<Button variant="outline" onClick={handleToggleLock} disabled={processing || isLocking || isUnlocking}>
						{(customer as any).isLocked ? (
							<>
								<UnlockIcon className="w-4 h-4 mr-2" /> Mở khóa tài khoản
							</>
						) : (
							<>
								<LockIcon className="w-4 h-4 mr-2" /> Khóa tài khoản
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Content of customer detail remains unchanged */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-lg font-medium text-gray-900">
							Thông tin cá nhân
						</h2>
					</div>
					<div className="p-6 space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Họ và tên
								</label>
								<div className="text-lg font-semibold text-gray-900">
									{customer?.fullName}
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email
								</label>
								<div className="text-gray-900">{customer.email}</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Số điện thoại
								</label>
								<div className="text-gray-900">{customer.phone}</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Trạng thái
								</label>
								<Badge
									variant="secondary"
									className="bg-green-100 text-green-800"
								>
									Hoạt động
								</Badge>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Địa chỉ
							</label>
							<div className="text-gray-900 p-3 bg-gray-50 rounded-md">
								{customer.address}
							</div>
						</div>
					</div>
				</div>
				<div className="space-y-6">
					<div className="bg-white rounded-lg shadow p-6">
						<h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái</h3>
						<Badge variant={(customer as any).isLocked ? 'destructive' : 'default'}>
							{(customer as any).isLocked ? 'Đã khóa' : 'Hoạt động'}
						</Badge>
					</div>
					{/* System Information */}
					<div className="bg-white rounded-lg shadow p-6">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Thông tin hệ thống
						</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									ID khách hàng
								</label>
								<code className="text-sm bg-gray-100 px-2 py-1 rounded">
									{customer._id}
								</code>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Ngày tạo tài khoản
								</label>
								<div className="text-sm text-gray-600">
									{new Date(customer.createdAt).toLocaleString('vi-VN')}
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Cập nhật lần cuối
								</label>
								<div className="text-sm text-gray-600">
									{new Date(customer.updatedAt).toLocaleString('vi-VN')}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
