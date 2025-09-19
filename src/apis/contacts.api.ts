import axiosInstance from '@/configs/instances/axios';

export interface ContactItem {
  _id: string;
  name: string;
  email: string;
  address: string;
  product: string;
  note?: string;
  status: 'pending' | 'answered';
  adminReply?: string;
  createdAt: string;
  repliedAt?: string | null;
  isRead?: boolean;
}

export const fetchContacts = async (status?: string) => {
  const response = await axiosInstance.get<ContactItem[]>(
    `/admin/contacts${status ? `?status=${encodeURIComponent(status)}` : ''}`,
  );
  return response.data;
};

export const replyContact = async (id: string, reply: string) => {
  const response = await axiosInstance.post<ContactItem>(`/admin/contacts/${id}/reply`, {
    reply,
  });
  return response.data;
};

export const fetchContactsUnreadCount = async () => {
  const response = await axiosInstance.get<{ count: number }>(
    '/admin/contacts-unread-count',
  );
  return response.data;
};

export const fetchRecentContacts = async (limit = 10) => {
  const response = await axiosInstance.get<ContactItem[]>(
    `/admin/contacts-recent?limit=${limit}`,
  );
  return response.data;
};

export const markContactRead = async (id: string) => {
  const response = await axiosInstance.post<ContactItem>(
    `/admin/contacts/${id}/mark-read`,
  );
  return response.data;
};


