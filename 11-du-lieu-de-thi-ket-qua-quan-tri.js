
        // =====================================================
        //  DỮ LIỆU: ĐỀ THI, KẾT QUẢ + TRANG QUẢN TRỊ
        // =====================================================
        const KHO_DE = 'skyedu-de-thi';
        const KHO_KQ = 'skyedu-ket-qua';
        const MAU_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let dangLamBai = false;      // đang làm bài thi?
        let dongHoLamBai = null;     // bộ đếm giờ làm bài
        let conLaiLamBai = 0;        // số giây còn lại

        function taoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

        // Hai đề mẫu để có sẵn dữ liệu khi mở lần đầu
        function deMau() {
            const bay = new Date().toISOString();
            return [
                {
                    id: 'de-tsa-1', ten: 'Đề thi thử TSA số 1', phong: 'tsa', phut: 20, hienThi: true, ngayTao: bay, nguoiTao: 'admin@skyedu.vn',
                    cauHoi: [
                        { cau: 'Giá trị của biểu thức 2 + 3 × 4 là bao nhiêu?', dapAn: ['20', '14', '24', '12'], dung: 1 },
                        { cau: 'Số tiếp theo của dãy 2, 4, 8, 16, ... là?', dapAn: ['24', '30', '32', '20'], dung: 2 },
                        { cau: 'Hình chữ nhật dài 8 cm, rộng 5 cm có chu vi là?', dapAn: ['13 cm', '26 cm', '40 cm', '30 cm'], dung: 1 },
                        { cau: 'Mọi con mèo đều là động vật, Tom là một con mèo. Kết luận nào đúng?', dapAn: ['Tom là động vật', 'Tom là con chó', 'Tom không phải động vật', 'Không kết luận được'], dung: 0 },
                        { cau: 'Phương trình 2x + 6 = 14 có nghiệm x bằng?', dapAn: ['3', '4', '5', '10'], dung: 1 }
                    ]
                },
                {
                    id: 'de-hsa-1', ten: 'Đề thi thử HSA số 1', phong: 'hsa', phut: 15, hienThi: true, ngayTao: bay, nguoiTao: 'admin@skyedu.vn',
                    cauHoi: [
                        { cau: 'Thủ đô của Việt Nam là thành phố nào?', dapAn: ['Huế', 'Đà Nẵng', 'Hà Nội', 'Hải Phòng'], dung: 2 },
                        { cau: 'Nước nguyên chất sôi ở bao nhiêu độ C (áp suất tiêu chuẩn)?', dapAn: ['50', '80', '100', '120'], dung: 2 },
                        { cau: 'Căn bậc hai của 81 là?', dapAn: ['7', '8', '9', '10'], dung: 2 },
                        { cau: 'Từ trái nghĩa với "chăm chỉ" là?', dapAn: ['Siêng năng', 'Lười biếng', 'Cần cù', 'Nhanh nhẹn'], dung: 1 }
                    ]
                }
            ];
        }

        let deThi = docKho('localStorage', KHO_DE);
        if (!Array.isArray(deThi) || deThi.length === 0) { deThi = deMau(); ghiKho('localStorage', KHO_DE, deThi); }
        let ketQua = docKho('localStorage', KHO_KQ);
        if (!Array.isArray(ketQua)) { ketQua = []; }

        function luuTaiKhoan() { ghiKho('localStorage', KHO_TK, danhSach); }
        function luuDe() { ghiKho('localStorage', KHO_DE, deThi); }
        function luuKetQua() { ghiKho('localStorage', KHO_KQ, ketQua); }
        function ngayGio(iso) { return new Date(iso).toLocaleString('vi-VN'); }
        function soAdmin() { return danhSach.filter(function (u) { return u.vaiTro === 'admin'; }).length; }
        function timTaiKhoan(email) { return danhSach.find(function (u) { return u.email === email; }); }
        window.timTaiKhoan = timTaiKhoan;   // cho các phần mã khác dùng chung
        function giayThanhChu(s) { return pad(Math.floor(s / 60)) + ':' + pad(s % 60); }

        // Số bài và điểm trung bình của một học sinh
        function thongKe(email) {
            const ds = ketQua.filter(function (k) { return k.email === email; });
            if (ds.length === 0) { return { so: 0, tb: null }; }
            const tong = ds.reduce(function (t, k) { return t + k.diem; }, 0);
            return { so: ds.length, tb: Math.round(tong / ds.length * 10) / 10 };
        }

        // ----- Hộp thoại: bản mới, có thể mở rộng và biết "đang làm bài" -----
        function moDialog(noiDung, rong) {
            document.querySelector('#dialog .modal-box').classList.toggle('wide', !!rong);
            document.querySelector('#dialog .modal-box').classList.remove('xl');
            dialogBody.innerHTML = noiDung;
            dialog.classList.add('open');
        }
        function dongDialog() {
            if (dangLamBai && !confirm('Thoát bây giờ sẽ không lưu bài làm. Bạn chắc chắn muốn thoát?')) { return; }
            dangLamBai = false;
            clearInterval(dongHoLamBai);
            dialog.classList.remove('open');
        }

        // ----- Chuyển tab trong trang quản trị -----
        document.querySelectorAll('.ad-tab').forEach(function (nut) {
            nut.addEventListener('click', function () {
                document.querySelectorAll('.ad-tab').forEach(function (n) { n.classList.remove('active'); });
                document.querySelectorAll('.ad-pane').forEach(function (p) { p.classList.remove('active'); });
                nut.classList.add('active');
                document.getElementById('ad-' + nut.dataset.ad).classList.add('active');
            });
        });

        function veQuanTri() { veCaThi(); veThongKe(); veHocSinh(); veDe(); veKetQua(); if (typeof veKho === 'function') { veKho(); } }

        // ===== Thống kê tổng quan =====
        function veThongKe() {
            const soHS = danhSach.filter(function (u) { return u.vaiTro === 'hocsinh'; }).length;
            let tb = '-';
            if (ketQua.length > 0) {
                tb = Math.round(ketQua.reduce(function (t, k) { return t + k.diem; }, 0) / ketQua.length * 10) / 10;
            }
            document.getElementById('ad-stats').innerHTML =
                '<div class="stat"><b>' + soHS + '</b><span>Học sinh</span></div>' +
                '<div class="stat"><b>' + deThi.length + '</b><span>Đề thi</span></div>' +
                '<div class="stat"><b>' + (typeof khoCH !== 'undefined' ? khoCH.length : 0) + '</b><span>Câu trong kho</span></div>' +
                '<div class="stat"><b>' + ketQua.length + '</b><span>Lượt làm bài</span></div>' +
                '<div class="stat"><b>' + tb + '</b><span>Điểm trung bình</span></div>';
        }

        // ===== QUẢN LÝ HỌC SINH / TÀI KHOẢN =====
        function veHocSinh() {
            const tuKhoa = document.getElementById('hs-tim').value.trim().toLowerCase();
            const chonVT = document.getElementById('hs-loc-vt').value;
            const chonLop = document.getElementById('hs-loc-lop');
            const lopCu = chonLop.value;

            // Tạo danh sách lớp từ dữ liệu
            const cacLop = [];
            danhSach.forEach(function (u) { if (u.lop && cacLop.indexOf(u.lop) === -1) { cacLop.push(u.lop); } });
            cacLop.sort();
            chonLop.innerHTML = '<option value="">Tất cả lớp</option>' + cacLop.map(function (l) {
                return '<option value="' + thoat(l) + '">' + thoat(l) + '</option>';
            }).join('');
            chonLop.value = cacLop.indexOf(lopCu) !== -1 ? lopCu : '';

            const ds = danhSach.filter(function (u) {
                if (chonVT && u.vaiTro !== chonVT) { return false; }
                if (chonLop.value && u.lop !== chonLop.value) { return false; }
                const chuoi = (u.ten + ' ' + u.email + ' ' + (u.sdt || '')).toLowerCase();
                if (tuKhoa && chuoi.indexOf(tuKhoa) === -1) { return false; }
                return true;
            });

            const thanh = document.getElementById('hs-body');
            if (ds.length === 0) {
                thanh.innerHTML = '<tr><td colspan="9" class="empty-row">Không có tài khoản nào phù hợp.</td></tr>';
            } else {
                thanh.innerHTML = ds.map(function (u) {
                    const tk = thongKe(u.email);
                    const e = thoat(u.email);
                    return '<tr>' +
                        '<td><b>' + thoat(u.ten) + '</b></td>' +
                        '<td>' + e + '</td>' +
                        '<td>' + (u.lop ? thoat(u.lop) : '-') + '</td>' +
                        '<td>' + (u.sdt ? thoat(u.sdt) : '-') + '</td>' +
                        '<td>' + (u.vaiTro === 'admin' ? '<span class="tag tag-blue">Quản trị</span>' : '<span class="tag tag-gray">Học sinh</span>') + '</td>' +
                        '<td>' + tk.so + '</td>' +
                        '<td>' + (tk.tb === null ? '-' : tk.tb) + '</td>' +
                        '<td>' + (u.khoa ? '<span class="tag tag-red">Đã khóa</span>' : '<span class="tag tag-green">Hoạt động</span>') + '</td>' +
                        '<td class="acts">' +
                            '<button class="icon-btn" data-act="kq" data-email="' + e + '" title="Xem kết quả">📊</button>' +
                            '<button class="icon-btn" data-act="sua" data-email="' + e + '" title="Sửa">✏️</button>' +
                            '<button class="icon-btn" data-act="khoa" data-email="' + e + '" title="' + (u.khoa ? 'Mở khóa' : 'Khóa') + '">' + (u.khoa ? '🔓' : '🔒') + '</button>' +
                            '<button class="icon-btn" data-act="mk" data-email="' + e + '" title="Đặt lại mật khẩu">🔑</button>' +
                            '<button class="icon-btn" data-act="xoa" data-email="' + e + '" title="Xóa">🗑</button>' +
                        '</td></tr>';
                }).join('');
            }
            document.getElementById('hs-dem').textContent = 'Đang hiển thị ' + ds.length + ' / ' + danhSach.length + ' tài khoản';
        }

        document.getElementById('hs-tim').addEventListener('input', veHocSinh);
        document.getElementById('hs-loc-vt').addEventListener('change', veHocSinh);
        document.getElementById('hs-loc-lop').addEventListener('change', veHocSinh);
        document.getElementById('hs-them').addEventListener('click', function () { moFormHocSinh(null); });

        // Các nút trong bảng (dùng một bộ lắng nghe chung cho cả bảng)
        document.getElementById('hs-body').addEventListener('click', function (e) {
            const nut = e.target.closest('button[data-act]');
            if (!nut) { return; }
            const u = timTaiKhoan(nut.dataset.email);
            if (!u) { return; }
            const act = nut.dataset.act;
            const laToi = nguoiDung && nguoiDung.email === u.email;

            if (act === 'sua') {
                moFormHocSinh(u.email);
            } else if (act === 'kq') {
                document.getElementById('kq-tim').value = u.email;
                document.querySelector('.ad-tab[data-ad="kq"]').click();
                veKetQua();
            } else if (act === 'khoa') {
                if (laToi) { hienToast('Bạn không thể tự khóa tài khoản của mình.'); return; }
                if (!u.khoa && u.vaiTro === 'admin' && soAdmin() <= 1) { hienToast('Phải còn ít nhất một quản trị viên hoạt động.'); return; }
                u.khoa = !u.khoa;
                luuTaiKhoan(); veQuanTri();
                hienToast(u.khoa ? 'Đã khóa tài khoản ' + u.ten : 'Đã mở khóa tài khoản ' + u.ten);
            } else if (act === 'xoa') {
                if (laToi) { hienToast('Bạn không thể tự xóa tài khoản của mình.'); return; }
                if (u.vaiTro === 'admin' && soAdmin() <= 1) { hienToast('Phải còn ít nhất một tài khoản quản trị.'); return; }
                if (!confirm('Xóa tài khoản "' + u.ten + '"? Kết quả làm bài của tài khoản này cũng sẽ bị xóa.')) { return; }
                danhSach = danhSach.filter(function (x) { return x.email !== u.email; });
                ketQua = ketQua.filter(function (k) { return k.email !== u.email; });
                luuTaiKhoan(); luuKetQua(); veQuanTri();
                hienToast('Đã xóa tài khoản ' + u.ten);
            }
        });

        // Biểu mẫu thêm / sửa tài khoản
        function moFormHocSinh(email) {
            const u = email ? timTaiKhoan(email) : null;
            const sua = u !== null && u !== undefined;

            moDialog(
                '<h3>' + (sua ? 'Sửa tài khoản' : 'Thêm tài khoản') + '</h3>' +
                '<p class="modal-sub">' + (sua ? 'Để trống mật khẩu nếu không muốn đổi.' : 'Tạo tài khoản để học sinh đăng nhập.') + '</p>' +
                '<div class="form-2col">' +
                    '<div class="field full"><label for="f-ten">Họ và tên</label><input id="f-ten" placeholder="Nguyễn Văn A"></div>' +
                    '<div class="field full"><label for="f-email">Email (dùng để đăng nhập)</label><input id="f-email" placeholder="ten@email.com"></div>' +
                    '<div class="field"><label for="f-mk">Mật khẩu</label><input id="f-mk" type="text" placeholder="' + (sua ? 'Để trống nếu giữ nguyên' : 'Ít nhất 6 ký tự') + '"></div>' +
                    '<div class="field"><label for="f-vt">Vai trò</label><select id="f-vt"><option value="hocsinh">Học sinh</option><option value="admin">Quản trị</option></select></div>' +
                    '<div class="field"><label for="f-lop">Lớp</label><input id="f-lop" placeholder="Ví dụ: 12A1"></div>' +
                    '<div class="field"><label for="f-sdt">Số điện thoại</label><input id="f-sdt" placeholder="Không bắt buộc"></div>' +
                    '<div class="field full"><label for="f-gc">Ghi chú</label><textarea id="f-gc" rows="2" placeholder="Ví dụ: Mục tiêu 28 điểm khối A00"></textarea></div>' +
                '</div>' +
                '<div class="form-error" id="f-loi"></div>' +
                '<div class="dialog-actions"><button class="btn-sec" id="f-huy">Hủy</button><button class="btn-link" id="f-luu">Lưu</button></div>',
                true
            );

            // Điền giá trị bằng DOM (an toàn, không cần escape)
            if (sua) {
                document.getElementById('f-ten').value = u.ten;
                document.getElementById('f-email').value = u.email;
                document.getElementById('f-email').disabled = true;     // email là khóa nên không đổi
                document.getElementById('f-vt').value = u.vaiTro;
                document.getElementById('f-lop').value = u.lop || '';
                document.getElementById('f-sdt').value = u.sdt || '';
                document.getElementById('f-gc').value = u.ghiChu || '';
            }

            document.getElementById('f-huy').addEventListener('click', dongDialog);
            document.getElementById('f-luu').addEventListener('click', function () {
                const loi = document.getElementById('f-loi');
                const ten = document.getElementById('f-ten').value.trim();
                const mail = document.getElementById('f-email').value.trim().toLowerCase();
                const mk = document.getElementById('f-mk').value;
                const vt = document.getElementById('f-vt').value;

                if (ten === '') { baoLoi(loi, 'Vui lòng nhập họ và tên.'); return; }
                if (!sua) {
                    if (!MAU_EMAIL.test(mail)) { baoLoi(loi, 'Email chưa đúng định dạng.'); return; }
                    if (timTaiKhoan(mail)) { baoLoi(loi, 'Email này đã có tài khoản.'); return; }
                    if (mk.length < 6) { baoLoi(loi, 'Mật khẩu cần ít nhất 6 ký tự.'); return; }
                } else if (mk !== '' && mk.length < 6) {
                    baoLoi(loi, 'Mật khẩu mới cần ít nhất 6 ký tự.'); return;
                }
                if (sua && u.vaiTro === 'admin' && vt !== 'admin' && soAdmin() <= 1) {
                    baoLoi(loi, 'Phải còn ít nhất một tài khoản quản trị.'); return;
                }

                const lop = document.getElementById('f-lop').value.trim();
                const sdt = document.getElementById('f-sdt').value.trim();
                const gc = document.getElementById('f-gc').value.trim();

                if (sua) {
                    u.ten = ten; u.vaiTro = vt; u.lop = lop; u.sdt = sdt; u.ghiChu = gc;
                    if (mk !== '') { u.matKhau = mk; }
                    if (nguoiDung && nguoiDung.email === u.email) { nguoiDung.ten = ten; }
                } else {
                    danhSach.push({ ten: ten, email: mail, matKhau: mk, vaiTro: vt, lop: lop, sdt: sdt, ghiChu: gc,
                                    khoa: false, ngayTao: new Date().toISOString() });
                }
                luuTaiKhoan();
                dongDialog();
                capNhatGiaoDien();
                if (!laAdmin()) { showPage('home'); } else { veQuanTri(); }
                hienToast(sua ? 'Đã cập nhật tài khoản.' : 'Đã tạo tài khoản cho ' + ten + ' ✔');
            });
        }

        // ===== QUẢN LÝ ĐỀ THI =====
        function veDe() {
            const luoi = document.getElementById('de-luoi');
            if (deThi.length === 0) {
                luoi.innerHTML = '<div class="empty-row">Chưa có đề thi nào. Bấm "+ Tạo đề thi" để bắt đầu.</div>';
                return;
            }
            luoi.innerHTML = deThi.map(function (d) {
                const luot = ketQua.filter(function (k) { return k.deId === d.id; }).length;
                return '<div class="de-card">' +
                    '<div class="de-top">' +
                        '<span class="tag ' + (d.phong === 'tsa' ? 'tag-blue' : 'tag-green') + '">' + thoat(d.phong.toUpperCase()) + '</span>' +
                        (d.hienThi ? '<span class="tag tag-green">Đang mở</span>' : '<span class="tag tag-gray">Đang ẩn</span>') +
                    '</div>' +
                    '<h4>' + thoat(d.ten) + '</h4>' +
                    '<p class="de-info">📝 ' + d.cauHoi.length + ' câu · ⏱ ' + d.phut + ' phút · 👥 ' + luot + ' lượt làm</p>' +
                    '<div class="de-acts">' +
                        '<button class="icon-btn" data-act="sua" data-id="' + thoat(d.id) + '" title="Sửa">✏️ Sửa</button>' +
                        '<button class="icon-btn" data-act="an" data-id="' + thoat(d.id) + '" title="Ẩn / hiện">' + (d.hienThi ? '🙈 Ẩn' : '👁 Mở') + '</button>' +
                        '<button class="icon-btn" data-act="nhan" data-id="' + thoat(d.id) + '" title="Nhân bản">📄 Nhân bản</button>' +
                        '<button class="icon-btn" data-act="xoa" data-id="' + thoat(d.id) + '" title="Xóa">🗑</button>' +
                    '</div></div>';
            }).join('');
        }

        document.getElementById('de-them').addEventListener('click', function () { moFormDe(null); });
        document.getElementById('de-luoi').addEventListener('click', function (e) {
            const nut = e.target.closest('button[data-act]');
            if (!nut) { return; }
            const d = deThi.find(function (x) { return x.id === nut.dataset.id; });
            if (!d) { return; }
            const act = nut.dataset.act;
            if (act === 'sua') {
                moFormDe(d.id);
            } else if (act === 'an') {
                d.hienThi = !d.hienThi;
                luuDe(); veQuanTri();
                hienToast(d.hienThi ? 'Đề đã được mở cho học sinh.' : 'Đề đã được ẩn.');
            } else if (act === 'nhan') {
                const ban = JSON.parse(JSON.stringify(d));
                ban.id = taoId(); ban.ten = d.ten + ' (bản sao)'; ban.hienThi = false; ban.ngayTao = new Date().toISOString();
                deThi.push(ban);
                luuDe(); veQuanTri();
                hienToast('Đã nhân bản đề thi (đang ẩn).');
            } else if (act === 'xoa') {
                if (!confirm('Xóa đề "' + d.ten + '"? Kết quả đã nộp của đề này vẫn được giữ lại.')) { return; }
                deThi = deThi.filter(function (x) { return x.id !== d.id; });
                luuDe(); veQuanTri();
                hienToast('Đã xóa đề thi.');
            }
        });

        // Đánh số lại các câu hỏi trong biểu mẫu
        function danhSoCau() {
            document.querySelectorAll('#q-list .q-no').forEach(function (b, i) { b.textContent = 'Câu ' + (i + 1); });
        }

        let demCau = 0;   // để mỗi câu có nhóm nút tròn riêng
        function themCauHoi(q) {
            demCau++;
            const nhom = 'dung-' + demCau;
            const the = document.createElement('div');
            the.className = 'q-item';
            the.dataset.ls = (q && q.loiGiai) ? q.loiGiai : '';
            if (q && loaiCau(q) !== 'tn') {          // Đúng/Sai, Điền khuyết, Kéo thả: soạn ở Kho câu hỏi, ở đây giữ nguyên
                the.dataset.raw = JSON.stringify(q);
                the.innerHTML = '<div class="q-head"><b class="q-no"></b><button type="button" class="icon-btn q-del" title="Xóa câu này">🗑</button></div>' +
                    '<div class="q-lock">' + nhanLoai(q) + ' ' + cauGon(q, { khongHinh: true }) +
                    '<br><small>Dạng câu này soạn trong tab “Kho câu hỏi”. Ở đây câu được giữ nguyên khi lưu đề (có thể xóa).</small></div>';
                the.querySelector('.q-del').addEventListener('click', function () { the.remove(); danhSoCau(); });
                document.getElementById('q-list').appendChild(the);
                danhSoCau();
                return;
            }
            the.innerHTML =
                '<div class="q-head"><b class="q-no"></b><button type="button" class="icon-btn q-del" title="Xóa câu này">🗑</button></div>' +
                '<textarea class="q-text" rows="2" placeholder="Nội dung câu hỏi"></textarea>' +
                ['A', 'B', 'C', 'D'].map(function (ch, i) {
                    return '<label class="q-opt"><input type="radio" name="' + nhom + '" value="' + i + '">' +
                           '<span class="q-ch">' + ch + '</span><input type="text" class="q-ans" placeholder="Đáp án ' + ch + '"></label>';
                }).join('') +
                '<div class="q-hint">Chọn nút tròn ở đáp án đúng</div>';

            if (q) {
                the.querySelector('.q-text').value = q.cau;
                const o = the.querySelectorAll('.q-ans');
                for (let i = 0; i < 4; i++) { o[i].value = q.dapAn[i] || ''; }
                the.querySelectorAll('input[type=radio]')[q.dung].checked = true;
            }
            the.querySelector('.q-del').addEventListener('click', function () { the.remove(); danhSoCau(); });
            document.getElementById('q-list').appendChild(the);
            danhSoCau();
        }

        // Biểu mẫu tạo / sửa đề thi
        function moFormDe(id) {
            const d = id ? deThi.find(function (x) { return x.id === id; }) : null;

            moDialog(
                '<h3>' + (d ? 'Sửa đề thi' : 'Tạo đề thi mới') + '</h3>' +
                '<div class="form-2col">' +
                    '<div class="field full"><label for="d-ten">Tên đề thi</label><input id="d-ten" placeholder="Ví dụ: Đề thi thử TSA số 2"></div>' +
                    '<div class="field"><label for="d-phong">Phòng luyện</label><select id="d-phong"><option value="tsa">Phòng TSA</option><option value="hsa">Phòng HSA</option></select></div>' +
                    '<div class="field"><label for="d-goi">Gói đề</label><select id="d-goi">' + goiOptions() + '</select></div>' +
                    '<div class="field"><label for="d-phut">Thời gian làm bài (phút)</label><input id="d-phut" type="number" min="1" max="300" value="30"></div>' +
                    '<label class="check full"><input type="checkbox" id="d-hien" checked> Cho học sinh làm đề này ngay</label>' +
                '</div>' +
                '<h4 class="q-title">Câu hỏi</h4>' +
                '<p class="modal-sub">Soạn nhanh câu trắc nghiệm tại đây. Câu <b>Đúng/Sai, Điền khuyết, Kéo thả</b>: soạn trong tab <b>Kho câu hỏi</b>, tick chọn rồi bấm “Tạo đề từ câu đã chọn”.</p>' +
                '<div id="q-list"></div>' +
                '<button type="button" class="btn-sec" id="q-them">+ Thêm câu hỏi</button>' +
                '<div class="form-error" id="d-loi"></div>' +
                '<div class="dialog-actions"><button class="btn-sec" id="de-huy">Hủy</button><button class="btn-link" id="de-luu">Lưu đề thi</button></div>',
                true
            );

            if (d) {
                document.getElementById('d-ten').value = d.ten;
                document.getElementById('d-phong').value = d.phong;
                document.getElementById('d-goi').value = d.goi || 'mien-phi';
                document.getElementById('d-phut').value = d.phut;
                document.getElementById('d-hien').checked = d.hienThi;
                d.cauHoi.forEach(function (q) { themCauHoi(q); });
            } else {
                themCauHoi(null);
            }

            document.getElementById('q-them').addEventListener('click', function () { themCauHoi(null); });
            document.getElementById('de-huy').addEventListener('click', dongDialog);
            document.getElementById('de-luu').addEventListener('click', function () {
                const loi = document.getElementById('d-loi');
                const ten = document.getElementById('d-ten').value.trim();
                const phut = parseInt(document.getElementById('d-phut').value, 10);
                const cacCau = document.querySelectorAll('#q-list .q-item');

                if (ten === '') { baoLoi(loi, 'Vui lòng nhập tên đề thi.'); return; }
                if (!(phut >= 1 && phut <= 300)) { baoLoi(loi, 'Thời gian làm bài phải từ 1 đến 300 phút.'); return; }
                if (cacCau.length === 0) { baoLoi(loi, 'Đề thi cần có ít nhất một câu hỏi.'); return; }

                const cauHoi = [];
                let hopLe = true;
                cacCau.forEach(function (it, i) {
                    if (!hopLe) { return; }
                    if (it.dataset.raw) { cauHoi.push(JSON.parse(it.dataset.raw)); return; }
                    const cau = it.querySelector('.q-text').value.trim();
                    const dapAn = Array.prototype.map.call(it.querySelectorAll('.q-ans'), function (o) { return o.value.trim(); });
                    const chon = it.querySelector('input[type=radio]:checked');
                    if (cau === '' || dapAn.some(function (a) { return a === ''; })) {
                        baoLoi(loi, 'Câu ' + (i + 1) + ': hãy nhập đủ nội dung và cả 4 đáp án.'); hopLe = false; return;
                    }
                    if (!chon) {
                        baoLoi(loi, 'Câu ' + (i + 1) + ': hãy chọn đáp án đúng.'); hopLe = false; return;
                    }
                    cauHoi.push({ cau: cau, dapAn: dapAn, dung: parseInt(chon.value, 10), loiGiai: it.dataset.ls || '' });
                });
                if (!hopLe) { return; }

                const phong = document.getElementById('d-phong').value;
                const hien = document.getElementById('d-hien').checked;
                if (d) {
                    d.ten = ten; d.phong = phong; d.goi = document.getElementById('d-goi').value; d.phut = phut; d.hienThi = hien; d.cauHoi = cauHoi;
                } else {
                    deThi.push({ id: taoId(), ten: ten, phong: phong, goi: document.getElementById('d-goi').value, phut: phut, hienThi: hien, cauHoi: cauHoi,
                                 ngayTao: new Date().toISOString(), nguoiTao: nguoiDung ? nguoiDung.email : '' });
                }
                luuDe();
                dongDialog();
                veQuanTri();
                hienToast(d ? 'Đã cập nhật đề thi.' : 'Đã tạo đề thi mới ✔');
            });
        }

        // ===== KẾT QUẢ LÀM BÀI =====
        function veKetQua() {
            const tuKhoa = document.getElementById('kq-tim').value.trim().toLowerCase();
            const ds = ketQua.filter(function (k) {
                return !tuKhoa || (k.ten + ' ' + k.email + ' ' + k.tenDe).toLowerCase().indexOf(tuKhoa) !== -1;
            }).sort(function (a, b) { return a.ngay < b.ngay ? 1 : -1; });

            const thanh = document.getElementById('kq-body');
            if (ds.length === 0) {
                thanh.innerHTML = '<tr><td colspan="7" class="empty-row">Chưa có kết quả nào.</td></tr>';
                return;
            }
            thanh.innerHTML = ds.map(function (k) {
                return '<tr>' +
                    '<td><b>' + thoat(k.ten) + '</b><br><small>' + thoat(k.email) + '</small></td>' +
                    '<td>' + thoat(k.tenDe) + '</td>' +
                    '<td><b>' + k.diem + '</b> / 10</td>' +
                    '<td>' + k.dung + ' / ' + k.tong + '</td>' +
                    '<td>' + giayThanhChu(k.giay) + '</td>' +
                    '<td>' + ngayGio(k.ngay) + '</td>' +
                    '<td><button class="icon-btn" data-id="' + thoat(k.id) + '" title="Xóa kết quả">🗑</button></td>' +
                '</tr>';
            }).join('');
        }
        document.getElementById('kq-tim').addEventListener('input', veKetQua);
        document.getElementById('kq-body').addEventListener('click', function (e) {
            const nut = e.target.closest('button[data-id]');
            if (!nut) { return; }
            if (!confirm('Xóa kết quả làm bài này?')) { return; }
            ketQua = ketQua.filter(function (k) { return k.id !== nut.dataset.id; });
            luuKetQua(); veQuanTri();
        });

        // ===== SAO LƯU / KHÔI PHỤC DỮ LIỆU =====
        function taiFile(ten, noiDung, loai) {
            const blob = new Blob([noiDung], { type: loai });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = ten;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
        }

        document.getElementById('dl-xuat').addEventListener('click', function () {
            const goi = { phienBan: 1, xuatLuc: new Date().toISOString(), taiKhoan: danhSach, deThi: deThi, ketQua: ketQua, khoCauHoi: khoCH, dotThi: dotThi, caThi: caThi, dangKyCa: dangKyCa };
            taiFile('skyedu-du-lieu.json', JSON.stringify(goi, null, 2), 'application/json');
            hienToast('Đã tải file sao lưu.');
        });

        document.getElementById('dl-csv').addEventListener('click', function () {
            const dong = [['Họ tên', 'Email', 'Lớp', 'SĐT', 'Vai trò', 'Số bài làm', 'Điểm TB', 'Trạng thái', 'Ghi chú']];
            danhSach.forEach(function (u) {
                const tk = thongKe(u.email);
                dong.push([u.ten, u.email, u.lop || '', u.sdt || '', u.vaiTro === 'admin' ? 'Quản trị' : 'Học sinh',
                           tk.so, tk.tb === null ? '' : tk.tb, u.khoa ? 'Đã khóa' : 'Hoạt động', u.ghiChu || '']);
            });
            const csv = dong.map(function (r) {
                return r.map(function (o) { return '"' + String(o).replace(/"/g, '""') + '"'; }).join(',');
            }).join('\n');
            taiFile('skyedu-hoc-sinh.csv', '\uFEFF' + csv, 'text/csv');   // \uFEFF giúp Excel đọc đúng tiếng Việt
            hienToast('Đã tải danh sách học sinh.');
        });

        document.getElementById('dl-nhap').addEventListener('click', function () {
            document.getElementById('dl-file').click();
        });
        document.getElementById('dl-file').addEventListener('change', function () {
            const f = this.files[0];
            if (!f) { return; }
            const doc = new FileReader();
            doc.onload = function () {
                try {
                    const g = JSON.parse(doc.result);
                    if (!Array.isArray(g.taiKhoan) || !Array.isArray(g.deThi) || !Array.isArray(g.ketQua)) { throw new Error('sai dinh dang'); }
                    if (!confirm('Khôi phục sẽ THAY THẾ toàn bộ dữ liệu hiện tại. Tiếp tục?')) { return; }
                    danhSach = g.taiKhoan;
                    deThi = g.deThi.filter(function (d) { return d && Array.isArray(d.cauHoi) && typeof d.id === 'string'; });
                    ketQua = g.ketQua.filter(function (k) { return k && typeof k.email === 'string'; });
                    if (Array.isArray(g.dotThi)) {
                        dotThi = g.dotThi;
                        caThi = Array.isArray(g.caThi) ? g.caThi : [];
                        dangKyCa = Array.isArray(g.dangKyCa) ? g.dangKyCa : [];
                    }
                    khoCH = Array.isArray(g.khoCauHoi) ? g.khoCauHoi.filter(function (q) { return q && Array.isArray(q.dapAn) && typeof q.id === 'string'; }) : []; luuKho();
                    damBaoTaiKhoanMau(); luuDe(); luuKetQua(); luuCa();
                    if (nguoiDung && !timTaiKhoan(nguoiDung.email)) { dangXuat(); } else { capNhatGiaoDien(); veQuanTri(); }
                    hienToast('Đã khôi phục dữ liệu ✔');
                } catch (err) {
                    hienToast('File không đúng định dạng dữ liệu SKY EDU.');
                }
            };
            doc.readAsText(f);
            this.value = '';
        });

        document.getElementById('dl-reset').addEventListener('click', function () {
            if (!confirm('Xóa TOÀN BỘ tài khoản, đề thi và kết quả rồi quay về dữ liệu mẫu?')) { return; }
            xoaKho('localStorage', KHO_TK); xoaKho('localStorage', KHO_DE); xoaKho('localStorage', KHO_KQ); xoaKho('localStorage', KHO_CA); xoaKho('localStorage', KHO_KHO);
            xoaKho('localStorage', KHO_PHIEN); xoaKho('sessionStorage', KHO_PHIEN);
            location.reload();
        });

        // =====================================================
        //  PHÍA HỌC SINH: PHÒNG LUYỆN VÀ LÀM BÀI THI
        // =====================================================
        // Danh sách đề trong phòng TSA / HSA (ghi đè hàm cũ, lấy dữ liệu thật)
        function moPhong(loai) {
            document.getElementById('modal-title').textContent = loai === 'tsa' ? 'Phòng TSA' : 'Phòng HSA';
            modalNote.textContent = '';
            modalList.innerHTML = '';

            const ds = deThi.filter(function (d) { return d.phong === loai && d.hienThi; });
            if (ds.length === 0) {
                modalList.innerHTML = '<p class="empty-row">Phòng này chưa có đề nào đang mở.</p>';
            }
            ds.forEach(function (d) {
                let tot = null;
                ketQua.forEach(function (k) {
                    if (k.deId === d.id && nguoiDung && k.email === nguoiDung.email && (tot === null || k.diem > tot)) { tot = k.diem; }
                });
                const dong = document.createElement('div');
                dong.className = 'exam';
                dong.innerHTML = '<div><div class="exam-name"></div><div class="exam-info">⏱ ' + d.phut + ' phút · ' +
                                 d.cauHoi.length + ' câu' + (tot !== null ? ' · Điểm cao nhất: <b>' + tot + '</b>' : '') + '</div></div>' +
                                 '<button>Làm bài</button>';
                dong.querySelector('.exam-name').textContent = d.ten;
                dong.querySelector('button').addEventListener('click', function () { batDauLamBai(d.id); });
                modalList.appendChild(dong);
            });
            modal.classList.add('open');
        }

        function batDauLamBai(id) {
            const de = deThi.find(function (x) { return x.id === id; });
            if (!de) { return; }
            dongPhong();

            let noiDung = '<div class="exam-top"><div><h3>' + thoat(de.ten) + '</h3>' +
                          '<span class="exam-meta">' + de.cauHoi.length + ' câu · ' + de.phut + ' phút</span></div>' +
                          '<div class="timer" id="timer">' + giayThanhChu(de.phut * 60) + '</div></div><div id="exam-qs">';
            de.cauHoi.forEach(function (q, i) {
                noiDung += '<div class="eq">'; if (q.anh && anhViTri(q) === 'tren') { noiDung += anhCauHTML(q, i + 1); } noiDung += '<div class="eq-text"><b>Câu ' + (i + 1) + '.</b> ' + thoat(q.cau) + '</div>'; if (q.anh && anhViTri(q) === 'duoi') { noiDung += anhCauHTML(q, i + 1); }
                q.dapAn.forEach(function (a, j) {
                    noiDung += '<label class="opt"><input type="radio" name="cau-' + i + '" value="' + j + '"><span><b>' +
                               'ABCD'.charAt(j) + '.</b> ' + thoat(a) + '</span></label>';
                });
                noiDung += '</div>';
            });
            noiDung += '</div><div class="form-error" id="exam-loi"></div>' +
                       '<div class="dialog-actions"><button class="btn-sec" id="exam-thoat">Thoát</button>' +
                       '<button class="btn-link" id="exam-nop">Nộp bài</button></div>';

            moDialog(noiDung, true);
            dangLamBai = true;
            conLaiLamBai = de.phut * 60;

            clearInterval(dongHoLamBai);
            dongHoLamBai = setInterval(function () {
                conLaiLamBai--;
                const o = document.getElementById('timer');
                if (o) {
                    o.textContent = giayThanhChu(Math.max(0, conLaiLamBai));
                    o.classList.toggle('gap', conLaiLamBai <= 60);
                }
                if (conLaiLamBai <= 0) { nopBai(de, true); }
            }, 1000);

            document.getElementById('exam-thoat').addEventListener('click', function () { dongDialog(); });
            document.getElementById('exam-nop').addEventListener('click', function () { nopBai(de, false); });
        }

        function nopBai(de, hetGio) {
            const cacCau = document.querySelectorAll('#exam-qs .eq');
            const chon = [];
            let chuaLam = 0;
            cacCau.forEach(function (c) {
                const r = c.querySelector('input[type=radio]:checked');
                if (r) { chon.push(parseInt(r.value, 10)); } else { chon.push(-1); chuaLam++; }
            });
            if (!hetGio && chuaLam > 0 && !confirm('Bạn còn ' + chuaLam + ' câu chưa làm. Vẫn nộp bài?')) { return; }

            clearInterval(dongHoLamBai);
            dangLamBai = false;

            let dung = 0;
            de.cauHoi.forEach(function (q, i) { if (chon[i] === q.dung) { dung++; } });
            const tong = de.cauHoi.length;
            const diem = tinhDiemIRT(de, chon);                       // chấm theo IRT
            const giay = Math.max(0, de.phut * 60 - conLaiLamBai);

            ketQua.push({ id: taoId(), email: nguoiDung.email, ten: nguoiDung.ten, deId: de.id, tenDe: de.ten,
                          diem: diem, dung: dung, tong: tong, giay: giay, ngay: new Date().toISOString(), ans: chon.slice() });
            luuKetQua();

            let xem = '';
            de.cauHoi.forEach(function (q, i) {
                if (chon[i] !== q.dung) {
                    xem += '<div class="rv"><div><b>Câu ' + (i + 1) + '.</b> ' + thoat(q.cau) + '</div>' +
                           '<div class="rv-sai">Bạn chọn: ' + (chon[i] === -1 ? '(bỏ trống)' : thoat(q.dapAn[chon[i]])) + '</div>' +
                           '<div class="rv-dung">Đáp án đúng: ' + thoat(q.dapAn[q.dung]) + '</div></div>';
                }
            });
            xem = xem === '' ? '<p class="rv-full">🎉 Bạn trả lời đúng tất cả các câu!</p>' : '<h4>Các câu cần xem lại</h4>' + xem;

            let loiNhan = 'Cố gắng hơn ở lần sau nhé!';
            if (diem >= 8) { loiNhan = 'Xuất sắc! 🎉'; } else if (diem >= 5) { loiNhan = 'Khá tốt, tiếp tục luyện tập nhé!'; }

            moDialog(
                '<h3>Kết quả: ' + thoat(de.ten) + '</h3>' +
                '<div class="score-box"><div class="big">' + diem + ' / 10</div>' +
                '<div>Đúng ' + dung + ' / ' + tong + ' câu · ' + giayThanhChu(giay) + '</div><div>' + loiNhan + '</div></div>' +
                xem +
                '<div class="dialog-actions"><button class="btn-sec" id="kq-dong">Đóng</button>' +
                '<button class="btn-link" id="kq-lai">Làm lại</button></div>',
                true
            );
            document.getElementById('kq-dong').addEventListener('click', dongDialog);
            document.getElementById('kq-lai').addEventListener('click', function () { batDauLamBai(de.id); });
            if (laAdmin()) { veQuanTri(); }
        }


        // =====================================================
        //  CA THI TSA: ĐỢT THI, CA THI, ĐĂNG KÝ CỦA HỌC SINH
        // =====================================================
        const KHO_CA = 'skyedu-ca-thi';
        let dotThi = [];      // đợt thi
        let caThi = [];       // ca thi thuộc một đợt
        let dangKyCa = [];    // học sinh đã đăng ký ca nào

        function luuCa() { ghiKho('localStorage', KHO_CA, { dotThi: dotThi, caThi: caThi, dangKyCa: dangKyCa }); }

        (function napCaThi() {
            const da = docKho('localStorage', KHO_CA);
            if (da && Array.isArray(da.dotThi)) {
                dotThi = da.dotThi;
                caThi = Array.isArray(da.caThi) ? da.caThi : [];
                dangKyCa = Array.isArray(da.dangKyCa) ? da.dangKyCa : [];
                return;
            }
            // Dữ liệu mẫu lần đầu: một đợt còn mở đăng ký để bạn thử ngay
            dotThi = [{ id: 'dot-mau', ten: 'Đợt 1 năm 2027 (mẫu)', ma: 'TSA27-1', ngayThi: '2027-01-16', hanDangKy: '2026-12-15T23:59', moDK: true }];
            caThi = [
                { id: 'ca-mau-1', dotId: 'dot-mau', gio: '2027-01-16T07:00', phong: 'Phòng F-101 (mẫu)', soCho: 40 },
                { id: 'ca-mau-2', dotId: 'dot-mau', gio: '2027-01-16T13:30', phong: 'Phòng F-102 (mẫu)', soCho: 40 }
            ];
            dangKyCa = [];
            luuCa();
        })();

        function dotDangXem() {
            const hop = document.getElementById('ca-dot-xem');
            return dotThi.find(function (d) { return d.id === (hop ? hop.value : ''); }) || null;
        }
        function dotDangMo(dot) {
            return dot.moDK !== false && new Date(dot.hanDangKy).getTime() > Date.now();
        }
        function caCuaDot(dotId) {
            return caThi.filter(function (c) { return c.dotId === dotId; })
                        .sort(function (a, b) { return a.gio < b.gio ? -1 : 1; });
        }
        function soDaDangKyCa(caId) { return dangKyCa.filter(function (r) { return r.caId === caId; }).length; }
        function dangKyCuaHocSinh(dotId, email) {
            return dangKyCa.find(function (r) { return r.dotId === dotId && r.email === email; }) || null;
        }
        function gioNgan(iso) {
            return new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
        }
        function ngayNgan(s) { return new Date(s + 'T00:00').toLocaleDateString('vi-VN'); }
        function maDot(ngayThi) {
            const nam = ngayThi.slice(2, 4);
            let n = dotThi.length + 1;
            while (dotThi.some(function (d) { return d.ma === 'TSA' + nam + '-' + n; })) { n++; }
            return 'TSA' + nam + '-' + n;
        }

        // ----- Học sinh: đăng ký ca thi -----

        // ----- Thông tin khai báo khi đăng ký ca thi -----
        const DS_TINH_THANH = ['Hà Nội','Huế','Đà Nẵng','Hải Phòng','Cần Thơ','Lai Châu','Điện Biên','Sơn La','Lạng Sơn','Quảng Ninh','Thanh Hóa','Nghệ An','Hà Tĩnh','Cao Bằng','Tuyên Quang','Lào Cai','Thái Nguyên','Phú Thọ','Bắc Ninh','Hưng Yên','Ninh Bình','Quảng Trị','Quảng Ngãi','Gia Lai','Khánh Hòa','Lâm Đồng','Đắk Lắk','Hồ Chí Minh','Đồng Nai','Tây Ninh','An Giang','Vĩnh Long','Đồng Tháp','Cà Mau'];
        function formThongTinDK() {
            const tk = nguoiDung ? timTaiKhoan(nguoiDung.email) : null;
            const v = function (x) { return thoat(x || ''); };
            let tuyChon = '<option value="">-- Chọn tỉnh / thành phố --</option>';
            DS_TINH_THANH.forEach(function (t) {
                tuyChon += '<option value="' + thoat(t) + '"' + (tk && tk.tinh === t ? ' selected' : '') + '>' + thoat(t) + '</option>';
            });
            return '<div class="dk-profile"><h4>Thông tin dự thi</h4>' +
                   '<div class="form-2col">' +
                   '<div class="field full"><label for="dk-ten">Họ và tên</label><input id="dk-ten" value="' + v(tk ? tk.ten : '') + '" placeholder="Nhập họ và tên"></div>' +
                   '<div class="field"><label for="dk-lop">Lớp</label><input id="dk-lop" value="' + v(tk ? tk.lop : '') + '" placeholder="Ví dụ: 12A1"></div>' +
                   '<div class="field"><label for="dk-tinh">Tỉnh / Thành phố</label><select id="dk-tinh">' + tuyChon + '</select></div>' +
                   '<div class="field full"><label for="dk-truong">Trường</label><input id="dk-truong" value="' + v(tk ? tk.truong : '') + '" placeholder="Tên trường THPT"></div>' +
                   '</div><div class="form-error" id="dk-loi"></div></div>';
        }
        function moDangKyCa() {
            if (typeof veKhaoThi === 'function') { veKhaoThi(); }   // làm mới thẻ Khảo thí cùng lúc
            let noi = '<h3>Đăng ký ca thi TSA</h3>' +
                      '<p class="modal-sub">Chọn một ca còn chỗ. Mỗi học sinh chỉ đăng ký một ca cho mỗi đợt.</p>' + formThongTinDK();
            if (dotThi.length === 0) { noi += '<p class="empty-row">Chưa có đợt thi nào.</p>'; }

            dotThi.forEach(function (dot) {
                const mo = dotDangMo(dot);
                const dk = nguoiDung ? dangKyCuaHocSinh(dot.id, nguoiDung.email) : null;
                noi += '<div style="margin-top:18px">' +
                       '<div class="exam-name">' + thoat(dot.ten) + ' ' +
                       (mo ? '<span class="tag tag-green">Đang mở</span>' : '<span class="tag tag-gray">Đã đóng</span>') + '</div>' +
                       '<div class="exam-info">📅 Ngày thi ' + ngayNgan(dot.ngayThi) + ' · Hạn đăng ký ' + gioNgan(dot.hanDangKy) + '</div>';

                if (dk) {
                    const ca = caThi.find(function (c) { return c.id === dk.caId; });
                    noi += '<div class="dk-ok">✔ Số báo danh: <b>' + thoat(dk.soBaoDanh) + '</b>' +
                           (ca ? '<br>⏰ ' + gioNgan(ca.gio) + ' · ' + thoat(ca.phong) : '') + '</div>';
                    if (mo) { noi += '<button class="btn-danger" style="margin-top:10px" data-huy="' + thoat(dk.id) + '">Hủy đăng ký</button>'; }
                } else {
                    caCuaDot(dot.id).forEach(function (ca) {
                        const con = ca.soCho - soDaDangKyCa(ca.id);
                        noi += '<div class="ca-row"><div><b>' + gioNgan(ca.gio) + '</b><br><small>' + thoat(ca.phong) + '</small></div>' +
                               '<div>' + (con > 0 ? '<span class="tag tag-blue">Còn ' + con + ' chỗ</span>' : '<span class="tag tag-red">Hết chỗ</span>') + '</div>' +
                               (mo && con > 0 ? '<button class="btn-link" data-dk="' + thoat(ca.id) + '">Đăng ký</button>' : '') + '</div>';
                    });
                }
                noi += '</div>';
            });

            noi += '<div class="dialog-actions"><button class="btn-sec" id="ca-dong">Đóng</button></div>';
            moDialog(noi, true);
            document.getElementById('ca-dong').addEventListener('click', dongDialog);
        }

        function dangKyCaThi(caId) {
            if (!nguoiDung) { showPage('login'); return; }
            const hoTen = document.getElementById('dk-ten') ? document.getElementById('dk-ten').value.trim() : '';
            const lop = document.getElementById('dk-lop') ? document.getElementById('dk-lop').value.trim() : '';
            const truong = document.getElementById('dk-truong') ? document.getElementById('dk-truong').value.trim() : '';
            const tinh = document.getElementById('dk-tinh') ? document.getElementById('dk-tinh').value : '';
            const baoLoiDK = function (noi) {
                const o = document.getElementById('dk-loi');
                if (o) { baoLoi(o, noi); }
                hienToast(noi);
            };
            if (hoTen === '' || lop === '' || truong === '' || tinh === '') {
                baoLoiDK('Vui lòng khai đủ họ tên, lớp, trường và tỉnh / thành phố.');
                return;
            }
            const tkDK = timTaiKhoan(nguoiDung.email);
            if (tkDK) {
                tkDK.ten = hoTen; tkDK.lop = lop; tkDK.truong = truong; tkDK.tinh = tinh;
                luuTaiKhoan();
                nguoiDung.ten = hoTen;
            }
            const ca = caThi.find(function (c) { return c.id === caId; });
            const dot = ca ? dotThi.find(function (d) { return d.id === ca.dotId; }) : null;
            if (!ca || !dot) { hienToast('Ca thi này không còn tồn tại.'); return; }
            if (!dotDangMo(dot)) { hienToast('Đợt thi này đã hết hạn đăng ký.'); return; }
            if (trangThaiCa(ca) !== 'sapbatdau') { hienToast('Ca thi này đã bắt đầu, không thể đăng ký.'); return; }
            if (dangKyCuaHocSinh(dot.id, nguoiDung.email)) { hienToast('Bạn đã đăng ký đợt này rồi.'); return; }
            if (soDaDangKyCa(ca.id) >= ca.soCho) { hienToast('Ca này đã đủ chỗ, hãy chọn ca khác.'); return; }

            const seq = dangKyCa.filter(function (r) { return r.dotId === dot.id; })
                                .reduce(function (m, r) { return Math.max(m, parseInt(r.soBaoDanh.split('-').pop(), 10) || 0); }, 0) + 1;
            const soBD = dot.ma + '-' + String(seq).padStart(4, '0');
            dangKyCa.push({ id: taoId(), email: nguoiDung.email, ten: hoTen, lop: lop, truong: truong, tinh: tinh, dotId: dot.id, caId: ca.id,
                            soBaoDanh: soBD, ngay: new Date().toISOString() });
            luuCa();
            veCaThi();
            hienToast('Đăng ký thành công! Số báo danh: ' + soBD);
            moDangKyCa();
        }

        function huyDangKyCa(id) {
            const r = dangKyCa.find(function (x) { return x.id === id; });
            if (!r || !nguoiDung || r.email !== nguoiDung.email) { return; }
            const dot = dotThi.find(function (d) { return d.id === r.dotId; });
            if (dot && !dotDangMo(dot)) { hienToast('Đã hết hạn đăng ký, không thể hủy.'); return; }
            if (!confirm('Hủy đăng ký số báo danh ' + r.soBaoDanh + '?')) { return; }
            dangKyCa = dangKyCa.filter(function (x) { return x.id !== id; });
            luuCa();
            veCaThi();
            hienToast('Đã hủy đăng ký.');
            moDangKyCa();
        }

        // Bấm nút Đăng ký / Hủy trong hộp thoại (một bộ lắng nghe dùng cho mọi lần mở)
        dialogBody.addEventListener('click', function (e) {
            const dk = e.target.closest('button[data-dk]');
            if (dk) { dangKyCaThi(dk.dataset.dk); return; }
            const huy = e.target.closest('button[data-huy]');
            if (huy) { huyDangKyCa(huy.dataset.huy); }
        });
        document.getElementById('ca-mo').addEventListener('click', moDangKyCa);

        // ----- Quản trị: đợt thi và ca thi -----
        function veCaThi() {
            const hopXem = document.getElementById('ca-dot-xem');
            const hopChon = document.getElementById('ca-chon-dot');
            const thongTin = document.getElementById('ca-thong-tin');
            const bang = document.getElementById('ca-dk-body');
            if (!hopXem || !thongTin) { return; }

            const cu = hopXem.value;
            const tuyChon = dotThi.map(function (d) { return '<option value="' + thoat(d.id) + '">' + thoat(d.ten) + '</option>'; }).join('')
                            || '<option value="">(chưa có đợt)</option>';
            hopXem.innerHTML = tuyChon;
            document.getElementById('ca-dot-list').innerHTML = dotThi.map(function (d) { return '<option value="' + thoat(d.ten) + '">'; }).join('');
            document.getElementById('ca-de').innerHTML = '<option value="">-- Chưa gắn đề --</option>' + deThi.map(function (d) {
                return '<option value="' + thoat(d.id) + '">' + thoat(d.ten) + ' (' + d.phut + ' phút)</option>';
            }).join('');
            if (dotThi.some(function (d) { return d.id === cu; })) { hopXem.value = cu; }

            const dot = dotDangXem();
            if (!dot) {
                thongTin.innerHTML = '<p class="empty-row">Chưa có đợt thi nào. Hãy tạo đợt thi ở bước 1.</p>';
                bang.innerHTML = '';
                return;
            }
            if (hopChon.value.trim() === '') { hopChon.value = dot.ten; }

            let h = '<div class="ca-head"><b>' + thoat(dot.ten) + '</b> · Mã ' + thoat(dot.ma) +
                    ' · Ngày thi ' + ngayNgan(dot.ngayThi) + ' · Hạn đăng ký ' + gioNgan(dot.hanDangKy) + ' · ' +
                    (dotDangMo(dot) ? '<span class="tag tag-green">Đang nhận đăng ký</span>' : '<span class="tag tag-gray">Đã đóng</span>') + '</div>';
            const ds = caCuaDot(dot.id);
            if (ds.length === 0) {
                h += '<p class="empty-row">Đợt này chưa có ca thi nào. Thêm ca ở bước 2.</p>';
            } else {
                h += '<div class="table-wrap"><table class="tbl"><thead><tr><th>Giờ thi</th><th>Phòng</th><th>Số chỗ</th><th>Đề thi</th><th>Đã đăng ký</th><th>Thao tác</th></tr></thead><tbody>';
                ds.forEach(function (ca) {
                    const n = soDaDangKyCa(ca.id);
                    h += '<tr><td>' + gioNgan(ca.gio) + '</td><td>' + thoat(ca.phong) + '</td><td>' + ca.soCho + '</td>' +
                         '<td>' + thoat((deCuaCa(ca) || { ten: '-' }).ten) + '</td><td>' + n + '</td>' +
                         '<td class="acts"><button class="icon-btn" data-ca-act="sua" data-ca-id="' + thoat(ca.id) + '" title="Đổi số chỗ">✏️ Số chỗ</button>' +
                         (n === 0 ? '<button class="icon-btn" data-ca-act="xoa" data-ca-id="' + thoat(ca.id) + '" title="Xóa ca">🗑</button>' : '') +
                         '</td></tr>';
                });
                h += '</tbody></table></div>';
            }
            thongTin.innerHTML = h;

            const dk = dangKyCa.filter(function (r) { return r.dotId === dot.id; })
                               .sort(function (a, b) { return a.soBaoDanh < b.soBaoDanh ? -1 : 1; });
            if (dk.length === 0) {
                bang.innerHTML = '<tr><td colspan="9" class="empty-row">Chưa có học sinh nào đăng ký đợt này.</td></tr>';
            } else {
                bang.innerHTML = dk.map(function (r) {
                    const ca = caThi.find(function (c) { return c.id === r.caId; });
                    return '<tr><td><b>' + thoat(r.soBaoDanh) + '</b></td><td>' + thoat(r.ten) + '</td><td>' + thoat(r.email) + '</td><td>' + thoat(r.lop || '-') + '</td><td>' + thoat(r.truong || '-') + '</td><td>' + thoat(r.tinh || '-') + '</td>' +
                           '<td>' + (ca ? gioNgan(ca.gio) + ' · ' + thoat(ca.phong) : '-') + '</td>' +
                           '<td>' + ngayGio(r.ngay) + '</td>' +
                           '<td><button class="icon-btn" data-dk-xoa="' + thoat(r.id) + '" title="Hủy đăng ký">🗑</button></td></tr>';
                }).join('');
            }
        }

        function maTaoDotMoi() {
            const ten = document.getElementById('ca-dot-ten').value.trim();
            const ngay = document.getElementById('ca-dot-ngay').value;
            const han = document.getElementById('ca-dot-han').value;
            const tu = document.getElementById('ca-dot-tu').value;
            const le = document.getElementById('ca-dot-le').value.trim();
            if (ten === '' || !ngay || !han) { hienToast('Nhập đủ tên đợt, ngày thi và hạn đăng ký.'); return; }
            if (tu && new Date(tu).getTime() >= new Date(han).getTime()) { hienToast('Ngày mở đăng ký phải trước hạn đăng ký.'); return; }
            if (new Date(han).getTime() >= new Date(ngay + 'T00:00').getTime()) { hienToast('Hạn đăng ký phải trước ngày thi.'); return; }
            const dot = { id: taoId(), ten: ten, ma: maDot(ngay), ngayThi: ngay, hanDangKy: han, moDK: true, dangKyTu: tu, lePhi: le || 'Miễn phí' };
            dotThi.push(dot);
            luuCa();
            veCaThi();
            document.getElementById('ca-dot-xem').value = dot.id;
            document.getElementById('ca-chon-dot').value = dot.ten;
            veCaThi();
            hienToast('Đã tạo đợt thi ✔');
        }
        document.getElementById('ca-dot-tao').addEventListener('click', maTaoDotMoi);

        document.getElementById('ca-tao').addEventListener('click', function () {
            let dot = dotThi.find(function (d) { return d.ten === document.getElementById('ca-chon-dot').value.trim(); }) || null;
            const tenDot = document.getElementById('ca-chon-dot').value.trim();
            if (!dot) {
                if (tenDot === '') { hienToast('Nhập tên đợt thi: chọn đợt có sẵn hoặc gõ tên đợt mới.'); return; }
                const ngay = document.getElementById('ca-dot-ngay').value;
                const han = document.getElementById('ca-dot-han').value;
                if (!ngay || !han) { hienToast('Đợt "' + tenDot + '" chưa có. Điền Ngày thi và Hạn đăng ký ở bước 1 để tạo đợt mới.'); return; }
                if (new Date(han).getTime() >= new Date(ngay + 'T00:00').getTime()) { hienToast('Hạn đăng ký phải trước ngày thi.'); return; }
                dot = { id: taoId(), ten: tenDot, ma: maDot(ngay), ngayThi: ngay, hanDangKy: han, moDK: true,
                        dangKyTu: document.getElementById('ca-dot-tu').value,
                        lePhi: document.getElementById('ca-dot-le').value.trim() || 'Miễn phí' };
                dotThi.push(dot);
                hienToast('Đã tạo đợt "' + tenDot + '" ✔');
            }
            const gio = document.getElementById('ca-gio').value;
            const phong = document.getElementById('ca-phong').value.trim();
            const cho = parseInt(document.getElementById('ca-cho').value, 10);
            if (!dot) { hienToast('Hãy tạo đợt thi trước.'); return; }
            if (!gio || phong === '') { hienToast('Nhập giờ thi và tên phòng.'); return; }
            if (!(cho >= 1 && cho <= 2000)) { hienToast('Số chỗ phải từ 1 đến 2000.'); return; }
            caThi.push({ id: taoId(), dotId: dot.id, gio: gio, phong: phong, soCho: cho, deId: document.getElementById('ca-de').value || '' , taoLuc: new Date().toISOString() });
            luuCa();
            veCaThi();
            hienToast('Đã thêm ca thi ✔');
        });

        document.getElementById('ca-dot-xem').addEventListener('change', veCaThi);

        document.getElementById('ca-dot-dong').addEventListener('click', function () {
            const dot = dotDangXem();
            if (!dot) { return; }
            dot.moDK = dot.moDK === false;          // đảo cờ đóng / mở thủ công
            luuCa();
            veCaThi();
            hienToast(dot.moDK ? 'Đã mở đăng ký cho đợt này.' : 'Đã đóng đăng ký cho đợt này.');
        });

        document.getElementById('ca-dot-xoa').addEventListener('click', function () {
            const dot = dotDangXem();
            if (!dot) { return; }
            if (dangKyCa.some(function (r) { return r.dotId === dot.id; })) { hienToast('Đợt này đã có học sinh đăng ký, không thể xóa.'); return; }
            if (!confirm('Xóa đợt "' + dot.ten + '" và toàn bộ ca thi của đợt này?')) { return; }
            dotThi = dotThi.filter(function (d) { return d.id !== dot.id; });
            caThi = caThi.filter(function (c) { return c.dotId !== dot.id; });
            luuCa();
            veCaThi();
            hienToast('Đã xóa đợt thi.');
        });

        document.getElementById('ca-thong-tin').addEventListener('click', function (e) {
            const nut = e.target.closest('button[data-ca-act]');
            if (!nut) { return; }
            const ca = caThi.find(function (c) { return c.id === nut.dataset.caId; });
            if (!ca) { return; }
            const n = soDaDangKyCa(ca.id);
            if (nut.dataset.caAct === 'sua') {
                const v = parseInt(prompt('Số chỗ mới (không nhỏ hơn ' + n + '):', ca.soCho), 10);
                if (isNaN(v)) { return; }
                if (!(v >= Math.max(1, n) && v <= 2000)) { hienToast('Số chỗ không hợp lệ.'); return; }
                ca.soCho = v;
                luuCa(); veCaThi();
                hienToast('Đã cập nhật số chỗ.');
            } else if (nut.dataset.caAct === 'xoa') {
                if (n > 0) { hienToast('Ca này đã có học sinh đăng ký, không thể xóa.'); return; }
                if (!confirm('Xóa ca thi này?')) { return; }
                caThi = caThi.filter(function (c) { return c.id !== ca.id; });
                luuCa(); veCaThi();
                hienToast('Đã xóa ca thi.');
            }
        });

        document.getElementById('ca-dk-body').addEventListener('click', function (e) {
            const nut = e.target.closest('button[data-dk-xoa]');
            if (!nut) { return; }
            if (!confirm('Hủy đăng ký của học sinh này?')) { return; }
            dangKyCa = dangKyCa.filter(function (r) { return r.id !== nut.dataset.dkXoa; });
            luuCa(); veCaThi();
            hienToast('Đã hủy đăng ký.');
        });


        // =====================================================
        //  KHẢO THÍ: THẺ CA THI CHO HỌC SINH
        // =====================================================
        function deCuaCa(ca) { return ca.deId ? (deThi.find(function (d) { return d.id === ca.deId; }) || null) : null; }

        // sapbatdau: chưa đến giờ thi | dangthi: đang trong giờ thi | ketthuc: đã hết giờ
        // sapbatdau: chưa đến ngày thi | ngaythi: đã đến ngày thi, chưa đến giờ | dangthi: đang trong giờ thi | ketthuc: đã hết giờ
        function trangThaiCa(ca) {
            const bd = new Date(ca.gio).getTime();
            const de = deCuaCa(ca);
            const ketThuc = bd + ((de ? de.phut : 60) + 15) * 60000;
            const dau = new Date(ca.gio); dau.setHours(0, 0, 0, 0);
            if (Date.now() >= ketThuc) { return 'ketthuc'; }
            if (Date.now() >= bd) { return 'dangthi'; }
            if (Date.now() >= dau.getTime()) { return 'ngaythi'; }
            return 'sapbatdau';
        }

        function conLaiTxt(ms) {
            const s = Math.max(0, Math.floor(ms / 1000));
            const ng = Math.floor(s / 86400), g = Math.floor((s % 86400) / 3600), p = Math.floor((s % 3600) / 60);
            if (ng > 0) { return 'Còn ' + ng + ' ngày ' + g + ' giờ'; }
            if (g > 0) { return 'Còn ' + g + ' giờ ' + p + ' phút'; }
            return 'Còn ' + p + ' phút';
        }

        function veKhaoThi() {
            const luoi = document.getElementById('ex-grid');
            if (!luoi) { return; }
            // Ca mới tạo lên trước; ca cũ không có thời điểm tạo thì xếp sau, theo giờ thi
            const ds = caThi.slice().sort(function (a, b) {
                const ta = a.taoLuc || '', tb = b.taoLuc || '';
                if (ta !== tb) { return ta < tb ? 1 : -1; }
                return a.gio < b.gio ? -1 : 1;
            });
            if (ds.length === 0) { luoi.innerHTML = '<p class="empty-row">Chưa có ca thi nào. Admin tạo ca thi để hiện ở đây.</p>'; return; }

            luoi.innerHTML = ds.map(function (ca) {
                const dot = dotThi.find(function (d) { return d.id === ca.dotId; });
                if (!dot) { return ''; }
                if (anKetThuc && trangThaiCa(ca) === 'ketthuc') { return ''; }
                const de = deCuaCa(ca);
                const dk = nguoiDung ? dangKyCuaHocSinh(dot.id, nguoiDung.email) : null;
                const soCon = ca.soCho - soDaDangKyCa(ca.id);
                const tt = trangThaiCa(ca);
                let nut = '', ghiChu = '';

                if (dk && dk.caId === ca.id) {
                    if (tt === 'sapbatdau') {
                        nut = '<button class="btn-soon" disabled>Sắp bắt đầu</button>';
                        ghiChu = '<div class="ex-note">' + conLaiTxt(new Date(ca.gio).getTime() - Date.now()) + '</div>';
                    } else if (tt === 'ketthuc') {
                        nut = '<button class="btn-off" disabled>Đã kết thúc</button>';
                    } else {
                        nut = de ? '<button class="btn-now" data-vao="' + thoat(ca.id) + '">Vào làm bài</button>'
                                 : '<button class="btn-off" disabled>Chưa gắn đề</button>';
                    }
                } else if (dk) {
                    nut = '<button class="btn-off" disabled>Đã đăng ký ca khác</button>';
                } else if (tt !== 'sapbatdau') {
                    nut = '<button class="btn-off" disabled>Đã bắt đầu</button>';
                } else if (!dotDangMo(dot)) {
                    nut = '<button class="btn-off" disabled>Đã hết hạn</button>';
                } else if (soCon <= 0) {
                    nut = '<button class="btn-off" disabled>Hết chỗ</button>';
                } else {
                    nut = '<button class="btn-link" data-mo-dk="1">Đăng ký</button>';
                }

                const xemKq = de ? '<a href="#" class="link" data-kq="' + thoat(de.id) + '">Xem kết quả</a>' : '';
                const thoiGianDK = (dot.dangKyTu ? gioNgan(dot.dangKyTu) : 'Mở ngay') + ' - ' + gioNgan(dot.hanDangKy);

                return '<div class="ex-card">' +
                    '<div class="ex-head">' + thoat(dot.ten) + '</div>' +
                    '<div class="ex-body">' +
                        '<div class="ex-row"><span>Hình thức thi</span><b><span class="tag tag-red">Thi tại địa điểm thi</span></b></div>' +
                        '<div class="ex-row"><span>Thời gian đăng ký</span><b>' + thoat(thoiGianDK) + '</b></div>' +
                        '<div class="ex-row"><span>Lệ phí</span><b>' + thoat(dot.lePhi || 'Miễn phí') + '</b></div>' +
                        '<div class="ex-row"><span>Thời gian thi</span><b>' + gioNgan(ca.gio) + '</b></div>' +
                        '<div class="ex-row"><span>Phòng thi</span><b>' + thoat(ca.phong) + '</b></div>' +
                        '<div class="ex-row"><span>Đề thi</span><b>' + thoat(de ? de.ten + ' (' + de.phut + ' phút)' : 'Chưa gắn đề') + '</b></div>' +
                        '<div class="ex-row"><span>Chỗ còn lại</span><b>' + Math.max(0, soCon) + ' / ' + ca.soCho + '</b></div>' +
                    '</div>' +
                    '<div class="ex-foot"><div>' + xemKq + '</div><div style="text-align:right">' + nut + ghiChu + '</div></div>' +
                '</div>';
            }).join('');
        }

        function moKetQuaDe(deId) {
            const de = deThi.find(function (d) { return d.id === deId; });
            const ds = ketQua.filter(function (k) { return nguoiDung && k.email === nguoiDung.email && k.deId === deId; })
                             .sort(function (a, b) { return a.ngay < b.ngay ? 1 : -1; });
            let noi = '<h3>Kết quả: ' + thoat(de ? de.ten : '') + '</h3>';
            if (ds.length === 0) { noi += '<p class="empty-row">Bạn chưa làm đề này.</p>'; }
            ds.forEach(function (k) {
                noi += '<div class="ca-row"><div><b>' + k.diem + ' / 10</b><br><small>' + k.dung + ' / ' + k.tong + ' câu · ' +
                       giayThanhChu(k.giay) + '</small></div><div>' + ngayGio(k.ngay) + '</div></div>';
            });
            noi += '<div class="dialog-actions"><button class="btn-sec" id="kqd-dong">Đóng</button></div>';
            moDialog(noi, false);
            document.getElementById('kqd-dong').addEventListener('click', dongDialog);
        }

        document.getElementById('ex-grid').addEventListener('click', function (e) {
            const vao = e.target.closest('button[data-vao]');
            if (vao) {
                const ca = caThi.find(function (c) { return c.id === vao.dataset.vao; });
                const de = ca ? deCuaCa(ca) : null;
                if (!ca || !de) { return; }
                if (Date.now() < new Date(ca.gio).getTime()) {
                    hienToast('Chưa đến giờ thi. Ca bắt đầu lúc ' + gioNgan(ca.gio));
                    return;
                }
                batDauLamBai(de.id);
                return;
            }
            const dk = e.target.closest('button[data-mo-dk]');
            if (dk) { moDangKyCa(); return; }
            const kq = e.target.closest('a[data-kq]');
            if (kq) { e.preventDefault(); moKetQuaDe(kq.dataset.kq); }
        });

        // Tự cập nhật trạng thái mỗi 15 giây khi đang ở trang Khảo thí
        setInterval(function () {
            const c = document.querySelector('.container');
            if (c && c.classList.contains('exams-mode')) { veKhaoThi(); }
        }, 15000);

        // =====================================================
        //  KHỞI ĐỘNG
        // =====================================================
        // Phiên đăng nhập cũ phải còn tài khoản hợp lệ (chưa bị xóa hoặc khóa)
        if (nguoiDung) {
            const tk = timTaiKhoan(nguoiDung.email);
            if (!tk || tk.khoa) {
                nguoiDung = null;
                xoaKho('localStorage', KHO_PHIEN);
                xoaKho('sessionStorage', KHO_PHIEN);
            } else {
                nguoiDung.ten = tk.ten;
            }
        }
        capNhatGiaoDien();
        showPage(nguoiDung ? 'home' : 'login');
    