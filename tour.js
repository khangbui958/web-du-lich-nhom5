document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // I. KHỞI TẠO CÁC BIẾN VÀ HÀM HỖ TRỢ
    // =========================================================================

    // Phần tử UI LỌC TOUR
    const searchInput = document.querySelector('.search-bar input[type="text"]');
    const destinationSelect = document.querySelector('select[name="destination"]');
    const durationSelect = document.querySelector('select[name="duration"]'); 
    const priceSelect = document.querySelector('select[name="price"]');
    
    const filterButton = document.querySelector('.btn-filter');
    const tourCardsGrid = document.querySelector('.tour-cards-grid');
    
    // Lấy tất cả tour cards
    const tourCards = tourCardsGrid ? tourCardsGrid.querySelectorAll('.tour-card') : [];
    const tourCountTitle = document.getElementById('tour-count-title');
    
    if (tourCards.length === 0) {
        console.warn("Không tìm thấy thẻ tour nào để lọc.");
    }

    /**
     * Chuyển đổi chuỗi sang dạng không dấu, viết thường và loại bỏ khoảng trắng thừa.
     * @param {string} text - Chuỗi cần chuẩn hóa.
     * @returns {string} Chuỗi đã chuẩn hóa.
     */
    const normalizeText = (text) => {
        if (!text) return '';
        return text.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    // =========================================================================
    // II. LOGIC LỌC TOUR (FILTER LOGIC)
    // =========================================================================

    /**
     * Hàm lọc chính: Lọc các tour dựa trên các tiêu chí tìm kiếm và dropdown.
     */
    const filterTours = () => {
        const searchText = normalizeText(searchInput.value);
        
        const selectedDestination = normalizeText(destinationSelect.value); // Chuẩn hóa luôn
        const selectedDuration = durationSelect.value;
        const selectedPrice = priceSelect.value;
        
        let visibleCount = 0;

        tourCards.forEach(card => {
            const titleElement = card.querySelector('h3');
            
            if (!titleElement) {
                card.style.display = 'none'; 
                return; 
            }

            // LẤY DỮ LIỆU TỪ data-* ATTRIBUTES (Tối ưu hóa và nhất quán)
            const title = normalizeText(titleElement.textContent);
            const cardLocation = normalizeText(card.dataset.location || ''); // Sử dụng data-location
            const cardDuration = card.dataset.duration || ''; 
            const cardPriceRange = card.dataset.priceRange || '';
            
            let isVisible = true;

            // --- Lọc 1: Theo từ khóa tìm kiếm (Tiêu đề HOẶC Địa điểm) ---
            if (searchText && !title.includes(searchText) && !cardLocation.includes(searchText)) {
                isVisible = false;
            }

            // --- Lọc 2: Theo Địa điểm (Dropdown - Dựa trên data-location) ---
            if (isVisible && selectedDestination) {
                // Kiểm tra nếu địa điểm của tour (cardLocation) có chứa giá trị đã chọn
                if (!cardLocation.includes(selectedDestination)) { 
                    isVisible = false;
                }
            }
            
            // --- Lọc 3: Theo Thời gian (Dropdown - Dựa trên data-duration) ---
            if (isVisible && selectedDuration) {
                if (cardDuration !== selectedDuration) {
                    isVisible = false;
                }
            }

            // --- Lọc 4: Theo Mức giá (Dropdown - Dựa trên data-price-range) ---
            if (isVisible && selectedPrice) {
                if (cardPriceRange !== selectedPrice) {
                    isVisible = false;
                }
            }

            // Hiển thị hoặc ẩn card
            card.style.display = isVisible ? 'block' : 'none';
            if (isVisible) {
                visibleCount++;
            }
        });

        // Cập nhật tiêu đề hiển thị số lượng tour
        if (tourCountTitle) {
            tourCountTitle.innerHTML = `✨ Khám phá **${visibleCount}** tour du lịch hấp dẫn nhất`;
        }
    };

    // [III. LOGIC ĐẶT TOUR và IV. KHỞI CHẠY KHÔNG THAY ĐỔI]
    
    /**
     * Gắn các sự kiện lắng nghe cho các bộ lọc.
     */
    const setupFilterListeners = () => {
        filterButton.addEventListener('click', (e) => {
            e.preventDefault(); 
            filterTours();
        });

        searchInput.addEventListener('input', filterTours);
        destinationSelect.addEventListener('change', filterTours);
        durationSelect.addEventListener('change', filterTours);
        priceSelect.addEventListener('change', filterTours);
    };

    /**
     * Xử lý sự kiện khi click nút "Đặt ngay".
     */
    function setupBookingAction() {
        const bookButtons = document.querySelectorAll('.btn-book');

        bookButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Kiểm tra trạng thái đăng nhập
                if (typeof window.checkLoginStatus === 'function' && window.checkLoginStatus()) { 
                    const tourId = this.dataset.tourId;
                    alert(`Đang chuyển đến trang đặt tour cho ID: ${tourId}`);
                    // window.location.href = `booking.html?tourId=${tourId}`; // Mở lại khi cần
                } else {
                    alert('Vui lòng đăng nhập để đặt tour.');
                    window.location.href = 'login.html';
                }
            });
        });
    }

    // =========================================================================
    // IV. KHỞI CHẠY TẤT CẢ CÁC CHỨC NĂNG
    // =========================================================================

    setupBookingAction();
    setupFilterListeners();
    filterTours(); // Chạy lọc ban đầu để hiển thị đúng số lượng tour và áp dụng bộ lọc ban đầu
});