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

  // State cho chức năng sửa
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editAuthor, setEditAuthor] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await api.get('/api/posts');
      setPosts(res.data);
    } catch {
      toast.error('Không thể kết nối server!');
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  // Đăng bài mới
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

  // Xoá bài
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

  // Mở form sửa
  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditAuthor(post.author);
  };

  // Huỷ sửa
  const handleEditCancel = () => {
    setEditingPost(null);
    setEditTitle(''); setEditContent(''); setEditAuthor('');
  };

  // Submit sửa
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPost) return;
    try {
      await api.put(`/api/posts/${editingPost.id}`, {
        title: editTitle,
        content: editContent,
        author: editAuthor,
      });
      toast.success('Cập nhật thành công!');
      setPosts(prev => prev.map(p =>
        p.id === editingPost.id
          ? { ...p, title: editTitle, content: editContent, author: editAuthor }
          : p
      ));
      handleEditCancel();
    } catch {
      toast.error('Cập nhật thất bại!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-black"> {/* Thêm text-black ở đây để làm màu mặc định */}
      <h1 className="text-2xl font-bold mb-6 text-black">📝 Quản lý bài viết</h1>

      {/* Form đăng bài mới */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 mb-6 space-y-3 shadow-sm text-black">
        <h2 className="font-semibold text-lg text-black">Đăng bài mới</h2>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Tiêu đề"
          required
          className="w-full border border-gray-300 bg-white rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Nội dung"
          required
          rows={3}
          className="w-full border border-gray-300 bg-white rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
        />
        <input
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="Tác giả"
          required
          className="w-full border border-gray-300 bg-white rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
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
          <div key={p.id} className="border rounded-lg shadow-sm bg-white overflow-hidden text-black">

            {/* Chế độ xem bình thường */}
            {editingPost?.id !== p.id ? (
              <div className="flex justify-between items-start p-4">
                <div>
                  {/* Chỉnh tiêu đề bài viết màu đen đậm */}
                  <h3 className="font-bold text-base text-black">{p.title}</h3>
                  {/* Chỉnh thông tin tác giả và nội dung bài viết */}
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-black">{p.author}</span> · {p.content}
                  </p>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => handleEditClick(p)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            ) : (
              /* Chế độ inline edit */
              <form onSubmit={handleEditSubmit} className="p-4 space-y-2 bg-blue-50">
                <p className="text-xs text-blue-600 font-medium">✏️ Đang chỉnh sửa</p>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                  className="w-full border border-gray-300 bg-white rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  required
                  rows={2}
                  className="w-full border border-gray-300 bg-white rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  value={editAuthor}
                  onChange={e => setEditAuthor(e.target.value)}
                  required
                  className="w-full border border-gray-300 bg-white rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm font-medium"
                  >
                    Huỷ
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}