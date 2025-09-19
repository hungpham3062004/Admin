import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
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
} from '@/components/ui/alert-dialog';
import { EyeIcon, PencilIcon, LockIcon, UnlockIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLockProduct, useUnlockProduct } from '@/hooks/products/useProduct';
import { formatPrice } from '@/lib/format-currency';
import type { Product } from '@/types/product.type';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TableProductProps {
	products: Product[];
}

export const TableProduct = ({ products }: TableProductProps) => {
	const navigate = useNavigate();
	const { mutate: lockProduct, isPending: isLocking } = useLockProduct();
	const { mutate: unlockProduct, isPending: isUnlocking } = useUnlockProduct();
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	const handleViewDetail = (productId: string) => {
		navigate(`/products/detail/${productId}`);
	};

	const handleEditProduct = (productId: string) => {
		navigate(`/products/edit/${productId}`);
	};

	const handleToggleHidden = (product: Product) => {
		setSelectedProduct(product);
		setShowConfirmDialog(true);
	};

	const confirmToggleHidden = () => {
		if (!selectedProduct) return;
		
		const action = selectedProduct.isHidden ? unlockProduct : lockProduct;
		setProcessingId(selectedProduct.id);
		action(selectedProduct.id, {
			onSettled: () => {
				setProcessingId(null);
				setShowConfirmDialog(false);
				setSelectedProduct(null);
			},
		});
	};

	const cancelToggleHidden = () => {
		setShowConfirmDialog(false);
		setSelectedProduct(null);
	};

	return (
		<>
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">ID</TableHead>
							<TableHead>Tên sản phẩm</TableHead>
							<TableHead>Danh mục</TableHead>
							<TableHead>Giá</TableHead>
							<TableHead>Trọng lượng</TableHead>
							<TableHead>Tồn kho</TableHead>
							<TableHead>Chất liệu</TableHead>
							<TableHead className="text-right">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products.map((product: Product, index: number) => (
							<TableRow key={product.id}>
								<TableCell className="font-mono text-xs">#{index + 1}</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<img
											src={product.images[0]}
											alt={product.productName}
											className="w-20 h-20 rounded-md object-cover flex-shrink-0 border border-gray-300"
										/>
										<div>
											<div className="font-medium text-gray-900 truncate line-clamp-1 text-sm">
												{product.productName.slice(0, 40) + '...'}
											</div>
											<div className="text-sm text-gray-500 truncate line-clamp-2">
												{product.description.slice(0, 30) + '...'}
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
										{product.category?.categoryName}
									</span>
								</TableCell>
								<TableCell className="font-medium">
									{formatPrice(product.price)}
								</TableCell>
								<TableCell className="text-sm text-gray-600">
									{product.weight}g
								</TableCell>
								<TableCell>
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											product.stockQuantity <= 10
												? 'bg-red-100 text-red-800'
												: product.stockQuantity <= 50
												? 'bg-yellow-100 text-yellow-800'
												: 'bg-green-100 text-green-800'
										}`}
									>
										{product.stockQuantity}
									</span>
								</TableCell>
								<TableCell className="text-sm text-gray-600">
									{product.material}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex items-center justify-end gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleViewDetail(product.id)}
											className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
										>
											<EyeIcon className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleEditProduct(product.id)}
										>
											<PencilIcon className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleToggleHidden(product)}
											className={product.isHidden ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'}
											disabled={(isLocking || isUnlocking) && processingId === product.id}
										>
											{product.isHidden ? (
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

			{/* Confirmation Dialog */}
			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Xác nhận {selectedProduct?.isHidden ? 'mở khóa' : 'khóa'} sản phẩm
						</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn {selectedProduct?.isHidden ? 'mở khóa' : 'khóa'} sản phẩm "{selectedProduct?.productName}"?
							{selectedProduct?.isHidden 
								? ' Sản phẩm sẽ được hiển thị lại trên trang khách hàng.' 
								: ' Sản phẩm sẽ bị ẩn khỏi trang khách hàng.'
							}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={cancelToggleHidden}>
							Hủy
						</AlertDialogCancel>
						<AlertDialogAction 
							onClick={confirmToggleHidden}
							disabled={(isLocking || isUnlocking) && processingId === selectedProduct?.id}
							className={selectedProduct?.isHidden ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}
						>
							{(isLocking || isUnlocking) && processingId === selectedProduct?.id
								? 'Đang xử lý...'
								: selectedProduct?.isHidden ? 'Mở khóa' : 'Khóa'
							}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
