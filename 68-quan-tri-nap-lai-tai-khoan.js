
        // Quản trị: mỗi lần mở mục quản trị hoặc chuyển tab, nạp lại danh sách tài khoản mới nhất
        function napLaiTaiKhoanQT() {
            const kho = docKho('localStorage', KHO_TK);
            if (Array.isArray(kho)) { danhSach = kho; }
            if (typeof veQuanTri === 'function') { veQuanTri(); }
        }
        document.addEventListener('click', function (e) {
            if (e.target.closest('.admin-only, .ad-tab')) { setTimeout(napLaiTaiKhoanQT, 0); }
        }, true);
    