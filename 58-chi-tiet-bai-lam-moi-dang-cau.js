
        // =====================================================
        //  CHI TIẾT BÀI LÀM: mọi dạng câu (trắc nghiệm, đúng/sai, điền, kéo thả)
        // =====================================================
        function veChiTietLuyen() {
            const s = window.kqSnap, lab = Object.assign({}, window.__lab, window.__labFns);
            if (!s || !lab || !lab.chamCau) { return; }
            const qs = s.de.cauHoi, n = qs.length, kq = s.kq;
            const chiTiet = function (i) {
                const r = lab.chamCau(qs[i], s.ans[i], s.chips ? s.chips[i] : null);
                const da = lab.daLam(qs[i], s.ans[i]);
                let trang = 'skip';
                if (r.diem >= 1) { trang = 'ok'; } else if (da) { trang = r.diem > 0 ? 'part' : 'bad'; }
                return { r: r, trang: trang };
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
                const t = chiTiet(i).trang;
                const cls = t === 'ok' ? 'ok' : (t === 'skip' ? '' : 'bad');
                return '<button class="rv-n ' + cls + (i === rvIdx ? ' cur' : '') + '" data-i="' + i + '">' + (i + 1) + '</button>';
            }).join('');

            const q = qs[rvIdx], a = s.ans[rvIdx];
            const ct = chiTiet(rvIdx);
            const lo = lab.loaiCau(q);
            const nhan = ct.trang === 'ok' ? '<div class="rv-res ok"><span class="rv-ic">✔</span>Đúng</div>'
                       : ct.trang === 'part' ? '<div class="rv-res part"><span class="rv-ic">~</span>Đúng một phần (' + Math.round(ct.r.diem * 100) + '%)</div>'
                       : ct.trang === 'bad' ? '<div class="rv-res bad"><span class="rv-ic">✘</span>Sai</div>'
                       : '<div class="rv-res skip"><span class="rv-ic">—</span>Chưa làm</div>';

            let noiDung = '', chiTietDong = '', dapAnDong = '';
            if (lo === 'tn') {
                noiDung = lab.tex(q.cau);
                chiTietDong = q.dapAn.map(function (t, j) {
                    const chon = j === a, dung = j === q.dung;
                    return '<div class="rv-opt' + (chon ? ' chon' : '') + (dung && !chon ? ' dung' : '') + '"><i></i><span>' + lab.tex(t) + '</span></div>';
                }).join('');
                chiTietDong = '<div class="rv-opts">' + chiTietDong + '</div>';
            } else if (lo === 'ds' || lo === 'nhieu') {
                // Đúng/Sai và nhiều đáp án: dùng ô tròn như câu trắc nghiệm (xanh = bạn chọn, viền xanh lá = đáp án đúng)
                noiDung = lab.tex(q.cau);
                const dong = ct.r.ct || [];
                const kyHieu = function (i) { const c = dong[i]; return c ? '<span class="rv-dsic ' + (c.ok ? 'ok' : 'bad') + '">' + (c.ok ? '✔' : '✘') + '</span>' : ''; };
                if (lo === 'ds') {
                    // Bảng Đúng/Sai: mỗi ý một hàng, hai cột ô tròn (xanh = bạn chọn, viền xanh lá = đáp án đúng khi bạn chọn sai)
                    const o = function (chon, dung) { return '<td class="rv-dst-c"><span class="rv-opt' + (chon ? ' chon' : '') + (dung && !chon ? ' dung' : '') + '"><i></i></span></td>'; };
                    chiTietDong = '<table class="rv-dst"><thead><tr><th></th><th>Đúng</th><th>Sai</th></tr></thead><tbody>' + q.menh.map(function (m, i) {
                        const ai = (a && a[i] !== undefined) ? a[i] : null;
                        return '<tr><td class="rv-dst-t">' + lab.tex(m.nd) + '</td>' + o(ai === true, !!m.dung) + o(ai === false, !m.dung) + '</tr>';
                    }).join('') + '</tbody></table>';
                    dapAnDong = q.menh.map(function (m) { return m.dung ? 'Đúng' : 'Sai'; }).join(' ; ');
                } else {
                    chiTietDong = '<div class="rv-dsl">' + q.menh.map(function (m, i) {
                        const ai = (a && a[i] !== undefined) ? a[i] : null;
                        const chon = ai === true, dung = !!m.dung;
                        return '<div class="rv-opt' + (chon ? ' chon' : '') + (dung && !chon ? ' dung' : '') + '"><i></i><span>' + lab.tex(m.nd) + '</span>' + kyHieu(i) + '</div>';
                    }).join('') + '</div>';
                    dapAnDong = q.menh.map(function (m, i) { return m.dung ? 'abcdefgh'.charAt(i) : ''; }).filter(Boolean).join(', ');
                }
            } else {
                noiDung = (lo === 'dien' || lo === 'keo') && lab.cauGon ? lab.cauGon(q) : lab.tex(q.cau);
                const dong = ct.r.ct || [];
                chiTietDong = '<div class="rv-ct">' + dong.map(function (c, i) {
                    const tenY = (lo === 'ds' || lo === 'nhieu') ? '<div class="rv-ct-y">' + lab.tex(c.nd) + '</div>' : '<div class="rv-ct-y">Ô ' + (i + 1) + '</div>';
                    return '<div class="rv-ct-row ' + (c.ok ? 'ok' : 'bad') + '">' + tenY +
                           '<div class="rv-ct-v"><span>Bạn: ' + (c.nguoiH || '') + '</span><span>Đáp án: <b>' + (c.dapAnH || '') + '</b></span></div>' +
                           '<span class="rv-ct-ic">' + (c.ok ? '✔' : '✘') + '</span></div>';
                }).join('') + '</div>';
            }

            document.getElementById('rv-body').innerHTML =
                '<div class="rv-card">' +
                    '<div class="rv-qhead"><span class="rv-badge">' + (rvIdx + 1) + '</span>' +
                    '<div class="rv-qtext">' + (q.anh && anhViTri(q) === 'tren' ? anhCauHTML(q, rvIdx + 1) : '') + noiDung + (q.anh && anhViTri(q) === 'duoi' ? anhCauHTML(q, rvIdx + 1) : '') + '</div></div>' +
                    '<div class="rv-body-ct">' + chiTietDong + '</div>' +
                    nhan +
                    (lo === 'tn' ? '<div class="rv-ans">Đáp án đúng: <b>' + 'ABCD'.charAt(q.dung) + '</b></div>' : (dapAnDong ? '<div class="rv-ans">Đáp án đúng: <b><i>' + dapAnDong + '</i></b></div>' : '')) +
                    '<div class="rv-btns">' +
                        '<button class="rv-btn" id="rv-loigiai">Xem đáp án chi tiết</button>' +
                        '<button class="rv-btn" id="rv-video">Xem video hướng dẫn giải</button>' +
                    '</div>' +
                '</div>';

            // Khung lời giải của câu
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

            document.getElementById('rv-prev').disabled = rvIdx === 0;
            document.getElementById('rv-next').disabled = rvIdx === n - 1;
        }
    