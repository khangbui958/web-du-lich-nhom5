document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------
    // PHẦN 1: QUẢN LÝ TRẠNG THÁI ĐĂNG NHẬP & HEADER
    // ----------------------------------------------

    function checkLoginStatus() {
        // Kiểm tra biến lưu trạng thái đăng nhập (Giả định là 'isLoggedIn' trong localStorage)
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
                if (userDropdownMenu.classList.contains('active') && !userMenuToggle.contains(e.target) && !userDropdownMenu.contains(e.target)) {
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
    // KHỞI CHẠY
    // ----------------------------------------------
    updateHomeLink();
    updateHeaderUI();

});