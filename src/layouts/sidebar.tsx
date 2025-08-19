import {
	Bookmark,
	CreditCard,
	GraduationCap,
	Home,
	Shield,
	Ticket,
	Users,
	MessageSquare,
	Heart,
} from 'lucide-react';
import { Link, useLocation, type To } from 'react-router-dom';

import { urls } from '@/configs/urls';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Sidebar = () => {
	// useLocation
	const location = useLocation();
	const pathName = location.pathname;
	const { admin } = useAuth();

	const menus = [
		{ id: 1, path: urls.home, icon: <Home />, title: 'Dashboard' },
		{ id: 2, path: urls.products.list, icon: <Bookmark />, title: 'Products' },
		{
			id: 3,
			path: urls.categories.list,
			icon: <GraduationCap />,
			title: 'Categories',
		},
		{
			id: 4,
			path: '/vouchers',
			icon: <Ticket />,
			title: 'Vouchers',
		},
		{
			id: 5,
			path: urls.customers.list,
			icon: <Users />,
			title: 'Customers',
		},
		{
			id: 6,
			path: urls.admins.list,
			icon: <Shield />,
			title: 'Admins',
		},
		{ id: 7, path: urls.orders, icon: <CreditCard />, title: 'Orders' },
		{ id: 8, path: '/comments', icon: <MessageSquare />, title: 'Comments' },
		{ id: 9, path: '/favorites', icon: <Heart />, title: 'Favorites' },
	];

	return (
		<div className="w-64 bg-[#F2EAE1]">
			{/* title */}
			<div className="p-6 border-l-4 border-l-[#B87A1F]">
				<h1 className="font-bold text-xl uppercase">Jewelry Admin</h1>
			</div>

			{/* profile */}
			<div className="mt-8 flex flex-col items-center">
				<div className="w-32 mb-4 h-32 rounded-full overflow-hidden bg-[#B87A1F] flex items-center justify-center">
					<div className="text-white text-4xl font-bold">
						{admin?.username?.charAt(0).toUpperCase() || 'A'}
					</div>
				</div>

				<h2 className="text-lg font-semibold">{admin?.username || 'Admin'}</h2>
				<p className="text-[#FEAF00] text-sm">
					{admin?.role === 'SuperAdmin' ? 'Super Admin' : 'Staff'}
				</p>
			</div>

			{/* menu */}
			<div className="mt-10">
				{menus.map((menuItem) => {
					return (
						<Link
							to={menuItem.path as To}
							key={menuItem.id}
							className={cn(
								'flex items-center gap-3  py-3 px-6',
								{ 'text-white bg-[#B87A1F]': menuItem.path === pathName },
								{ 'hover:bg-gray-200': menuItem.path !== pathName }
							)}
						>
							{menuItem.icon}
							{menuItem.title}
						</Link>
					);
				})}
			</div>
		</div>
	);
};

export default Sidebar;
