
        // =====================================================
        //  MÀN HÌNH TRƯỚC KHI LÀM BÀI (2 bước):
        //  1) Danh sách bài thi  →  Làm ngay
        //  2) Xác nhận thông tin dự thi  →  Bắt đầu thi
        // =====================================================
        let peLaKhaoThi = false;
        let peBoQua = false;
        let peDe = null;
        let peOnLam = null;

        function peLogo() { const l = document.querySelector('.logo'); return l ? l.src : ''; }
        function peHoTen() { return nguoiDung ? nguoiDung.ten : ''; }

        function soBaoDanhCua(de) {
            if (nguoiDung) {
                const ca = caThi.find(function (c) { return c.deId === de.id && dangKyCa.some(function (r) { return r.caId === c.id && r.email === nguoiDung.email; }); });
                if (ca) {
                    return dangKyCa.find(function (x) { return x.caId === ca.id && x.email === nguoiDung.email; }).soBaoDanh;
                }
            }
            // Học sinh luyện tập: mã nội bộ cố định theo tài khoản
            const email = nguoiDung ? nguoiDung.email : '';
            let so = 0;
            for (let i = 0; i < email.length; i++) { so = (so * 31 + email.charCodeAt(i)) % 1679616; }
            return 'E' + so.toString(36).toUpperCase().padStart(4, '0') + 'D';
        }

        function peKetQuaGanNhat(de) {
            return ketQua.filter(function (k) { return nguoiDung && k.email === nguoiDung.email && k.deId === de.id; })
                         .sort(function (a, b) { return a.ngay < b.ngay ? 1 : -1; })[0] || null;
        }

        function peDong() { document.getElementById('pe').classList.remove('on'); }

        // Bước 1: danh sách bài thi
        function peHienDanhSach() {
            const kq = peKetQuaGanNhat(peDe);
            document.getElementById('pe-card').className = 'pe-card';
            document.getElementById('pe-card').innerHTML =
                '<div class="pe-brand">' +
                    '<img class="pe-logo" alt="SKY EDU">' +
                    '<div><small>Kì Thi Đánh Giá Tư Duy</small><b>Phòng Luyện Đề SKY EDU</b></div>' +
                '</div>' +
                '<div class="pe-head"><h2>' + thoat(peDe.ten) + '</h2>' +
                    '<span class="pe-mode">' + (peLaKhaoThi ? 'Chế độ thi thử' : 'Chế độ Luyện tập (Tự do)') + '</span></div>' +
                '<div class="pe-info">' +
                    '<div>Họ tên: <b>' + thoat(peHoTen()) + '</b></div>' +
                    '<div class="pe-sbd">SỐ BÁO DANH : <b>' + thoat(soBaoDanhCua(peDe)) + '</b></div>' +
                '</div>' +
                '<div class="pe-list-title">Danh sách bài thi <span>1 BÀI THI KHẢ DỤNG</span></div>' +
                '<div class="pe-item"><div>' +
                    '<div class="pe-name">1. ' + thoat(peDe.ten) + '</div>' +
                    '<div class="pe-meta">Thời gian: ' + peDe.phut + ' phút &nbsp;&nbsp; Trạng thái: ' +
                    (kq ? '<b class="pe-done">Đã thi · ' + kq.diem + ' / 10</b>' : '<b class="pe-new">Chưa thi</b>') + '</div>' +
                '</div><button class="pe-go" id="pe-lam">Làm ngay</button></div>' +
                '<div class="pe-foot"><a href="#" id="pe-ve">Về trang luyện đề</a><a href="#" id="pe-ket">Kết thúc kịp thi</a></div>';
            document.querySelectorAll('#pe-card .pe-logo').forEach(function (im) { im.src = peLogo(); });
            document.getElementById('pe-lam').addEventListener('click', peHienXacNhan);
            document.getElementById('pe-ve').addEventListener('click', function (e) {
                e.preventDefault(); peDong(); showPage(peLaKhaoThi ? 'exams' : 'practice');
            });
            document.getElementById('pe-ket').addEventListener('click', function (e) { e.preventDefault(); peDong(); });
        }

        // Bước 2: xác nhận thông tin dự thi
        function peHienXacNhan() {
            document.getElementById('pe-card').className = 'pe-card pe-card-sm';
            document.getElementById('pe-card').innerHTML =
                '<div class="pe-brand pe-center">' +
                    '<img src="' + peLogo() + '" alt="SKY EDU">' +
                    '<div><small>Kì Thi Đánh Giá Tư Duy</small><b>Phòng Luyện Đề SKY EDU</b></div>' +
                '</div>' +
                '<h2 class="pe-title2">Xác nhận thông tin dự thi</h2>' +
                '<div class="pe-rows">' +
                    '<div><span>Họ tên</span><b>' + thoat(peHoTen()) + '</b></div>' +
                    '<div><span>Kíp thi</span><b>' + thoat(peDe.ten) + '</b></div>' +
                    '<div><span>Thời gian làm bài</span><b>' + peDe.phut + ' phút</b></div>' +
                '</div>' +
                '<p class="pe-note">Lưu ý: Bằng việc nhấn nút "Bắt đầu thi" hệ thống sẽ bắt đầu tính giờ cho bài thi của bạn</p>' +
                '<button class="pe-start" id="pe-bd">Bắt đầu thi</button>' +
                '<div class="pe-foot"><a href="#" id="pe-back">Quay lại</a><a href="#" id="pe-hd">Hướng dẫn</a></div>';
            document.getElementById('pe-bd').addEventListener('click', function () {
                const cb = peOnLam;
                peOnLam = null;
                // Phòng luyện: thanh chạy suốt thời gian hệ thống kiểm tra và mở bài.
                // Khảo thí: thanh chạy ngắn rồi vào bài.
                const dur = peLabPath ? 3300 : 1200;
                document.getElementById('pe-bd').outerHTML =
                    '<div class="pe-load"><div class="pe-bar"><i style="animation-duration:' + dur + 'ms"></i></div>' +
                    '<p>Đang kiểm tra thông tin bài thi ... <b class="pe-pct">0%</b></p></div>';
                // Hiện phần trăm chạy theo thanh để thấy rõ tiến trình
                const batDau = performance.now();
                const pctEl = document.querySelector('.pe-pct');
                const barEl = document.querySelector('.pe-bar i');
                (function chayPct() {
                    const t = Math.min(1, (performance.now() - batDau) / dur);
                    if (pctEl) { pctEl.textContent = Math.round(t * 100) + '%'; }
                    if (barEl) { barEl.style.width = Math.round(t * 100) + '%'; }
                    if (t < 1 && pctEl && pctEl.isConnected) { requestAnimationFrame(chayPct); }
                })();
                if (peLabPath) {
                    if (cb) { cb(); }                       // bài mở khi thanh chạy xong; overlay đóng khi màn làm bài hiện
                } else {
                    setTimeout(function () {
                        peDong();
                        if (cb) { cb(); }
                    }, dur);
                }
            });
            document.getElementById('pe-back').addEventListener('click', function (e) { e.preventDefault(); peHienDanhSach(); });
            document.getElementById('pe-hd').addEventListener('click', function (e) {
                e.preventDefault();
                hienToast('Làm bài trong thời gian quy định. Hệ thống tự nộp bài khi hết giờ.');
            });
        }

        function moPreThi(de, laKhaoThi, onLamNgay) {
            peDe = de;
            peLaKhaoThi = laKhaoThi;
            peOnLam = onLamNgay;
            peHienDanhSach();
            document.getElementById('pe').classList.add('on');
        }

        // Khảo thí (thi theo ca) và các lần gọi làm bài khác
        const batTruocManHinh = batDauLamBai;
        batDauLamBai = function (id) {
            const laKhaoThi = nguonKhaoThi;
            nguonKhaoThi = false;
            const de = deThi.find(function (x) { return x.id === id; });
            if (!de || (!laKhaoThi && nguoiDung && !duocLuyenDe(nguoiDung.email))) {
                nguonKhaoThi = laKhaoThi;
                return batTruocManHinh(id);
            }
            peLabPath = false;
            moPreThi(de, laKhaoThi, function () {
                nguonKhaoThi = laKhaoThi;
                batTruocManHinh(id);
            });
        };

        // Phòng luyện: bấm Vào làm → hiện "Bắt đầu làm bài" (chọn chế độ) trước,
        // rồi mới đến màn danh sách bài thi và xác nhận. Khi bấm "Bắt đầu ngay" thì chặn lại để hiện màn xác nhận.
        function deTuTheDe(nut) {
            let el = nut;
            while (el && !el.querySelector('h4')) { el = el.parentElement; }
            const h = el ? el.querySelector('h4') : null;
            return h ? deThi.find(function (d) { return d.ten === h.textContent.trim(); }) || null : null;
        }
        document.addEventListener('click', function (e) {
            const vao = e.target.closest('.lbtn');
            if (vao && /Vào làm/.test(vao.textContent)) {
                if (peBoQua) { peBoQua = false; return; }
                const de = deTuTheDe(vao);
                if (de) { peDe = de; peLaKhaoThi = false; }   // để lớp chọn chế độ của phòng luyện mở ra
                return;
            }
            const bat = e.target.closest('#lm-go');
            if (!bat) { return; }
            if (peBoQua) { peBoQua = false; return; }
            if (!peDe) { return; }
            e.stopImmediatePropagation();
            e.preventDefault();
            document.getElementById('l-mode').classList.remove('on');
            peLabPath = true;
            peSplash(function () {
                moPreThi(peDe, false, function () {
                    peBoQua = true;
                    document.getElementById('lm-go').click();
                });
            });
        }, true);
    