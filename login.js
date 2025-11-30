// login.js (Phiên bản Hoàn chỉnh & Đồng bộ)

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    // ID để hiển thị thông báo. (Cần có <div id="login-message">...</div> trong login.html)
    const messageElementId = 'login-message'; 
    const API_URL = 'http://localhost:3000/api/login'; 

    // Hàm hiển thị thông báo (Giữ nguyên)
    function showMessage(id, message, type) {
        let element = document.getElementById(id);
        if (!element) {
            // Nếu không tìm thấy, tạo tạm một div ngay dưới form
            element = document.createElement('div');
            element.id = id;
            element.classList.add('general-message');
            loginForm.prepend(element);
        }
        element.textContent = message;
        element.className = `general-message ${type}`;
        element.style.display = 'block';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Lấy dữ liệu với ID KHỚP VỚI HTML
            const emailOrUsername = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            showMessage(messageElementId, '', '');

            if (!emailOrUsername || !password) {
                 showMessage(messageElementId, 'Vui lòng điền đầy đủ Email/Tên đăng nhập và Mật khẩu.', 'error');
                 return;
            }

            try {
                // Gửi yêu cầu đăng nhập đến Server
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // Giả định Backend sử dụng trường 'email' để xác thực
                    body: JSON.stringify({ email: emailOrUsername, password: password }) 
                });

                const data = await response.json();

                if (response.ok) {
                    // Đăng nhập thành công
                    // Lấy tên người dùng (giả định có trong data.user.name hoặc dùng phần trước @ của email)
                    const userName = data.user.name || (emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername); 
                    
                    // LƯU KEY ĐỒNG BỘ: 'userToken' và 'userName'
                    localStorage.setItem('userToken', data.token);     
                    localStorage.setItem('userName', userName);        
                    localStorage.setItem('currentUser', JSON.stringify(data.user)); // Lưu thông tin chi tiết người dùng

                    showMessage(messageElementId, data.message + ' Đang chuyển hướng...', 'success');
                    loginForm.reset();
                    
                    // CHUYỂN HƯỚNG ĐẾN TRANG CHỦ ĐÃ ĐĂNG NHẬP
                    setTimeout(() => {
                        window.location.href = 'index-login.html'; 
                    }, 1000);

                } else {
                    // Lỗi từ Server (Email/mật khẩu sai)
                    showMessage(messageElementId, data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.', 'error');
                }
            } catch (error) {
                console.error('Lỗi kết nối Backend:', error);
                showMessage(messageElementId, '❌ Lỗi: Không thể kết nối đến máy chủ. Vui lòng kiểm tra Server (cổng 3000).', 'error');
            }
        });
    }
});