import { useLockProduct, useProductDetail, useUnlockProduct } from '@/hooks/products/useProduct';
import { ArrowLeft, Loader, PencilIcon, LockIcon, UnlockIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format-currency';
import { useNavigate } from 'react-router-dom';

const ProductDetailPage = () => {
	const navigate = useNavigate();
	const { product, isLoading } = useProductDetail();
	const { mutate: lockProduct, isPending: isLocking } = useLockProduct();
	const { mutate: unlockProduct, isPending: isUnlocking } = useUnlockProduct();

	const handleEdit = () => {
		navigate(`/products/edit/${product?.id}`);
	};

	const handleToggleHidden = () => {
		if (!product) return;
		const action = product.isHidden ? unlockProduct : lockProduct;
		action(product.id);
	};

	if (isLoading) {
		return (
			<div className="py-8 px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					<Loader className="animate-spin mx-auto mb-4" />
					<p>Đang tải thông tin sản phẩm...</p>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="py-8 px-4 sm:px-6 lg:px-8">
				<div className="text-center text-red-600">
					<h2 className="text-2xl font-bold">Không tìm thấy sản phẩm</h2>
					<p>Sản phẩm bạn đang tìm kiếm không tồn tại.</p>
					<Button
						variant="outline"
						onClick={() => navigate('/products')}
						className="mt-4"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Quay lại danh sách
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="py-8 px-4 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center justify-between">
					<div>
						<Button
							variant="outline"
							onClick={() => navigate('/products')}
							className="mb-4"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Quay lại danh sách
						</Button>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							{product.productName}
						</h1>
						<p className="text-gray-600">Chi tiết thông tin sản phẩm</p>
					</div>
					<div className="flex gap-2">
						<Button onClick={handleEdit} className="flex items-center gap-2">
							<PencilIcon className="w-4 h-4" />
							Chỉnh sửa
						</Button>
						<Button variant="outline" onClick={handleToggleHidden} disabled={isLocking || isUnlocking}>
							{product.isHidden ? (
								<>
									<UnlockIcon className="w-4 h-4 mr-2" />
									{isUnlocking ? 'Đang mở khóa...' : 'Hiển thị lại'}
								</>
							) : (
								<>
									<LockIcon className="w-4 h-4 mr-2" />
									{isLocking ? 'Đang khóa...' : 'Ẩn sản phẩm'}
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="bg-white rounded-lg shadow">
				<div className="p-6">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Images */}
						<div className="lg:col-span-1">
							<div className="space-y-4">
								<div className="aspect-square rounded-lg overflow-hidden border">
									<img
										src={product.images[0]}
										alt={product.productName}
										className="w-full h-full object-cover"
									/>
								</div>
								{product.images.length > 1 && (
									<div className="grid grid-cols-3 gap-2">
										{product.images.slice(1, 4).map((image, index) => (
											<div
												key={index}
												className="aspect-square rounded-lg overflow-hidden border"
											>
												<img
													src={image}
													alt={`${product.productName} ${index + 2}`}
													className="w-full h-full object-cover"
												/>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Product Info */}
						<div className="lg:col-span-2">
							<div className="space-y-6">
								{/* Basic Info */}
								<div>
									<div className="flex items-center gap-4 mb-4">
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
											{product.category?.categoryName}
										</span>
										{product.isFeatured && (
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
												Sản phẩm nổi bật
											</span>
										)}
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												product.stockQuantity > 0
													? 'bg-green-100 text-green-800'
													: 'bg-red-100 text-red-800'
											}`}
										>
											{product.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
										</span>
									</div>
									<div className="text-3xl font-bold text-gray-900 mb-2">
										{formatPrice(product.price)}
									</div>
								</div>

								{/* Description */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										Mô tả sản phẩm
									</h3>
									<p className="text-gray-700 leading-relaxed">
										{product.description}
									</p>
								</div>

								{/* Specifications */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-4">
										Thông số kỹ thuật
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="bg-gray-50 p-4 rounded-lg">
											<dt className="text-sm font-medium text-gray-500">
												Chất liệu
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{product.material}
											</dd>
										</div>
										<div className="bg-gray-50 p-4 rounded-lg">
											<dt className="text-sm font-medium text-gray-500">
												Trọng lượng
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{product.weight}g
											</dd>
										</div>
										<div className="bg-gray-50 p-4 rounded-lg">
											<dt className="text-sm font-medium text-gray-500">
												Số lượng tồn kho
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{product.stockQuantity} sản phẩm
											</dd>
										</div>
										<div className="bg-gray-50 p-4 rounded-lg">
											<dt className="text-sm font-medium text-gray-500">
												Lượt xem
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{product.views} lượt
											</dd>
										</div>
									</div>
								</div>

								{/* Timestamps */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-4">
										Thông tin hệ thống
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="bg-gray-50 p-4 rounded-lg">
											<dt className="text-sm font-medium text-gray-500">
												Ngày tạo
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{new Date(product.createdAt).toLocaleDateString(
													'vi-VN',
													{
														year: 'numeric',
														month: 'long',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
													}
												)}
											</dd>
										</div>
										<div className="bg-gray-50 p-4 rounded-lg">
											<dt className="text-sm font-medium text-gray-500">
												Cập nhật lần cuối
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{new Date(product.updatedAt).toLocaleDateString(
													'vi-VN',
													{
														year: 'numeric',
														month: 'long',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
													}
												)}
											</dd>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductDetailPage;
