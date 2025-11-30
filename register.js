// register.js (Đã cập nhật để khớp với ID trong HTML)

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    // Thêm một div để hiển thị thông báo ngay dưới form (bạn cần thêm id="register-message" vào HTML)
    const messageElementId = 'register-message'; 
    const API_URL = 'http://localhost:3000/api/register';

    // Hàm hiển thị thông báo (Bạn cần đảm bảo hàm này có trong file script.js chung)
    function showMessage(id, message, type) {
        let element = document.getElementById(id);
        if (!element) {
            // Nếu chưa có, tạo tạm một div ngay dưới form
            element = document.createElement('div');
            element.id = id;
            element.classList.add('general-message');
            registerForm.prepend(element); // Thêm vào đầu form
        }
        element.textContent = message;
        element.className = `general-message ${type}`;
        element.style.display = 'block';
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Lấy dữ liệu với ID KHỚP VỚI HTML
            const fullname = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('reg-password').value; // SỬA: reg-password
            const confirmPassword = document.getElementById('confirm-password').value; // SỬA: confirm-password

            // Ẩn thông báo cũ
            showMessage(messageElementId, '', '');

            if (password !== confirmPassword) {
                showMessage(messageElementId, 'Mật khẩu xác nhận không khớp.', 'error'); 
                return;
            }
            if (password.length < 6) {
                showMessage(messageElementId, 'Mật khẩu phải có ít nhất 6 ký tự.', 'error');
                return;
            }
            if (!fullname || !email) {
                 showMessage(messageElementId, 'Vui lòng điền đầy đủ thông tin.', 'error');
                 return;
            }


            try {
                // Gửi dữ liệu Đăng ký đến Server
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullname, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(messageElementId, data.message + ' Đang chuyển hướng đến trang Đăng nhập...', 'success');
                    registerForm.reset();
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    // Xử lý lỗi từ Server (Email đã tồn tại, lỗi server,...)
                    showMessage(messageElementId, data.message || 'Đăng ký thất bại, vui lòng thử lại.', 'error');
                }
            } catch (error) {
                console.error('Lỗi kết nối:', error);
                showMessage(messageElementId, '❌ Lỗi: Không thể kết nối đến máy chủ. Vui lòng kiểm tra Server (cổng 3000).', 'error');
            }
        });
    }
});