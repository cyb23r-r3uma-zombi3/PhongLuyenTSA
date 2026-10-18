
        // =====================================================
        //  BÀI VIẾT CỘNG ĐỒNG DÙNG CHUNG QUA MÁY CHỦ
        //  Ai đăng bài (người có quyền đăng) thì mọi người vào web đều thấy.
        // =====================================================
        const KHOA_SNAP_BV = 'skyedu-bv-snap';
        let snapBV = (function () {
            try { return new Map(JSON.parse(localStorage.getItem(KHOA_SNAP_BV) || '[]')); } catch (e) { return new Map(); }
        })();
        let dangKeoBV = false;
        let hangBV = null;

        function luuSnapBV() {
            try { localStorage.setItem(KHOA_SNAP_BV, JSON.stringify(Array.from(snapBV.entries()))); } catch (e) {}
        }

        // Gửi bài mới / bài sửa / bài xóa lên máy chủ
        async function dayBaiVietLenMayChu() {
            if (!mayChuBat() || dangKeoBV) { return; }
            const hienTai = new Map(baiViet.map(function (b) { return [b.id, JSON.stringify(b)]; }));
            const viec = [];
            hienTai.forEach(function (chuoi, id) {
                if (snapBV.get(id) !== chuoi) {
                    const b = baiViet.find(function (x) { return x.id === id; });
                    viec.push(fetch(MAY_CHU_TAI_KHOAN + '/api/bai-viet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }));
                }
            });
            snapBV.forEach(function (chuoi, id) {
                if (!hienTai.has(id)) { viec.push(fetch(MAY_CHU_TAI_KHOAN + '/api/bai-viet/' + encodeURIComponent(id), { method: 'DELETE' })); }
            });
            try {
                await Promise.all(viec);
                snapBV = hienTai;
                luuSnapBV();
            } catch (e) { /* mất mạng: lần sau đẩy lại */ }
        }

        // Nhận bài viết mới nhất từ máy chủ
        async function keoBaiVietTuMayChu() {
            if (!mayChuBat()) { return false; }
            let ds;
            try {
                const r = await fetch(MAY_CHU_TAI_KHOAN + '/api/bai-viet');
                if (!r.ok) { return false; }
                ds = await r.json();
            } catch (e) { return false; }
            const server = new Map(ds.map(function (b) { return [b.id, b]; }));
            let doi = false;
            dangKeoBV = true;
            try {
                server.forEach(function (b, id) {
                    const i = baiViet.findIndex(function (x) { return x.id === id; });
                    const cs = JSON.stringify(b);
                    if (i < 0) { baiViet.push(b); doi = true; snapBV.set(id, cs); return; }
                    const local = JSON.stringify(baiViet[i]);
                    if (snapBV.has(id) && local !== snapBV.get(id)) { return; }   // máy này đang sửa dở
                    if (local !== cs) { baiViet[i] = b; doi = true; }
                    snapBV.set(id, cs);
                });
                Array.from(snapBV.keys()).forEach(function (id) {
                    if (!server.has(id)) {
                        const i = baiViet.findIndex(function (x) { return x.id === id; });
                        if (i >= 0) { baiViet.splice(i, 1); doi = true; }
                        snapBV.delete(id);
                    }
                });
                baiViet.sort(function (a, b) { return (a.thoiGian || '') < (b.thoiGian || '') ? 1 : -1; });
                if (doi) { ghiKho('localStorage', KHO_BV, baiViet); }
                luuSnapBV();
            } finally { dangKeoBV = false; }
            if (doi && typeof veBaiViet === 'function') { try { veBaiViet(); } catch (e) {} }
            return doi;
        }

        // Mỗi lần lưu bài viết trên máy này thì đẩy lên máy chủ
        const ghiKhoTruocBV = ghiKho;
        ghiKho = function (loai, khoa, gia) {
            ghiKhoTruocBV(loai, khoa, gia);
            if (khoa === KHO_BV && mayChuBat() && !dangKeoBV) {
                clearTimeout(hangBV);
                hangBV = setTimeout(dayBaiVietLenMayChu, 300);
            }
        };

        // Lấy bài mới khi mở trang, khi vào mục Cộng đồng, và định kỳ
        window.addEventListener('load', function () { keoBaiVietTuMayChu(); });
        document.addEventListener('click', function (e) {
            if (e.target.closest('.tab[data-tab="community"]')) { keoBaiVietTuMayChu(); }
        }, true);
        setInterval(function () { if (nguoiDung) { keoBaiVietTuMayChu(); } }, 15000);
    