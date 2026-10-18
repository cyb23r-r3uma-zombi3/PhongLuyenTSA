
        // ===== Menu tài khoản (góc phải) =====
        const userMenu = document.getElementById('user-menu');
        const dialog = document.getElementById('dialog');
        const dialogBody = document.getElementById('dialog-body');
        const toast = document.getElementById('toast');

        // Bấm vào avatar: mở / đóng menu thả xuống
        document.getElementById('user-trigger').addEventListener('click', function (e) {
            e.stopPropagation();                 // không cho click lan ra ngoài
            userMenu.classList.toggle('open');
        });
        // Bấm ra ngoài thì đóng menu
        document.addEventListener('click', function (e) {
            if (!userMenu.contains(e.target)) { userMenu.classList.remove('open'); }
        });

        // --- Hộp thoại dùng chung ---
        function moDialog(noiDung) {
            dialogBody.innerHTML = noiDung;
            dialog.classList.add('open');
        }
        function dongDialog() { dialog.classList.remove('open'); }

        document.getElementById('dialog-close').addEventListener('click', function () { dongDialog(); });
        dialog.addEventListener('click', function (e) { if (e.target === dialog) { dongDialog(); } });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { dongDialog(); userMenu.classList.remove('open'); }
        });

        // --- Thông báo nhỏ tự biến mất sau 2,5 giây ---
        let henGio;
        function hienToast(chu) {
            toast.textContent = chu;
            toast.classList.add('show');
            clearTimeout(henGio);
            henGio = setTimeout(function () { toast.classList.remove('show'); }, 2500);
        }

        // --- Cá nhân ---
        function moCaNhan() {
            moDialog(
                '<div class="profile-head"><img src="' + logoUrl + '" alt="">' +
                '<div><h3>' + thoat(nguoiDung ? nguoiDung.ten : '') + '</h3><div class="profile-mail">' + thoat(nguoiDung ? nguoiDung.email : '') + '</div></div></div>' +
                '<div class="profile-stat">📚 Số khóa đã đăng ký: <b>' + daDangKy.size + '</b></div>' +
                '<div class="dialog-actions">' +
                '<button class="btn-sec" id="d-dong">Đóng</button>' +
                '<button class="btn-link" id="d-lich">Xem lịch học</button></div>'
            );
            document.getElementById('d-dong').addEventListener('click', dongDialog);
            document.getElementById('d-lich').addEventListener('click', function () {
                dongDialog();
                showPage('schedule');
            });
        }

        // --- Đăng xuất ---
        function moDangXuat() {
            moDialog(
                '<h3>Đăng xuất</h3><p class="modal-sub">Bạn có chắc muốn đăng xuất khỏi tài khoản?</p>' +
                '<div class="dialog-actions">' +
                '<button class="btn-sec" id="d-o-lai">Ở lại</button>' +
                '<button class="btn-danger" id="d-dang-xuat">Đăng xuất</button></div>'
            );
            document.getElementById('d-o-lai').addEventListener('click', dongDialog);
            document.getElementById('d-dang-xuat').addEventListener('click', function () {
                dongDialog();
                showPage('home');
                dangXuat();
                hienToast('Đã đăng xuất. Hẹn gặp lại bạn! 👋');
            });
        }

        // --- Mã truy cập ---
        function moMaTruyCap() {
            moDialog(
                '<h3>Nhập mã truy cập</h3><p class="modal-sub">Nhập mã để mở khóa học hoặc phòng luyện của bạn</p>' +
                '<input class="code-input" id="code-input" placeholder="Ví dụ: SKY-1234">' +
                '<p class="modal-note" id="code-note"></p>' +
                '<div class="dialog-actions">' +
                '<button class="btn-sec" id="d-huy">Hủy</button>' +
                '<button class="btn-link" id="d-xac-nhan">Xác nhận</button></div>'
            );
            const o = document.getElementById('code-input');
            const ghiChu = document.getElementById('code-note');
            ghiChu.style.color = '#d93025';
            o.focus();

            document.getElementById('d-huy').addEventListener('click', dongDialog);
            document.getElementById('d-xac-nhan').addEventListener('click', function () {
                if (o.value.trim() === '') {
                    ghiChu.textContent = 'Vui lòng nhập mã truy cập.';
                } else {
                    ghiChu.textContent = 'Mã không hợp lệ hoặc đã hết hạn (đây là bản demo).';
                }
            });
        }

        // --- Gắn sự kiện cho các nút ---
        document.getElementById('menu-profile').addEventListener('click', function (e) {
            e.preventDefault();
            userMenu.classList.remove('open');
            moCaNhan();
        });
        document.getElementById('menu-logout').addEventListener('click', function (e) {
            e.preventDefault();
            userMenu.classList.remove('open');
            moDangXuat();
        });
        document.getElementById('nav-access').addEventListener('click', moMaTruyCap);
        document.querySelector('.btn-row .btn').addEventListener('click', moMaTruyCap);
    