// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;

// Phục vụ file tĩnh từ thư mục hiện tại
app.use(express.static(__dirname));

// Route GET / để trả về index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});


// Đường dẫn đến tours.json (giả định ở cùng thư mục server)
// PATH đã được kiểm tra và giữ nguyên
const toursFilePath = path.join(__dirname, 'tours.json');

// Hàm đọc dữ liệu tour từ tours.json
function loadToursData() {
    try {
        const data = fs.readFileSync(toursFilePath, 'utf8');
        return JSON.parse(data); 
    } catch (error) {
        console.error("Lỗi khi đọc tours.json:", error.message);
        return [];
    }
}

// Khởi tạo Database SQLite
const db = new sqlite3.Database('./nhom5traver.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Đã kết nối thành công đến database nhom5traver.db.');
        // Tạo bảng users
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            dob TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error("Lỗi khi tạo bảng users:", err.message);
            else console.log("Bảng 'users' đã sẵn sàng.");
        });

        // Tạo bảng bookings
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            bookingId INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            tourId TEXT NOT NULL,
            tourName TEXT,
            departureDate TEXT,
            guestCount INTEGER,
            totalPrice INTEGER,
            status TEXT DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error("Lỗi khi tạo bảng bookings:", err.message);
            else console.log("Bảng 'bookings' đã sẵn sàng.");
        });
    }
});

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// =========================================================
// API 1: ĐĂNG KÝ (POST /api/register)
// =========================================================
app.post('/api/register', (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
    }

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Lỗi server khi mã hóa mật khẩu.' });
        }

        const sql = `INSERT INTO users (fullname, email, password_hash) VALUES (?, ?, ?)`;
        db.run(sql, [fullname, email, hash], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ message: 'Email đã tồn tại. Vui lòng sử dụng email khác.' });
                }
                console.error(err.message);
                return res.status(500).json({ message: 'Lỗi server khi đăng ký.' });
            }
            res.status(201).json({ 
                message: 'Đăng ký thành công!',
                userId: this.lastID
            });
        });
    });
});

// =========================================================
// API 2: ĐĂNG NHẬP (POST /api/login)
// =========================================================
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ Email và Mật khẩu.' });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Lỗi server.' });
        }
        if (!user) {
            return res.status(400).json({ message: 'Email hoặc Mật khẩu không đúng.' });
        }

        bcrypt.compare(password, user.password_hash, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi server khi so sánh mật khẩu.' });
            }
            
            if (!result) {
                return res.status(400).json({ message: 'Email hoặc Mật khẩu không đúng.' });
            }

            const token = 'fake_auth_token_12345'; // Dùng token giả nếu chưa cài JWT

            const safeUser = { 
                id: user.id, 
                fullname: user.fullname, 
                email: user.email, 
                phone: user.phone,
                address: user.address,
                dob: user.dob
            };

            res.status(200).json({ 
                message: 'Đăng nhập thành công.',
                token: token,
                user: safeUser
            });
        });
    });
});

// =========================================================
// API 3: CẬP NHẬT THÔNG TIN CÁ NHÂN (PATCH /api/user/update)
// =========================================================
app.patch('/api/user/update', (req, res) => {
    const { email, fullname, phone, address, dob } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email không được tìm thấy.' });
    }

    const sql = `UPDATE users SET fullname = ?, phone = ?, address = ?, dob = ? WHERE email = ?`;
    
    db.run(sql, [fullname, phone, address, dob, email], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Lỗi server khi cập nhật dữ liệu.' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật.' });
        }

        db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, updatedUser) => {
             if (err || !updatedUser) {
                 return res.status(500).json({ message: 'Lỗi khi truy xuất dữ liệu cập nhật.' });
             }
             const safeUser = { 
                 id: updatedUser.id, 
                 fullname: updatedUser.fullname, 
                 email: updatedUser.email, 
                 phone: updatedUser.phone, 
                 address: updatedUser.address, 
                 dob: updatedUser.dob 
             };
             res.status(200).json({ 
                 message: 'Cập nhật thành công.',
                 updatedUser: safeUser
             });
        });
    });
});

// =========================================================
// API 4: ĐỔI MẬT KHẨU (PATCH /api/user/change-password)
// =========================================================
app.patch('/api/user/change-password', (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    
    db.get(`SELECT password_hash FROM users WHERE email = ?`, [email], (err, user) => {
        if (err || !user) {
            return res.status(400).json({ message: 'Người dùng không tồn tại.' });
        }

        bcrypt.compare(oldPassword, user.password_hash, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi server khi so sánh mật khẩu.' });
            }
            
            if (!result) {
                return res.status(400).json({ message: 'Mật khẩu cũ không chính xác.' });
            }

            bcrypt.hash(newPassword, saltRounds, (hashErr, newHash) => {
                if (hashErr) {
                    return res.status(500).json({ message: 'Lỗi server khi mã hóa mật khẩu mới.' });
                }

                db.run(`UPDATE users SET password_hash = ? WHERE email = ?`, [newHash, email], function(updateErr) {
                    if (updateErr) {
                        return res.status(500).json({ message: 'Lỗi server khi cập nhật mật khẩu.' });
                    }
                    res.status(200).json({ message: 'Đổi mật khẩu thành công.' });
                });
            });
        });
    });
});

// =========================================================
// API 5: LẤY THÔNG TIN TOUR CHI TIẾT (GET /api/tours/:id)
// *** ĐÃ SỬA LỖI LOGIC: TÌM KIẾM TRỰC TIẾP ID BẰNG tourId NHẬN ĐƯỢC ***
// =========================================================
app.get('/api/tours/:id', (req, res) => {
    const tourId = req.params.id; 
    const tours = loadToursData(); 

    // CHỈ TÌM KIẾM TRỰC TIẾP. Bỏ qua logic ánh xạ ID sai.
    const tour = tours.find(t => t.id === tourId);

    if (tour) {
        res.json({
            id: tour.id,
            title: tour.name,
            price: tour.price_value,
        });
    } else {
        // Lỗi này sẽ biến mất sau khi sửa lỗi ánh xạ sai
        console.warn(`Yêu cầu Tour ID không tìm thấy: ${tourId}`); 
        res.status(404).send({ message: `Tour ID ${tourId} not found.` }); 
    }
});


// =========================================================
// API 6: ĐẶT VÀ LƯU ĐƠN HÀNG (POST /api/orders)
// Xử lý form thanh toán
// =========================================================
app.post('/api/orders', (req, res) => {
    const { 
        email, 
        tour_id_input, 
        departure_date_input, 
        total_amount_input,
        quantity // Giả định trường này được gửi từ form
    } = req.body; 

    if (!email || !tour_id_input || !total_amount_input) {
        return res.status(400).json({ message: 'Thiếu thông tin đặt hàng.' });
    }

    // Lấy tên tour để lưu vào DB
    const tours = loadToursData();
    const tourDetail = tours.find(t => t.id === tour_id_input);
    const tourName = tourDetail ? tourDetail.name : 'Tour Name N/A';

    // Lấy số lượng khách
    const guestCount = parseInt(quantity) || 1;
    
    const sql = `INSERT INTO bookings (user_email, tourId, tourName, departureDate, guestCount, totalPrice) VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [
        email, 
        tour_id_input, 
        tourName,
        departure_date_input, 
        guestCount, 
        total_amount_input
    ], function(err) {
        if (err) {
            console.error("Lỗi khi lưu đơn hàng:", err.message);
            return res.status(500).json({ message: 'Lỗi server khi lưu đơn hàng.' });
        }
        res.status(201).json({
            message: 'Đơn hàng đã được đặt thành công.',
            bookingId: this.lastID
        });
    });
});


// Khởi động Server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
    console.log(`Kiểm tra API tại Postman hoặc trình duyệt.`);
});
app.use(express.static(path.join(__dirname, '../')));
