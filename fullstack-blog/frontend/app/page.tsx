'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Comments from './components/Comments';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt?: string;
  comments?: {
    id: number;
    author: string;
    content: string;
    createdAt: string;
  }[];
}

export default function PostsPage() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editAuthor, setEditAuthor] = useState('');

  // useQuery: tự fetch + cache danh sách bài viết
  const { data: posts = [], isLoading, isError } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: () => api.get('/api/posts').then(r => r.data),
  });

  // Mutation: đăng bài mới
  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string; author: string }) =>
      api.post('/api/posts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Đăng bài thành công!');
      setTitle(''); setContent(''); setAuthor('');
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr.response?.data?.error || 'Đăng bài thất bại!');
    },
  });

  // Mutation: xoá bài
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Đã xoá bài viết');
    },
    onError: () => toast.error('Xoá thất bại, thử lại!'),
  });

  // Mutation: sửa bài
  const editMutation = useMutation({
    mutationFn: ({ id, data }: {
      id: number;
      data: { title: string; content: string; author: string }
    }) => api.put(`/api/posts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Cập nhật thành công!');
      handleEditCancel();
    },
    onError: () => toast.error('Cập nhật thất bại!'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate({ title, content, author });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn chắc chắn muốn xoá bài viết này?')) return;
    deleteMutation.mutate(id);
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditAuthor(post.author);
  };

  const handleEditCancel = () => {
    setEditingPost(null);
    setEditTitle(''); setEditContent(''); setEditAuthor('');
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPost) return;
    editMutation.mutate({
      id: editingPost.id,
      data: { title: editTitle, content: editContent, author: editAuthor },
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-slate-900"> {/* Ép màu chữ mặc định toàn trang là đen xám đậm */}
      <h1 className="text-3xl font-extrabold mb-8 text-black flex items-center gap-2">
        <span>📝</span> Quản lý bài viết
      </h1>

      {/* Form đăng bài mới */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 mb-8 space-y-4 shadow-md text-black">
        <h2 className="font-bold text-xl text-black border-b pb-2">Đăng bài mới</h2>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Tiêu đề</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề bài viết..."
            required
            className="w-full border border-slate-300 bg-white rounded-lg px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Nội dung</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Viết nội dung tại đây..."
            required
            rows={3}
            className="w-full border border-slate-300 bg-white rounded-lg px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Tác giả</label>
          <input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Tên người viết..."
            required
            className="w-full border border-slate-300 bg-white rounded-lg px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-200"
        >
          {createMutation.isPending ? '🚀 Đang xử lý...' : '➕ Đăng bài ngay'}
        </button>
      </form>

      {/* Trạng thái loading / error */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center font-medium">
          ❌ Không thể tải bài viết! Vui lòng kiểm tra lại server.
        </div>
      )}

      {/* Danh sách bài viết */}
      <div className="space-y-4">
        {!isLoading && posts.length === 0 && (
          <div className="text-slate-400 text-center py-12 border-2 border-dashed rounded-xl">
            📭 Chưa có bài viết nào được đăng.
          </div>
        )}

        {posts.map(p => (
          <div key={p.id} className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden transition-hover hover:shadow-md">

            {editingPost?.id !== p.id ? (
              /* Chế độ xem bình thường */
              <div className="flex justify-between items-center p-5">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-black leading-tight">{p.title}</h3>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold text-xs">
                      {p.author}
                    </span>
                    <span className="text-slate-400">•</span>
                    <p className="text-slate-600">{p.content}</p>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    {p.comments?.length || 0} bình luận
                  </p>
                </div>
                <div className="flex gap-3 ml-4 shrink-0">
                  <button
                    onClick={() => handleEditClick(p)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-bold p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-bold p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            ) : (
              /* Chế độ inline edit */
              <form onSubmit={handleEditSubmit} className="p-5 space-y-3 bg-slate-50 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-700 font-bold flex items-center gap-1">✏️ Chỉnh sửa bài viết</p>
                </div>

                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                  className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-black focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  required
                  rows={2}
                  className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-black focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <input
                  value={editAuthor}
                  onChange={e => setEditAuthor(e.target.value)}
                  required
                  className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-black focus:ring-2 focus:ring-blue-400 outline-none"
                />

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={editMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md"
                  >
                    {editMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-5 py-2 rounded-lg text-sm font-bold"
                  >
                    Huỷ
                  </button>
                </div>
              </form>
            )}
            <Comments postId={p.id} />
          </div>
        ))}
      </div>
    </div>
  );
}