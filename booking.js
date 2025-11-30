// booking.js - Phiên bản đã sửa lỗi, lưu vào localStorage và chuyển hướng đến trang thanh toán

document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('booking-form');
    const bookTourBtn = document.getElementById('book-tour-btn');

    if (!bookTourBtn || !bookingForm) {
        console.error('Lỗi: Không tìm thấy Form (booking-form) hoặc Nút (book-tour-btn) trong HTML.');
        return; 
    }
    
    // =========================================================
    // HÀM LẤY ID VÀ GIÁ TỪ DATA ATTRIBUTE (trên nút Đặt tour)
    // =========================================================
    function getTourDetails(button) {
        const tourId = button.getAttribute('data-tour-id');
        const tourPrice = parseFloat(button.getAttribute('data-price')) || 0;
        return { tourId, tourPrice };
    }

    // =========================================================
    // HÀM LƯU DỮ LIỆU TOUR MỚI VÀO LOCAL STORAGE
    // =========================================================
    function saveNewTour(newTourData) {
        try {
            const allTours = JSON.parse(localStorage.getItem('selectedTours')) || [];
            
            // Lọc các tour trùng ID duy nhất (tránh lỗi khi test), sau đó thêm tour mới
            const existingTours = allTours.filter(tour => tour.id !== newTourData.id);
            existingTours.push(newTourData);
            
            localStorage.setItem('selectedTours', JSON.stringify(existingTours));
            return true;
        } catch (error) {
            console.error("Lỗi khi lưu tour vào localStorage:", error);
            return false;
        }
    }

    // =========================================================
    // XỬ LÝ SỰ KIỆN CLICK VÀO NÚT ĐẶT TOUR
    // =========================================================
    bookTourBtn.addEventListener('click', function(event) {
        event.preventDefault(); // Ngăn chặn hành vi submit form mặc định

        // 1. Kiểm tra tính hợp lệ của form
        if (!bookingForm.checkValidity()) {
            bookingForm.reportValidity(); 
            return;
        }

        try {
            // 2. Thu thập dữ liệu
            const departureDate = bookingForm.querySelector('#departure-date').value;
            const quantity = parseInt(bookingForm.querySelector('#quantity').value); 
            
            const fullName = bookingForm.querySelector('#full-name').value; 
            const phone = bookingForm.querySelector('#phone').value; 
            const emailForm = bookingForm.querySelector('#email').value; // Email từ form
            
            const { tourId, tourPrice } = getTourDetails(bookTourBtn); 
            const tourNameElement = document.querySelector('.tour-detail-description h1');
            const tourName = tourNameElement ? tourNameElement.textContent.trim() : 'Tour không tên';
            
            if (!tourId || !departureDate || quantity === 0 || tourPrice === 0) {
                alert('Lỗi dữ liệu: Không thể xác định thông tin đặt tour.');
                return;
            }

            // 🔥 Cập nhật: Lấy email của người dùng đang đăng nhập
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            // Sử dụng email của người dùng đang đăng nhập làm ID duy nhất
            // Nếu không đăng nhập, dùng email trong form (Giả định rằng user phải đăng nhập)
            const userEmailIdentifier = currentUser?.email || emailForm; 
            
            if (!userEmailIdentifier) {
                alert('Lỗi xác định tài khoản: Vui lòng đăng nhập hoặc nhập email hợp lệ.');
                return;
            }
            
            // 3. TẠO ĐỐI TƯỢNG TOUR VÀ LƯU VÀO LOCAL STORAGE
            const newTourId = 'BOOK-' + Date.now().toString(36).toUpperCase(); // ID DUY NHẤT
            
            const newTour = {
                id: newTourId, // ID duy nhất cho booking này
                tourId: tourId, // ID tour gốc (ví dụ: condao-2n1d)
                name: tourName, 
                date: departureDate,
                quantity: quantity,
                price: tourPrice,
                // 🔥 Cập nhật: Lưu EMAIL làm ID người dùng thay vì username
                email: userEmailIdentifier, 
                status: 'pending', // TRẠNG THÁI CHỜ THANH TOÁN
                bookingDetails: {
                    fullName: fullName,
                    phone: phone,
                    email: emailForm // Lưu email đã điền trong form
                }
            };

            if (saveNewTour(newTour)) {
                // 4. CHUYỂN HƯỚNG SANG TRANG THANH TOÁN
                alert(`Đặt Tour ${tourName} thành công! Vui lòng hoàn tất thanh toán.`);
                
                // Chuyển hướng sang trang thanh toán kèm theo ID tour MỚI được tạo
                window.location.href = `../thanhtoan.html?tourId=${newTourId}`;
            } else {
                alert('Lỗi: Không thể lưu thông tin tour. Vui lòng thử lại.');
            }
            
        } catch (error) {
            console.error("Lỗi khi xử lý đặt tour:", error);
            alert("Lỗi xảy ra khi đặt tour. Vui lòng kiểm tra console log.");
        }
    });
});