// tour-dachon.js - PHIÊN BẢN HOÀN CHỈNH: TỐI ƯU HÓA LỌC TOUR THEO TÀI KHOẢN VÀ GIỮ LOGIC ĐẶT/HỦY TOUR

document.addEventListener('DOMContentLoaded', () => {
    // 1. Khai báo biến và tham chiếu DOM
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // **KIỂM TRA ĐĂNG NHẬP (QUAN TRỌNG)**
    if (!currentUser || !currentUser.email) {
        alert('Vui lòng đăng nhập để xem các tour đã chọn của bạn.');
        window.location.href = 'login.html'; 
        return; 
    }
    
    // 🔥 ID duy nhất là EMAIL
    const currentEmail = currentUser.email;

    const tourTabsContainer = document.getElementById('tour-tabs-container');
    const upcomingList = document.getElementById('upcoming');
    const completedList = document.getElementById('completed');
    const cancelledList = document.getElementById('cancelled');
    const emptyMessage = document.getElementById('empty-list-message');
    let allToursData = {}; // Lưu trữ dữ liệu đã phân loại

    // Hàm định dạng số tiền VND
    const formatCurrency = (number) => {
        if (typeof number !== 'number' || isNaN(number)) return 'N/A';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    };

    // Hàm giả lập chi tiết tour (Sử dụng tourId gốc)
    const getTourDetailsStatic = (tourId) => {
        switch (tourId) {
            case 'condao-2n1d':
                return {
                    name: 'Tour Tầm Linh Côn Đảo | 2N1Đ',
                    image: 'images/samson.png', 
                    url: 'tour-details/condao-2n1d.html', 
                    price: 1400000 
                };
            case 'phuquoc-3n2d':
                return { 
                    name: 'Tour Phú Quốc - Thiên Đường Bảo Ngọc - 3N2Đ', 
                    image: 'images/haiphong.jpg', 
                    url: 'tour-details/phuquoc.html', 
                    price: 4200000
                };
            case 'tayninh-1d':
                return { 
                    name: 'Tây Ninh 1 Ngày - Chinh phục nóc nhà Đông Nam Bộ', 
                    image: 'images/tayninh.png', 
                    url: 'tour-details/tayninh.html', 
                    price: 1400000 
                };
            default:
                return { 
                    name: `Tour: ${tourId} (Không rõ)`, 
                    image: 'images/default-tour.jpg', 
                    url: '#',
                    price: 1000000
                };
        }
    };
    
    // Hàm lấy và phân loại tour của người dùng hiện tại
    const getAndCategorizeTours = () => {
        const allTours = JSON.parse(localStorage.getItem('selectedTours')) || [];
        
        // **QUAN TRỌNG:** Chỉ lọc tour thuộc về EMAIL hiện tại.
        const userTours = allTours.filter(tour => tour.email === currentEmail);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        const toursData = {
            upcoming: [],
            completed: [],
            cancelled: []
        };
        
        userTours.forEach(tour => {
            const staticDetails = getTourDetailsStatic(tour.tourId);
            
            // Cập nhật/Ánh xạ chi tiết tour
            // Sử dụng giá/tên lưu trong tour (nếu có) hoặc lấy từ staticDetails
            tour.price = tour.price || staticDetails.price; 
            tour.name = tour.name || staticDetails.name; 
            tour.image = tour.image || staticDetails.image; 
            tour.url = staticDetails.url; 
            tour.totalPrice = tour.price * tour.quantity; // Tính tổng tiền

            const tourDate = new Date(tour.date);

            // Phân loại tour dựa trên trạng thái và ngày khởi hành
            if (tour.status === 'cancelled') {
                toursData.cancelled.push(tour);
            } else if (tour.status === 'completed' || (tour.status !== 'cancelled' && tourDate < today)) {
                // Nếu tour đã qua ngày khởi hành VÀ chưa bị hủy, coi như đã hoàn thành
                toursData.completed.push(tour);
                if (tour.status !== 'completed') tour.status = 'completed';
            } else {
                // Bao gồm 'pending' và 'confirmed' chưa khởi hành
                toursData.upcoming.push(tour); 
            }
        });
        
        allToursData = toursData; 
        
        // Cần lưu lại ngay lập tức nếu có tour bị chuyển từ upcoming sang completed
        saveAllTours(toursData);
        return toursData;
    };
    
    // Hàm lưu lại tất cả tour đã cập nhật
    const saveAllTours = (toursData) => {
        let allTours = JSON.parse(localStorage.getItem('selectedTours')) || [];
        
        // 🔥 Cập nhật quan trọng: Lọc tour của người dùng khác HOẶC tour không có trường 'email' (tour cũ)
        const otherUsersTours = allTours.filter(tour => tour.email !== currentEmail || !tour.email);
        
        // Tổng hợp tất cả tour đã cập nhật của người dùng hiện tại
        const updatedUserTours = [...toursData.upcoming, ...toursData.completed, ...toursData.cancelled];
        
        // Lưu lại toàn bộ mảng (Tour của người khác + Tour đã cập nhật của người dùng hiện tại)
        localStorage.setItem('selectedTours', JSON.stringify([...otherUsersTours, ...updatedUserTours]));
    };
    
    // Hàm tạo HTML cho mỗi tour item
    const createTourItem = (tour) => {
        const item = document.createElement('div');
        item.classList.add('tour-item');
        
        let statusClass = '';
        let statusText = '';
        let actionsHTML = '';

        const totalPrice = tour.totalPrice || (tour.price * tour.quantity);
        const departureDate = new Date(tour.date).toLocaleDateString('vi-VN'); 

        // Định nghĩa trạng thái và nút hành động
        switch(tour.status) {
            case 'pending':
                statusClass = 'status-pending';
                statusText = 'Chờ thanh toán';
                actionsHTML = `
                    <a href="thanhtoan.html?tourId=${tour.id}" class="btn-primary" data-action="pay" data-tour-id="${tour.id}">Thanh toán ngay</a>
                    <button class="btn-secondary btn-cancel" data-action="cancel" data-tour-id="${tour.id}">Hủy tour</button>
                `; 
                break;
            case 'confirmed':
                statusClass = 'status-confirmed';
                statusText = 'Đã xác nhận';
                actionsHTML = `
                    <a href="${tour.url}" class="btn-primary">Xem chi tiết</a>
                    <button class="btn-secondary btn-cancel" data-action="cancel" data-tour-id="${tour.id}">Hủy tour</button>
                `; 
                break;
            case 'completed':
                statusClass = 'status-completed';
                statusText = 'Đã hoàn thành';
                actionsHTML = `
                    <a href="${tour.url}" class="btn-primary">Xem chi tiết</a>
                    <button class="btn-secondary btn-rebook" data-action="rebook" data-tour-id="${tour.id}" data-tour-product-id="${tour.tourId}">Đặt lại tour</button>
                `;
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Đã hủy';
                actionsHTML = `
                    <button class="btn-primary btn-rebook" data-action="rebook" data-tour-id="${tour.id}" data-tour-product-id="${tour.tourId}">Đặt lại tour</button>
                    <a href="${tour.url}" class="btn-secondary">Xem chi tiết</a>
                `;
                break;
            default:
                statusClass = 'status-pending';
                statusText = 'Chờ xử lý';
        }

        item.innerHTML = `
            <div class="tour-image">
                <img src="${tour.image}" alt="${tour.name}">
            </div>
            <div class="tour-details">
                <h3><a href="${tour.url}" style="color: inherit; text-decoration: none;">${tour.name}</a></h3>
                <p><strong>Mã đặt chỗ:</strong> ${tour.id}</p>
                <p><strong>Ngày khởi hành:</strong> ${departureDate}</p>
                <p><strong>Số người:</strong> ${tour.quantity}</p>
                <p><strong>Trạng thái:</strong> <span class="tour-status ${statusClass}">${statusText}</span></p>
            </div>
            <div class="tour-actions">
                <span class="tour-price">${formatCurrency(totalPrice)}</span>
                ${actionsHTML}
            </div>
        `;
        return item;
    };


    // Hàm hiển thị nội dung tour
    const displayTours = (toursData) => {
        // 1. Cập nhật số lượng trên tab
        document.getElementById('count-upcoming').textContent = toursData.upcoming.length;
        document.getElementById('count-completed').textContent = toursData.completed.length;
        document.getElementById('count-cancelled').textContent = toursData.cancelled.length;
        
        upcomingList.innerHTML = '';
        completedList.innerHTML = '';
        cancelledList.innerHTML = '';

        // 2. Chèn các mục tour vào danh sách
        toursData.upcoming.forEach(tour => {
            upcomingList.appendChild(createTourItem(tour));
        });
        toursData.completed.forEach(tour => {
            completedList.appendChild(createTourItem(tour));
        });
        toursData.cancelled.forEach(tour => {
            cancelledList.appendChild(createTourItem(tour));
        });
        
        // 3. Kích hoạt và kiểm tra tab mặc định
        const activeTab = tourTabsContainer.querySelector('.tab-button.active');
        const defaultTabId = activeTab ? activeTab.dataset.tab : 'upcoming';
        
        if (!activeTab) {
            const defaultTabBtn = tourTabsContainer.querySelector('[data-tab="upcoming"]');
            if (defaultTabBtn) defaultTabBtn.classList.add('active');
        }
        
        handleTabContent(defaultTabId);

        // Gắn lại sự kiện sau khi nội dung được render
        attachActionListeners(toursData);
    };
    
    // Xử lý logic ẩn/hiện danh sách và thông báo rỗng
    const handleTabContent = (activeTabId) => {
        document.querySelectorAll('.tour-list').forEach(list => list.style.display = 'none');
        
        const activeList = document.getElementById(activeTabId);
        if (activeList) {
            activeList.style.display = 'flex'; 
            
            if (activeList.children.length === 0) {
                const tabName = activeTabId === 'upcoming' ? 'Sắp khởi hành' : activeTabId === 'completed' ? 'Đã hoàn thành' : 'Đã hủy';
                emptyMessage.textContent = `Hiện chưa có tour nào trong danh mục ${tabName}.`;
                emptyMessage.style.display = 'block';
            } else {
                emptyMessage.style.display = 'none';
            }
        }
    }
    
    // Xử lý chuyển đổi Tab
    const handleTabClick = (event) => {
        const target = event.target.closest('.tab-button');
        if (!target) return;

        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');

        handleTabContent(target.dataset.tab);
    };
    
    // HÀM ĐẶT LẠI TOUR (Rebook) - CHỈ CHUYỂN HƯỚNG
    const handleRebook = (tourId, tourProductId) => {
        // 1. Chỉ xác nhận và kiểm tra sự tồn tại 
        if (!confirm('Bạn có chắc chắn muốn Đặt lại (Rebook) tour này không? Bạn sẽ được chuyển hướng đến trang thanh toán.')) {
            return;
        }

        let foundIndex = allToursData.cancelled.findIndex(t => t.id === tourId);

        if (foundIndex === -1) {
            alert('Lỗi: Không tìm thấy tour đã hủy để đặt lại.');
            return;
        }
        
        // Việc xóa tour cũ sẽ được xử lý trong thanhtoan.js sau khi thanh toán thành công.

        const checkoutUrl = `thanhtoan.html?tourId=${tourProductId}&rebook=true&rebookBookingId=${tourId}`;
        
        window.location.href = checkoutUrl;
    };
    
    // Gắn sự kiện cho các nút hành động (Hủy tour và Thanh toán, Đặt lại)
    const attachActionListeners = (toursData) => {
        
        // 1. Hủy tour
        document.querySelectorAll('[data-action="cancel"]').forEach(button => {
            button.addEventListener('click', (event) => {
                if (confirm('Bạn có chắc chắn muốn hủy tour này không? Hành động này không thể hoàn tác.')) {
                    const tourId = event.target.dataset.tourId;
                    
                    let foundIndex = toursData.upcoming.findIndex(t => t.id === tourId);
                    
                    if (foundIndex !== -1) {
                        const cancelledTour = toursData.upcoming.splice(foundIndex, 1)[0]; 
                        cancelledTour.status = 'cancelled';
                        toursData.cancelled.push(cancelledTour); 
                        
                        saveAllTours(toursData);
                        alert('Tour đã được hủy thành công. Vui lòng kiểm tra tab "Tour Đã Hủy".');
                        
                        displayTours(toursData);
                    } else {
                        alert('Không tìm thấy tour để hủy.');
                    }
                }
            });
        });

        // 2. Thanh toán (Chỉ chuyển hướng)
        document.querySelectorAll('[data-action="pay"]').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault(); 
                const tourId = event.target.dataset.tourId;
                const checkoutUrl = `thanhtoan.html?tourId=${tourId}`;
                window.location.href = checkoutUrl;
            });
        });
        
        // 3. Đặt lại Tour (Rebook)
        document.querySelectorAll('[data-action="rebook"]').forEach(button => {
            button.addEventListener('click', (event) => {
                const tourId = event.target.dataset.tourId; 
                const tourProductId = event.target.dataset.tourProductId; 
                
                handleRebook(tourId, tourProductId);
            });
        });
    };
    
    // Khởi tạo
    if (tourTabsContainer) {
        tourTabsContainer.addEventListener('click', handleTabClick);
    }
    
    // Lấy dữ liệu và hiển thị lần đầu
    const initialToursData = getAndCategorizeTours();
    displayTours(initialToursData);
});