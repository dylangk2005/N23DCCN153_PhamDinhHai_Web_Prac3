const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Dữ liệu mẫu
let posts = [
    { id: 1, title: 'Bài viết đầu tiên', content: 'Nội dung bài 1', author: 'Admin' },
    { id: 2, title: 'Hướng dẫn NextJS', content: 'Nội dung bài 2', author: 'Admin' },
];

// GET tất cả bài viết
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

// POST tạo bài viết mới
app.post('/api/posts', (req, res) => {
    const { title, content, author } = req.body;
    if (!title || !content || !author)
        return res.status(400).json({ error: 'Thiếu dữ liệu' });

    const newPost = {
        id: Date.now(),
        title,
        content,
        author,
        createdAt: new Date().toISOString()
    };
    posts.push(newPost);
    res.status(201).json(newPost);
});

// DELETE xoá bài viết
app.delete('/api/posts/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = posts.findIndex(p => p.id === id);
    if (index === -1)
        return res.status(404).json({ error: 'Không tìm thấy bài viết' });

    posts.splice(index, 1);
    res.json({ message: 'Đã xoá thành công' });
});

// PUT cập nhật bài viết
app.put('/api/posts/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = posts.findIndex(p => p.id === id);
    if (index === -1)
        return res.status(404).json({ error: 'Không tìm thấy' });

    posts[index] = { ...posts[index], ...req.body };
    res.json(posts[index]);
});

app.listen(5000, () => console.log('✅ Backend chạy tại http://localhost:5000'));