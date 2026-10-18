
        // =====================================================
        //  ĐỒNG BỘ DÙNG CHUNG: đề thi, kết quả, đợt/ca thi, đăng ký ca, mã truy cập
        //  Gộp theo mã từng mục: ai thêm mục nào thì mục đó được giữ lại, không ghi đè nhau.
        // =====================================================
        const BO_DONG_BO = {
            de:  { khoa: 'de',  mang: () => deThi,     luu: () => luuDe() },
            kq:  { khoa: 'kq',  mang: () => ketQua,    luu: () => luuKetQua() },
            dot: { khoa: 'dot', mang: () => dotThi,    luu: () => luuCa() },
            ca:  { khoa: 'ca',  mang: () => caThi,     luu: () => luuCa() },
            dk:  { khoa: 'dk',  mang: () => dangKyCa,  luu: () => luuCa() },
            ma:  { khoa: 'ma',  mang: () => maTruyCap, luu: () => luuMa(), maDinh: m => m.ma }
        };
        const KHO_NOI_BO_DS = { [KHO_DE]: ['de'], [KHO_KQ]: ['kq'], [KHO_CA]: ['dot', 'ca', 'dk'], [KHO_MA]: ['ma'] };
        const DANG_DONG_BO = {}, HEN_DONG_BO = {}, ANH_CHUP_DONG_BO = {};

        function dongBoBat() { return !!MAY_CHU_TAI_KHOAN; }
        function maMucDB(bo, x) { return bo.maDinh ? bo.maDinh(x) : (x.id || (x.caId + '|' + x.email)); }
        function docAnhDB(n) {
            try { return new Map(JSON.parse(localStorage.getItem('skyedu-anh-' + n) || '[]')); } catch (e) { return new Map(); }
        }
        function luuAnhDB(n) {
            try { localStorage.setItem('skyedu-anh-' + n, JSON.stringify(Array.from(ANH_CHUP_DONG_BO[n].entries()))); } catch (e) {}
        }
        Object.keys(BO_DONG_BO).forEach(function (n) { ANH_CHUP_DONG_BO[n] = docAnhDB(n); DANG_DONG_BO[n] = false; });

        // Đẩy thay đổi của máy này lên máy chủ
        async function dayDongBo(n) {
            if (!dongBoBat() || DANG_DONG_BO[n]) { return; }
            const bo = BO_DONG_BO[n];
            const mang = bo.mang();
            const hienTai = new Map(mang.map(function (x) { return [maMucDB(bo, x), JSON.stringify(x)]; }));
            const viec = [];
            hienTai.forEach(function (chuoi, id) {
                if (ANH_CHUP_DONG_BO[n].get(id) !== chuoi) {
                    const x = mang.find(function (y) { return maMucDB(bo, y) === id; });
                    viec.push(fetch(MAY_CHU_TAI_KHOAN + '/api/c/' + bo.khoa, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(Object.assign({}, x, { id: id }))
                    }));
                }
            });
            ANH_CHUP_DONG_BO[n].forEach(function (chuoi, id) {
                if (!hienTai.has(id)) { viec.push(fetch(MAY_CHU_TAI_KHOAN + '/api/c/' + bo.khoa + '/' + encodeURIComponent(id), { method: 'DELETE' })); }
            });
            try {
                await Promise.all(viec);
                ANH_CHUP_DONG_BO[n] = hienTai;
                luuAnhDB(n);
            } catch (e) { /* mất mạng: lần sau đẩy lại */ }
        }

        // Nhận dữ liệu mới nhất từ máy chủ và gộp vào máy này
        async function keoDongBo(n) {
            if (!dongBoBat()) { return false; }
            const bo = BO_DONG_BO[n];
            let ds;
            try {
                const r = await fetch(MAY_CHU_TAI_KHOAN + '/api/c/' + bo.khoa);
                if (!r.ok) { return false; }
                ds = await r.json();
            } catch (e) { return false; }
            const mang = bo.mang();
            const choServer = new Map(ds.map(function (x) { return [maMucDB(bo, x), x]; }));
            let doi = false;
            DANG_DONG_BO[n] = true;
            try {
                choServer.forEach(function (x, id) {
                    const i = mang.findIndex(function (y) { return maMucDB(bo, y) === id; });
                    const cs = JSON.stringify(x);
                    if (i < 0) { mang.push(x); doi = true; ANH_CHUP_DONG_BO[n].set(id, cs); return; }
                    const local = JSON.stringify(mang[i]);
                    if (ANH_CHUP_DONG_BO[n].has(id) && local !== ANH_CHUP_DONG_BO[n].get(id)) { return; }  // máy này đang sửa dở
                    if (local !== cs) { mang[i] = x; doi = true; }
                    ANH_CHUP_DONG_BO[n].set(id, cs);
                });
                Array.from(ANH_CHUP_DONG_BO[n].keys()).forEach(function (id) {
                    if (!choServer.has(id)) {
                        const i = mang.findIndex(function (y) { return maMucDB(bo, y) === id; });
                        if (i >= 0) { mang.splice(i, 1); doi = true; }
                        ANH_CHUP_DONG_BO[n].delete(id);
                    }
                });
                if (doi) { bo.luu(); }
                luuAnhDB(n);
            } finally { DANG_DONG_BO[n] = false; }
            return doi;
        }

        async function dongBoTatCa() {
            if (!dongBoBat()) { return; }
            let coThayDoi = false;
            for (const n of Object.keys(BO_DONG_BO)) {
                if (await keoDongBo(n)) { coThayDoi = true; }
            }
            if (coThayDoi) {
                if (typeof veQuanTri === 'function') { try { veQuanTri(); } catch (e) {} }
            }
        }

        // Mỗi lần lưu trên máy này thì đẩy lên máy chủ (gộp các lần sát nhau)
        const ghiKhoTruocDongBo = ghiKho;
        ghiKho = function (loai, khoa, gia) {
            ghiKhoTruocDongBo(loai, khoa, gia);
            const ds = KHO_NOI_BO_DS[khoa];
            if (!ds || !dongBoBat()) { return; }
            ds.forEach(function (n) {
                if (DANG_DONG_BO[n]) { return; }
                clearTimeout(HEN_DONG_BO[n]);
                HEN_DONG_BO[n] = setTimeout(function () { dayDongBo(n); }, 300);
            });
        };

        window.addEventListener('load', function () { dongBoTatCa(); });
        setInterval(function () { dongBoTatCa(); }, 15000);
    