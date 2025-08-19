import { EyeIcon, LockIcon, PencilIcon, UnlockIcon } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import type { Customer } from '@/types/customer.type';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLockCustomer, useUnlockCustomer } from '@/hooks/customers/useCustomer';

interface TableCustomerProps {
	customers: Customer[];
}

export const TableCustomer = ({ customers }: TableCustomerProps) => {
	const navigate = useNavigate();
	const { mutate: lockCustomer, isPending: isLocking } = useLockCustomer();
	const { mutate: unlockCustomer, isPending: isUnlocking } = useUnlockCustomer();
	const [processingId, setProcessingId] = useState<string | null>(null);

	const handleViewDetail = (customerId: string) => {
		navigate(`/customers/detail/${customerId}`);
	};

	const handleEditCustomer = (customerId: string) => {
		navigate(`/customers/edit/${customerId}`);
	};

	const handleToggleLock = (customer: Customer) => {
		setProcessingId(customer._id);
		if ((customer as any).isLocked) {
			unlockCustomer(customer._id, { onSettled: () => setProcessingId(null) });
		} else {
			lockCustomer(customer._id, { onSettled: () => setProcessingId(null) });
		}
	};

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[100px]">STT</TableHead>
						<TableHead>Họ tên</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>SĐT</TableHead>
						<TableHead>Địa chỉ</TableHead>
						<TableHead>Ngày tạo</TableHead>
						<TableHead className="text-right">Thao tác</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{customers.map((customer: Customer, index: number) => (
						<TableRow key={customer._id}>
							<TableCell className="font-mono text-xs">#{index + 1}</TableCell>
							<TableCell>{customer.fullName}</TableCell>
							<TableCell>{customer.email}</TableCell>
							<TableCell>{customer.phone}</TableCell>
							<TableCell>{customer.address}</TableCell>
							<TableCell>
								{new Date(customer.createdAt).toLocaleDateString('vi-VN')}
							</TableCell>
							<TableCell className="text-right">
								<div className="flex items-center justify-end gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleViewDetail(customer._id)}
										className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
									>
										<EyeIcon className="w-4 h-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleEditCustomer(customer._id)}
									>
										<PencilIcon className="w-4 h-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleToggleLock(customer)}
										className={(customer as any).isLocked ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'}
										disabled={(isLocking || isUnlocking) && processingId === customer._id}
									>
										{(customer as any).isLocked ? (
											<UnlockIcon className="w-4 h-4" />
										) : (
											<LockIcon className="w-4 h-4" />
										)}
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};
