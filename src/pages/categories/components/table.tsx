import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { LockIcon, PencilIcon, UnlockIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useToggleCategoryActive } from '@/hooks/categories/useCategory';
import type { Category } from '@/types/category.type';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TableCategoryProps {
	categories: Category[];
}

export const TableCategory = ({ categories }: TableCategoryProps) => {
	const navigate = useNavigate();
	const { mutate: toggleCategory, isPending: isToggling } = useToggleCategoryActive();
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [confirmDialog, setConfirmDialog] = useState<{
		isOpen: boolean;
		categoryId: string | null;
		categoryName: string;
		isActive: boolean;
	}>({
		isOpen: false,
		categoryId: null,
		categoryName: '',
		isActive: false,
	});

	const handleEditCategory = (categoryId: string) => {
		navigate(`/categories/edit/${categoryId}`);
	};

	const handleToggleCategory = (categoryId: string, categoryName: string, isActive: boolean) => {
		setConfirmDialog({
			isOpen: true,
			categoryId,
			categoryName,
			isActive,
		});
	};

	const confirmToggleCategory = () => {
		if (confirmDialog.categoryId) {
			setProcessingId(confirmDialog.categoryId);
			toggleCategory(confirmDialog.categoryId, {
				onSettled: () => {
					setProcessingId(null);
					setConfirmDialog({
						isOpen: false,
						categoryId: null,
						categoryName: '',
						isActive: false,
					});
				},
			});
		}
	};

	const cancelToggleCategory = () => {
		setConfirmDialog({
			isOpen: false,
			categoryId: null,
			categoryName: '',
			isActive: false,
		});
	};

	return (
		<>
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">STT</TableHead>
							<TableHead>Tên danh mục</TableHead>
							<TableHead>Mô tả</TableHead>
							<TableHead>Trạng thái</TableHead>
							<TableHead>Ngày tạo</TableHead>
							<TableHead>Cập nhật</TableHead>
							<TableHead className="text-right">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{categories.map((category: Category, index: number) => (
							<TableRow key={category.id}>
								<TableCell className="font-mono text-xs">#{index + 1}</TableCell>
								<TableCell>{category.categoryName}</TableCell>
								<TableCell>{category.description}</TableCell>
								<TableCell>
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											category.isActive
												? 'bg-green-100 text-green-800'
												: 'bg-red-100 text-red-800'
										}`}
									>
										{category.isActive ? 'Đang hoạt động' : 'Đã khóa'}
									</span>
								</TableCell>
								<TableCell>
									{new Date(category.createdAt).toLocaleDateString('vi-VN')}
								</TableCell>
								<TableCell>
									{new Date(category.updatedAt).toLocaleDateString('vi-VN')}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex items-center justify-end gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleEditCategory(category.id)}
										>
											<PencilIcon className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleToggleCategory(category.id, category.categoryName, category.isActive)}
											className={category.isActive ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
											disabled={isToggling && processingId === category.id}
										>
											{category.isActive ? (
												<LockIcon className="w-4 h-4" />
											) : (
												<UnlockIcon className="w-4 h-4" />
											)}
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Confirmation Dialog */}
			<Dialog open={confirmDialog.isOpen} onOpenChange={(open) => {
				if (!open) {
					setConfirmDialog({
						isOpen: false,
						categoryId: null,
						categoryName: '',
						isActive: false,
					});
				}
			}}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{confirmDialog.isActive ? 'Khóa danh mục' : 'Mở khóa danh mục'}
						</DialogTitle>
						<DialogDescription>
							{confirmDialog.isActive 
								? `Bạn có chắc muốn khóa danh mục "${confirmDialog.categoryName}" không? Danh mục này sẽ bị ẩn khỏi trang khách hàng.`
								: `Bạn có chắc muốn mở khóa danh mục "${confirmDialog.categoryName}" không? Danh mục này sẽ được hiển thị lại trên trang khách hàng.`
							}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={cancelToggleCategory}
							disabled={isToggling}
						>
							Hủy
						</Button>
						<Button
							onClick={confirmToggleCategory}
							disabled={isToggling}
							className={confirmDialog.isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
						>
							{isToggling ? 'Đang xử lý...' : (confirmDialog.isActive ? 'Khóa danh mục' : 'Mở khóa danh mục')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
