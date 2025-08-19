import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCustomerDetail, useUpdateCustomer } from '@/hooks/customers/useCustomer';
import { useNavigate } from 'react-router-dom';

const updateCustomerSchema = z.object({
	fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
	phone: z.string().min(10, 'SĐT không hợp lệ'),
	address: z.string().optional(),
});

type UpdateCustomerForm = z.infer<typeof updateCustomerSchema>;

export default function EditCustomerPage() {
	const navigate = useNavigate();
	const { customer, isLoading, error } = useCustomerDetail();
	const { mutate: updateCustomer, isPending } = useUpdateCustomer();

	const form = useForm<UpdateCustomerForm>({
		resolver: zodResolver(updateCustomerSchema),
		defaultValues: {
			fullName: '',
			phone: '',
			address: '',
		},
	});

	useEffect(() => {
		if (customer) {
			form.reset({
				fullName: customer.fullName || '',
				phone: customer.phone || '',
				address: customer.address || '',
			});
		}
	}, [customer, form]);

	const onSubmit = (data: UpdateCustomerForm) => {
		if (!customer) return;
		updateCustomer(
			{ id: customer._id, customer: data },
			{
				onSuccess: () => navigate('/customers'),
			}
		);
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
				</div>
			</div>
		);
	}

	return (
		<div className="py-8 px-4 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Chỉnh sửa khách hàng
				</h1>
				<p className="text-gray-600">Cập nhật thông tin khách hàng</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="fullName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Họ tên</FormLabel>
								<FormControl>
									<Input placeholder="Nguyễn Văn A" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="phone"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Số điện thoại</FormLabel>
								<FormControl>
									<Input placeholder="0987xxxxxx" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="address"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Địa chỉ</FormLabel>
								<FormControl>
									<Input placeholder="Địa chỉ" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex gap-4 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate('/customers')}
							className="flex-1"
							disabled={isPending}
						>
							Hủy
						</Button>
						<Button type="submit" disabled={isPending} className="flex-1 flex items-center justify-center">
							{isPending && <Loader className="animate-spin mr-2" />}
							{isPending ? 'Đang cập nhật...' : 'Cập nhật'}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
