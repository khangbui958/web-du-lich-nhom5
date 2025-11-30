// ====================================================================
// KHU VỰC HÀM TIỆN ÍCH CHUNG
// ====================================================================

function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        return JSON.parse(userJson);
    }
    return null;
}

function formatCurrency(amount) {
    if (typeof amount !== 'number') return amount;
    // Cập nhật để sử dụng formatCurrency chuẩn như trong tour-dachon.js (nếu bạn muốn dùng nó)
    // return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    return amount.toLocaleString('vi-VN') + ' VNĐ'; // Giữ nguyên format của bạn
}

function showMessage(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = 'general-message ' + type;
        setTimeout(() => {
            element.textContent = '';
            element.className = 'general-message';
        }, 3000);
    }
}


// ====================================================================
// LOGIC SỰ KIỆN CHUNG (Header, Đăng xuất, Dropdown)
// ====================================================================

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getCurrentUser();
    
    // --- KHAI BÁO CÁC PHẦN TỬ CỦA HEADER ---
    const displayUsername = document.getElementById('display-username');
    const welcomeMessage = document.getElementById('welcome-message');
    
    const loggedInHeader = document.querySelector('.header-actions.logged-in-header');
    const notLoggedInHeader = document.querySelector('.header-actions.not-logged-in'); 
    
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    const userDropdownMenu = document.querySelector('.user-dropdown-menu');
    const logoutButton = document.getElementById('logout-button');

    // --- 1. LOGIC ĐIỀU KHIỂN HEADER (Chuyển đổi trạng thái) ---
    if (currentUser) {
        // TRẠNG THÁI: ĐÃ ĐĂNG NHẬP
        const displayName = currentUser.fullname || currentUser.email;

        if (displayUsername) displayUsername.textContent = displayName;
        
        // Hiển thị lời chào mừng 
        if (welcomeMessage) {
            welcomeMessage.textContent = `Chào mừng trở lại, ${displayName}! Hãy khám phá những chuyến đi mới.`;
        }
        
        // Điều chỉnh hiển thị khối header
        if (notLoggedInHeader) notLoggedInHeader.style.display = 'none';
        if (loggedInHeader) loggedInHeader.style.display = 'flex'; 

    } else {
        // TRẠNG THÁI: CHƯA ĐĂNG NHẬP
        if (loggedInHeader) loggedInHeader.style.display = 'none';
        if (notLoggedInHeader) notLoggedInHeader.style.display = 'flex'; 
    }


    // --- 2. LOGIC DROPDOWN VÀ ĐĂNG XUẤT ---
    
    // Bật/Tắt Dropdown
    if (userMenuToggle && userDropdownMenu) {
        userMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdownMenu.classList.toggle('active');
        });

        // Đóng dropdown khi click bên ngoài
        document.addEventListener('click', function(event) {
            if (userMenuToggle && userDropdownMenu && !userMenuToggle.contains(event.target) && !userDropdownMenu.contains(event.target)) {
                userDropdownMenu.classList.remove('active');
            }
        });
    }

    // Xử lý Đăng xuất
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            // **XÓA THÔNG TIN NGƯỜI DÙNG HIỆN TẠI** (Logic quan trọng đã đúng)
            localStorage.removeItem('currentUser');
            
            // Xóa thông tin booking tạm thời (nếu 'userBooking' là tạm thời)
            localStorage.removeItem('userBooking');
            
            window.location.href = 'index.html'; // Chuyển về trang chưa đăng nhập
        });
    }
    
    // ====================================================================
    // CÁC LOGIC KHÁC (Đã xử lý file tour-dachon.js)
    // ====================================================================

});