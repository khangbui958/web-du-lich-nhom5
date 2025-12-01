document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------
    // PHẦN 1: QUẢN LÝ TRẠNG THÁI ĐĂNG NHẬP & HEADER (GIỮ NGUYÊN)
    // ----------------------------------------------

    function checkLoginStatus() {
        // Kiểm tra biến lưu trạng thái đăng nhập trong localStorage
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    function updateHomeLink() {
        const homeLink = document.getElementById('home-link');
        if (homeLink) {
            if (checkLoginStatus()) {
                // Đã đăng nhập -> chuyển đến index-login.html
                homeLink.href = 'index-login.html';
            } else {
                // Chưa đăng nhập -> giữ nguyên index.html
                homeLink.href = 'index.html';
            }
        }
    }

    function updateHeaderUI() {
        const isLoggedIn = checkLoginStatus();
        const loggedInHeader = document.querySelector('.logged-in-header');
        const notLoggedInHeader = document.querySelector('.not-logged-in');
        const usernameDisplay = document.getElementById('display-username');
        const userDropdownMenu = document.querySelector('.user-dropdown-menu');
        const userMenuToggle = document.querySelector('.user-menu-toggle');
        const logoutButton = document.getElementById('logout-button');

        if (isLoggedIn) {
            // HIỆN giao diện đã đăng nhập và ẩn giao diện chưa đăng nhập
            if (loggedInHeader) loggedInHeader.style.display = 'flex';
            if (notLoggedInHeader) notLoggedInHeader.style.display = 'none';

            // Hiển thị tên người dùng
            const username = localStorage.getItem('username') || 'Tài khoản';
            if (usernameDisplay) usernameDisplay.textContent = username;

        } else {
            // HIỆN giao diện chưa đăng nhập và ẩn giao diện đã đăng nhập
            if (loggedInHeader) loggedInHeader.style.display = 'none';
            // Cần set style=flex để hiển thị nút Đăng nhập/Đăng ký đúng cách (thay vì block)
            if (notLoggedInHeader) notLoggedInHeader.style.display = 'flex';
        }

        // Logic Toggle Dropdown Menu
        if (userMenuToggle && userDropdownMenu) {
            userMenuToggle.addEventListener('click', function(e) {
                e.stopPropagation(); // Ngăn sự kiện click lan ra body
                userDropdownMenu.classList.toggle('active');
            });
            // Ẩn menu khi click ra ngoài
            document.body.addEventListener('click', function(e) {
                if (userDropdownMenu.classList.contains('active') && !userMenuToggle.contains(e.target)) {
                    userDropdownMenu.classList.remove('active');
                }
            });
        }

        // Logic Đăng xuất
        if (logoutButton) {
            logoutButton.addEventListener('click', function(e) {
                e.preventDefault();
                // Xóa trạng thái đăng nhập khỏi localStorage
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                
                // Chuyển hướng về trang chủ mặc định (index.html)
                window.location.href = 'index.html';
            });
        }
    }

    // ----------------------------------------------
    // PHẦN 2: LOGIC FORM LIÊN HỆ (ĐÃ CẬP NHẬT: LƯU VÀO LOCALSTORAGE)
    // ----------------------------------------------
    
    const contactForm = document.getElementById('contact-form');
    // ID của khu vực thông báo trạng thái trên trang lienhe.html là 'contact-message'
    const statusMessage = document.getElementById('contact-message'); 

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Lấy dữ liệu từ các ID input trong form lienhe.html
            const name = document.getElementById('name')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const phone = document.getElementById('phone')?.value.trim();
            const message = document.getElementById('message')?.value.trim();
            
            // Kiểm tra tính hợp lệ cơ bản
            if (!name || !email || !phone || !message) {
                if (statusMessage) {
                    statusMessage.textContent = 'Vui lòng điền đầy đủ Họ tên, Email, Số điện thoại và Nội dung.';
                    statusMessage.style.color = 'red';
                }
                return;
            }

            // Tạo đối tượng tin nhắn
            const messageData = {
                id: Date.now(),
                name: name,
                email: email,
                phone: phone,
                message: message,
                date: new Date().toLocaleString('vi-VN')
            };

            // Lấy tin nhắn hiện có và thêm tin nhắn mới
            let contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
            contactMessages.push(messageData);

            // Lưu vào LocalStorage
            localStorage.setItem('contactMessages', JSON.stringify(contactMessages));

            // Thông báo thành công và làm sạch form
            if (statusMessage) {
                statusMessage.textContent = '✅ Tin nhắn của bạn đã được gửi thành công. Cảm ơn bạn đã đóng góp!';
                statusMessage.style.color = 'green';
            }
            
            contactForm.reset();

            // Xóa thông báo sau 5 giây
            setTimeout(() => {
                if (statusMessage) statusMessage.textContent = '';
            }, 5000);
        });
    }


    // ----------------------------------------------
    // KHỞI CHẠY
    // ----------------------------------------------
    updateHomeLink();
    updateHeaderUI();

});