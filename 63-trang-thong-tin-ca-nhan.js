
        // =====================================================
        //  TRANG THÔNG TIN CÁ NHÂN (theo mẫu): cột trái menu, cột phải thông tin và nút chỉnh sửa
        // =====================================================
        function veHoSo() {
            const box = document.getElementById('tk-box');
            if (!box || !nguoiDung) { return; }
            const tk = timTaiKhoan(nguoiDung.email) || nguoiDung;
            const chu = (tk.ten || '?').trim().charAt(0).toUpperCase();
            const anh = tk.anh ? 'background-image:url(\'' + tk.anh + '\')' : '';
            const dong = function (nhan, gia) {
                return '<div class="pf-row"><span>' + nhan + '</span><b>' + (gia ? thoat(gia) : '<i class="pf-trong">Chưa cập nhật</i>') + '</b></div>';
            };
            box.setAttribute('style', 'max-width:none;padding:0;background:transparent;box-shadow:none;border:0');
            box.innerHTML =
                '<div class="pf-wrap">' +
                  '<aside class="pf-left">' +
                    '<div class="pf-avatar pf-ava-big' + (tk.anh ? ' co-anh' : '') + '" style="' + anh + '">' + (tk.anh ? '' : thoat(chu)) + '</div>' +
                    '<h3 class="pf-name">' + thoat(tk.ten || '') + '</h3>' +
                    '<p class="pf-mail">' + thoat(tk.email || '') + '</p>' +
                    '<nav class="pf-menu">' +
                      '<button class="pf-item on" data-pf="tt"><span>🪪</span>Thông tin cá nhân<i>›</i></button>' +
                      '<button class="pf-item" data-pf="kh"><span>🎓</span>Khóa học của tôi<i>›</i></button>' +
                      '<button class="pf-item" data-pf="mk"><span>🔒</span>Đổi mật khẩu<i>›</i></button>' +
                      '<button class="pf-item" data-pf="sach"><span>📖</span>Sách đã mua<i>›</i></button>' +
                      '<button class="pf-item" data-pf="don"><span>🛒</span>Đơn sách &amp; Giỏ hàng<i>›</i></button>' +
                      '<button class="pf-item" data-pf="ls"><span>↺</span>Lịch sử làm bài<i>›</i></button>' +
                    '</nav>' +
                    '<button class="pf-logout" data-pf="out">⇥ Đăng xuất</button>' +
                  '</aside>' +
                  '<section class="pf-right">' +
                    '<h2 class="pf-title">Thông tin cá nhân</h2>' +
                    '<div class="pf-top">' +
                      '<div class="pf-avatar pf-ava-mid' + (tk.anh ? ' co-anh' : '') + '" style="' + anh + '">' +
                        (tk.anh ? '' : thoat(chu)) +
                        '<label class="pf-cam" title="Đổi ảnh đại diện">📷<input type="file" accept="image/*" id="pf-anh" hidden></label></div>' +
                      '<div class="pf-actions">' +
                        '<button class="pf-btn-do" data-pf="sua">Chỉnh sửa thông tin</button>' +
                        '<button class="pf-btn-trang" data-pf="mk">Thay đổi mật khẩu</button>' +
                        '<div class="pf-sub"><label class="pf-link" for="pf-anh">⬆ Đổi ảnh đại diện</label>' +
                        (tk.anh ? '<button class="pf-link" data-pf="xoaanh">🗑 Xóa ảnh</button>' : '') + '</div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="pf-rows">' +
                      dong('Họ và tên', tk.ten) +
                      dong('Tài khoản', (tk.email || '').split('@')[0]) +
                      dong('Email', tk.email) +
                      dong('Giới tính', tk.gioiTinh) +
                      dong('Ngày sinh', tk.ngaySinh ? new Date(tk.ngaySinh).toLocaleDateString('vi-VN') : '') +
                      dong('Số điện thoại', tk.sdt) +
                      dong('Lớp', tk.lop) +
                      dong('Trường học', tk.truong) +
                      dong('Tỉnh / Thành phố', tk.tinh) +
                      dong('Ghi chú', tk.ghiChu) +
                    '</div>' +
                  '</section>' +
                '</div>';
            gan();
        }

        function gan() {
            const box = document.getElementById('tk-box');
            box.querySelectorAll('[data-pf]').forEach(function (b) {
                b.addEventListener('click', function () {
                    const k = b.dataset.pf;
                    if (k === 'sua') { moSuaHoSo(); }
                    else if (k === 'mk') { moDoiMatKhau(); }
                    else if (k === 'out') { dangXuat(); }
                    else if (k === 'xoaanh') {
                        const tk = timTaiKhoan(nguoiDung.email); if (!tk) { return; }
                        delete tk.anh; luuTaiKhoan(); veHoSo(); hienToast('Đã xóa ảnh đại diện.');
                    }
                    else if (k === 'kh') { moKhoaCuaToi(); }
                    else if (k === 'sach') { moTrongDon('Sách đã mua', 'Bạn chưa mua sách nào.'); }
                    else if (k === 'don') { moTrongDon('Đơn sách & Giỏ hàng', 'Giỏ hàng đang trống.'); }
                    else if (k === 'ls') { hienToast('Mở mục Lịch sử làm bài ở menu bên trái.'); }
                    else if (k === 'tt') { hienToast('Bạn đang xem thông tin cá nhân.'); }
                });
            });
            const anh = document.getElementById('pf-anh');
            if (anh) {
                anh.addEventListener('change', async function () {
                    const f = this.files[0]; if (!f) { return; }
                    try {
                        const tk = timTaiKhoan(nguoiDung.email); if (!tk) { return; }
                        tk.anh = await thuNhoAnhDaiDien(f);
                        luuTaiKhoan(); veHoSo(); hienToast('Đã cập nhật ảnh đại diện ✔');
                    } catch (e) { hienToast('Không đọc được ảnh. Thử ảnh khác.'); }
                });
            }
        }

        function moSuaHoSo() {
            const tk = timTaiKhoan(nguoiDung.email); if (!tk) { return; }
            moDialog(
                '<h3>Chỉnh sửa thông tin</h3>' +
                '<div class="field"><label for="pf-ten">Họ và tên</label><input id="pf-ten" value="' + thoat(tk.ten || '') + '"></div>' +
                '<div class="form-2col"><div class="field"><label for="pf-gt">Giới tính</label><select id="pf-gt"><option value="">-- Chọn --</option><option' + (tk.gioiTinh === 'Nam' ? ' selected' : '') + '>Nam</option><option' + (tk.gioiTinh === 'Nữ' ? ' selected' : '') + '>Nữ</option><option' + (tk.gioiTinh === 'Khác' ? ' selected' : '') + '>Khác</option></select></div>' +
                '<div class="field"><label for="pf-ns">Ngày sinh</label><input id="pf-ns" type="date" value="' + thoat(tk.ngaySinh || '') + '"></div></div>' +
                '<div class="form-2col"><div class="field"><label for="pf-sdt">Số điện thoại</label><input id="pf-sdt" value="' + thoat(tk.sdt || '') + '"></div>' +
                '<div class="field"><label for="pf-lop">Lớp</label><input id="pf-lop" value="' + thoat(tk.lop || '') + '"></div></div>' +
                '<div class="field"><label for="pf-truong">Trường học</label><input id="pf-truong" value="' + thoat(tk.truong || '') + '"></div>' +
                '<div class="field"><label for="pf-tinh">Tỉnh / Thành phố</label><input id="pf-tinh" value="' + thoat(tk.tinh || '') + '"></div>' +
                '<div class="field"><label for="pf-gc">Ghi chú</label><input id="pf-gc" value="' + thoat(tk.ghiChu || '') + '"></div>' +
                '<div class="form-error" id="pf-loi"></div>' +
                '<div class="dialog-actions"><button class="btn-sec" id="pf-huy">Hủy</button><button class="btn-link" id="pf-luu">Lưu</button></div>'
            );
            document.getElementById('pf-huy').addEventListener('click', dongDialog);
            document.getElementById('pf-luu').addEventListener('click', function () {
                const ten = document.getElementById('pf-ten').value.trim();
                if (ten === '') { baoLoi(document.getElementById('pf-loi'), 'Vui lòng nhập họ và tên.'); return; }
                tk.ten = ten;
                tk.sdt = document.getElementById('pf-sdt').value.trim();
                tk.gioiTinh = document.getElementById('pf-gt').value;
                tk.ngaySinh = document.getElementById('pf-ns').value;
                tk.lop = document.getElementById('pf-lop').value.trim();
                tk.truong = document.getElementById('pf-truong').value.trim();
                tk.tinh = document.getElementById('pf-tinh').value.trim();
                tk.ghiChu = document.getElementById('pf-gc').value.trim();
                nguoiDung.ten = ten;
                luuTaiKhoan();
                dongDialog(); veHoSo();
                hienToast('Đã lưu thông tin cá nhân ✔');
            });
        }

        function moKhoaCuaToi() {
            const ds = (typeof daDangKy !== 'undefined') ? Array.from(daDangKy) : [];
            const noi = ds.length === 0
                ? '<p class="empty-row">Bạn chưa có khóa học nào. Nhập mã truy cập hoặc đăng ký khóa học để bắt đầu.</p>'
                : '<div class="pf-khoa">' + ds.map(function (t) { return '<div class="pf-khoa-i">🎓 ' + thoat(t) + '</div>'; }).join('') + '</div>';
            moDialog('<h3>Khóa học của tôi</h3>' + noi + '<div class="dialog-actions"><button class="btn-sec" id="kh-dong">Đóng</button></div>');
            document.getElementById('kh-dong').addEventListener('click', dongDialog);
        }
        function moTrongDon(tieu, thongBao) {
            moDialog('<h3>' + thoat(tieu) + '</h3><p class="empty-row">' + thoat(thongBao) + '</p><div class="dialog-actions"><button class="btn-sec" id="mt-dong">Đóng</button></div>');
            document.getElementById('mt-dong').addEventListener('click', dongDialog);
        }

        function moDoiMatKhau() {
            const tk = timTaiKhoan(nguoiDung.email); if (!tk) { return; }
            moDialog(
                '<h3>Thay đổi mật khẩu</h3>' +
                '<div class="field"><label for="mk-cu">Mật khẩu hiện tại</label><input id="mk-cu" type="password"></div>' +
                '<div class="field"><label for="mk-moi">Mật khẩu mới (tối thiểu 6 ký tự)</label><input id="mk-moi" type="password"></div>' +
                '<div class="field"><label for="mk-nl">Nhập lại mật khẩu mới</label><input id="mk-nl" type="password"></div>' +
                '<div class="form-error" id="mk-loi"></div>' +
                '<div class="dialog-actions"><button class="btn-sec" id="mk-huy">Hủy</button><button class="btn-link" id="mk-luu">Đổi mật khẩu</button></div>'
            );
            document.getElementById('mk-huy').addEventListener('click', dongDialog);
            document.getElementById('mk-luu').addEventListener('click', function () {
                const cu = document.getElementById('mk-cu').value, moi = document.getElementById('mk-moi').value, nl = document.getElementById('mk-nl').value;
                const loi = document.getElementById('mk-loi');
                if (cu !== tk.matKhau) { baoLoi(loi, 'Mật khẩu hiện tại không đúng.'); return; }
                if (moi.length < 6) { baoLoi(loi, 'Mật khẩu mới cần ít nhất 6 ký tự.'); return; }
                if (moi !== nl) { baoLoi(loi, 'Hai lần nhập mật khẩu mới chưa khớp.'); return; }
                tk.matKhau = moi;
                luuTaiKhoan();
                dongDialog();
                hienToast('Đã đổi mật khẩu ✔');
            });
        }

        // Khi mở mục Tài khoản trong trang luyện đề thì vẽ trang thông tin cá nhân
        document.querySelectorAll('.l-nav a[data-v="tk"]').forEach(function (a) {
            a.addEventListener('click', function () { setTimeout(veHoSo, 0); });
        });
    