
        // =====================================================
        //  QUẢN TRỊ: TÍCH HỌC SINH ĐÃ ĐÓNG TIỀN KHÓA HỌC
        // =====================================================
        (function themTabKhoaHoc() {
            const tabs = document.querySelector('.ad-tabs');
            const trang = document.querySelector('.admin-page');
            if (!tabs || !trang) { return; }

            const nut = document.createElement('button');
            nut.className = 'ad-tab';
            nut.dataset.ad = 'tk';
            nut.textContent = '🎓 Học sinh trong khóa';
            tabs.insertBefore(nut, tabs.querySelector('button[data-ad="dl"]'));

            const khung = document.createElement('div');
            khung.className = 'ad-pane';
            khung.id = 'ad-tk';
            khung.innerHTML =
                '<div class="toolbar">' +
                '<input class="grow" id="tk-tim" placeholder="🔍 Tìm học sinh theo tên, email, lớp">' +
                '<span class="tbl-foot" id="tk-dem"></span></div>' +
                '<p class="tbl-foot">Tích vào học sinh trong khóa. Học sinh được tích vào mục "Học sinh trong khóa" và làm được các đề luyện. Học sinh chưa tích chỉ đăng ký và làm khảo thí thi thử.</p>' +
                '<div class="table-wrap"><table class="tbl"><thead><tr>' +
                '<th style="width:70px">Được vào</th><th>Họ và tên</th><th>Email</th><th>Lớp</th><th>Trạng thái</th>' +
                '</tr></thead><tbody id="tk-body"></tbody></table></div>';
            trang.appendChild(khung);

            nut.addEventListener('click', function () {
                document.querySelectorAll('.ad-tab').forEach(function (n) { n.classList.remove('active'); });
                document.querySelectorAll('.ad-pane').forEach(function (p) { p.classList.remove('active'); });
                nut.classList.add('active');
                khung.classList.add('active');
                veTichKhoa();
            });

            document.getElementById('tk-tim').addEventListener('input', veTichKhoa);

            document.getElementById('tk-body').addEventListener('change', function (e) {
                const o = e.target;
                if (!o.matches('input[type=checkbox][data-email]')) { return; }
                const tk = timTaiKhoan(o.dataset.email);
                if (!tk) { return; }
                tk.daMuaKhoa = o.checked;
                luuTaiKhoan();
                veTichKhoa();
                hienToast(o.checked
                    ? 'Đã cấp quyền phòng luyện cho ' + tk.ten
                    : 'Đã thu quyền phòng luyện của ' + tk.ten);
            });
        })();

        function veTichKhoa() {
            const bang = document.getElementById('tk-body');
            if (!bang) { return; }
            const k = (document.getElementById('tk-tim').value || '').trim().toLowerCase();
            const hs = danhSach.filter(function (u) {
                if (u.vaiTro !== 'hocsinh') { return false; }
                if (k === '') { return true; }
                return (u.ten + ' ' + u.email + ' ' + (u.lop || '')).toLowerCase().indexOf(k) !== -1;
            });
            const soTich = danhSach.filter(function (u) { return u.vaiTro === 'hocsinh' && u.daMuaKhoa === true; }).length;
            document.getElementById('tk-dem').textContent = 'Đã tích: ' + soTich + ' / ' + danhSach.filter(function (u) { return u.vaiTro === 'hocsinh'; }).length + ' học sinh';

            if (hs.length === 0) {
                bang.innerHTML = '<tr><td colspan="5" class="empty-row">Không có học sinh phù hợp.</td></tr>';
                return;
            }
            bang.innerHTML = hs.map(function (u) {
                const tich = u.daMuaKhoa === true;
                return '<tr><td style="text-align:center"><input type="checkbox" data-email="' + thoat(u.email) + '"' + (tich ? ' checked' : '') + ' style="width:18px;height:18px;cursor:pointer"></td>' +
                       '<td><b>' + thoat(u.ten) + '</b></td><td>' + thoat(u.email) + '</td><td>' + thoat(u.lop || '-') + '</td>' +
                       '<td>' + (tich ? '<span class="tag tag-green">Được vào phòng luyện</span>' : '<span class="tag tag-gray">Chưa cấp quyền</span>') + '</td></tr>';
            }).join('');
        }
    