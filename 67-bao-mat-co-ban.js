
        // =====================================================
        //  BẢO MẬT CƠ BẢN (chạy trong trình duyệt):
        //  1) Khóa tạm đăng nhập sau nhiều lần nhập sai
        //  2) Tự đăng xuất sau một khoảng thời gian không dùng
        // =====================================================
        const KHO_KHOA = 'skyedu-khoa-dang-nhap';
        const SO_LAN_SAI_TOI_DA = 5;
        const THOI_GIAN_KHOA_PHUT = 5;
        const THOI_GIAN_NGHI_PHUT = 15;

        function docKhoaDN() {
            try { return JSON.parse(localStorage.getItem(KHO_KHOA) || '{}'); } catch (e) { return {}; }
        }
        function ghiKhoaDN(o) {
            try { localStorage.setItem(KHO_KHOA, JSON.stringify(o)); } catch (e) {}
        }

        // Chặn đăng nhập khi tài khoản đang bị khóa; ghi nhận lần sai
        (function () {
            const nut = document.querySelector('#form-login .auth-submit');
            const o = document.getElementById('login-email');
            if (!nut || !o) { return; }
            nut.addEventListener('click', function (e) {
                const email = (o.value || '').trim().toLowerCase();
                if (!email) { return; }
                const k = docKhoaDN()[email] || { sai: 0, khoaDen: 0 };
                if (k.khoaDen && Date.now() < k.khoaDen) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    const con = Math.ceil((k.khoaDen - Date.now()) / 60000);
                    hienToast('Tài khoản tạm khóa do nhập sai nhiều lần. Thử lại sau ' + con + ' phút.');
                    return;
                }
                // Sau khi xử lý đăng nhập, nếu vẫn chưa vào được thì tính là một lần sai
                setTimeout(function () {
                    if (typeof nguoiDung !== 'undefined' && nguoiDung) {
                        const d = docKhoaDN(); delete d[email]; ghiKhoaDN(d);
                        return;
                    }
                    const d = docKhoaDN();
                    const cur = d[email] || { sai: 0, khoaDen: 0 };
                    cur.sai = (cur.sai || 0) + 1;
                    if (cur.sai >= SO_LAN_SAI_TOI_DA) {
                        cur.khoaDen = Date.now() + THOI_GIAN_KHOA_PHUT * 60000;
                        cur.sai = 0;
                        hienToast('Nhập sai nhiều lần. Tài khoản bị khóa ' + THOI_GIAN_KHOA_PHUT + ' phút.');
                    }
                    d[email] = cur; ghiKhoaDN(d);
                }, 400);
            }, true);
        })();

        // Tự đăng xuất khi không thao tác trong một thời gian
        (function () {
            let hen = null;
            function datLai() {
                if (hen) { clearTimeout(hen); hen = null; }
                if (typeof nguoiDung === 'undefined' || !nguoiDung) { return; }
                hen = setTimeout(function () {
                    if (typeof nguoiDung !== 'undefined' && nguoiDung) {
                        dangXuat();
                        hienToast('Đã tự đăng xuất do không hoạt động.');
                    }
                }, THOI_GIAN_NGHI_PHUT * 60000);
            }
            ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(function (s) {
                document.addEventListener(s, datLai, { passive: true });
            });
            setInterval(datLai, 30000);
            datLai();
        })();
    