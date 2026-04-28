'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Comment {
    id: number;
    author: string;
    content: string;
    createdAt: string;
}

interface Props {
    postId: number;
}

export default function Comments({ postId }: Props) {
    const queryClient = useQueryClient();
    const [author, setAuthor] = useState('');
    const [content, setContent] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Fetch bình luận
    const { data: comments = [], isLoading } = useQuery<Comment[]>({
        queryKey: ['comments', postId],
        queryFn: () => api.get(`/api/posts/${postId}/comments`).then(r => r.data),
        enabled: isOpen, // chỉ fetch khi mở
    });

    // Thêm bình luận
    const addMutation = useMutation({
        mutationFn: (data: { author: string; content: string }) =>
            api.post(`/api/posts/${postId}/comments`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Đã thêm bình luận!');
            setAuthor(''); setContent('');
        },
        onError: () => toast.error('Thêm bình luận thất bại!'),
    });

    // Xoá bình luận
    const deleteMutation = useMutation({
        mutationFn: (commentId: number) =>
            api.delete(`/api/posts/${postId}/comments/${commentId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Đã xoá bình luận');
        },
        onError: () => toast.error('Xoá bình luận thất bại!'),
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        addMutation.mutate({ author, content });
    };

    return (
        <div className="border-t px-4 py-3 bg-gray-50">
            {/* Toggle mở/đóng */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
                💬 {isOpen ? 'Ẩn bình luận' : 'Xem bình luận'}
            </button>

            {isOpen && (
                <div className="mt-3 space-y-3">
                    {/* Danh sách bình luận */}
                    {isLoading && <p className="text-xs text-gray-400">Đang tải...</p>}
                    {!isLoading && comments.length === 0 && (
                        <p className="text-xs text-gray-400">Chưa có bình luận nào.</p>
                    )}
                    {comments.map(c => (
                        <div key={c.id} className="flex justify-between items-start bg-white border rounded p-2">
                            <div>
                                <p className="text-xs font-semibold text-gray-700">{c.author}</p>
                                <p className="text-sm text-gray-600">{c.content}</p>
                            </div>
                            <button
                                onClick={() => deleteMutation.mutate(c.id)}
                                disabled={deleteMutation.isPending}
                                className="text-red-400 hover:text-red-600 text-xs ml-2 shrink-0"
                            >
                                Xoá
                            </button>
                        </div>
                    ))}

                    {/* Form thêm bình luận */}
                    <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t">
                        <input
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                            placeholder="Tên của bạn"
                            required
                            className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Nội dung bình luận..."
                            required
                            rows={2}
                            className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            type="submit"
                            disabled={addMutation.isPending}
                            className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white px-3 py-1.5 rounded text-xs font-medium"
                        >
                            {addMutation.isPending ? 'Đang gửi...' : 'Gửi bình luận'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}