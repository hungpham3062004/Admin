import { useEffect, useState } from 'react';
import axios from '../../../configs/instances/axios';
import { ContactItem } from '../../../apis/contacts.api';

export default function ContactsPage() {
  const [items, setItems] = useState<ContactItem[]>([]);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ContactItem | null>(null);
  const [reply, setReply] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const url = `/admin/contacts${status ? `?status=${encodeURIComponent(
        status,
      )}` : ''}`;
      const { data } = await axios.get<ContactItem[]>(url);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onSendReply = async () => {
    if (!selected || !reply.trim()) return;
    await axios.post(`/admin/contacts/${selected._id}/reply`, { reply });
    setReply('');
    setSelected(null);
    load();
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-lg font-semibold">Liên hệ khách hàng</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Tất cả</option>
          <option value="pending">Chưa trả lời</option>
          <option value="answered">Đã trả lời</option>
        </select>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Khách hàng</th>
                <th className="text-left p-2">Email/SĐT</th>
                <th className="text-left p-2">Sản phẩm</th>
                <th className="text-left p-2">Ghi chú</th>
                <th className="text-left p-2">Trạng thái</th>
                <th className="text-left p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id} className="border-t">
                  <td className="p-2">{it.name}</td>
                  <td className="p-2">{it.email}</td>
                  <td className="p-2">{it.product}</td>
                  <td className="p-2">{it.note}</td>
                  <td className="p-2">{it.status === 'pending' ? 'Chưa trả lời' : 'Đã trả lời'}</td>
                  <td className="p-2">
                    <button
                      className="px-3 py-1 text-white bg-blue-600 rounded"
                      onClick={() => {
                        setSelected(it);
                        setReply(it.adminReply || '');
                      }}
                    >
                      Trả lời
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-lg">
            <h2 className="font-semibold mb-2">Phản hồi khách hàng</h2>
            <p className="text-sm mb-2">
              <strong>{selected.name}</strong> — {selected.email}
            </p>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full border rounded p-2 h-32"
              placeholder="Nhập nội dung phản hồi..."
            />
            <div className="mt-3 flex justify-end gap-2">
              <button className="px-3 py-1 border rounded" onClick={() => setSelected(null)}>
                Hủy
              </button>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded"
                onClick={onSendReply}
              >
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


