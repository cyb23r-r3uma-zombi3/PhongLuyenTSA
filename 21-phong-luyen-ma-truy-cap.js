
        // =====================================================
        //  PHÒNG LUYỆN ĐỀ: CẦN MÃ TRUY CẬP HOẶC ĐÃ MUA KHÓA HỌC
        //  Khảo thí (thi theo ca) không bị chặn ở đây.
        // =====================================================
        const KHO_MA = 'skyedu-ma-truy-cap';
        let maTruyCap = [];        // danh sách mã do quản trị tạo: {ma, ghiChu, ngayTao}
        let nguonKhaoThi = false;  // đánh dấu lần bấm vào từ trang Khảo thí

        (function napMa() {
            const da = docKho('localStorage', KHO_MA);
            maTruyCap = Array.isArray(da) ? da : [];
        })();
        function luuMa() { ghiKho('localStorage', KHO_MA, maTruyCap); }
        function maHopLe(ma) {
            const k = String(ma || '').trim().toUpperCase();
            return maTruyCap.some(function (m) { return m.ma.toUpperCase() === k; });
        }

        // Học sinh đã mở khóa phòng luyện chưa?
        function duocLuyenDe(email) {
            if (!email) { return false; }
            // Đọc lại danh sách mới nhất: quyền vừa được cấp ở tab khác vẫn có hiệu lực ngay
            const kho = docKho('localStorage', KHO_TK);
            if (Array.isArray(kho)) { danhSach = kho; }
            const tk = timTaiKhoan(email);
            if (tk && tk.vaiTro === 'admin') { return true; }
            if (tk && tk.daMuaKhoa === true) { return true; }                    // quản trị đã tích: học sinh đã đóng tiền khóa học
            const khoMa = docKho('localStorage', KHO_MA);
            if (Array.isArray(khoMa)) { maTruyCap = khoMa; }
            return !!tk && Array.isArray(tk.maDaNhap) && tk.maDaNhap.some(maHopLe);   // đã nhập mã admin cấp, mã còn hiệu lực
        }

        // Bấm vào thẻ ca trên trang Khảo thí thì đánh dấu là thi theo ca
        document.getElementById('ex-grid').addEventListener('click', function (e) {
            if (e.target.closest('button[data-vao]')) { nguonKhaoThi = true; }
        }, true);

        // Chặn bắt đầu làm bài trong phòng luyện nếu chưa mở khóa
        const batDauLamBaiGoc = batDauLamBai;
        batDauLamBai = function (id) {
            const laKhaoThi = nguonKhaoThi;
            nguonKhaoThi = false;
            if (!laKhaoThi && nguoiDung && !duocLuyenDe(nguoiDung.email)) {
                hienToast('Mục này dành cho học sinh trong khóa. Nhập mã truy cập (nút Mã truy cập) hoặc đăng ký khảo thí thi thử.');
                return;
            }
            if (!laKhaoThi && !duocLuyenDe(nguoiDung && nguoiDung.email)) {
                hienToast('Phòng luyện đề cần mã truy cập hoặc đã đóng tiền khóa học.');
                moMoKhoaLuyen();
                return;
            }
            return batDauLamBaiGoc(id);
        };

        // Hộp nhập mã truy cập (dùng chung cho nút Mã truy cập và khi bị chặn)
        function moMoKhoaLuyen() {
            moDialog(
                '<h3>Mở khóa phòng luyện đề</h3>' +
                '<p class="modal-sub">Nhập mã truy cập do trung tâm cấp. Nhập đúng mã, bạn sẽ được cấp quyền vào mục Học sinh trong khóa.</p>' +
                '<input class="code-input" id="kl-ma" placeholder="Nhập mã truy cập, ví dụ: SKY-ABC123">' +
                '<div class="form-error" id="kl-loi"></div>' +
                '<div class="dialog-actions"><button class="btn-sec" id="kl-khoa">Xem khóa học</button>' +
                '<button class="btn-link" id="kl-ok">Xác nhận</button></div>'
            );
            document.getElementById('kl-ma').focus();
            document.getElementById('kl-khoa').addEventListener('click', function () { dongDialog(); showPage('courses'); });
            const xacNhan = function () {
                const ma = document.getElementById('kl-ma').value.trim();
                const loi = document.getElementById('kl-loi');
                if (ma === '') { baoLoi(loi, 'Vui lòng nhập mã truy cập.'); return; }
                if (!nguoiDung) { showPage('login'); return; }
                if (!maHopLe(ma)) { baoLoi(loi, 'Mã không hợp lệ hoặc đã bị thu hồi.'); return; }
                const tk = timTaiKhoan(nguoiDung.email);
                if (!tk) { return; }
                if (!Array.isArray(tk.maDaNhap)) { tk.maDaNhap = []; }
                const k = ma.toUpperCase();
                if (tk.maDaNhap.indexOf(k) === -1) { tk.maDaNhap.push(k); }
                tk.daMuaKhoa = true;                                   // nhập đúng mã là được cấp quyền luôn
                luuTaiKhoan();
                if (typeof veTichKhoa === 'function') { veTichKhoa(); }
                dongDialog();
                hienToast('Đã mở khóa phòng luyện đề ✔');
            };
            document.getElementById('kl-ok').addEventListener('click', xacNhan);
            document.getElementById('kl-ma').addEventListener('keydown', function (e) { if (e.key === 'Enter') { xacNhan(); } });
        }

        // Nút "Mã truy cập" trên thanh menu và nút đỏ ở cột phải: mở hộp nhập mã
        document.getElementById('nav-access').addEventListener('click', moMoKhoaLuyen);
        document.querySelector('.btn-row .btn').addEventListener('click', moMoKhoaLuyen);

        // ----- Quản trị: tab Mã truy cập -----
        (function themTabMa() {
            const tabs = document.querySelector('.ad-tabs');
            const trang = document.querySelector('.admin-page');
            if (!tabs || !trang) { return; }

            const nut = document.createElement('button');
            nut.className = 'ad-tab';
            nut.dataset.ad = 'ma';
            nut.textContent = '🔑 Mã truy cập';
            tabs.insertBefore(nut, tabs.querySelector('button[data-ad="dl"]'));

            const khung = document.createElement('div');
            khung.className = 'ad-pane';
            khung.id = 'ad-ma';
            khung.innerHTML =
                '<div class="toolbar">' +
                '<input class="grow" id="ma-moi" placeholder="Mã mới (để trống để hệ thống tự tạo)">' +
                '<input class="grow" id="ma-ghichu" placeholder="Ghi chú, ví dụ: Lớp 12A1 - đợt 1">' +
                '<button class="btn-link" id="ma-tao">+ Tạo mã</button></div>' +
                '<p class="tbl-foot">Học sinh nhập mã trong hộp "Mã truy cập" để mở phòng luyện đề. Thu hồi mã (xóa) thì học sinh đã nhập sẽ mất quyền.</p>' +
                '<div class="table-wrap"><table class="tbl"><thead><tr>' +
                '<th>Mã truy cập</th><th>Ghi chú</th><th>Ngày tạo</th><th>Học sinh đã nhập</th><th></th></tr></thead>' +
                '<tbody id="ma-body"></tbody></table></div>';
            trang.appendChild(khung);

            nut.addEventListener('click', function () {
                document.querySelectorAll('.ad-tab').forEach(function (n) { n.classList.remove('active'); });
                document.querySelectorAll('.ad-pane').forEach(function (p) { p.classList.remove('active'); });
                nut.classList.add('active');
                khung.classList.add('active');
                veMa();
            });

            function taoMaNgauNhien() {
                const ky = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                let s = 'SKY-';
                for (let i = 0; i < 6; i++) { s += ky.charAt(Math.floor(Math.random() * ky.length)); }
                return s;
            }
            document.getElementById('ma-tao').addEventListener('click', function () {
                let ma = document.getElementById('ma-moi').value.trim().toUpperCase();
                if (ma === '') { ma = taoMaNgauNhien(); }
                if (maHopLe(ma)) { hienToast('Mã này đã tồn tại.'); return; }
                maTruyCap.push({ ma: ma, ghiChu: document.getElementById('ma-ghichu').value.trim(), ngayTao: new Date().toISOString() });
                luuMa();
                document.getElementById('ma-moi').value = '';
                document.getElementById('ma-ghichu').value = '';
                veMa();
                hienToast('Đã tạo mã ' + ma + ' ✔');
            });
            document.getElementById('ma-body').addEventListener('click', function (e) {
                const x = e.target.closest('button[data-ma-xoa]');
                if (!x) { return; }
                if (!confirm('Thu hồi mã ' + x.dataset.maXoa + '? Học sinh đã nhập mã sẽ mất quyền luyện đề.')) { return; }
                maTruyCap = maTruyCap.filter(function (m) { return m.ma !== x.dataset.maXoa; });
                luuMa();
                veMa();
                hienToast('Đã thu hồi mã.');
            });
        })();

        function veMa() {
            const bang = document.getElementById('ma-body');
            if (!bang) { return; }
            if (maTruyCap.length === 0) {
                bang.innerHTML = '<tr><td colspan="5" class="empty-row">Chưa có mã nào. Bấm "+ Tạo mã" để tạo.</td></tr>';
                return;
            }
            bang.innerHTML = maTruyCap.map(function (m) {
                const dem = danhSach.filter(function (u) {
                    return Array.isArray(u.maDaNhap) && u.maDaNhap.indexOf(m.ma.toUpperCase()) !== -1;
                }).length;
                return '<tr><td><b>' + thoat(m.ma) + '</b></td><td>' + thoat(m.ghiChu || '-') + '</td>' +
                       '<td>' + ngayGio(m.ngayTao) + '</td><td>' + dem + '</td>' +
                       '<td><button class="icon-btn" data-ma-xoa="' + thoat(m.ma) + '" title="Thu hồi">🗑</button></td></tr>';
            }).join('');
        }
    