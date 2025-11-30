// account-setting.js (Phiên bản Hoàn chỉnh & Tối ưu)

document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'http://localhost:3000/api/user'; 
    
    // Khai báo biến LỚN (sẽ được cập nhật sau khi fetch/update)
    let currentUser = null; 
    let userToken = localStorage.getItem('userToken'); 
    
    // Lấy dữ liệu người dùng đã lưu
    const storedUserData = localStorage.getItem('currentUser');
    
    // --- KIỂM TRA ĐĂNG NHẬP VÀ TẢI DỮ LIỆU BAN ĐẦU ---
    if (!storedUserData || !userToken) {
        // Nếu không có dữ liệu hoặc token, chuyển hướng (mở comment nếu cần áp dụng)
        // alert('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
        // window.location.href = 'login.html';
        // return; 
        
        // Cài đặt dữ liệu mặc định để script vẫn chạy trong môi trường phát triển
        currentUser = { fullname: 'Người Dùng Test', email: 'test@example.com', phone: '', address: '', dob: '' };
        userToken = 'dummy-token';
    } else {
        currentUser = JSON.parse(storedUserData);
    }
    
    // --- Tham chiếu DOM ---
    const infoForm = document.querySelector('.account-form');
    const passwordForm = document.querySelector('.password-form');
    const logoutLinks = document.querySelectorAll('.user-dropdown-menu a[href="#"], .sidebar-menu a[href="#"]'); 
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    const userDropdownMenu = document.querySelector('.user-dropdown-menu');

    // --- Hàm tiện ích: Hiển thị thông báo ---
    function showMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.className = `general-message ${type}`; 
            element.style.display = message ? 'block' : 'none';
        }
    }
    
    // --- Hàm tiện ích: Cập nhật tên người dùng hiển thị ---
    function displayUsername() {
        const usernameSpan = document.querySelector('.username');
        if (usernameSpan && currentUser.fullname) {
            usernameSpan.textContent = currentUser.fullname;
        }
        // Đồng bộ tên hiển thị ở header (nếu có)
        const headerUsernameSpan = document.getElementById('display-username');
        if (headerUsernameSpan) {
            headerUsernameSpan.textContent = currentUser.fullname || currentUser.email.split('@')[0];
        }
    }

    // --- Hàm tiện ích: Đổ dữ liệu vào form ---
    function populateInfoForm() {
        if (infoForm) {
            document.getElementById('fullname').value = currentUser.fullname || '';
            document.getElementById('email').value = currentUser.email || '';
            document.getElementById('phone').value = currentUser.phone || '';
            document.getElementById('address').value = currentUser.address || '';
            // Đảm bảo định dạng YYYY-MM-DD
            document.getElementById('dob').value = currentUser.dob ? currentUser.dob.split('T')[0] : ''; 
        }
    }
    
    // --- Hàm tiện ích: Xử lý ĐĂNG XUẤT CỤC BỘ ---
    function handleLogout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userToken'); 
        localStorage.removeItem('userName'); 
        window.location.href = 'index.html';
    }

    // --- TẢI TRANG BAN ĐẦU ---
    displayUsername();
    populateInfoForm();
    
    // --- 1. XỬ LÝ MỞ/ĐÓNG DROPDOWN MENU ---
    if (userMenuToggle && userDropdownMenu) {
        userMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation(); 
            userDropdownMenu.classList.toggle('active'); 
        });
        
        userDropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.addEventListener('click', function(e) {
            if (userDropdownMenu.classList.contains('active') && !userMenuToggle.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                userDropdownMenu.classList.remove('active');
            }
        });
    }


    // --- 2. XỬ LÝ CHUYỂN TAB (Sidebar) --- (Giữ nguyên logic của bạn)
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    const contentTabs = document.querySelectorAll('.content-tab');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);

            sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');

            contentTabs.forEach(tab => {
                tab.classList.remove('active-content');
                if (tab.id === targetId) {
                    tab.classList.add('active-content');
                }
            });
        });
    });

    // --- 3. XỬ LÝ CẬP NHẬT THÔNG TIN CÁ NHÂN ---
    if (infoForm) {
        infoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            showMessage('info-update-message', '', ''); 
            
            const updatedData = {
                // Email được dùng để xác định người dùng trên server
                email: currentUser.email, 
                fullname: document.getElementById('fullname').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                dob: document.getElementById('dob').value 
            };
    
            try {
                const response = await fetch(`${API_BASE_URL}/update`, {
                    method: 'PATCH', 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify(updatedData)
                });
    
                if (response.ok) {
                    const data = await response.json();
                    
                    // Cập nhật biến currentUser cục bộ
                    Object.assign(currentUser, data.updatedUser); 
                    
                    // Cập nhật LocalStorage
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    // Cập nhật userName (dùng cho header)
                    localStorage.setItem('userName', currentUser.fullname || currentUser.email.split('@')[0]);
                    
                    displayUsername();
                    showMessage('info-update-message', 'Cập nhật thông tin cá nhân thành công!', 'success');
                } else {
                    const errorData = await response.json();
                    showMessage('info-update-message', errorData.message || 'Cập nhật thất bại.', 'error');
                }
            } catch (error) {
                console.error('Lỗi kết nối hoặc server:', error);
                showMessage('info-update-message', 'Lỗi kết nối: Không thể gửi yêu cầu đến máy chủ.', 'error');
            }
        });
    }

    // --- 4. XỬ LÝ ĐỔI MẬT KHẨU ---
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            showMessage('password-update-message', '', ''); 

            const oldPassword = document.getElementById('old-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (newPassword !== confirmPassword) {
                showMessage('password-update-message', 'Mật khẩu mới và xác nhận không khớp.', 'error');
                return;
            }
            if (newPassword.length < 6) {
                showMessage('password-update-message', 'Mật khẩu phải có ít nhất 6 ký tự.', 'error');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/change-password`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({ email: currentUser.email, oldPassword, newPassword })
                });

                if (response.ok) {
                    showMessage('password-update-message', 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
                    passwordForm.reset();
                    // Đăng xuất sau 2 giây để người dùng đăng nhập lại với mật khẩu mới
                    setTimeout(handleLogout, 2000); 
                } else {
                    const errorData = await response.json();
                    showMessage('password-update-message', errorData.message || 'Đổi mật khẩu thất bại.', 'error');
                }
            } catch (error) {
                console.error('Lỗi kết nối hoặc server:', error);
                showMessage('password-update-message', 'Lỗi kết nối: Không thể gửi yêu cầu đến máy chủ.', 'error');
            }
        });
    }

    // --- 5. GẮN SỰ KIỆN ĐĂNG XUẤT ---
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    });

});