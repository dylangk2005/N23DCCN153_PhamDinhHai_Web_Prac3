'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt?: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/api/posts');
      setPosts(res.data);
    } catch {
      toast.error('Không thể kết nối server!');
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/posts', { title, content, author });
      toast.success('Đăng bài thành công!');
      setTitle(''); setContent(''); setAuthor('');
      fetchPosts();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr.response?.data?.error || 'Đăng bài thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn chắc chắn muốn xoá bài viết này?')) return;
    try {
      await api.delete(`/api/posts/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Đã xoá bài viết');
    } catch {
      toast.error('Xoá thất bại, thử lại!');
      fetchPosts();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-black"> {/* Thêm text-black ở bọc ngoài cùng */}
      <h1 className="text-2xl font-bold mb-6 text-black">📝 Quản lý bài viết</h1>

      {/* Form đăng bài */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 mb-6 space-y-3 shadow-sm">
        <h2 className="text-black font-semibold text-lg">Đăng bài mới</h2>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Tiêu đề"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Nội dung"
          required
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
        />
        <input
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="Tác giả"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded text-sm font-medium"
        >
          {loading ? 'Đang đăng...' : 'Đăng bài'}
        </button>
      </form>

      {/* Danh sách bài viết */}
      <div className="space-y-3">
        {posts.length === 0 && (
          <p className="text-gray-500 text-center py-8">Chưa có bài viết nào.</p>
        )}
        {posts.map(p => (
          <div key={p.id} className="flex justify-between items-start p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div>
              <h3 className="font-bold text-base text-black">{p.title}</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">{p.author}</span> · {p.content}
              </p>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium ml-4 shrink-0"
            >
              Xoá
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}