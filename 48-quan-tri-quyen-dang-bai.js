
        // Quản trị: cấp quyền đăng bài / bình luận / chia sẻ cho học sinh
        (function themTabQuyenDang() {
            const tabs = document.querySelector('.ad-tabs');
            const trang = document.querySelector('.admin-page');
            if (!tabs || !trang) { return; }
            const nut = document.createElement('button');
            nut.className = 'ad-tab';
            nut.dataset.ad = 'qd';
            nut.textContent = '✍️ Quyền đăng bài';
            tabs.insertBefore(nut, tabs.querySelector('button[data-ad="dl"]'));
            const khung = document.createElement('div');
            khung.className = 'ad-pane';
            khung.id = 'ad-qd';
            khung.innerHTML =
                '<div class="toolbar"><input class="grow" id="qd-tim" placeholder="🔍 Tìm học sinh theo tên, email, lớp"></div>' +
                '<p class="tbl-foot">Học sinh được tích sẽ đăng bài, bình luận và chia sẻ trong mục Cộng đồng. Học sinh chưa tích vẫn xem và thích bài được.</p>' +
                '<div class="table-wrap"><table class="tbl"><thead><tr><th style="width:90px">Được đăng</th><th>Họ và tên</th><th>Email</th><th>Lớp</th></tr></thead><tbody id="qd-body"></tbody></table></div>';
            trang.appendChild(khung);
            nut.addEventListener('click', function () {
                document.querySelectorAll('.ad-tab').forEach(function (n) { n.classList.remove('active'); });
                document.querySelectorAll('.ad-pane').forEach(function (p) { p.classList.remove('active'); });
                nut.classList.add('active');
                khung.classList.add('active');
                veQuyenDang();
            });
            document.getElementById('qd-tim').addEventListener('input', veQuyenDang);
            document.getElementById('qd-body').addEventListener('change', function (e) {
                const o = e.target;
                if (!o.matches('input[type=checkbox][data-email]')) { return; }
                const tk = timTaiKhoan(o.dataset.email);
                if (!tk) { return; }
                tk.quyenDang = o.checked;
                luuTaiKhoan();
                veQuyenDang();
                hienToast(o.checked ? 'Đã cấp quyền đăng bài cho ' + tk.ten : 'Đã thu quyền đăng bài của ' + tk.ten);
            });
        })();

        function veQuyenDang() {
            const bang = document.getElementById('qd-body');
            if (!bang) { return; }
            const k = (document.getElementById('qd-tim').value || '').trim().toLowerCase();
            const hs = danhSach.filter(function (u) {
                if (u.vaiTro !== 'hocsinh') { return false; }
                if (k === '') { return true; }
                return (u.ten + ' ' + u.email + ' ' + (u.lop || '')).toLowerCase().indexOf(k) !== -1;
            });
            if (hs.length === 0) { bang.innerHTML = '<tr><td colspan="4" class="empty-row">Không có học sinh phù hợp.</td></tr>'; return; }
            bang.innerHTML = hs.map(function (u) {
                return '<tr><td style="text-align:center"><input type="checkbox" data-email="' + thoat(u.email) + '"' +
                       (u.quyenDang === true ? ' checked' : '') + ' style="width:18px;height:18px;cursor:pointer"></td>' +
                       '<td><b>' + thoat(u.ten) + '</b></td><td>' + thoat(u.email) + '</td><td>' + thoat(u.lop || '-') + '</td></tr>';
            }).join('');
        }
    