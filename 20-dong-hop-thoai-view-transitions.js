
    /* ===== SKY EDU — Bổ trợ chuyển động: đóng hộp thoại mượt + View Transitions ===== */
    (function () {
        var giamChuyenDong = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (giamChuyenDong) { return; }

        /* 1) Hộp thoại / overlay: khi class "open"/"on" bị gỡ, giữ lại màn hình
              thêm một nhịp để chạy animation đóng (sky-out) rồi mới ẩn hẳn. */
        var THOI_GIAN_DONG = 230;
        function mocHoatDong(el, tenLop) {
            if (!el) { return; }
            var henDong = null;
            new MutationObserver(function (danhSach) {
                danhSach.forEach(function (m) {
                    if (m.attributeName !== 'class') { return; }
                    if (el.classList.contains(tenLop)) {
                        clearTimeout(henDong);
                        /* Chỉ gỡ class khi thật sự có: gọi remove() khi không có vẫn là một thay đổi,
                           khiến MutationObserver này tự kích hoạt lại mãi => trình duyệt bị đơ. */
                        if (el.classList.contains('sky-out')) { el.classList.remove('sky-out'); }
                        if (el.style.display) { el.style.display = ''; }
                        return;
                    }
                    var cu = ' ' + (m.oldValue || '') + ' ';
                    if (cu.indexOf(' ' + tenLop + ' ') === -1 || el.classList.contains('sky-out')) { return; }
                    el.classList.add('sky-out');
                    el.style.display = 'flex';
                    clearTimeout(henDong);
                    henDong = setTimeout(function () {
                        /* Chỉ gỡ class khi thật sự có: gọi remove() khi không có vẫn là một thay đổi,
                           khiến MutationObserver này tự kích hoạt lại mãi => trình duyệt bị đơ. */
                        if (el.classList.contains('sky-out')) { el.classList.remove('sky-out'); }
                        if (el.style.display) { el.style.display = ''; }
                    }, THOI_GIAN_DONG);
                });
            }).observe(el, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
        }
        mocHoatDong(document.getElementById('dialog'), 'open');
        mocHoatDong(document.getElementById('lab'), 'open');
        ['l-mode', 'l-hist', 'l-splash', 'l-conf', 'l-exam', 'l-res'].forEach(function (id) {
            mocHoatDong(document.getElementById(id), 'on');
        });

        /* 2) Ghi chú: không bọc showPage bằng View Transitions API nữa —
              một số webview nhúng xử lý startViewTransition kém, gây đơ/crash
              trình duyệt (đã gặp thực tế). Hiệu ứng vào trang do CSS lo. */
    })();
