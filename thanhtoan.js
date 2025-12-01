// thanhtoan.js - Xử lý thông tin tour trên trang thanh toán và cập nhật trạng thái sau khi thanh toán

document.addEventListener('DOMContentLoaded', () => {

    // Hàm định dạng tiền tệ
    const formatCurrency = (number) => {
        if (typeof number !== 'number' || isNaN(number)) return 'N/A';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    };

    // Hàm giả lập chi tiết tour (giống trong tour-dachon.js)
    const getTourDetailsStatic = (tourId) => {
        switch (tourId) {
            case 'condao-2n1d':
                return { name: 'Tour Tầm Linh Côn Đảo | 2N1Đ', price: 1400000, image: 'images/samson.png' };
            case 'phuquoc-3n2d':
                return { name: 'Tour Phú Quốc - Thiên Đường Bảo Ngọc - 3N2Đ', price: 4200000, image: 'images/haiphong.jpg' };
            case 'tayninh-1d':
                return { name: 'Tây Ninh 1 Ngày - Chinh phục nóc nhà Đông Nam Bộ', price: 1400000, image: 'images/tayninh.png' };
            default:
                return { name: `Tour: ${tourId} (Không rõ)`, price: 1000000, image: 'images/default-tour.jpg' };
        }
    };

    // Lấy thông tin từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const tourIdFromUrl = urlParams.get('tourId'); // ID booking (PENDING) HOẶC ID sản phẩm tour (REBOOK)
    const isRebook = urlParams.get('rebook') === 'true';
    const rebookBookingId = urlParams.get('rebookBookingId'); // ID booking bị hủy (chỉ có khi rebook=true)

    // Khai báo biến
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let tourData = { id: null };
    let totalPrice = 0;

    // Kiểm tra đăng nhập
    if (!currentUser || !currentUser.email) {
        alert('Bạn chưa đăng nhập hoặc thông tin tài khoản không đầy đủ. Vui lòng đăng nhập lại để tiếp tục thanh toán.');
        window.location.href = 'login.html';
        return;
    }

    // 🔥 Lấy Email làm ID duy nhất
    const currentEmail = currentUser.email;


    // 1. Tải và chuẩn bị dữ liệu tour
    const loadTourData = () => {
        const allTours = JSON.parse(localStorage.getItem('selectedTours')) || [];

        if (isRebook && rebookBookingId) {
            // --- LOGIC ĐẶT LẠI (REBOOK) ---
            // Tìm tour bị hủy dựa trên ID booking cũ (rebookBookingId)
            const cancelledTour = allTours.find(t => t.id === rebookBookingId && t.email === currentEmail);

            if (cancelledTour && cancelledTour.tourId === tourIdFromUrl) {
                const staticDetails = getTourDetailsStatic(cancelledTour.tourId);

                tourData = {
                    id: cancelledTour.id, // Vẫn dùng ID cũ để xác định tour bị xóa sau này
                    tourId: cancelledTour.tourId, // ID sản phẩm
                    name: staticDetails.name,
                    price: staticDetails.price,
                    quantity: cancelledTour.quantity,
                    date: cancelledTour.date,
                    // Dữ liệu người đặt ban đầu (hoặc lấy từ user hiện tại)
                    fullName: cancelledTour.bookingDetails?.fullName || currentUser?.fullname || 'N/A',
                    phone: cancelledTour.bookingDetails?.phone || currentUser?.phone || 'N/A',
                    email: cancelledTour.bookingDetails?.email || currentUser?.email || 'N/A',
                    currentStatus: 'cancelled_rebooking' // Trạng thái tạm thời
                };
            } else {
                alert('Lỗi: Không tìm thấy thông tin tour bị hủy hợp lệ hoặc tour không thuộc tài khoản của bạn.');
                window.location.href = 'tour-dachon.html';
                return;
            }

        } else if (tourIdFromUrl) {
            // --- LOGIC THANH TOÁN LẦN ĐẦU (Pending) ---

            // 🔥 Lọc tour theo EMAIL VÀ ID BOOKING
            const foundTour = allTours.find(t => t.id === tourIdFromUrl && t.email === currentEmail);

            if (foundTour && foundTour.status === 'pending') {
                const staticDetails = getTourDetailsStatic(foundTour.tourId);

                tourData = {
                    id: foundTour.id, // ID booking duy nhất
                    tourId: foundTour.tourId, // ID sản phẩm
                    name: staticDetails.name,
                    price: staticDetails.price,
                    quantity: foundTour.quantity,
                    date: foundTour.date,
                    // Dữ liệu người đặt
                    fullName: foundTour.bookingDetails?.fullName || currentUser?.fullname || 'N/A',
                    phone: foundTour.bookingDetails?.phone || currentUser?.phone || 'N/A',
                    email: foundTour.bookingDetails?.email || currentUser?.email || 'N/A',
                    currentStatus: foundTour.status
                };
            } else if (foundTour && (foundTour.status === 'confirmed' || foundTour.status === 'completed')) {
                // Xử lý trường hợp người dùng cố gắng vào thanh toán một tour đã xác nhận/hoàn thành
                const staticDetails = getTourDetailsStatic(foundTour.tourId);
                tourData = {
                    ...foundTour,
                    name: staticDetails.name,
                    price: staticDetails.price,
                    currentStatus: foundTour.status // Giữ nguyên trạng thái đã xác nhận/hoàn thành
                };
            } else {
                // Tour không tìm thấy hoặc không thuộc về người dùng này
                alert('Lỗi: Không tìm thấy tour cần thanh toán hoặc tour không thuộc về tài khoản của bạn.');
                window.location.href = 'tour-dachon.html';
                return;
            }
        }

        if (tourData.id) {
            totalPrice = tourData.price * tourData.quantity;
            displayTourData();
            attachFormListener();
        } else {
            displayError('Không tìm thấy thông tin tour cần thanh toán hoặc tour đã được xử lý.');
        }
    };

    // 2. Hiển thị dữ liệu lên DOM
    const displayTourData = () => {
        if (tourData.currentStatus === 'confirmed' || tourData.currentStatus === 'completed') {
            const statusMessage = tourData.currentStatus === 'completed' 
                ? 'đã được thanh toán và hoàn thành.' 
                : 'đã được thanh toán và xác nhận.';
            displayError(`Tour **${tourData.name}** ${statusMessage} Vui lòng kiểm tra trang <a href="tour-dachon.html">Quản lý Tour</a>.`, 'green', 'check-circle');
            return;
        }

        // HIỂN THỊ TÓM TẮT ĐƠN HÀNG
        document.getElementById('checkout-tour-name').textContent = tourData.name;
        document.getElementById('checkout-tour-date').textContent = new Date(tourData.date).toLocaleDateString('vi-VN');
        document.getElementById('checkout-tour-quantity').textContent = tourData.quantity;
        document.getElementById('checkout-tour-price-unit').textContent = formatCurrency(tourData.price);
        document.getElementById('checkout-total-price').textContent = formatCurrency(totalPrice);

        // HIỂN THỊ THÔNG TIN NGƯỜI ĐẶT
        document.getElementById('checkout-customer-name').textContent = tourData.fullName;
        document.getElementById('checkout-customer-phone').textContent = tourData.phone;
        document.getElementById('checkout-customer-email').textContent = tourData.email;

        // ĐIỀN TỰ ĐỘNG VÀO FORM
        document.getElementById('full-name').value = tourData.fullName !== 'N/A' ? tourData.fullName : '';
        document.getElementById('email').value = tourData.email !== 'N/A' ? tourData.email : '';
        document.getElementById('phone').value = tourData.phone !== 'N/A' ? tourData.phone : '';

        // ĐIỀN DỮ LIỆU HIDDEN INPUTS
        document.getElementById('tour_id_input').value = tourData.tourId; // Lưu ID sản phẩm tour gốc
        document.getElementById('total_amount_input').value = totalPrice;
        document.getElementById('departure_date_input').value = tourData.date;
        // 🔥 Cập nhật: Lưu EMAIL làm Customer ID/User ID
        document.getElementById('customer_id_input').value = currentEmail;
    };

    const displayError = (message, color = 'red', icon = 'exclamation-triangle') => {
        const container = document.getElementById('checkout-container');
        if (container) {
            container.innerHTML = `
                <h1>Trang Thanh Toán Đặt Tour</h1>
                <p class="message" style="color: ${color}; font-size: 1.2em; text-align: center; padding: 50px;">
                    <i class="fas fa-${icon}"></i> ${message}
                </p>
            `;
        }
    };

    // 3. Xử lý sự kiện Submit Form
    const attachFormListener = () => {
        document.getElementById('checkout-form').addEventListener('submit', function(e) {
            e.preventDefault();

            // Giả lập thanh toán thành công
            const selectedPaymentMethod = document.querySelector('input[name="payment_method"]:checked');
            if (!selectedPaymentMethod) {
                alert('Vui lòng chọn phương thức thanh toán.');
                return;
            }

            if (!confirm(`Xác nhận thanh toán ${formatCurrency(totalPrice)}?`)) {
                return;
            }

            let allTours = JSON.parse(localStorage.getItem('selectedTours')) || [];
            let updateSuccess = false;

            if (isRebook && rebookBookingId) {
                // --- LOGIC ĐẶT LẠI (REBOOK) ---

                // a. 🔥 Xóa tour cũ (đã hủy) dựa trên rebookBookingId và currentEmail
                allTours = allTours.filter(t => t.id !== rebookBookingId || t.email !== currentEmail);

                // b. Tạo ID mới cho booking mới (đặt lại)
                const newBookingId = 'BOOK-' + Date.now().toString(36).toUpperCase();

                // c. Tạo bản ghi booking mới
                const newBooking = {
                    id: newBookingId,
                    tourId: tourData.tourId, // ID sản phẩm tour gốc
                    name: tourData.name,
                    date: tourData.date,
                    quantity: tourData.quantity,
                    price: tourData.price,
                    // ✅ CẬP NHẬT: Tour đặt lại sẽ chuyển sang trạng thái đã HOÀN THÀNH
                    status: 'completed', 
                    // 🔥 Lưu EMAIL làm ID người dùng
                    email: currentEmail,
                    bookedAt: new Date().toISOString(),
                    bookingDetails: {
                        fullName: document.getElementById('full-name').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        paymentMethod: selectedPaymentMethod.value
                    }
                };

                allTours.push(newBooking);
                alert(`Đặt lại Tour và Thanh toán thành công! Mã booking mới của bạn là: ${newBookingId}. Tour đã chuyển sang mục hoàn thành.`);
                updateSuccess = true;

            } else {
                // --- LOGIC THANH TOÁN LẦN ĐẦU (Pending -> Completed) ---
                // Chỉ cần tìm tour theo ID booking và cập nhật trạng thái
                const bookingIndex = allTours.findIndex(t => t.id === tourIdFromUrl && t.email === currentEmail);

                if (bookingIndex !== -1) {
                    // ✅ CẬP NHẬT: Tour thanh toán lần đầu sẽ chuyển sang trạng thái đã HOÀN THÀNH
                    allTours[bookingIndex].status = 'completed'; 
                    // Cần đảm bảo tour đang được cập nhật có trường EMAIL
                    allTours[bookingIndex].email = currentEmail;
                    allTours[bookingIndex].bookingDetails = {
                        fullName: document.getElementById('full-name').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        paymentMethod: selectedPaymentMethod.value
                    };
                    alert('Thanh toán thành công! Tour của bạn đã được xác nhận và chuyển sang mục đã hoàn thành.');
                    updateSuccess = true;
                }
            }

            // 4. Lưu lại Local Storage và chuyển hướng
            if (updateSuccess) {
                localStorage.setItem('selectedTours', JSON.stringify(allTours));
                window.location.href = 'tour-dachon.html'; // Quay lại trang quản lý tour
            } else {
                alert('Lỗi xử lý đơn hàng. Vui lòng thử lại.');
            }
        });
    };

    // Khởi tạo
    loadTourData();
});