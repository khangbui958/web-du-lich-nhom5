document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------
    // PHẦN 1: QUẢN LÝ TRẠNG THÁI ĐĂNG NHẬP & HEADER
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
    // PHẦN 2: LOGIC FORM LIÊN HỆ
    // ----------------------------------------------
    
    const contactForm = document.getElementById('contact-form');
    const contactMessage = document.getElementById('contact-message');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Trong môi trường thực tế, bạn sẽ gửi dữ liệu này đến server
            // Bắt đầu hiển thị trạng thái đang xử lý (tùy chọn)
            contactMessage.textContent = 'Đang gửi...';
            contactMessage.style.color = 'gray';

            // Giả lập xử lý và gửi thành công sau 1 giây
            setTimeout(() => {
                contactMessage.textContent = 'Gửi thành công! Chúng tôi sẽ liên hệ lại với bạn sớm nhất.';
                contactMessage.style.color = 'green';
                contactForm.reset();
                
                // Xóa thông báo sau 5 giây
                setTimeout(() => {
                    contactMessage.textContent = '';
                }, 5000);
            }, 1000); // 1000ms delay
        });
    }


    // ----------------------------------------------
    // KHỞI CHẠY
    // ----------------------------------------------
    updateHomeLink();
    updateHeaderUI();

});