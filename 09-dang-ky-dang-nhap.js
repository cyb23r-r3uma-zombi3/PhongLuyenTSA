
        // ===== Đăng ký / Đăng nhập (giả lập, lưu trong trình duyệt) =====
        const KHO_TK = 'skyedu-tai-khoan';    // danh sách tài khoản đã đăng ký
        const KHO_PHIEN = 'skyedu-phien';     // người đang đăng nhập

        // Các hàm đọc / ghi / xóa. loai là 'localStorage' hoặc 'sessionStorage'
        function docKho(loai, khoa) {
            try { return JSON.parse(window[loai].getItem(khoa)); } catch (e) { return null; }
        }
        function ghiKho(loai, khoa, giaTri) {
            try { window[loai].setItem(khoa, JSON.stringify(giaTri)); } catch (e) {}
        }
        function xoaKho(loai, khoa) {
            try { window[loai].removeItem(khoa); } catch (e) {}
        }

        // Chống chèn mã HTML: đổi các ký tự đặc biệt thành dạng an toàn
        function thoat(chu) {
            return String(chu).replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }

        // Danh sách tài khoản, luôn có sẵn một tài khoản thử
        let danhSach = docKho('localStorage', KHO_TK) || [];
        if (!Array.isArray(danhSach)) { danhSach = []; }

        // Chuẩn hóa dữ liệu tài khoản và bảo đảm luôn có ít nhất một tài khoản quản trị
        function damBaoTaiKhoanMau() {
            const trong = danhSach.length === 0;
            danhSach = danhSach.filter(function (u) { return u && typeof u.email === 'string'; });
            danhSach.forEach(function (u) {
                if (!u.vaiTro) { u.vaiTro = 'hocsinh'; }
                if (u.lop === undefined) { u.lop = ''; }
                if (u.sdt === undefined) { u.sdt = ''; }
                if (u.ghiChu === undefined) { u.ghiChu = ''; }
                if (u.khoa === undefined) { u.khoa = false; }
                if (!u.ngayTao) { u.ngayTao = new Date().toISOString(); }
            });
            if (trong) {
                danhSach.push({ ten: 'Học viên thử', email: 'demo@skyedu.vn', matKhau: '123456', vaiTro: 'hocsinh',
                                lop: '12A1', sdt: '', ghiChu: '', khoa: false, ngayTao: new Date().toISOString() });
            }
            if (!danhSach.some(function (u) { return u.vaiTro === 'admin'; })) {
                danhSach.push({ ten: 'Quản trị viên', email: 'admin@skyedu.vn', matKhau: 'admin123', vaiTro: 'admin',
                                lop: '', sdt: '', ghiChu: '', khoa: false, ngayTao: new Date().toISOString() });
            }
            ghiKho('localStorage', KHO_TK, danhSach);
        }
        damBaoTaiKhoanMau();

        // Người đang đăng nhập (null nghĩa là chưa đăng nhập)
        let nguoiDung = docKho('localStorage', KHO_PHIEN) || docKho('sessionStorage', KHO_PHIEN);

        // Người đang đăng nhập có phải quản trị viên không?
        function laAdmin() {
            if (!nguoiDung) { return false; }
            const tk = danhSach.find(function (u) { return u.email === nguoiDung.email; });
            return !!tk && tk.vaiTro === 'admin';
        }

        // Cập nhật giao diện theo trạng thái đăng nhập
        function capNhatGiaoDien() {
            document.body.classList.toggle('logged-in', nguoiDung !== null);
            document.body.classList.toggle('is-admin', laAdmin());
            if (nguoiDung) {
                document.querySelector('.user-name').textContent = nguoiDung.ten;
                document.querySelector('.user-mail').textContent = nguoiDung.email;
            }
        }

        function dangXuat() {
            nguoiDung = null;
            xoaKho('localStorage', KHO_PHIEN);
            xoaKho('sessionStorage', KHO_PHIEN);
            capNhatGiaoDien();
            showPage('login');
        }

        // Hiện lỗi dưới form, kèm hiệu ứng lắc
        function baoLoi(o, noiDung) {
            o.textContent = noiDung;
            o.classList.remove('shake');
            void o.offsetWidth;          // buộc trình duyệt khởi động lại hiệu ứng
            if (noiDung !== '') { o.classList.add('shake'); }
        }

        // --- Nút con mắt: hiện / ẩn mật khẩu ---
        document.querySelectorAll('.pw-toggle').forEach(function (nut) {
            nut.addEventListener('click', function () {
                const o = document.getElementById(nut.dataset.for);
                const dangAn = o.type === 'password';
                o.type = dangAn ? 'text' : 'password';
                nut.textContent = dangAn ? '🙈' : '👁';
            });
        });

        // --- Đăng nhập ---
        document.getElementById('form-login').addEventListener('submit', function (e) {
            e.preventDefault();                       // không tải lại trang
            const loi = document.getElementById('login-error');
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const matKhau = document.getElementById('login-pass').value;

            if (email === '' || matKhau === '') { baoLoi(loi, 'Vui lòng nhập đủ tài khoản và mật khẩu.'); return; }

            const tk = danhSach.find(function (u) { return u.email === email; });
            if (!tk) { baoLoi(loi, 'Tài khoản không tồn tại. Hãy đăng ký trước nhé.'); return; }
            if (tk.matKhau !== matKhau) { baoLoi(loi, 'Sai mật khẩu, bạn thử lại nhé.'); return; }
            if (tk.khoa) { baoLoi(loi, 'Tài khoản này đã bị khóa. Hãy liên hệ quản trị viên.'); return; }

            baoLoi(loi, '');
            nguoiDung = { ten: tk.ten, email: tk.email, vaiTro: tk.vaiTro };
            if (document.getElementById('login-remember').checked) {
                ghiKho('localStorage', KHO_PHIEN, nguoiDung);        // nhớ lâu dài
            } else {
                ghiKho('sessionStorage', KHO_PHIEN, nguoiDung);      // chỉ nhớ đến khi đóng tab
            }
            document.getElementById('login-pass').value = '';
            capNhatGiaoDien();
            showPage('home');
            hienToast('Xin chào, ' + tk.ten + '! 🎉');
        });

        // --- Đăng ký ---
        document.getElementById('form-register').addEventListener('submit', function (e) {
            e.preventDefault();
            const loi = document.getElementById('reg-error');
            const ten = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim().toLowerCase();
            const mk = document.getElementById('reg-pass').value;
            const mk2 = document.getElementById('reg-pass2').value;
            const dongY = document.getElementById('reg-terms').checked;

            const dungEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;   // dạng a@b.c

            if (ten === '')            { baoLoi(loi, 'Vui lòng nhập họ và tên.'); return; }
            if (!dungEmail.test(email)) { baoLoi(loi, 'Email chưa đúng định dạng.'); return; }
            if (mk.length < 6)         { baoLoi(loi, 'Mật khẩu cần ít nhất 6 ký tự.'); return; }
            if (mk !== mk2)            { baoLoi(loi, 'Hai mật khẩu chưa giống nhau.'); return; }
            if (!dongY)                { baoLoi(loi, 'Bạn cần đồng ý với điều khoản sử dụng.'); return; }
            if (danhSach.some(function (u) { return u.email === email; })) {
                baoLoi(loi, 'Email này đã được đăng ký.'); return;
            }

            baoLoi(loi, '');
            danhSach.push({ ten: ten, email: email, matKhau: mk, vaiTro: 'hocsinh', lop: '', sdt: '', ghiChu: '',
                               khoa: false, ngayTao: new Date().toISOString() });
            ghiKho('localStorage', KHO_TK, danhSach);

            document.getElementById('form-register').reset();
            document.getElementById('login-email').value = email;    // điền sẵn cho lần đăng nhập
            showPage('login');
            hienToast('Tạo tài khoản thành công! Hãy đăng nhập nhé 🎉');
        });

        document.getElementById('forgot').addEventListener('click', function (e) {
            e.preventDefault();
            hienToast('Tính năng này cần máy chủ gửi email, bản demo chưa có.');
        });

        // --- Nút lên đầu trang ---
        const nutLen = document.getElementById('to-top');
        window.addEventListener('scroll', function () {
            nutLen.classList.toggle('show', window.scrollY > 250);
        });
        nutLen.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // (Phần khởi động nằm ở cuối script quản trị bên dưới)
    