
        // =====================================================
        //  NỔI BẬT: quản trị viên thống kê và tích học sinh để hiện ở trang chủ
        // =====================================================
        function thongKeHocSinh(email) {
            const ds = ketQua.filter(function (k) { return k.email === email; });
            if (ds.length === 0) { return { so: 0, tb: 0 }; }
            const tong = ds.reduce(function (t, k) { return t + (Number(k.diem) || 0); }, 0);
            return { so: ds.length, tb: Math.round(tong / ds.length * 10) / 10 };
        }

        // Hiện các học sinh được tích "nổi bật" ở trang chủ
        function renderNoiBat() {
            const box = document.getElementById('noi-bat');
            if (!box) { return; }
            const ds = danhSach.filter(function (u) { return u.vaiTro === 'hocsinh' && u.noiBat === true; });
            if (ds.length === 0) {
                box.innerHTML = '<p class="empty-row" style="width:100%">Chưa có bạn nổi bật. Quản trị viên sẽ tích chọn trong mục ⭐ Nổi bật.</p>';
                return;
            }
            box.innerHTML = ds.map(function (u, i) {
                const tk = thongKeHocSinh(u.email);
                return '<div class="teacher nb-card">' +
                    '<span class="nb-rank">#' + (i + 1) + '</span>' +
                    '<span class="nb-ava">' + thoat((u.ten || '?').trim().charAt(0).toUpperCase()) + '</span>' +
                    '<span class="nb-ten">' + thoat(u.ten) + '</span>' +
                    '<span class="nb-diem">' + (tk.so ? 'TB ' + tk.tb + ' · ' + tk.so + ' bài' : (u.lop ? 'Lớp ' + thoat(u.lop) : 'Học sinh')) + '</span></div>';
            }).join('');
        }

        // Tab quản trị: thống kê và tích nổi bật
        (function themTabNoiBat() {
            const tabs = document.querySelector('.ad-tabs');
            const trang = document.querySelector('.admin-page');
            if (!tabs || !trang) { return; }
            const nut = document.createElement('button');
            nut.className = 'ad-tab';
            nut.dataset.ad = 'nb';
            nut.textContent = '⭐ Nổi bật';
            tabs.insertBefore(nut, tabs.querySelector('button[data-ad="dl"]'));
            const khung = document.createElement('div');
            khung.className = 'ad-pane';
            khung.id = 'ad-nb';
            khung.innerHTML =
                '<div class="toolbar"><input class="grow" id="nb-tim" placeholder="🔍 Tìm học sinh theo tên, email, lớp"></div>' +
                '<p class="tbl-foot">Tích vào học sinh để hiện ở mục "Các bạn đăng ký nổi bật" trên trang chủ. Bảng bên dưới thống kê số bài và điểm trung bình để bạn chọn.</p>' +
                '<div class="table-wrap"><table class="tbl"><thead><tr><th style="width:90px">Nổi bật</th><th>Họ và tên</th><th>Email</th><th>Lớp</th><th>Số bài</th><th>Điểm TB</th></tr></thead><tbody id="nb-body"></tbody></table></div>';
            trang.appendChild(khung);
            nut.addEventListener('click', function () {
                document.querySelectorAll('.ad-tab').forEach(function (n) { n.classList.remove('active'); });
                document.querySelectorAll('.ad-pane').forEach(function (p) { p.classList.remove('active'); });
                nut.classList.add('active');
                khung.classList.add('active');
                veNoiBatQT();
            });
            document.getElementById('nb-tim').addEventListener('input', veNoiBatQT);
            document.getElementById('nb-body').addEventListener('change', function (e) {
                const o = e.target;
                if (!o.matches('input[type=checkbox][data-email]')) { return; }
                const tk = timTaiKhoan(o.dataset.email);
                if (!tk) { return; }
                tk.noiBat = o.checked;
                luuTaiKhoan();
                veNoiBatQT();
                renderNoiBat();
                hienToast(o.checked ? 'Đã đưa ' + tk.ten + ' vào mục nổi bật' : 'Đã bỏ ' + tk.ten + ' khỏi mục nổi bật');
            });
        })();

        function veNoiBatQT() {
            const bang = document.getElementById('nb-body');
            if (!bang) { return; }
            const k = (document.getElementById('nb-tim').value || '').trim().toLowerCase();
            const hs = danhSach.filter(function (u) {
                if (u.vaiTro !== 'hocsinh') { return false; }
                if (k === '') { return true; }
                return (u.ten + ' ' + u.email + ' ' + (u.lop || '')).toLowerCase().indexOf(k) !== -1;
            });
            if (hs.length === 0) { bang.innerHTML = '<tr><td colspan="6" class="empty-row">Không có học sinh phù hợp.</td></tr>'; return; }
            bang.innerHTML = hs.map(function (u) {
                const tk = thongKeHocSinh(u.email);
                return '<tr><td style="text-align:center"><input type="checkbox" data-email="' + thoat(u.email) + '"' +
                       (u.noiBat === true ? ' checked' : '') + ' style="width:18px;height:18px;cursor:pointer"></td>' +
                       '<td><b>' + thoat(u.ten) + '</b></td><td>' + thoat(u.email) + '</td><td>' + thoat(u.lop || '-') + '</td>' +
                       '<td>' + tk.so + '</td><td>' + (tk.so ? tk.tb : '-') + '</td></tr>';
            }).join('');
        }

        // Khi mở trang chủ hoặc quản trị làm mới: vẽ lại
        const veQuanTriTruocNB = veQuanTri;
        veQuanTri = function () { veQuanTriTruocNB(); veNoiBatQT(); };
    