
        // =====================================================
        //  CHI TIẾT BÀI LÀM (theo mẫu)
        // =====================================================
        let rvIdx = 0;
        function moChiTietLuyen() {
            const s = window.kqSnap;
            if (!s) { return; }
            rvIdx = 0;
            document.querySelector('#rv .rv-logo').src = peLogo();
            document.getElementById('rv').classList.add('on');
            document.getElementById('rv').classList.add('closed');
            veChiTietLuyen();
        }
        function veChiTietLuyen() {
            const s = window.kqSnap, lab = Object.assign({}, window.__lab, window.__labFns);
            if (!s || !lab || !lab.chamCau) { return; }
            const qs = s.de.cauHoi, n = qs.length, kq = s.kq;
            const ketQua = function (i) {
                const r = lab.chamCau(qs[i], s.ans[i], s.chips ? s.chips[i] : null);
                if (r.diem >= 1) { return 'ok'; }
                return lab.daLam(qs[i], s.ans[i]) ? 'bad' : 'skip';
            };
            document.getElementById('rv-ten').textContent = s.de.ten;

            const ng = new Date(kq.ngay);
            document.getElementById('rv-time').textContent = 'Hoàn thành: ' +
                ng.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + ng.toLocaleDateString('vi-VN');
            document.getElementById('rv-pos').textContent = 'Câu ' + (rvIdx + 1) + ' / ' + n;

            document.getElementById('rv-stats').innerHTML =
                '<div><small>Điểm số</small><b>' + kq.diem + '</b></div>' +
                '<div><small>Câu đúng</small><b>' + Math.round(kq.dung) + '/' + kq.tong + '</b></div>' +
                '<div><small>Thời gian</small><b>' + kq.giay + 's</b></div>';
            document.getElementById('rv-grid').innerHTML = qs.map(function (q, i) {
                return '<button class="rv-n ' + ketQua(i) + (i === rvIdx ? ' cur' : '') + '" data-i="' + i + '">' + (i + 1) + '</button>';
            }).join('');

            const q = qs[rvIdx], a = s.ans[rvIdx], tt = ketQua(rvIdx);
            const laTN = lab.loaiCau(q) === 'tn';
            let opts = '';
            if (laTN) {
                opts = q.dapAn.map(function (t, j) {
                    const chon = j === a, dung = j === q.dung;
                    return '<div class="rv-opt' + (chon ? ' chon' : '') + (dung && !chon ? ' dung' : '') + '"><i></i><span>' + lab.tex(t) + '</span></div>';
                }).join('');
            } else {
                opts = '<p class="rv-note">Dạng câu này xem đáp án trong bản chi tiết của phòng luyện.</p>';
            }
            const nhan = tt === 'ok' ? '<div class="rv-res ok"><span class="rv-ic">✔</span>Đúng</div>'
                       : tt === 'bad' ? '<div class="rv-res bad"><span class="rv-ic">✘</span>Sai</div>'
                       : '<div class="rv-res skip"><span class="rv-ic">—</span>Chưa làm</div>';
            document.getElementById('rv-body').innerHTML =
                '<div class="rv-card">' +
                    '<div class="rv-qhead"><span class="rv-badge">' + (rvIdx + 1) + '</span>' +
                    '<div class="rv-qtext">' + lab.tex(q.cau) + '</div></div>' +
                    '<div class="rv-opts">' + opts + '</div>' +
                    nhan +
                    (laTN ? '<div class="rv-ans">Đáp án đúng: <b>' + 'ABCD'.charAt(q.dung) + '</b></div>' : '') +
                    '<div class="rv-btns">' +
                        '<button class="rv-btn" id="rv-loigiai">Xem đáp án chi tiết</button>' +
                        '<button class="rv-btn" id="rv-video">Xem video hướng dẫn giải</button>' +
                    '</div>' +
                '</div>';
            document.getElementById('rv-prev').disabled = rvIdx === 0;
            document.getElementById('rv-next').disabled = rvIdx === n - 1;
            // Khung lời giải của câu: hiện / ẩn ngay bên dưới hai nút
            const khungLG = document.createElement('div');
            khungLG.className = 'rv-lg';
            khungLG.style.display = 'none';
            const noiLG = (q.loiGiai || '').trim();
            khungLG.innerHTML = '<div class="rv-lg-t">Đáp án chi tiết:</div>' +
                (noiLG ? '<div class="rv-lg-n">' + lab.tex(noiLG) + '</div>' : '<div class="rv-lg-n rv-lg-trong">Câu này chưa có lời giải.</div>');
            document.querySelector('#rv-body .rv-card').appendChild(khungLG);
            document.getElementById('rv-loigiai').addEventListener('click', function () {
                const dangMo = khungLG.style.display !== 'none';
                khungLG.style.display = dangMo ? 'none' : 'block';
                this.textContent = dangMo ? 'Xem đáp án chi tiết' : 'Ẩn đáp án chi tiết';
            });
            document.getElementById('rv-video').addEventListener('click', function () { hienToast('Video hướng dẫn giải cho câu này chưa có.'); });
        }
        function rvChuyen(i) { rvIdx = i; veChiTietLuyen(); }
        document.getElementById('rv-prev').addEventListener('click', function () { if (rvIdx > 0) { rvChuyen(rvIdx - 1); } });
        document.getElementById('rv-next').addEventListener('click', function () {
            const s = window.kqSnap; if (s && rvIdx < s.de.cauHoi.length - 1) { rvChuyen(rvIdx + 1); }
        });
        document.getElementById('rv-grid').addEventListener('click', function (e) {
            const b = e.target.closest('button[data-i]'); if (b) { rvChuyen(Number(b.dataset.i)); }
        });
        function rvDongMo(mo) {
            const rv = document.getElementById('rv');
            rv.classList.toggle('closed', !mo);
        }
        document.getElementById('rv-open').addEventListener('click', function () {
            rvDongMo(document.getElementById('rv').classList.contains('closed'));
        });
        document.getElementById('rv-tab').addEventListener('click', function () { rvDongMo(true); });
        document.getElementById('rv-back').addEventListener('click', function () {
            document.getElementById('rv').classList.remove('on');
        });
    