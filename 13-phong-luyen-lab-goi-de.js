
        // ===== Phòng luyện kiểu LAB: gói đề -> đề -> chế độ -> xác nhận -> làm bài =====
        const GOI = [
            { id: 'chuyen-de', ten: 'Phòng Luyện Chuyên Đề' },
            { id: 'cam-nang', ten: 'Phòng Luyện Cẩm Nang' },
            { id: 'mien-phi', ten: 'Phòng Luyện Miễn Phí', mf: true },
            { id: 'thuc-chien', ten: 'Phòng Luyện Thực Chiến Đợt 1' }
        ];
        function goiOptions() {
            return GOI.map(function (g) { return '<option value="' + g.id + '">' + g.ten + '</option>'; }).join('');
        }
        (function () {
            const $ = function (id) { return document.getElementById(id); };
            const KHO_GOI = 'skyedu-goi-so-huu';
            let own = docKho('localStorage', KHO_GOI);
            if (!Array.isArray(own)) { own = []; }
            const L = { room: 'tsa', de: null, mode: 'luyen' };
            window.__lab = Object.assign(window.__lab || {}, { L: L });
            const on = function (id, v) { $(id).classList.toggle('on', v); };
            const coGoi = function (g) { return g.mf || own.indexOf(g.id) !== -1; };
            const deCua = function (gid) {
                return deThi.filter(function (d) { return d.phong === L.room && d.hienThi && (d.goi || 'mien-phi') === gid; });
            };
            const diemCao = function (d) {
                let t = null;
                ketQua.forEach(function (k) { if (k.deId === d.id && k.email === nguoiDung.email && (t === null || k.diem > t)) { t = k.diem; } });
                return t;
            };
            const ngay = function (iso) { return iso ? new Date(iso).toLocaleDateString('vi-VN') : '—'; };
            const mmss = function (s) { return Math.floor(s / 60) + ':' + pad(s % 60); };

            function chonView(id) { on('lv-goi', id === 'lv-goi'); on('lv-de', id === 'lv-de'); }

            // ---- Trang 1: danh sách gói đề ----
            function veGoi() {
                const kw = $('lg-q').value.trim().toLowerCase();
                $('lg-h').textContent = 'Gói đề thi ' + L.room.toUpperCase();
                $('l-title').textContent = 'Phòng luyện ' + L.room.toUpperCase();
                const box = $('lg-list'); box.innerHTML = '';
                GOI.filter(function (g) { return g.ten.toLowerCase().indexOf(kw) !== -1; }).forEach(function (g) {
                    const ds = deCua(g.id);
                    const xong = ds.filter(function (d) { return diemCao(d) !== null; }).length;
                    const cau = ds.reduce(function (t, d) { return t + d.cauHoi.length; }, 0);
                    const phut = ds.reduce(function (t, d) { return t + d.phut; }, 0);
                    const c = document.createElement('div'); c.className = 'lcard';
                    c.innerHTML = '<h4>' + g.ten + '</h4>' +
                        '<div class="lrow"><span>Trạng thái gói đề</span><span class="lbadge ' + (g.mf ? 'ok' : '') + '">' + (g.mf ? 'Miễn phí' : coGoi(g) ? 'Đã sở hữu' : 'Chưa sở hữu') + '</span></div>' +
                        '<div class="lrow"><span>Số lượng đề thi</span><b>' + ds.length + ' đề thi</b></div>' +
                        '<div class="lrow"><span>Thời hạn</span><b>01/07/2027</b></div>' +
                        '<div class="lrow"><span>Số lượng phần</span><b>' + cau + ' phần</b></div>' +
                        '<div class="lfoot"><div class="pg">' + (ds.length ? 'Hoàn thành <b style="float:right;color:#c8153f">' + xong + '/' + ds.length + ' đề</b><div class="lprog"><i style="width:' + (xong / ds.length * 100) + '%"></i></div>' : '') + '</div><button class="lbtn">' + (g.mf ? 'Bắt đầu' : 'Xem gói') + '</button></div>';
                    c.querySelector('button').addEventListener('click', function () { veDe(g); });
                    box.appendChild(c);
                });
            }

            // ---- Trang 2: các đề trong gói ----
            function veDe(g) {
                L.goi = g;
                $('ld-h').textContent = 'Gói đề: ' + g.ten;
                const box = $('ld-list'); box.innerHTML = '';
                const ds = deCua(g.id);
                if (!ds.length) { box.innerHTML = '<p class="empty-row">Gói này chưa có đề nào đang mở.</p>'; }
                ds.forEach(function (d) {
                    const tot = diemCao(d);
                    const c = document.createElement('div'); c.className = 'lcard';
                    c.innerHTML = '<h4></h4>' +
                        '<div class="lrow"><span>Trạng thái:</span><span class="lbadge open">Đang mở</span></div>' +
                        '<div class="lrow"><span>Số phần thi:</span><b>' + d.cauHoi.length + ' Phần</b></div>' +
                        '<div class="lrow"><span>Hình thức:</span><b>Trong gói</b></div>' +
                        '<div class="lrow"><span>Ngày tạo:</span><b>' + ngay(d.ngayTao) + '</b></div>' +
                        '<div class="lfoot"><button class="llink">Xem lịch sử</button><button class="lbtn">Vào làm ▸</button></div>';
                    c.querySelector('h4').textContent = d.ten;
                    c.querySelector('.llink').addEventListener('click', function () { lichSu(d); });
                    c.querySelector('.lbtn').addEventListener('click', function () {
                        if (!coGoi(g)) {
                            if (!duocLuyenDe(nguoiDung && nguoiDung.email)) { moMoKhoaLuyen(); return; }
                            own.push(g.id); ghiKho('localStorage', KHO_GOI, own);
                        }
                        L.de = d; $('lm-name').textContent = d.ten; on('l-mode', true);
                    });
                    box.appendChild(c);
                });
                chonView('lv-de');
            }

            function lichSu(d) {
                const ds = ketQua.filter(function (k) { return k.deId === d.id && k.email === nguoiDung.email; }).reverse();
                $('lh-body').innerHTML = ds.length ? ds.map(function (k) {
                    return '<div class="lh-c"><h4>Ngày thi ' + ngay(k.ngay) + '</h4><div><span class="tg r">TSA - Đánh giá tư duy</span><span class="tg g">Hoàn thành</span></div><div class="lh-m"><div class="lh-o">' + k.diem + '</div><div class="lh-p"><div class="lh-n"><span>' + thoat(d.ten) + '</span><b>' + k.dung + '/' + k.tong + '</b></div><div class="lprog"><i style="width:' + (k.tong ? k.dung / k.tong * 100 : 0) + '%"></i></div></div></div><div class="lh-f"><span>📅 ' + ngay(k.ngay) + '</span><span>⏱ ' + Math.ceil(k.giay / 60) + ' phút</span><button class="lh-ct" data-kq="' + k.id + '">Chi tiết →</button></div></div>';
                }).join('') : '<p class="empty-row">Bạn chưa làm đề này lần nào.</p>';
                on('l-hist', true);
            }

            // ---- Mở / đóng phòng ----
            window.moPhong = function (loai) {
                if (!nguoiDung) { showPage('login'); hienToast('Vui lòng đăng nhập để vào phòng luyện'); return; }
                L.room = loai;
                const logo = document.querySelector('img.logo').src;
                ['l-logo', 'l-splash-img', 'c-logo', 'x-logo'].forEach(function (id) { $(id).src = logo; });
                $('l-user').textContent = nguoiDung.ten || nguoiDung.email;
                $('lg-q').value = '';
                veGoi(); chonView('lv-goi');
                $('lab').classList.add('open');
                document.body.style.overflow = 'hidden';
            };
            function thoatPhong() {
                tatGiamSat();
                clearInterval(L.tm); dangLamBai = false;
                ['l-mode', 'l-hist', 'l-splash', 'l-conf', 'l-exam', 'l-res'].forEach(function (id) { on(id, false); });
                $('lab').classList.remove('open');
                document.body.style.overflow = '';
            }
            $('l-exit').addEventListener('click', thoatPhong);
            $('ld-back').addEventListener('click', function () { veGoi(); chonView('lv-goi'); });
            $('lg-q').addEventListener('input', veGoi);

            // ---- Chế độ Thực chiến: toàn màn hình + cảnh báo khi thoát / chụp màn hình ----
            function dangToanManHinh() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
            function vaoToanManHinh() {
                const el = document.documentElement;
                const f = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
                if (!f) { return; }
                try { const p = f.call(el); if (p && p.catch) { p.catch(function () {}); } } catch (e) { /* trình duyệt không cho phép */ }
            }
            function thoatToanManHinh() {
                if (!dangToanManHinh()) { return; }
                const f = document.exitFullscreen || document.webkitExitFullscreen;
                try { const p = f.call(document); if (p && p.catch) { p.catch(function () {}); } } catch (e) { /* bỏ qua */ }
            }
            function tatGiamSat() { L.gs = false; $('l-cb').classList.remove('on'); thoatToanManHinh(); }
            function canhBao(lyDo) {
                if (!L.gs || L.nghi) { return; }
                const hop = $('l-cb');
                if (hop.classList.contains('on')) { return; }
                L.vp = (L.vp || 0) + 1;
                $('cb-nd').textContent = lyDo;
                $('cb-dem').textContent = 'Số lần cảnh báo: ' + L.vp;
                hop.classList.add('on');
            }
            // Hộp thoại confirm/alert làm trình duyệt mất tiêu điểm -> tạm nghỉ giám sát để không báo nhầm
            function nghiGiamSat() { L.nghi = true; }
            function tiepGiamSat() {
                setTimeout(function () {
                    L.nghi = false;
                    if (L.gs && !dangToanManHinh()) { vaoToanManHinh(); }
                }, 600);
            }
            function xacNhan(msg) { nghiGiamSat(); const r = confirm(msg); tiepGiamSat(); return r; }
            function thongBao(msg) { nghiGiamSat(); alert(msg); tiepGiamSat(); }

            ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
                document.addEventListener(ev, function () {
                    if (L.gs && !dangToanManHinh()) { canhBao('Bạn đã thoát chế độ toàn màn hình. Thi thật bắt buộc phải làm bài ở toàn màn hình.'); }
                });
            });
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) { canhBao('Bạn vừa rời khỏi trang làm bài (chuyển tab, chuyển cửa sổ hoặc chụp màn hình).'); }
            });
            window.addEventListener('blur', function () {
                canhBao('Cửa sổ làm bài vừa mất tiêu điểm. Bạn có thể đã chuyển ứng dụng hoặc đang chụp màn hình.');
            });
            window.addEventListener('beforeprint', function () { canhBao('Phát hiện lệnh in trang. In hoặc lưu đề thi là vi phạm quy chế.'); });
            document.addEventListener('keyup', function (e) {
                if (e.key === 'PrintScreen' || e.code === 'PrintScreen') { canhBao('Phát hiện phím Print Screen. Chụp hoặc ghi lại đề thi là vi phạm quy chế.'); }
            });
            document.addEventListener('keydown', function (e) {
                const chup = (e.metaKey && e.shiftKey && /^(KeyS|Digit3|Digit4|Digit5)$/.test(e.code || '')) || e.key === 'PrintScreen';
                if (chup) { canhBao('Phát hiện tổ hợp phím chụp màn hình. Chụp hoặc ghi lại đề thi là vi phạm quy chế.'); }
            });
            $('cb-ok').addEventListener('click', function () {
                $('l-cb').classList.remove('on');
                if (L.gs && !dangToanManHinh()) { vaoToanManHinh(); }
            });

            // ---- Chọn chế độ -> màn chờ -> xác nhận ----
            $('lm-huy').addEventListener('click', function () { on('l-mode', false); });
            $('lm-go').addEventListener('click', function () {
                L.mode = document.querySelector('input[name=lm]:checked').value;
                // Thực chiến: bật toàn màn hình ngay trong cú bấm (trình duyệt chỉ cho phép khi có thao tác của người dùng)
                if (L.mode === 'thuc') { L.gs = true; L.vp = 0; L.nghi = false; vaoToanManHinh(); } else { L.gs = false; }
                on('l-mode', false); on('l-splash', true);
                setTimeout(function () {
                    $('c-ten').textContent = nguoiDung.ten || nguoiDung.email;
                    $('c-de').textContent = L.de.ten;
                    $('c-phut').textContent = L.de.phut + ' phút';
                    $('c-mode').textContent = L.mode === 'thuc' ? 'Thực chiến thi thật' : 'Luyện tập (Tự do)';
                    $('c-go').style.display = ''; $('c-load').style.display = 'none';
                    $('c-load').querySelector('i').style.width = '0';
                    on('l-conf', true);
                }, 1500);
            });
            $('c-back').addEventListener('click', function () { tatGiamSat(); on('l-conf', false); on('l-splash', false); });
            $('c-help').addEventListener('click', function () {
                thongBao('Trắc nghiệm: chọn 1 đáp án. Đúng/Sai: chọn Đúng hoặc Sai cho từng ý. Điền khuyết: gõ vào ô trống. Kéo thả: kéo ô vuông thả vào chỗ trống (hoặc chạm ô rồi chạm chỗ trống). Dùng nút ⚑ để đánh dấu câu muốn xem lại. Hết giờ hệ thống tự nộp bài.');
            });
            $('c-go').addEventListener('click', function () {
                $('c-go').style.display = 'none'; $('c-load').style.display = 'block';
                setTimeout(function () { $('c-load').querySelector('i').style.width = '100%'; }, 30);
                setTimeout(vaoThi, 1800);
            });

            // ---- Màn làm bài ----
            function vaoThi() {
                const d = L.de;
                L.q = 0; L.left = d.phut * 60; L.start = L.left;
                L.ans = d.cauHoi.map(khoiTaoDapAn);
                L.chips = d.cauHoi.map(taoChip); L.sel = null;
                L.flag = d.cauHoi.map(function () { return false; });
                L.qs = d.cauHoi.map(function () { return 0; });
                $('x-name').textContent = d.ten;
                $('x-code').textContent = 'TSA_' + String(d.id).replace(/[^a-z0-9]/gi, '').slice(-5).toUpperCase();
                $('x-user').textContent = nguoiDung.ten || nguoiDung.email;
                on('l-conf', false); on('l-exam', true); on('l-splash', false);
                dangLamBai = true;
                veCau();
                clearInterval(L.tm);
                L.tm = setInterval(function () {
                    L.left--; L.qs[L.q]++;
                    $('x-time').textContent = giayThanhChu(Math.max(0, L.left));
                    $('x-time').classList.toggle('gap', L.left <= 60);
                    $('x-qt').textContent = mmss(L.qs[L.q]);
                    if (L.left <= 0) { nop(true); }
                }, 1000);
            }

            // Cột bên phải: số câu, tiến độ, nút chuyển câu
            function veBen() {
                const d = L.de, n = d.cauHoi.length;
                const nums = $('x-nums'); nums.innerHTML = '';
                d.cauHoi.forEach(function (c, i) {
                    const b = document.createElement('button');
                    b.textContent = i + 1;
                    b.className = (i === L.q ? 'cur' : daLam(c, L.ans[i]) ? 'ans' : '') + (L.flag[i] && i !== L.q ? ' flg' : '');
                    b.addEventListener('click', function () { diXoay(i, $('x-next')); });
                    nums.appendChild(b);
                });
                const xong = d.cauHoi.filter(function (c, i) { return daLam(c, L.ans[i]); }).length;
                $('x-n').textContent = n; $('x-na').textContent = xong; $('x-nf').textContent = L.flag.filter(Boolean).length;
                $('x-done').innerHTML = xong + '/' + n + ' <small>câu</small>';
                $('x-bar').style.width = (xong / n * 100) + '%'; $('x-pct').textContent = Math.round(xong / n * 100) + '%';
                $('x-prev').disabled = L.q === 0;
                $('x-next').disabled = L.q === n - 1;
                $('x-time').textContent = giayThanhChu(Math.max(0, L.left));
                $('x-qt').textContent = mmss(L.qs[L.q]);
            }

            // Khung câu hỏi theo từng dạng
            function veCau() {
                const d = L.de, q = d.cauHoi[L.q], lo = loaiCau(q), a = L.ans[L.q];
                $('x-q').innerHTML = '<div class="x-qh"><span class="x-no">' + (L.q + 1) + '</span><div class="x-qt"></div>' +
                    '<button class="x-flag' + (L.flag[L.q] ? ' on' : '') + '" id="x-flag" title="Đánh dấu xem lại">⚑</button></div><div class="x-body"></div>';
                const qt = $('x-q').querySelector('.x-qt'), bd = $('x-q').querySelector('.x-body');
                if (q.anh) {
                    if (anhViTri(q) === 'tren') { $('x-q').querySelector('.x-qh').insertAdjacentHTML('beforebegin', anhCauHTML(q, L.q + 1)); }
                    else { bd.insertAdjacentHTML('beforebegin', anhCauHTML(q, L.q + 1)); }
                }
                if (lo === 'tn') {
                    qt.innerHTML = tex(q.cau);
                    bd.innerHTML = q.dapAn.map(function (x, j) {
                        return '<label class="x-opt"><input type="radio" name="xo" value="' + j + '"' + (a === j ? ' checked' : '') + '><i></i><span>' + tex(x) + '</span></label>';
                    }).join('');
                } else if (lo === 'ds') {
                    qt.innerHTML = tex(q.cau);
                    bd.innerHTML = '<table class="x-ds"><thead><tr><th></th><th>Đúng</th><th>Sai</th></tr></thead><tbody>' + q.menh.map(function (m, j) {
                        return '<tr><td>' + tex(m.nd) + '</td>' + [true, false].map(function (v) {
                            return '<td class="c"><label><input type="radio" name="ds-' + j + '" data-i="' + j + '" value="' + (v ? 1 : 0) + '"' + (a[j] === v ? ' checked' : '') + '><i></i></label></td>';
                        }).join('') + '</tr>';
                    }).join('') + '</tbody></table>';
                } else if (lo === 'nhieu') {
                    qt.innerHTML = tex(q.cau);
                    bd.innerHTML = '<div class="x-hint">Chọn tất cả các đáp án đúng.</div>' + q.menh.map(function (m, j) {
                        return '<label class="x-opt x-cb"><input type="checkbox" data-m="' + j + '"' + (a[j] === true ? ' checked' : '') + '><i></i><span>' + tex(m.nd) + '</span></label>';
                    }).join('');
                } else if (lo === 'dien') {
                    qt.innerHTML = cauHTML(q, function (n) {
                        return '<input class="x-blank" data-b="' + n + '" value="' + thoat(a[n] || '') + '" autocomplete="off" autocapitalize="off" spellcheck="false" style="width:' + Math.max(10, String(a[n] || '').length + 3) + 'ch">';
                    }, null).h;
                } else {
                    const ch = L.chips[L.q], dung = {};
                    a.forEach(function (c) { if (c !== -1) { dung[c] = true; } });
                    const chip = function (i) { return '<span class="x-chip' + (L.sel === i ? ' sel' : '') + '" draggable="true" data-c="' + i + '">' + tex(ch[i].t) + '</span>'; };
                    const ngan = ch.map(function (c, i) { return i; }).filter(function (i) { return !dung[i]; });
                    qt.innerHTML = '<div class="x-bank">' + (ngan.length ? ngan.map(chip).join('') : '<span class="x-bank-empty">Bạn đã dùng hết các ô</span>') + '</div>' +
                        '<div class="x-keo-hd">Kéo các ô vuông thả vào vị trí thích hợp trong các câu sau:</div>' +
                        cauHTML(q, null, function (n) { return '<span class="x-slot" data-s="' + n + '">' + (a[n] !== -1 ? chip(a[n]) : '') + '</span>'; }).h +
                        '<div class="x-keo-note">Mẹo: trên điện thoại, chạm vào ô rồi chạm vào chỗ trống; chạm ô đã thả để trả về.</div>';
                }
                veBen();
            }
            function di(i) { if (i >= 0 && i < L.de.cauHoi.length) { L.q = i; veCau(); } }
            // Chuyển câu có vòng xoay: hai nút mờ đi ~0,7 giây, đổi câu giữa chừng, rồi nút sáng lại
            let xBan = false;
            function diXoay(i, nut) {
                if (xBan || i < 0 || i >= L.de.cauHoi.length || i === L.q) { return; }
                xBan = true;
                const nav = document.querySelector('.x-nav');
                nav.querySelectorAll('.x-spin').forEach(function (e) { e.classList.remove('on'); });
                nut.querySelector('.x-spin').classList.add('on');
                nav.classList.add('x-load');
                setTimeout(function () { if ($('l-exam').classList.contains('on')) { di(i); } }, 350);
                setTimeout(function () { nav.classList.remove('x-load'); xBan = false; }, 700);
            }
            $('x-prev').addEventListener('click', function () { diXoay(L.q - 1, $('x-prev')); });
            $('x-next').addEventListener('click', function () { diXoay(L.q + 1, $('x-next')); });
            $('x-q').addEventListener('change', function (e) {
                const t = e.target;
                if (t.name === 'xo') { L.ans[L.q] = parseInt(t.value, 10); veCau(); }                                   // trắc nghiệm
                else if (/^ds-/.test(t.name || '') && t.dataset.i !== undefined) { L.ans[L.q][+t.dataset.i] = t.value === '1'; veBen(); }   // đúng/sai
                else if (t.type === 'checkbox' && t.dataset.m !== undefined) { L.ans[L.q][+t.dataset.m] = t.checked; veBen(); }   // nhiều đáp án
            });
            $('x-q').addEventListener('input', function (e) {                                                           // điền khuyết
                const t = e.target;
                if (t.classList && t.classList.contains('x-blank')) {
                    L.ans[L.q][+t.dataset.b] = t.value;
                    t.style.width = Math.max(10, t.value.length + 3) + 'ch';
                    veBen();
                }
            });
            // Kéo thả: đặt ô c vào chỗ trống s (ô đang ở chỗ khác thì rút ra; ô đang nằm ở s trả về khung)
            function datChip(c, s) {
                const a = L.ans[L.q], cu = a.indexOf(c);
                if (cu !== -1) { a[cu] = -1; }
                a[s] = c; L.sel = null; veCau();
            }
            function traChip(c) {
                const a = L.ans[L.q], k = a.indexOf(c);
                if (k !== -1) { a[k] = -1; }
                L.sel = null; veCau();
            }
            $('x-q').addEventListener('click', function (e) {
                if (e.target.id === 'x-flag') { L.flag[L.q] = !L.flag[L.q]; veCau(); return; }
                const ch = e.target.closest('.x-chip'), sl = e.target.closest('.x-slot');
                if (ch) {
                    const c = +ch.dataset.c;
                    if (sl) { if (L.sel !== null) { datChip(L.sel, +sl.dataset.s); } else { traChip(c); } }   // chạm ô đã thả: đổi ô / trả về
                    else { L.sel = L.sel === c ? null : c; veCau(); }                                          // chạm ô trong khung: chọn
                } else if (sl && L.sel !== null) { datChip(L.sel, +sl.dataset.s); }
            });
            let dangKeo = null;
            $('x-q').addEventListener('dragstart', function (e) {
                const ch = e.target.closest ? e.target.closest('.x-chip') : null;
                if (!ch) { return; }
                dangKeo = +ch.dataset.c; ch.classList.add('drag');
                try { e.dataTransfer.setData('text/plain', String(dangKeo)); e.dataTransfer.effectAllowed = 'move'; } catch (x) { /* bỏ qua */ }
            });
            $('x-q').addEventListener('dragend', function () {
                dangKeo = null;
                $('x-q').querySelectorAll('.x-chip.drag, .x-slot.over').forEach(function (el) { el.classList.remove('drag', 'over'); });
            });
            $('x-q').addEventListener('dragover', function (e) {
                if (dangKeo === null) { return; }
                const sl = e.target.closest('.x-slot'), bk = e.target.closest('.x-bank');
                $('x-q').querySelectorAll('.x-slot.over').forEach(function (el) { el.classList.remove('over'); });
                if (sl) { sl.classList.add('over'); }
                if (sl || bk) { e.preventDefault(); }
            });
            $('x-q').addEventListener('drop', function (e) {
                if (dangKeo === null) { return; }
                const sl = e.target.closest('.x-slot'), bk = e.target.closest('.x-bank');
                if (!sl && !bk) { return; }
                e.preventDefault();
                const c = dangKeo; dangKeo = null;
                if (sl) { datChip(c, +sl.dataset.s); } else { traChip(c); }
            });
            $('x-nop').addEventListener('click', function () { nop(false); });
            $('x-out').addEventListener('click', function () {
                if (xacNhan('Thoát sẽ không lưu bài làm. Bạn chắc chắn thoát?')) {
                    tatGiamSat();
                    clearInterval(L.tm); dangLamBai = false; on('l-exam', false);
                }
            });
            const ketNoi = function () {
                $('x-conn').classList.toggle('off', !navigator.onLine);
                $('x-conn').querySelector('span').textContent = navigator.onLine ? 'Đã kết nối máy chủ' : 'Mất kết nối mạng';
            };
            window.addEventListener('online', ketNoi); window.addEventListener('offline', ketNoi);

            // ---- Nộp bài và xem kết quả ----
            function nop(hetGio) {
                const d = L.de, chua = d.cauHoi.filter(function (q, i) { return !daLam(q, L.ans[i]); }).length;
                if (!hetGio && chua > 0 && !xacNhan('Bạn còn ' + chua + ' câu chưa làm. Vẫn nộp bài?')) { return; }
                tatGiamSat();
                clearInterval(L.tm); dangLamBai = false;
                let dung = 0;
                const kqc = d.cauHoi.map(function (q, i) { const r = chamCau(q, L.ans[i], L.chips[i]); dung += r.diem; return r; });
                dung = Math.round(dung * 100) / 100;                       // câu nhiều ý / nhiều ô có thể được điểm từng phần
                const tong = d.cauHoi.length, diem = Math.round(dung / tong * 100) / 10, giay = Math.max(0, L.start - L.left);
                ketQua.push({ id: taoId(), email: nguoiDung.email, ten: nguoiDung.ten, deId: d.id, tenDe: d.ten,
                              diem: diem, dung: dung, tong: tong, giay: giay, ngay: new Date().toISOString() });
                luuKetQua();
                let xem = '';
                d.cauHoi.forEach(function (q, i) { if (kqc[i].diem < 1) { xem += xemLaiCau(q, i + 1, L.ans[i], kqc[i]); } });
                xem = xem === '' ? '<p class="rv-full">🎉 Bạn trả lời đúng tất cả các câu!</p>' : '<h4>Các câu cần xem lại</h4>' + xem;
                $('l-res-box').innerHTML = '<h3>Kết quả: ' + thoat(d.ten) + '</h3><div class="score-box"><div class="big">' + diem + ' / 10</div>' +
                    '<div>Đúng ' + dung + ' / ' + tong + ' câu · ' + giayThanhChu(giay) + '</div><div>' + (diem >= 8 ? 'Xuất sắc! 🎉' : diem >= 5 ? 'Khá tốt, tiếp tục luyện tập nhé!' : 'Cố gắng hơn ở lần sau nhé!') + '</div></div>' + xem +
                    '<div class="lacts"><button class="lbtn ghost" id="r-ds">Về danh sách đề</button><button class="lbtn" id="r-lai">Làm lại</button></div>';
                on('l-exam', false); on('l-res', true);
                $('r-ds').addEventListener('click', function () { on('l-res', false); veDe(L.goi); });
                $('r-lai').addEventListener('click', function () { on('l-res', false); veDe(L.goi); on('l-mode', true); });
                if (laAdmin()) { veQuanTri(); }
            }
        })();
    