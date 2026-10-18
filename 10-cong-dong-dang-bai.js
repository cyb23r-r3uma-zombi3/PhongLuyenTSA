
        // ===== CỘNG ĐỒNG: ĐĂNG BÀI VIẾT (lưu trong trình duyệt) =====
        const KHO_BV = 'skyedu-bai-viet';    // danh sách bài viết thành viên đăng

        let baiViet = docKho('localStorage', KHO_BV);
        if (!Array.isArray(baiViet)) { baiViet = []; }
        function luuBaiViet() { ghiKho('localStorage', KHO_BV, baiViet); }
        function taoIdBai() { return 'bv' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

        const khungBai = document.getElementById('post-feed');
        let anhDinhKem = null;               // ảnh đang đính kèm trong khung soạn

        // Chữ thời gian kiểu "x phút trước"
        function thoiGianChu(iso) {
            const s = (Date.now() - new Date(iso).getTime()) / 1000;
            if (s < 60) { return '· Vừa xong'; }
            if (s < 3600) { return '· ' + Math.floor(s / 60) + ' phút trước'; }
            if (s < 86400) { return '· ' + Math.floor(s / 3600) + ' giờ trước'; }
            const d = new Date(iso);
            return '· ' + d.getDate() + ' tháng ' + (d.getMonth() + 1) + ' năm ' + d.getFullYear();
        }

        // Màu đại diện riêng cho mỗi tài khoản (lấy từ email)
        function lopMau(email) {
            let t = 0;
            for (let i = 0; i < String(email).length; i++) { t = (t + String(email).charCodeAt(i)) % 5; }
            return t;
        }

        // Được đăng bài, bình luận, chia sẻ: quản trị viên hoặc học sinh được cấp quyền đăng bài
        function canDang(email) {
            if (!email) { return false; }
            const tk = timTaiKhoan(email);
            if (tk && tk.vaiTro === 'admin') { return true; }
            return !!tk && tk.quyenDang === true;
        }

        // Cập nhật khung soạn theo người đang đăng nhập
        function capNhatKhungSoan() {
            const av = document.getElementById('composer-avatar');
            const o = document.getElementById('composer-open');
            if (nguoiDung) {
                av.textContent = (nguoiDung.ten || '?').trim().charAt(0).toUpperCase();
                av.className = 'composer-avatar uav-' + lopMau(nguoiDung.email);
                o.textContent = canDang(nguoiDung.email) ? 'Bạn đang nghĩ gì, ' + nguoiDung.ten + '?' : 'Chỉ học sinh được cấp quyền mới đăng bài';
            } else {
                av.textContent = '?';
                av.className = 'composer-avatar';
                o.textContent = 'Đăng nhập để đăng bài viết';
            }
        }

        // Thu nhỏ ảnh trước khi lưu để không đầy bộ nhớ trình duyệt
        function thuNhoAnh(file, xong) {
            const boDoc = new FileReader();
            boDoc.onload = function () {
                const img = new Image();
                img.onload = function () {
                    const max = 900;
                    let w = img.width, h = img.height;
                    if (w > max || h > max) { const t = Math.min(max / w, max / h); w = Math.round(w * t); h = Math.round(h * t); }
                    const cv = document.createElement('canvas');
                    cv.width = w; cv.height = h;
                    cv.getContext('2d').drawImage(img, 0, 0, w, h);
                    xong(cv.toDataURL('image/jpeg', 0.75));
                };
                img.src = boDoc.result;
            };
            boDoc.readAsDataURL(file);
        }

        // Hộp thoại soạn bài mới
        function moSoanBai() {
            if (!nguoiDung) { hienToast('Vui lòng đăng nhập để đăng bài'); return; }
            if (!canDang(nguoiDung.email)) { hienToast('Bạn chưa được cấp quyền đăng bài.'); return; }
            anhDinhKem = null;
            moDialog(
                '<h3>Tạo bài viết mới</h3>' +
                '<p class="modal-sub">Chia sẻ kết quả học tập, câu hỏi hoặc điều hay với cả lớp nhé!</p>' +
                '<textarea class="bv-textarea" id="bv-noi-dung" maxlength="2000" placeholder="Viết điều bạn muốn chia sẻ..."></textarea>' +
                '<div class="bv-preview" id="bv-preview"><img id="bv-xem-truoc" alt=""><button class="bv-xoa-anh" id="bv-xoa-anh" title="Bỏ ảnh này">✕</button></div>' +
                '<div class="bv-tools"><button class="bv-anh-btn" id="bv-chon-anh">🖼 Thêm ảnh</button>' +
                '<input type="file" id="bv-file" accept="image/*" style="display:none"></div>' +
                '<p class="modal-note" id="bv-loi"></p>' +
                '<div class="dialog-actions"><button class="btn-sec" id="bv-huy">Hủy</button>' +
                '<button class="btn-link" id="bv-dang">Đăng bài</button></div>'
            );

            const o = document.getElementById('bv-noi-dung');
            const loi = document.getElementById('bv-loi');
            const xemTruoc = document.getElementById('bv-preview');
            const file = document.getElementById('bv-file');
            loi.style.color = '#d93025';
            o.focus();

            document.getElementById('bv-chon-anh').addEventListener('click', function () { file.click(); });
            file.addEventListener('change', function () {
                if (file.files && file.files[0]) {
                    thuNhoAnh(file.files[0], function (dataURL) {
                        anhDinhKem = dataURL;
                        document.getElementById('bv-xem-truoc').src = dataURL;
                        xemTruoc.style.display = 'block';
                    });
                }
            });
            document.getElementById('bv-xoa-anh').addEventListener('click', function () {
                anhDinhKem = null;
                file.value = '';
                xemTruoc.style.display = 'none';
            });
            document.getElementById('bv-huy').addEventListener('click', dongDialog);
            document.getElementById('bv-dang').addEventListener('click', function () {
                const noiDung = o.value.trim();
                if (noiDung === '' && !anhDinhKem) {
                    loi.textContent = 'Hãy viết nội dung hoặc thêm một tấm ảnh nhé.';
                    return;
                }
                baiViet.push({
                    id: taoIdBai(),
                    ten: nguoiDung.ten, email: nguoiDung.email, vaiTro: nguoiDung.vaiTro,
                    noiDung: noiDung, anh: anhDinhKem,
                    thoiGian: new Date().toISOString(), thich: 0
                });
                luuBaiViet();
                dongDialog();
                veBaiViet();
                hienToast('Đã đăng bài viết! 🎉');
            });
        }

        // Vẽ các bài viết thành viên đã đăng (bài mới nhất lên đầu)
        function veBaiViet() {
            khungBai.innerHTML = '';
            const sapXep = baiViet.slice().sort(function (a, b) { return new Date(b.thoiGian) - new Date(a.thoiGian); });
            sapXep.forEach(function (bv) {
                const the = document.createElement('div');
                the.className = 'post';
                const duocXoa = nguoiDung && (nguoiDung.email === bv.email || laAdmin());
                the.innerHTML =
                    '<div class="post-head">' +
                    '<span class="user-avatar uav-' + lopMau(bv.email) + '">' + thoat((bv.ten || '?').trim().charAt(0).toUpperCase()) + '</span>' +
                    '<div><span class="post-author">' + thoat(bv.ten) + '</span>' +
                    '<span class="role-chip' + (bv.vaiTro === 'admin' ? ' admin' : '') + '">' + (bv.vaiTro === 'admin' ? 'Quản trị viên' : 'Học viên') + '</span>' +
                    '<span class="post-time">' + thoiGianChu(bv.thoiGian) + '</span></div>' +
                    '</div>' +
                    (bv.noiDung ? '<p class="post-text">' + thoat(bv.noiDung).replace(/\n/g, '<br>') + '</p>' : '') +
                    (bv.anh ? '<img class="post-photo" src="' + bv.anh + '" alt="Ảnh bài viết">' : '') +
                    '<div class="post-actions">' +
                    '<button class="like-btn" data-id="' + bv.id + '">👍 Thích <b>' + (bv.thich || 0) + '</b></button>' +
                    (canDang(nguoiDung && nguoiDung.email) ? '<button class="cmt-btn" data-id="' + bv.id + '">💬 Bình luận <b>' + (bv.binhLuan || []).length + '</b></button>' +
                    '<button class="share-btn" data-id="' + bv.id + '">↗ Chia sẻ</button>' : '') +
                    (duocXoa ? '<button class="bv-xoa" data-id="' + bv.id + '">🗑 Xóa</button>' : '') +
                    '</div>' +
                    '<div class="cmt-box" id="cmt-' + bv.id + '" style="display:none"></div>';
                khungBai.appendChild(the);
            });

            // Nút Thích: tăng / giảm rồi lưu lại
            khungBai.querySelectorAll('.like-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const bv = baiViet.find(function (x) { return x.id === btn.dataset.id; });
                    if (!bv) { return; }
                    const daThich = btn.classList.contains('liked');
                    bv.thich = Math.max(0, (bv.thich || 0) + (daThich ? -1 : 1));
                    btn.classList.toggle('liked', !daThich);
                    btn.querySelector('b').textContent = bv.thich;
                    luuBaiViet();
                });
            });


            // Bình luận: mở khung, xem và thêm bình luận
            khungBai.querySelectorAll('.cmt-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const id = btn.dataset.id;
                    const hop = document.getElementById('cmt-' + id);
                    if (hop.style.display === 'block') { hop.style.display = 'none'; return; }
                    veBinhLuan(id);
                    hop.style.display = 'block';
                });
            });
            // Chia sẻ: sao chép liên kết bài viết
            khungBai.querySelectorAll('.share-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const lien = location.href.split('#')[0] + '#bai-' + btn.dataset.id;
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(lien).then(function () { hienToast('Đã sao chép liên kết bài viết ✔'); },
                            function () { hienToast('Liên kết: ' + lien); });
                    } else { hienToast('Liên kết: ' + lien); }
                });
            });

            // Nút Xóa (chỉ tác giả hoặc quản trị viên mới thấy)
            khungBai.querySelectorAll('.bv-xoa').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const id = btn.dataset.id;
                    moDialog(
                        '<h3>Xóa bài viết</h3><p class="modal-sub">Bạn có chắc muốn xóa bài viết này không?</p>' +
                        '<div class="dialog-actions"><button class="btn-sec" id="bv-giu">Giữ lại</button>' +
                        '<button class="btn-danger" id="bv-xac-nhan-xoa">Xóa</button></div>'
                    );
                    document.getElementById('bv-giu').addEventListener('click', dongDialog);
                    document.getElementById('bv-xac-nhan-xoa').addEventListener('click', function () {
                        baiViet = baiViet.filter(function (x) { return x.id !== id; });
                        luuBaiViet();
                        dongDialog();
                        veBaiViet();
                        hienToast('Đã xóa bài viết');
                    });
                });
            });
        }


        // Vẽ khung bình luận của một bài viết
        function veBinhLuan(id) {
            const bv = baiViet.find(function (x) { return x.id === id; });
            const hop = document.getElementById('cmt-' + id);
            if (!bv || !hop) { return; }
            const ds = (bv.binhLuan || []);
            const coQuyen = canDang(nguoiDung && nguoiDung.email);
            hop.innerHTML =
                (ds.length === 0 ? '<p class="cmt-trong">Chưa có bình luận nào.</p>' : '') +
                ds.map(function (c) {
                    return '<div class="cmt-item"><b>' + thoat(c.ten) + '</b> ' + thoat(c.noi) +
                           '<small> · ' + thoiGianChu(c.thoiGian).replace('· ', '') + '</small></div>';
                }).join('') +
                (coQuyen ? '<div class="cmt-nhap"><input id="cmt-in-' + id + '" placeholder="Viết bình luận..." maxlength="300">' +
                           '<button class="cmt-gui" data-id="' + id + '">Gửi</button></div>' : '');
            const gui = hop.querySelector('.cmt-gui');
            if (gui) {
                gui.addEventListener('click', function () {
                    const o = document.getElementById('cmt-in-' + id);
                    const noi = o.value.trim();
                    if (noi === '') { return; }
                    bv.binhLuan = bv.binhLuan || [];
                    bv.binhLuan.push({ ten: nguoiDung.ten, email: nguoiDung.email, noi: noi, thoiGian: new Date().toISOString() });
                    luuBaiViet();
                    veBinhLuan(id);
                    const cnt = khungBai.querySelector('.cmt-btn[data-id="' + id + '"] b');
                    if (cnt) { cnt.textContent = bv.binhLuan.length; }
                    document.getElementById('cmt-in-' + id).focus();
                });
            }
        }

        // Bấm vào ô nhập hoặc nút Đăng bài để mở khung soạn
        document.getElementById('composer-open').addEventListener('click', moSoanBai);
        document.getElementById('composer-btn').addEventListener('click', moSoanBai);

        // Vẽ lần đầu khi tải trang
        veBaiViet();
        capNhatKhungSoan();

        // Đăng nhập / đăng xuất cũng cập nhật khung soạn và danh sách bài viết
        const _capNhatGiaoDienCu = capNhatGiaoDien;
        capNhatGiaoDien = function () {
            _capNhatGiaoDienCu();
            capNhatKhungSoan();
            veBaiViet();
        };
    