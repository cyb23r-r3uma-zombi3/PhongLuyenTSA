
        // =====================================================
        //  ẢNH ĐẠI DIỆN HỌC SINH trong mục Nổi bật
        // =====================================================
        function thuNhoAnhDaiDien(file) {
            return new Promise(function (resolve, reject) {
                const doc = new FileReader();
                doc.onerror = reject;
                doc.onload = function () {
                    const im = new Image();
                    im.onerror = reject;
                    im.onload = function () {
                        const c = document.createElement('canvas');
                        const canh = Math.min(im.width, im.height);
                        c.width = 256; c.height = 256;
                        const x = (im.width - canh) / 2, y = (im.height - canh) / 2;
                        c.getContext('2d').drawImage(im, x, y, canh, canh, 0, 0, 256, 256);
                        resolve(c.toDataURL('image/jpeg', 0.85));
                    };
                    im.src = doc.result;
                };
                doc.readAsDataURL(file);
            });
        }

        // Thẻ nổi bật: ảnh đại diện nằm giữa, tên và thống kê bên dưới
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
                const nen = u.anh ? 'background-image:url(\'' + u.anh + '\')' : '';
                return '<div class="teacher nb-card">' +
                    '<span class="nb-rank">#' + (i + 1) + '</span>' +
                    '<span class="nb-ava' + (u.anh ? ' co-anh' : '') + '" style="' + nen + '">' +
                        (u.anh ? '' : thoat((u.ten || '?').trim().charAt(0).toUpperCase())) + '</span>' +
                    '<span class="nb-ten">' + thoat(u.ten) + '</span>' +
                    '<span class="nb-diem">' + (tk.so ? 'TB ' + tk.tb + ' · ' + tk.so + ' bài' : (u.lop ? 'Lớp ' + thoat(u.lop) : 'Học sinh')) + '</span></div>';
            }).join('');
        }

        // Bảng quản trị: thêm cột ảnh đại diện
        function veNoiBatQT() {
            const bang = document.getElementById('nb-body');
            if (!bang) { return; }
            const k = (document.getElementById('nb-tim').value || '').trim().toLowerCase();
            const hs = danhSach.filter(function (u) {
                if (u.vaiTro !== 'hocsinh') { return false; }
                if (k === '') { return true; }
                return (u.ten + ' ' + u.email + ' ' + (u.lop || '')).toLowerCase().indexOf(k) !== -1;
            });
            if (hs.length === 0) { bang.innerHTML = '<tr><td colspan="7" class="empty-row">Không có học sinh phù hợp.</td></tr>'; return; }
            bang.innerHTML = hs.map(function (u) {
                const tk = thongKeHocSinh(u.email);
                return '<tr><td style="text-align:center"><input type="checkbox" data-email="' + thoat(u.email) + '"' +
                       (u.noiBat === true ? ' checked' : '') + ' style="width:18px;height:18px;cursor:pointer"></td>' +
                       '<td><span class="nb-mini' + (u.anh ? ' co-anh' : '') + '" style="' + (u.anh ? 'background-image:url(\'' + u.anh + '\')' : '') + '">' +
                       (u.anh ? '' : thoat((u.ten || '?').trim().charAt(0).toUpperCase())) + '</span>' +
                       '<br><input type="file" accept="image/*" data-anh="' + thoat(u.email) + '" style="font-size:12px;max-width:150px"></td>' +
                       '<td><b>' + thoat(u.ten) + '</b></td><td>' + thoat(u.email) + '</td><td>' + thoat(u.lop || '-') + '</td>' +
                       '<td>' + tk.so + '</td><td>' + (tk.so ? tk.tb : '-') + '</td></tr>';
            }).join('');
        }

        // Tiêu đề bảng có thêm cột ảnh
        (function () {
            const dau = document.querySelector('#ad-nb thead tr');
            if (dau) { dau.innerHTML = '<th style="width:90px">Nổi bật</th><th>Ảnh đại diện</th><th>Họ và tên</th><th>Email</th><th>Lớp</th><th>Số bài</th><th>Điểm TB</th>'; }
            const bang = document.getElementById('nb-body');
            bang.addEventListener('change', async function (e) {
                const f = e.target;
                if (!f.matches('input[type=file][data-anh]')) { return; }
                const file = f.files[0];
                if (!file) { return; }
                const tk = timTaiKhoan(f.dataset.anh);
                if (!tk) { return; }
                try {
                    tk.anh = await thuNhoAnhDaiDien(file);
                    luuTaiKhoan();
                    veNoiBatQT();
                    renderNoiBat();
                    hienToast('Đã cập nhật ảnh đại diện cho ' + tk.ten);
                } catch (err) { hienToast('Không đọc được ảnh. Thử ảnh khác.'); }
            });
        })();
        renderNoiBat();
    