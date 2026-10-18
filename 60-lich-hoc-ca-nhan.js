
        // =====================================================
        //  LỊCH HỌC CÁ NHÂN: học sinh đã nhập mã / được cấp quyền tự chỉnh lịch của mình
        // =====================================================
        function laLichChinh() {
            return !!nguoiDung && (nguoiDung.vaiTro === 'admin' || duocLuyenDe(nguoiDung.email));
        }
        function lichRiengCuaToi() {
            const tk = nguoiDung ? timTaiKhoan(nguoiDung.email) : null;
            return tk && Array.isArray(tk.lichRieng) ? tk.lichRieng : [];
        }
        function luuLichRieng(ds) {
            const tk = timTaiKhoan(nguoiDung.email);
            if (!tk) { return; }
            tk.lichRieng = ds;
            luuTaiKhoan();
        }

        function veLich() {
            const week = document.getElementById('week');
            const rong = document.getElementById('sch-empty');
            const rieng = lichRiengCuaToi();
            const chinh = laLichChinh();
            const coGi = daDangKy.size > 0 || rieng.length > 0 || chinh;

            document.getElementById('sch-sub').textContent =
                'Lịch học cá nhân — ' + (chinh ? 'bạn có thể tự chỉnh lịch của mình' : 'Hiển thị các môn bạn đang tham gia') +
                ' (' + daDangKy.size + ' khóa)';
            rong.style.display = coGi ? 'none' : 'block';
            week.style.display = coGi ? 'grid' : 'none';
            week.innerHTML = '';

            // Nút chỉnh lịch: chỉ hiện với học sinh đã nhập mã / được cấp quyền
            let nutChinh = document.getElementById('lich-chinh');
            if (!nutChinh) {
                nutChinh = document.createElement('button');
                nutChinh.id = 'lich-chinh';
                nutChinh.className = 'btn-link';
                nutChinh.style.cssText = 'margin:0 0 14px;';
                nutChinh.textContent = '✏️ Chỉnh lịch của tôi';
                nutChinh.addEventListener('click', moChinhLich);
                week.parentNode.insertBefore(nutChinh, week);
            }
            nutChinh.style.display = chinh ? 'inline-block' : 'none';

            const homNay = (new Date().getDay() + 6) % 7;
            const cot = tenThu.map(function (ten, i) {
                const d = document.createElement('div');
                d.className = 'day' + (i === homNay ? ' today' : '');
                d.innerHTML = '<div class="day-name">' + ten + '</div>';
                week.appendChild(d);
                return d;
            });

            // Các khóa đã đăng ký (lịch mẫu của khóa)
            khoaHoc.forEach(function (kh, i) {
                if (!daDangKy.has(kh.ten)) return;
                const l = lichMau[i % lichMau.length];
                const buoi = document.createElement('div');
                buoi.className = 'lesson';
                buoi.innerHTML = '<b></b><span>⏰ ' + l.gio + '</span>';
                buoi.querySelector('b').textContent = kh.ten;
                cot[l.thu].appendChild(buoi);
            });

            // Lịch riêng của học sinh
            rieng.forEach(function (m) {
                const buoi = document.createElement('div');
                buoi.className = 'lesson rieng';
                buoi.style.cssText = 'background:linear-gradient(135deg,#0f766e,#14b8a6);';
                buoi.innerHTML = '<b></b><span>⏰ ' + m.gioBD + ' - ' + m.gioKT + '</span>';
                buoi.querySelector('b').textContent = m.ten;
                if (chinh) { buoi.style.cursor = 'pointer'; buoi.title = 'Bấm để sửa'; buoi.addEventListener('click', function () { moChinhLich(m.id); }); }
                cot[m.thu].appendChild(buoi);
            });
        }

        function moChinhLich(suaId) {
            const ds = lichRiengCuaToi();
            const dangSua = suaId ? ds.find(function (m) { return m.id === suaId; }) : null;
            const thuOpt = tenThu.map(function (t, i) {
                return '<option value="' + i + '"' + (dangSua && dangSua.thu === i ? ' selected' : '') + '>' + t + '</option>';
            }).join('');
            const dsHtml = ds.length === 0 ? '<p class="modal-sub">Chưa có buổi học riêng nào.</p>' :
                '<div class="table-wrap"><table class="tbl"><thead><tr><th>Thứ</th><th>Giờ</th><th>Nội dung</th><th style="width:70px"></th></tr></thead><tbody>' +
                ds.map(function (m) {
                    return '<tr><td>' + tenThu[m.thu] + '</td><td>' + m.gioBD + ' - ' + m.gioKT + '</td><td>' + thoat(m.ten) + '</td>' +
                           '<td><button class="btn-sec lc-xoa" data-id="' + m.id + '" style="padding:4px 8px">Xóa</button></td></tr>';
                }).join('') + '</tbody></table></div>';

            moDialog(
                '<h3>Lịch học của tôi</h3>' +
                '<p class="modal-sub">Thêm buổi học riêng vào thời khóa biểu của bạn.</p>' +
                '<div class="field"><label>Thứ</label><select id="lc-thu">' + thuOpt + '</select></div>' +
                '<div class="form-2col"><div class="field"><label>Giờ bắt đầu</label><input type="time" id="lc-bd" value="' + (dangSua ? dangSua.gioBD : '19:00') + '"></div>' +
                '<div class="field"><label>Giờ kết thúc</label><input type="time" id="lc-kt" value="' + (dangSua ? dangSua.gioKT : '21:00') + '"></div></div>' +
                '<div class="field"><label>Nội dung</label><input id="lc-ten" value="' + thoat(dangSua ? dangSua.ten : '') + '" placeholder="Ví dụ: Ôn Toán tư duy"></div>' +
                '<div class="form-error" id="lc-loi"></div>' +
                '<div class="dialog-actions"><button class="btn-sec" id="lc-dong">Đóng</button>' +
                (dangSua ? '<button class="btn-sec" id="lc-huysua">Hủy sửa</button>' : '') +
                '<button class="btn-link" id="lc-luu">' + (dangSua ? 'Cập nhật' : 'Thêm vào lịch') + '</button></div>' +
                '<h4 style="margin:18px 0 8px">Các buổi đã thêm</h4>' + dsHtml
            );
            document.getElementById('lc-dong').addEventListener('click', dongDialog);
            if (document.getElementById('lc-huysua')) { document.getElementById('lc-huysua').addEventListener('click', function () { moChinhLich(); }); }
            document.getElementById('lc-luu').addEventListener('click', function () {
                const thu = Number(document.getElementById('lc-thu').value);
                const bd = document.getElementById('lc-bd').value, kt = document.getElementById('lc-kt').value;
                const ten = document.getElementById('lc-ten').value.trim();
                const loi = document.getElementById('lc-loi');
                if (!bd || !kt || ten === '') { baoLoi(loi, 'Nhập đủ giờ bắt đầu, giờ kết thúc và nội dung.'); return; }
                if (kt <= bd) { baoLoi(loi, 'Giờ kết thúc phải sau giờ bắt đầu.'); return; }
                const ds2 = lichRiengCuaToi().slice();
                if (dangSua) {
                    const k = ds2.findIndex(function (m) { return m.id === dangSua.id; });
                    if (k >= 0) { ds2[k] = { id: dangSua.id, thu: thu, gioBD: bd, gioKT: kt, ten: ten }; }
                } else {
                    ds2.push({ id: taoId(), thu: thu, gioBD: bd, gioKT: kt, ten: ten });
                }
                luuLichRieng(ds2);
                veLich();
                moChinhLich();
                hienToast(dangSua ? 'Đã cập nhật buổi học.' : 'Đã thêm vào lịch của bạn.');
            });
            document.querySelectorAll('.lc-xoa').forEach(function (b) {
                b.addEventListener('click', function () {
                    if (!confirm('Xóa buổi học này khỏi lịch?')) { return; }
                    luuLichRieng(lichRiengCuaToi().filter(function (m) { return m.id !== b.dataset.id; }));
                    veLich();
                    moChinhLich();
                });
            });
        }

        // Vẽ lại lịch khi mở mục Lịch học
        const showPageTruocLich = showPage;
        showPage = function (name) {
            showPageTruocLich(name);
            if (name === 'schedule' && typeof veLich === 'function') { veLich(); }
        };
        veLich();
    