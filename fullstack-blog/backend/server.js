const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const DATA_PATH = path.join(__dirname, 'data.json');

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Hàm đọc dữ liệu từ file
async function readData() {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
}

// Hàm ghi dữ liệu vào file
async function writeData(data) {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

// GET tất cả bài viết
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await readData();
        res.json(posts);
    } catch {
        res.status(500).json({ error: 'Không thể đọc dữ liệu' });
    }
});

// POST tạo bài viết mới
app.post('/api/posts', async (req, res) => {
    try {
        const { title, content, author } = req.body;
        if (!title || !content || !author)
            return res.status(400).json({ error: 'Thiếu dữ liệu' });

        const posts = await readData();
        const newPost = {
            id: Date.now(),
            title,
            content,
            author,
            createdAt: new Date().toISOString()
        };
        posts.push(newPost);
        await writeData(posts);
        res.status(201).json(newPost);
    } catch {
        res.status(500).json({ error: 'Không thể tạo bài viết' });
    }
});

// PUT cập nhật bài viết
app.put('/api/posts/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const posts = await readData();
        const index = posts.findIndex(p => p.id === id);
        if (index === -1)
            return res.status(404).json({ error: 'Không tìm thấy' });

        posts[index] = { ...posts[index], ...req.body };
        await writeData(posts);
        res.json(posts[index]);
    } catch {
        res.status(500).json({ error: 'Không thể cập nhật bài viết' });
    }
});

// DELETE xoá bài viết
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const posts = await readData();
        const index = posts.findIndex(p => p.id === id);
        if (index === -1)
            return res.status(404).json({ error: 'Không tìm thấy bài viết' });

        posts.splice(index, 1);
        await writeData(posts);
        res.json({ message: 'Đã xoá thành công' });
    } catch {
        res.status(500).json({ error: 'Không thể xoá bài viết' });
    }
});

app.listen(5000, () => console.log('✅ Backend chạy tại http://localhost:5000'));