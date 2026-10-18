
        // =====================================================
        //  CHẤM ĐIỂM IRT (mô hình 3PL, ước lượng năng lực EAP)
        //  Điểm = 5 + 1,5 × θ, cắt trong khoảng 0–10.
        //  Thang điểm này là quy ước của SKY EDU, không phải điểm TSA chính thức.
        // =====================================================
        function thamSoIRT(q) {
            const t = q.irt || {};
            return {
                a: (typeof t.a === 'number' && t.a > 0) ? t.a : 1,                        // độ phân biệt
                b: (typeof t.b === 'number') ? t.b : 0,                                   // độ khó
                c: (typeof t.c === 'number') ? Math.min(Math.max(t.c, 0), 0.5) : 0.25     // xác suất đoán đúng
            };
        }

        function tinhDiemIRT(de, chon) {
            const luoi = [];
            for (let th = -4; th <= 4.0001; th += 0.1) { luoi.push(th); }
            // log-posterior cho từng điểm θ (prior chuẩn N(0,1) + khả năng của các câu trả lời)
            const logP = luoi.map(function (th) {
                let s = -0.5 * th * th;
                de.cauHoi.forEach(function (q, i) {
                    const p = thamSoIRT(q);
                    const P = p.c + (1 - p.c) / (1 + Math.exp(-p.a * (th - p.b)));
                    const dung = chon[i] === q.dung;                 // chưa làm (-1) tính là sai
                    s += Math.log(dung ? P : (1 - P));
                });
                return s;
            });
            const max = Math.max.apply(null, logP);
            let tuSo = 0, mauSo = 0;
            luoi.forEach(function (th, k) {
                const w = Math.exp(logP[k] - max);
                tuSo += th * w; mauSo += w;
            });
            const theta = tuSo / mauSo;
            const diem = Math.min(10, Math.max(0, 5 + 1.5 * theta));
            return Math.round(diem * 10) / 10;
        }

        // ----- Quản trị: nút 📐 Tham số IRT trên từng đề -----
        const veDeTruocIRT = veDe;
        veDe = function () {
            veDeTruocIRT();
            document.querySelectorAll('#de-luoi .de-card').forEach(function (the) {
                const nut = the.querySelector('button[data-act]');
                const acts = the.querySelector('.de-acts');
                if (!nut || !acts || the.querySelector('[data-thamso-id]')) { return; }
                const b = document.createElement('button');
                b.className = 'icon-btn';
                b.dataset.thamsoId = nut.dataset.id;
                b.title = 'Tham số IRT từng câu';
                b.textContent = '📐 IRT';
                acts.insertBefore(b, acts.firstChild);
            });
        };
        document.getElementById('de-luoi').addEventListener('click', function (e) {
            const b = e.target.closest('button[data-thamso-id]');
            if (b) { e.stopPropagation(); moThamSoIRT(b.dataset.thamsoId); }
        }, true);

        function moThamSoIRT(deId) {
            const de = deThi.find(function (d) { return d.id === deId; });
            if (!de) { return; }
            let noi = '<h3>Tham số IRT</h3>' +
                '<p class="modal-sub">' + thoat(de.ten) + '. Để trống hoặc giữ mặc định (a = 1, b = 0, c = 0,25) nếu chưa có số liệu. ' +
                'Độ khó b: số càng lớn càng khó (thường từ -2 đến 2). Độ phân biệt a: thường từ 0,5 đến 2.</p>' +
                '<div class="table-wrap"><table class="tbl"><thead><tr><th>Câu</th><th>Nội dung</th><th>a</th><th>b</th><th>c</th></tr></thead><tbody>';
            de.cauHoi.forEach(function (q, i) {
                const p = thamSoIRT(q);
                noi += '<tr><td>' + (i + 1) + '</td><td>' + thoat(q.cau.slice(0, 50)) + (q.cau.length > 50 ? '…' : '') + '</td>' +
                       '<td><input type="number" step="0.1" min="0.1" class="irt-a" value="' + p.a + '" style="width:70px"></td>' +
                       '<td><input type="number" step="0.1" class="irt-b" value="' + p.b + '" style="width:70px"></td>' +
                       '<td><input type="number" step="0.05" min="0" max="0.5" class="irt-c" value="' + p.c + '" style="width:70px"></td></tr>';
            });
            noi += '</tbody></table></div><div class="form-error" id="irt-loi"></div>' +
                   '<div class="dialog-actions"><button class="btn-sec" id="irt-huy">Hủy</button><button class="btn-link" id="irt-luu">Lưu</button></div>';
            moDialog(noi, true);
            document.getElementById('irt-huy').addEventListener('click', dongDialog);
            document.getElementById('irt-luu').addEventListener('click', function () {
                const as = document.querySelectorAll('.irt-a'), bs = document.querySelectorAll('.irt-b'), cs = document.querySelectorAll('.irt-c');
                for (let i = 0; i < de.cauHoi.length; i++) {
                    const a = parseFloat(as[i].value), b = parseFloat(bs[i].value), c = parseFloat(cs[i].value);
                    if (!(a > 0) || isNaN(b) || !(c >= 0 && c <= 0.5)) {
                        baoLoi(document.getElementById('irt-loi'), 'Câu ' + (i + 1) + ': a phải > 0, b là số, c từ 0 đến 0,5.');
                        return;
                    }
                    de.cauHoi[i].irt = { a: a, b: b, c: c };
                }
                luuDe();
                dongDialog();
                veQuanTri();
                hienToast('Đã lưu tham số IRT cho đề.');
            });
        }
    