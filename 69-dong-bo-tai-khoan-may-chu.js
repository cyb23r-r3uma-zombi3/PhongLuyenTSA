
        // =====================================================
        //  ĐỒNG BỘ TÀI KHOẢN QUA MÁY CHỦ
        //  Đặt địa chỉ máy chủ (ví dụ https://ten-may-chu.com). Để trống = chỉ lưu trên máy này.
        //  Học sinh đăng ký ở đâu, quản trị cũng thấy sau khi máy chủ nhận được tài khoản đó.
        // =====================================================
        const MAY_CHU_TAI_KHOAN = 'https://skyedu-may-chuu-production.up.railway.app';   // ví dụ: 'https://ten-may-chu.com' (để trống = chỉ lưu trên máy này)
        const KHOA_ANH_CHUP_DONG_BO = 'skyedu-anh-chup-dong-bo';
        let anhChup = (function () {
            try { return new Map(JSON.parse(localStorage.getItem(KHOA_ANH_CHUP_DONG_BO) || '[]')); } catch (e) { return new Map(); }
        })();
        let dangKeoVe = false;      // đang nhận dữ liệu từ máy chủ: không đẩy ngược lên
        let hangDayCho = null;

        function mayChuBat() { return !!MAY_CHU_TAI_KHOAN; }
        function luuAnhChup() {
            try { localStorage.setItem(KHOA_ANH_CHUP_DONG_BO, JSON.stringify(Array.from(anhChup.entries()))); } catch (e) {}
        }
        function chuoiMot(u) { return JSON.stringify(u); }

        // Gửi các thay đổi của máy này lên máy chủ
        async function dayLenMayChu() {
            if (!mayChuBat() || dangKeoVe) { return; }
            const hienTai = new Map(danhSach.map(function (u) { return [u.email, chuoiMot(u)]; }));
            const viec = [];
            hienTai.forEach(function (chuoi, email) {
                if (anhChup.get(email) !== chuoi) {
                    const u = danhSach.find(function (x) { return x.email === email; });
                    viec.push(fetch(MAY_CHU_TAI_KHOAN + '/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(u) }));
                }
            });
            anhChup.forEach(function (chuoi, email) {
                if (!hienTai.has(email)) { viec.push(fetch(MAY_CHU_TAI_KHOAN + '/api/users/' + encodeURIComponent(email), { method: 'DELETE' })); }
            });
            try {
                await Promise.all(viec);
                anhChup = hienTai;
                luuAnhChup();
            } catch (e) { /* mất mạng: lần sau sẽ đẩy lại */ }
        }

        // Nhận danh sách mới nhất từ máy chủ
        async function keoVeTuMayChu() {
            if (!mayChuBat()) { return false; }
            let ds;
            try {
                const r = await fetch(MAY_CHU_TAI_KHOAN + '/api/users');
                if (!r.ok) { return false; }
                ds = await r.json();
            } catch (e) { return false; }

            const choServer = new Map(ds.map(function (u) { return [u.email, u]; }));
            let doi = false;
            dangKeoVe = true;
            try {
                // Tài khoản trên máy chủ: thêm mới hoặc cập nhật nếu máy này chưa sửa
                choServer.forEach(function (u, email) {
                    const local = danhSach.find(function (x) { return x.email === email; });
                    const chuoiServer = chuoiMot(u);
                    if (!local) { danhSach.push(u); doi = true; anhChup.set(email, chuoiServer); return; }
                    const dangLocal = chuoiMot(local);
                    if (dangLocal !== anhChup.get(email) && anhChup.has(email)) { return; }   // máy này đang sửa dở: giữ bản của máy này
                    if (dangLocal !== chuoiServer) {
                        Object.keys(local).forEach(function (k) { delete local[k]; });
                        Object.assign(local, u);
                        doi = true;
                    }
                    anhChup.set(email, chuoiServer);
                });
                // Tài khoản đã bị xóa trên máy chủ
                Array.from(anhChup.keys()).forEach(function (email) {
                    if (!choServer.has(email)) {
                        const i = danhSach.findIndex(function (x) { return x.email === email; });
                        // Không bao giờ xóa tài khoản quản trị trên máy này
                        if (i >= 0 && danhSach[i].vaiTro !== 'admin') { danhSach.splice(i, 1); doi = true; }
                        anhChup.delete(email);
                    }
                });
                if (doi) { ghiKho('localStorage', KHO_TK, danhSach); }
                luuAnhChup();
            } finally { dangKeoVe = false; }
            return doi;
        }

        // Mỗi lần lưu tài khoản trên máy này thì đẩy lên máy chủ (gộp các lần sát nhau)
        const ghiKhoTaiKhoan = ghiKho;
        ghiKho = function (loai, khoa, gia) {
            ghiKhoTaiKhoan(loai, khoa, gia);
            if (khoa === KHO_TK && mayChuBat() && !dangKeoVe) {
                clearTimeout(hangDayCho);
                hangDayCho = setTimeout(dayLenMayChu, 300);
            }
        };

        // Trước khi đăng nhập hoặc đăng ký: lấy danh sách mới nhất để không thiếu tài khoản
        function chayTruocKhi(nut, sau) {
            let daXong = false;
            nut.addEventListener('click', function (e) {
                if (daXong || !mayChuBat()) { return; }
                e.stopImmediatePropagation();
                e.preventDefault();
                keoVeTuMayChu().then(function () {
                    daXong = true;
                    nut.click();
                    setTimeout(function () { daXong = false; }, 0);
                });
            }, true);
        }
        const nutDangNhap = document.querySelector('#form-login .auth-submit');
        if (nutDangNhap) { chayTruocKhi(nutDangNhap); }
        const nutDangKy = document.querySelector('#form-register button[type="submit"], #form-register .auth-submit');
        if (nutDangKy) { chayTruocKhi(nutDangKy); }

        // Mở trang: kéo dữ liệu mới nhất; nếu có thay đổi thì làm mới giao diện quản trị
        window.addEventListener('load', async function () {
            if (!mayChuBat()) { return; }
            const doi = await keoVeTuMayChu();
            if (doi && typeof veQuanTri === 'function') { try { veQuanTri(); } catch (e) {} }
        });

        // Mở mục quản trị: kéo lại để thấy học sinh mới đăng ký ở nơi khác
        document.addEventListener('click', async function (e) {
            if (!e.target.closest('.admin-only, .ad-tab') || !mayChuBat()) { return; }
            const doi = await keoVeTuMayChu();
            if (doi && typeof veQuanTri === 'function') { try { veQuanTri(); } catch (e2) {} }
        }, true);
    