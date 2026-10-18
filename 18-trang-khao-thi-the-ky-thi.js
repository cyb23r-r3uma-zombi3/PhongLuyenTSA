
// Trang Khảo thí: các nút trên thẻ kỳ thi
(function () {
    const v = document.getElementById('lv-khao'); if (!v) { return; }
    const di = function (k) { const a = document.querySelector('#lab .l-nav a[data-v="' + k + '"]'); if (a) { a.click(); } };

    // ----- Hộp thoại kết quả kỳ thi -----
    // Dữ liệu kỳ thi chính thức (mẫu): sửa trực tiếp tại đây. Kỳ "thithu" lấy kết quả thật từ lịch sử làm bài.
    const KT_KQ = {
       dot2: { ten: 'Bài thi TSA 2026 trải nghiệm - Đợt 2', diem: '-', dung: [['Tư duy Toán học', '-'], ['Tư duy Đọc hiểu', '-'], ['Tư duy Khoa học/Giải quyết vấn đề', '-']],
                ct: [['Hội đồng thi', 'SKY EDU'], ['Thời gian làm thủ tục', ''], ['Thời gian vào phòng thi', ''], ['Thời gian bắt đầu thi', ''],
                     ['Phòng thi', ''], ['Số báo danh', '']] },
    dot3: { ten: 'Bài thi TSA 2026 chính thức - Đợt 3', diem: '-', dung: [['Tư duy Toán học', '-'], ['Tư duy Đọc hiểu', '-'], ['Tư duy Khoa học/Giải quyết vấn đề', '-']],
                ct: [['Hội đồng thi', 'SKYEDU'], ['Thời gian làm thủ tục', ''], ['Thời gian vào phòng thi', ''], ['Thời gian bắt đầu thi', ''],
                     ['Phòng thi', ''], ['Số báo danh', '']] },
    dot1: { ten: 'Bài thi TSA 2026 chính thức - Đợt 1', diem: '-', dung: [['Tư duy Toán học', '-'], ['Tư duy Đọc hiểu', '-'], ['Tư duy Khoa học/Giải quyết vấn đề', '-']],
                ct: [['Hội đồng thi', 'SKY EDU'], ['Thời gian làm thủ tục', ''], ['Thời gian vào phòng thi', ''], ['Thời gian bắt đầu thi', ''],
                     ['Phòng thi', ''], ['Số báo danh', '']] }
    };
    const esc = function (t) { return typeof thoat === 'function' ? thoat(String(t)) : String(t); };
    let ov = null;
    function taoOv() {
        ov = document.createElement('div'); ov.id = 'kq-ov';
        ov.innerHTML = '<div class="kq-box" role="dialog" aria-modal="true"><button class="kq-x" id="kq-x" title="Đóng">✕</button><h3 id="kq-t"></h3><div class="kq-body" id="kq-b"></div></div>';
        document.body.appendChild(ov);   // đặt ngoài để hộp hiện trên mọi trang
        ov.addEventListener('click', function (e) { if (e.target === ov || e.target.id === 'kq-x') { dongKetQua(); } });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('on')) { dongKetQua(); } });
    }
    function dongKetQua() { if (ov) { ov.classList.remove('on'); } }
    function moKetQua(id) {
        if (!ov) { taoOv(); }
        let tieuDe, trai, phai;
        if (id === 'thithu') {
            const ks = (typeof ketQua !== 'undefined' && nguoiDung) ? ketQua.filter(function (k) { return k.email === nguoiDung.email; }) : [];
            tieuDe = 'Thi thử Bài thi Đánh giá tư duy';
            if (!ks.length) {
                // Chưa làm bài: hiện dấu "-" cho điểm và từng phần
                const PHAN = ['Tư duy Toán học', 'Tư duy Đọc hiểu', 'Tư duy Khoa học/Giải quyết vấn đề'];
                trai = '<div class="kq-left"><div class="kq-top"><div class="kq-score"><small>Điểm TSA</small><b>-</b></div>' +
                       '<div class="kq-dung"><strong>Số câu đúng:</strong>' + PHAN.map(function (p) { return esc(p) + ': <b>-</b>'; }).join('<br>') + '</div></div>' +
                       '<button class="kq-cc" data-kq="thi">Vào thi ngay</button></div>';
                phai = '<div class="kq-right"><h4>Thông tin dự thi</h4><p>Hình thức thi: Thi trực tuyến</p><p>Thời gian thi: 11/11/2024 - 11/11/2026</p></div>';
            } else {
                // Đã làm bài: hiện điểm và số câu đúng của lần làm gần nhất
                const k = ks[ks.length - 1];
                const so = function (n) { return String(Math.round(Number(n) * 100) / 100); };
                trai = '<div class="kq-left"><div class="kq-top"><div class="kq-score"><small>Điểm TSA</small><b>' + esc(so(k.diem)) + '</b></div>' +
                       '<div class="kq-dung"><strong>Số câu đúng:</strong><br>Tư duy toán học: <b>' + esc(so(k.dung)) + ' / ' + esc(so(k.tong)) + '</b> câu</div></div></div>';
                phai = '<div class="kq-right"><h4>Thông tin dự thi</h4><p>Hình thức thi: Thi trực tuyến</p><p>Đề thi: ' + esc(k.tenDe) + '</p>' +
                       '<p>Ngày làm bài: ' + new Date(k.ngay).toLocaleString('vi-VN') + '</p><p>Số lần làm bài: ' + ks.length + '</p></div>';
            }
        } else {
            const d = KT_KQ[id]; if (!d) { return; }
            tieuDe = d.ten;
            trai = '<div class="kq-left"><div class="kq-top"><div class="kq-score"><small>Điểm TSA</small><b>' + esc(d.diem) + '</b></div>' +
                   '<div class="kq-dung"><strong>Số câu đúng:</strong>' + d.dung.map(function (x) { return esc(x[0]) + ': <b>' + esc(x[1]) + '</b>'; }).join('<br>') + '</div></div>' +
                   '<button class="kq-cc" data-kq="cc">Xem chứng chỉ</button>' +
                   '</div>';
            phai = '<div class="kq-right"><h4>Thông tin dự thi</h4>' + d.ct.map(function (x) { return '<p>' + esc(x[0]) + ': ' + esc(x[1]) + '</p>'; }).join('') +
                   '<p>Giấy báo dự thi: <a href="#" data-kq="gb">Xem tại đây</a></p></div>';
        }
        document.getElementById('kq-t').textContent = tieuDe;
        document.getElementById('kq-b').innerHTML = trai + phai;
        ov.classList.add('on');
    }
    document.addEventListener('click', function (e) {
        const t = e.target.closest ? e.target.closest('[data-kq]') : null; if (!t || !ov || !ov.contains(t)) { return; }
        e.preventDefault();
        const k = t.dataset.kq;
        if (k === 'ls') { dongKetQua(); di('ls'); }
        else if (k === 'thi') { dongKetQua(); di('luyen'); hienToast('Chọn một đề trong gói để thi thử nhé!'); }
        else if (k === 'cc') { hienToast('Chứng chỉ TSA điện tử sẽ được cập nhật sớm.'); }
        else if (k === 'gb') { hienToast('Giấy báo dự thi đang được cập nhật.'); }
        else { hienToast('Thông tin chương trình đào tạo sẽ được cập nhật.'); }
    });
    v.addEventListener('click', function (e) {
        const t = e.target.closest('[data-kt], #kt-all'); if (!t) { return; }
        if (t.id === 'kt-all') {
            const an = document.getElementById('kt-more').classList.toggle('kt-off');
            document.getElementById('kt-sub').classList.toggle('kt-off', an);
            t.textContent = an ? 'Xem tất cả kỳ thi' : 'Thu gọn danh sách';
        } else if (t.dataset.kt === 'kq') { moKetQua(t.dataset.id); }
        else if (t.dataset.kt === 'thi') { di('luyen'); hienToast('Chọn một đề trong gói để thi thử nhé!'); }
        else { hienToast('Kỳ thi này đã hết hạn đăng ký.'); }
    });
})();
