
// ===== Trang Tài liệu: tải file lên (chỉ quản trị), xem và tải về =====
(function () {
    const TEN_DB = 'skyedu-tai-lieu', KHO = 'docs', GIOI_HAN = 100 * 1024 * 1024; // 100 MB mỗi file
    const TIEU_DE = { all: 'TÀI LIỆU', tsa: 'TÀI LIỆU TSA', hsa: 'TÀI LIỆU HSA', thpt: 'TÀI LIỆU THPT' };
    let db = null, ds = [], daTai = false, bo = 'all', tu = '', urlBia = {};
    const $ = function (id) { return document.getElementById(id); };
    const esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    const bo_dau = function (t) { return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); };
    function toast(t) { if (typeof hienToast === 'function') { hienToast(t); } else { alert(t); } }

    // --- Kho lưu file trong trình duyệt (IndexedDB, chứa được file lớn) ---
    function moDB() {
        return new Promise(function (ok) {
            try {
                const r = indexedDB.open(TEN_DB, 1);
                r.onupgradeneeded = function () { r.result.createObjectStore(KHO, { keyPath: 'id' }); };
                r.onsuccess = function () { ok(r.result); };
                r.onerror = function () { ok(null); };
                r.onblocked = function () { ok(null); };
            } catch (e) { ok(null); }
        });
    }
    function chay(che_do, fn) {
        return new Promise(function (ok, loi) {
            if (!db) { ok(); return; }
            const t = db.transaction(KHO, che_do);
            const r = fn(t.objectStore(KHO));
            t.oncomplete = function () { ok(r && r.result); };
            t.onerror = t.onabort = function () { loi(t.error); };
        });
    }
    async function taiDuLieu() {
        if (daTai) { return; }
        db = await moDB();
        if (db) {
            try { ds = (await chay('readonly', function (s) { return s.getAll(); })) || []; } catch (e) { ds = []; }
            if (navigator.storage && navigator.storage.persist) { try { navigator.storage.persist(); } catch (e) {} }
        } else {
            toast('Trình duyệt không cho lưu file lâu dài, tài liệu chỉ giữ đến khi tải lại trang');
        }
        daTai = true;
    }

    function dungLuong(b) {
        if (b < 1024) { return b + ' B'; }
        if (b < 1048576) { return (b / 1024).toFixed(1).replace(/\.0$/, '') + ' KB'; }
        return (b / 1048576).toFixed(1).replace(/\.0$/, '') + ' MB';
    }
    function duoiFile(ten) { const m = /\.([A-Za-z0-9]+)$/.exec(ten); return m ? m[1].toUpperCase() : 'FILE'; }
    function anhBia(d) {
        const b = d.bia || (d.mime && d.mime.indexOf('image/') === 0 ? d.file : null);
        if (!b) { return ''; }
        if (!urlBia[d.id]) { urlBia[d.id] = URL.createObjectURL(b); }
        return urlBia[d.id];
    }

    // --- Vẽ danh sách ---
    function ve() {
        const logo = (document.querySelector('.logo') || {}).src || '';
        const q = bo_dau(tu.trim());
        const list = ds.filter(function (d) {
            return (bo === 'all' || d.loai === bo) && (q === '' || bo_dau(d.ten).indexOf(q) !== -1);
        }).sort(function (a, b) { return a.ngay < b.ngay ? 1 : -1; });
        $('tl-heading').textContent = TIEU_DE[bo];
        const luoi = $('tl-grid');
        if (!list.length) {
            luoi.innerHTML = '<div class="tl-empty"><b>' + (ds.length && (q || bo !== 'all') ? 'Không tìm thấy tài liệu phù hợp' : 'Chưa có tài liệu nào') + '</b>' +
                (ds.length ? 'Thử đổi danh mục hoặc từ khóa tìm kiếm.' : 'Quản trị viên bấm "Tải tài liệu lên" để thêm tài liệu đầu tiên.') + '</div>';
            return;
        }
        luoi.innerHTML = list.map(function (d) {
            const bia = anhBia(d);
            const thumb = bia ? '<img class="tl-bia" src="' + bia + '" alt="">'
                : '<img class="tl-logo" src="' + logo + '" alt=""><div class="tl-ext-big">' + esc(d.kieu) + '</div>';
            return '<div class="tl-card" data-id="' + d.id + '">' +
                '<div class="tl-thumb">' + thumb + '<span class="tl-badge">' + esc(d.kieu) + '</span>' +
                '<div class="tl-tools tl-admin-tools"><button data-act="sua" title="Sửa">✏️</button><button data-act="xoa" title="Xóa">🗑</button></div></div>' +
                '<div class="tl-name">' + esc(d.ten) + '</div>' +
                '<div class="tl-meta"><span class="tl-luot">⬇ ' + (d.luotTai || 0) + ' lượt tải</span><span>' + dungLuong(d.size) + '</span></div></div>';
        }).join('');
    }
    window.veTaiLieu = async function () { await taiDuLieu(); ve(); };

    // --- Danh mục và tìm kiếm ---
    document.querySelectorAll('#tl-cats .cat').forEach(function (c) {
        c.addEventListener('click', function () {
            document.querySelectorAll('#tl-cats .cat').forEach(function (x) { x.classList.remove('active'); });
            c.classList.add('active');
            bo = c.dataset.dcat; ve();
        });
    });
    $('tl-search').addEventListener('input', function () { tu = this.value; ve(); });

    // --- Tải về / sửa / xóa ---
    function taiVe(d) {
        const url = URL.createObjectURL(d.file);
        const a = document.createElement('a');
        a.href = url; a.download = d.tenFile || d.ten;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        d.luotTai = (d.luotTai || 0) + 1;
        chay('readwrite', function (s) { return s.put(d); }).catch(function () {});
        ve();
    }
    $('tl-grid').addEventListener('click', function (e) {
        const the = e.target.closest('.tl-card'); if (!the) { return; }
        const d = ds.find(function (x) { return x.id === the.dataset.id; }); if (!d) { return; }
        const nut = e.target.closest('button[data-act]');
        if (nut) {
            e.stopPropagation();
            if (!laAdmin()) { return; }
            if (nut.dataset.act === 'sua') { moFormSua(d); } else { xoaTaiLieu(d); }
            return;
        }
        taiVe(d);
    });
    async function xoaTaiLieu(d) {
        if (!confirm('Xóa tài liệu "' + d.ten + '"? Việc này không thể hoàn tác.')) { return; }
        try { await chay('readwrite', function (s) { return s.delete(d.id); }); } catch (e) { toast('Không xóa được, thử lại sau'); return; }
        if (urlBia[d.id]) { URL.revokeObjectURL(urlBia[d.id]); delete urlBia[d.id]; }
        ds = ds.filter(function (x) { return x.id !== d.id; });
        ve(); toast('Đã xóa tài liệu');
    }
    const optLoai = function (cur) {
        return ['tsa', 'hsa', 'thpt'].map(function (k) { return '<option value="' + k + '"' + (k === cur ? ' selected' : '') + '>' + TIEU_DE[k] + '</option>'; }).join('');
    };
    function moFormSua(d) {
        moDialog('<h3>Sửa tài liệu</h3><label class="tl-lbl">Tên tài liệu</label><input class="tl-in" id="tl-s-ten" value="' + esc(d.ten) + '">' +
            '<label class="tl-lbl">Danh mục</label><select class="tl-sel" id="tl-s-loai">' + optLoai(d.loai) + '</select>' +
            '<div class="dialog-actions"><button class="tl-btn sec" id="tl-s-huy">Hủy</button><button class="tl-btn" id="tl-s-luu">Lưu</button></div>');
        $('tl-s-huy').addEventListener('click', function () { dongDialog(); });
        $('tl-s-luu').addEventListener('click', async function () {
            const ten = $('tl-s-ten').value.trim();
            if (!ten) { toast('Tên tài liệu không được để trống'); return; }
            d.ten = ten; d.loai = $('tl-s-loai').value;
            try { await chay('readwrite', function (s) { return s.put(d); }); } catch (e) { toast('Không lưu được, thử lại sau'); return; }
            dongDialog(); ve(); toast('Đã lưu thay đổi');
        });
    }

    // --- Tải file lên ---
    let hang = [];
    function veHang() {
        $('tl-hang').innerHTML = hang.map(function (h, i) {
            return '<div class="tl-row"><input type="text" data-i="' + i + '" value="' + esc(h.ten) + '">' +
                '<button class="tl-mini" data-bia="' + i + '" title="Ảnh bìa (không bắt buộc)">🖼 ' + (h.bia ? esc(h.bia.name.slice(0, 14)) : 'Ảnh bìa') + '</button>' +
                '<button class="tl-mini" data-bo="' + i + '" title="Bỏ file này">✕</button>' +
                '<small>' + esc(h.file.name) + ' · ' + dungLuong(h.file.size) + '</small></div>';
        }).join('');
        $('tl-up').disabled = !hang.length;
        $('tl-up').style.opacity = hang.length ? '1' : '.5';
    }
    function themFile(files) {
        Array.prototype.forEach.call(files, function (f) {
            if (f.size > GIOI_HAN) { toast('"' + f.name + '" lớn hơn 100 MB nên bị bỏ qua'); return; }
            hang.push({ file: f, ten: f.name.replace(/\.[^.]+$/, ''), bia: null });
        });
        veHang();
    }
    function moFormTai() {
        hang = [];
        moDialog('<h3>Tải tài liệu lên</h3><p class="modal-sub">Chọn một hoặc nhiều file (PDF, Word, Excel, PowerPoint, ảnh, ZIP...).</p>' +
            '<div class="tl-drop" id="tl-drop"><div class="tl-up-ico">📤</div><b>Kéo thả file vào đây</b><span>hoặc bấm để chọn file (tối đa 100 MB mỗi file)</span></div>' +
            '<input type="file" id="tl-file" multiple hidden><input type="file" id="tl-bia-in" accept="image/*" hidden>' +
            '<div class="tl-rows" id="tl-hang"></div>' +
            '<label class="tl-lbl">Danh mục</label><select class="tl-sel" id="tl-loai">' + optLoai(bo === 'all' ? 'tsa' : bo) + '</select>' +
            '<div class="dialog-actions"><button class="tl-btn sec" id="tl-huy">Hủy</button><button class="tl-btn" id="tl-up">Tải lên</button></div>');
        const drop = $('tl-drop'); let dangChonBia = -1;
        drop.addEventListener('click', function () { $('tl-file').click(); });
        $('tl-file').addEventListener('change', function () { themFile(this.files); this.value = ''; });
        ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
        ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
        drop.addEventListener('drop', function (e) { themFile(e.dataTransfer.files); });
        $('tl-hang').addEventListener('input', function (e) { if (e.target.dataset.i !== undefined) { hang[+e.target.dataset.i].ten = e.target.value; } });
        $('tl-hang').addEventListener('click', function (e) {
            const b = e.target.closest('button'); if (!b) { return; }
            if (b.dataset.bia !== undefined) { dangChonBia = +b.dataset.bia; $('tl-bia-in').click(); }
            if (b.dataset.bo !== undefined) { hang.splice(+b.dataset.bo, 1); veHang(); }
        });
        $('tl-bia-in').addEventListener('change', function () {
            if (this.files[0] && dangChonBia > -1 && hang[dangChonBia]) { hang[dangChonBia].bia = this.files[0]; veHang(); }
            this.value = '';
        });
        $('tl-huy').addEventListener('click', function () { dongDialog(); });
        $('tl-up').addEventListener('click', async function () {
            if (!hang.length) { return; }
            const loai = $('tl-loai').value; let xong = 0;
            this.disabled = true; this.textContent = 'Đang tải lên...';
            for (const h of hang) {
                const ten = h.ten.trim() || h.file.name;
                const d = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ten: ten, loai: loai, tenFile: h.file.name,
                            kieu: duoiFile(h.file.name), mime: h.file.type || '', size: h.file.size, luotTai: 0,
                            ngay: new Date().toISOString(), file: h.file, bia: h.bia || null };
                try { await chay('readwrite', function (s) { return s.put(d); }); ds.push(d); xong++; }
                catch (e) { toast('Không đủ dung lượng để lưu "' + h.file.name + '"'); }
            }
            dongDialog(); ve();
            if (xong) { toast('Đã tải lên ' + xong + ' tài liệu'); }
        });
        veHang();
    }
    $('tl-open-up').addEventListener('click', function () { if (laAdmin()) { moFormTai(); } });
})();
