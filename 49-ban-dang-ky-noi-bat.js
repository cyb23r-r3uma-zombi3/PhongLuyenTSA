
        // =====================================================
        //  CÁC BẠN ĐĂNG KÝ NỔI BẬT: xếp theo điểm trung bình các bài đã làm
        // =====================================================
        function xepHangHocSinh() {
            const gop = {};
            ketQua.forEach(function (k) {
                if (!gop[k.email]) { gop[k.email] = { ten: k.ten, email: k.email, tong: 0, so: 0 }; }
                gop[k.email].tong += Number(k.diem) || 0;
                gop[k.email].so += 1;
            });
            return Object.keys(gop).map(function (e) {
                const g = gop[e];
                const tk = timTaiKhoan(e);
                return { ten: tk ? tk.ten : g.ten, email: e, tb: Math.round(g.tong / g.so * 10) / 10, so: g.so };
            }).filter(function (x) {
                const tk = timTaiKhoan(x.email);
                return !tk || tk.vaiTro !== 'admin';
            }).sort(function (a, b) { return b.tb - a.tb || b.so - a.so; });
        }

        function renderNoiBat() {
            const box = document.getElementById('noi-bat');
            if (!box) { return; }
            const ds = xepHangHocSinh();
            const top = ds.slice(0, 5);
            if (top.length === 0) {
                box.innerHTML = '<p class="empty-row" style="width:100%">Chưa có bạn nổi bật. Hãy làm bài để xuất hiện ở đây.</p>';
                return;
            }
            box.innerHTML = top.map(function (x, i) {
                return '<div class="teacher nb-card">' +
                    '<span class="nb-rank">#' + (i + 1) + '</span>' +
                    '<span class="nb-ava">' + thoat((x.ten || '?').trim().charAt(0).toUpperCase()) + '</span>' +
                    '<span class="nb-ten">' + thoat(x.ten) + '</span>' +
                    '<span class="nb-diem">TB ' + x.tb + ' · ' + x.so + ' bài</span></div>';
            }).join('');
        }

        document.getElementById('noi-bat-xem').addEventListener('click', function () {
            const ds = xepHangHocSinh();
            let noi = '<h3>Bảng xếp hạng học sinh</h3><p class="modal-sub">Xếp theo điểm trung bình các bài đã làm.</p>';
            if (ds.length === 0) { noi += '<p class="empty-row">Chưa có dữ liệu.</p>'; }
            else {
                noi += '<div class="table-wrap"><table class="tbl"><thead><tr><th>Hạng</th><th>Họ và tên</th><th>Điểm TB</th><th>Số bài</th></tr></thead><tbody>' +
                    ds.map(function (x, i) {
                        return '<tr><td>' + (i + 1) + '</td><td>' + thoat(x.ten) + '</td><td>' + x.tb + '</td><td>' + x.so + '</td></tr>';
                    }).join('') + '</tbody></table></div>';
            }
            noi += '<div class="dialog-actions"><button class="btn-sec" id="xh-dong">Đóng</button></div>';
            moDialog(noi, true);
            document.getElementById('xh-dong').addEventListener('click', dongDialog);
        });

        // Cập nhật khi mở trang chủ hoặc sau khi có kết quả mới
        const showPageTruocNoiBat = showPage;
        showPage = function (name) {
            showPageTruocNoiBat(name);
            if (name === 'home') { renderNoiBat(); }
        };
        renderNoiBat();
    