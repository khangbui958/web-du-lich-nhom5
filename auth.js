document.addEventListener('DOMContentLoaded', () => {

    const loggedInHeader = document.querySelector('.logged-in-header');
    const notLoggedInActions = document.querySelector('.not-logged-in');
    const userDropdownMenu = document.querySelector('.user-dropdown-menu'); // Menu nằm ngoài logged-in-header
    const displayUsername = document.getElementById('display-username');
    const logoutButton = document.getElementById('logout-button');
    const userMenuToggle = document.querySelector('.user-menu-toggle'); // Nút click
    const welcomeMessage = document.getElementById('welcome-message'); 

    // =========================================================================
    // I. LOGIC TRẠNG THÁI ĐĂNG NHẬP (Giữ nguyên)
    // =========================================================================

    function checkLoginStatus() {
        return !!localStorage.getItem('userToken'); 
    }

    function updateHomeLink() {
        const isLoggedIn = checkLoginStatus(); 
        
        const homeLinks = document.querySelectorAll(
            '#home-link, #breadcrumb-home-link, .home-link-footer'
        ); 
        
        const targetUrl = isLoggedIn ? 'index-login.html' : 'index.html'; 

        homeLinks.forEach(link => {
            link.href = targetUrl;
        });
    }

    function updateHeaderUI() {
        const isLoggedIn = checkLoginStatus();
        
        if (isLoggedIn) {
            if (loggedInHeader) loggedInHeader.style.display = 'flex'; 
            if (notLoggedInActions) notLoggedInActions.style.display = 'none';

            const username = localStorage.getItem('userName') || 'Người dùng';
            if (displayUsername) {
                displayUsername.textContent = username;
            }

            if (welcomeMessage) {
                welcomeMessage.textContent = `Xin chào, ${username}! Chúc bạn một ngày du lịch tuyệt vời!`;
            }

        } else {
            if (loggedInHeader) loggedInHeader.style.display = 'none';
            if (notLoggedInActions) notLoggedInActions.style.display = 'flex';
            
            if (welcomeMessage) {
                 welcomeMessage.textContent = '';
            }
        }
    }

    // =========================================================================
    // II. LOGIC XỬ LÝ SỰ KIỆN
    // =========================================================================

    function handleLogout() {
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('userToken');
                localStorage.removeItem('userName'); 
                localStorage.removeItem('currentUser'); 
                
                window.location.href = 'index.html';
            });
        }
    }

    /**
     * Sửa: Tăng cường xử lý sự kiện click để khắc phục lỗi đóng mở menu.
     * Sử dụng e.stopPropagation() để ngăn click lan truyền ngay lập tức.
     */
    function setupUserMenuToggle() {
        if (userMenuToggle && userDropdownMenu) {
            
            // 1. Xử lý click MỞ/ĐÓNG menu
            userMenuToggle.addEventListener('click', (e) => {
                // QUAN TRỌNG: Ngăn chặn click lan truyền ra document
                e.stopPropagation(); 
                
                const isHidden = userDropdownMenu.style.display === 'none' || userDropdownMenu.style.display === '';
                userDropdownMenu.style.display = isHidden ? 'block' : 'none';
            });
            
            // 2. Ngăn chặn click bên trong menu làm đóng menu (rất quan trọng khi menu nằm ngoài khối cha)
            userDropdownMenu.addEventListener('click', (e) => {
                 e.stopPropagation();
            });

            // 3. Xử lý click ĐÓNG menu khi click bên ngoài
            document.addEventListener('click', (e) => {
                // Chỉ đóng nếu click không phải là nút toggle VÀ không nằm trong menu thả xuống
                if (userDropdownMenu.style.display === 'block') {
                    // Cấu trúc của bạn: userDropdownMenu nằm ngay sau header-top
                    // Chúng ta cần kiểm tra vị trí click so với nút toggle và menu
                    
                    const isClickOnToggle = userMenuToggle.contains(e.target);
                    const isClickInMenu = userDropdownMenu.contains(e.target);
                    
                    if (!isClickOnToggle && !isClickInMenu) {
                        userDropdownMenu.style.display = 'none';
                    }
                }
            });
        }
    }

    // =========================================================================
    // III. KHỞI CHẠY CHỨC NĂNG (Giữ nguyên)
    // =========================================================================
    
    window.checkLoginStatus = checkLoginStatus; 

    updateHomeLink();     
    updateHeaderUI();     
    handleLogout();       
    setupUserMenuToggle(); // Đã được sửa để hoạt động với cấu trúc HTML hiện tại

});