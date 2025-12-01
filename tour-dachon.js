// tour-dachon.js - PHIÊN BẢN CUỐI CÙNG: KHÔNG CÓ TOUR-DETAIL, CHỈ CÓ TOUR-DACHON

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
    
    // ✅ Biến Modal dùng tiền tố dachon
    const dachonModal = document.getElementById('tour-dachon-modal'); 
    const dachonModalContent = document.getElementById('tour-dachon-content');
    
    let allToursData = {}; // Lưu trữ dữ liệu đã phân loại

    // Hàm định dạng số tiền VND
    const formatCurrency = (number) => {
        if (typeof number !== 'number' || isNaN(number)) return 'N/A';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    };

    // Hàm giả lập chi tiết tour tĩnh (dùng cho mô tả và giá gốc nếu cần)
    const getTourDetailsStatic = (tourId) => {
        switch (tourId) {
            case 'condao-2n1d':
                return {
                    id: 'condao-2n1d',
                    name: 'Tour Tầm Linh Côn Đảo | 2N1Đ',
                    image: 'images/samson.png', 
                    description: 'Khám phá Côn Đảo huyền bí, viếng mộ chị Võ Thị Sáu và thăm quan các địa danh lịch sử.',
                    price: 1400000 
                };
            case 'phuquoc-3n2d':
                return { 
                    id: 'phuquoc-3n2d',
                    name: 'Tour Phú Quốc - Thiên Đường Bảo Ngọc - 3N2Đ', 
                    image: 'images/haiphong.jpg', 
                    description: 'Tận hưởng bãi biển đẹp, khám phá công viên Vinpearl Safari và thư giãn tại resort.',
                    price: 4200000
                };
            case 'tayninh-1d':
                return { 
                    id: 'tayninh-1d',
                    name: 'Tây Ninh 1 Ngày - Chinh phục nóc nhà Đông Nam Bộ', 
                    image: 'images/tayninh.png', 
                    description: 'Tham quan Núi Bà Đen bằng cáp treo và viếng Tòa Thánh Tây Ninh.',
                    price: 1400000 
                };
            default:
                return { 
                    id: tourId,
                    name: `Tour: ${tourId} (Không rõ)`, 
                    image: 'images/default-tour.jpg', 
                    description: 'Thông tin chi tiết đang được cập nhật.',
                    price: 1000000
                };
        }
    };
    
    // Hàm lấy và phân loại tour của người dùng hiện tại
    const getAndCategorizeTours = () => {
        const allTours = JSON.parse(localStorage.getItem('selectedTours')) || [];
        const userTours = allTours.filter(tour => tour.email === currentEmail);
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        const toursData = { upcoming: [], completed: [], cancelled: [] };
        
        userTours.forEach(tour => {
            const staticDetails = getTourDetailsStatic(tour.tourId);
            
            tour.price = tour.price || staticDetails.price; 
            tour.name = tour.name || staticDetails.name; 
            tour.image = tour.image || staticDetails.image; 
            tour.description = staticDetails.description;
            tour.totalPrice = tour.price * tour.quantity; 

            const tourDate = new Date(tour.date);

            if (tour.status === 'cancelled') {
                toursData.cancelled.push(tour);
            } else if (tour.status === 'completed' || (tour.status !== 'cancelled' && tourDate < today)) {
                toursData.completed.push(tour);
                if (tour.status !== 'completed') tour.status = 'completed';
            } else {
                toursData.upcoming.push(tour); 
            }
        });
        
        allToursData = toursData; 
        saveAllTours(toursData);
        return toursData;
    };
    
    // Hàm lưu lại tất cả tour đã cập nhật vào LocalStorage
    const saveAllTours = (toursData) => {
        let allTours = JSON.parse(localStorage.getItem('selectedTours')) || [];
        const otherUsersTours = allTours.filter(tour => tour.email !== currentEmail || !tour.email);
        const updatedUserTours = [...toursData.upcoming, ...toursData.completed, ...toursData.cancelled];
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
                    <button class="btn-primary btn-detail-tour" data-action="view-detail" data-tour-id="${tour.id}">Xem chi tiết</button>
                    <button class="btn-secondary btn-cancel" data-action="cancel" data-tour-id="${tour.id}">Hủy tour</button>
                `; 
                break;
            case 'completed':
                statusClass = 'status-completed';
                statusText = 'Đã hoàn thành';
                actionsHTML = `
                    <button class="btn-primary btn-detail-tour" data-action="view-detail" data-tour-id="${tour.id}">Xem chi tiết</button>
                    <button class="btn-secondary btn-rebook" data-action="rebook" data-tour-id="${tour.id}" data-tour-product-id="${tour.tourId}">Đặt lại tour</button>
                `;
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Đã hủy';
                actionsHTML = `
                    <button class="btn-primary btn-rebook" data-action="rebook" data-tour-id="${tour.id}" data-tour-product-id="${tour.tourId}">Đặt lại tour</button>
                    <button class="btn-secondary btn-detail-tour" data-action="view-detail" data-tour-id="${tour.id}">Xem chi tiết</button>
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
                <h3><span style="color: inherit; text-decoration: none; cursor: default;">${tour.name}</span></h3>
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
        if (!confirm('Bạn có chắc chắn muốn Đặt lại (Rebook) tour này không? Bạn sẽ được chuyển hướng đến trang thanh toán.')) {
            return;
        }
        let foundIndex = allToursData.cancelled.findIndex(t => t.id === tourId);
        if (foundIndex === -1) {
            alert('Lỗi: Không tìm thấy tour đã hủy để đặt lại.');
            return;
        }
        const checkoutUrl = `thanhtoan.html?tourId=${tourProductId}&rebook=true&rebookBookingId=${tourId}`;
        window.location.href = checkoutUrl;
    };
    
    // Gắn sự kiện cho các nút hành động (Hủy tour và Thanh toán, Đặt lại, Xem chi tiết)
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

        // 2. Thanh toán
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

        // 4. XEM CHI TIẾT TOUR (DÙNG MODAL tour-dachon)
        document.querySelectorAll('[data-action="view-detail"]').forEach(button => {
            button.addEventListener('click', (event) => {
                const bookingId = event.target.dataset.tourId; 
                showDachonModal(bookingId); 
            });
        });
    };
    
    // HÀM HIỂN THỊ CHI TIẾT TOUR TRONG MODAL
    const showDachonModal = (bookingId) => {
        // Tìm tour trong tất cả các danh mục
        const tour = [...allToursData.upcoming, ...allToursData.completed, ...allToursData.cancelled]
                     .find(t => t.id === bookingId);

        if (!tour || !dachonModal || !dachonModalContent) {
            alert('Lỗi: Không tìm thấy thông tin tour hoặc Modal chưa được thiết lập.');
            return;
        }

        const staticDetails = getTourDetailsStatic(tour.tourId);
        
        // Gán nội dung chi tiết vào modal
        dachonModalContent.innerHTML = `
            <div class="modal-header">
                <h3>Chi tiết Tour đã chọn: ${tour.name}</h3>
                <button type="button" class="close-btn" onclick="document.getElementById('tour-dachon-modal').style.display='none'">&times;</button>
            </div>
            <div class="modal-body">
                <img src="${tour.image}" alt="${tour.name}" style="width: 100%; max-height: 200px; object-fit: cover; margin-bottom: 15px;">
                <p><strong>Mã đặt chỗ:</strong> ${tour.id}</p>
                <p><strong>Mã tour gốc:</strong> ${tour.tourId}</p>
                <p><strong>Ngày khởi hành:</strong> ${new Date(tour.date).toLocaleDateString('vi-VN')}</p>
                <p><strong>Trạng thái:</strong> <span class="tour-status status-${tour.status}">${tour.status}</span></p>
                <p><strong>Số người:</strong> ${tour.quantity}</p>
                <p><strong>Tổng tiền:</strong> ${formatCurrency(tour.totalPrice)}</p>
                <hr>
                <p><strong>Mô tả tour:</strong> ${staticDetails.description || 'Không có mô tả chi tiết.'}</p>
            </div>
        `;

        // Hiển thị modal
        dachonModal.style.display = 'block';
    };
    
    // Khởi tạo
    if (tourTabsContainer) {
        tourTabsContainer.addEventListener('click', handleTabClick);
    }
    
    // Lấy dữ liệu và hiển thị lần đầu
    const initialToursData = getAndCategorizeTours();
    displayTours(initialToursData);
    
    // 5. XỬ LÝ ĐÓNG MODAL KHI CLICK RA NGOÀI
    if (dachonModal) {
        dachonModal.addEventListener('click', (event) => {
            if (event.target === dachonModal) {
                dachonModal.style.display = 'none';
            }
        });
    }
});