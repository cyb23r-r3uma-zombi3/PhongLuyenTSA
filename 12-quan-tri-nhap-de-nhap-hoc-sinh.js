
        // =====================================================
        //  BỔ SUNG QUẢN TRỊ: NHẬP ĐỀ TỪ FILE, NHẬP HỌC SINH HÀNG LOẠT, ĐẶT LẠI MẬT KHẨU
        // =====================================================

        // ---------- Phần xử lý dữ liệu thuần (không đụng giao diện) ----------

        // Tách văn bản CSV thành mảng các dòng, mỗi dòng là mảng ô. Hỗ trợ ô đặt trong dấu "..."
        function tachCSV(text, delim) {
            const rows = [];
            let row = [], cell = '', inQ = false;
            for (let i = 0; i < text.length; i++) {
                const c = text[i];
                if (inQ) {
                    if (c === '"') {
                        if (text[i + 1] === '"') { cell += '"'; i++; } else { inQ = false; }
                    } else { cell += c; }
                } else if (c === '"' && cell === '') {
                    inQ = true;
                } else if (c === delim) {
                    row.push(cell); cell = '';
                } else if (c === '\n') {
                    row.push(cell); rows.push(row); row = []; cell = '';
                } else if (c !== '\r') {
                    cell += c;
                }
            }
            row.push(cell);
            rows.push(row);
            return rows.filter(function (r) { return r.some(function (o) { return o.trim() !== ''; }); });
        }

        // Đoán dấu ngăn cách của dòng đầu tiên: Tab (dán từ Excel), chấm phẩy hoặc phẩy
        function doanDauTach(text) {
            const dong = (text.split('\n').find(function (l) { return l.trim() !== ''; }) || '');
            const dem = function (ch) { return dong.split(ch).length - 1; };
            if (dem('\t') > 0) { return '\t'; }
            return dem(';') > dem(',') ? ';' : ',';
        }

        // Chuyển chữ cái / số thành chỉ số đáp án: A -> 0, B -> 1, C -> 2, D -> 3 (hoặc 1..4)
        function chiSoDapAn(s) {
            s = String(s === undefined || s === null ? '' : s).trim().toUpperCase();
            if (/^[A-D]$/.test(s)) { return s.charCodeAt(0) - 65; }
            if (/^[1-4]$/.test(s)) { return parseInt(s, 10) - 1; }
            return -1;
        }

        // Kiểm tra một câu hỏi đã gom xong, trả về {cau} hoặc {loi}
        function chotCauHoi(cau, dapAn, dung, so) {
            cau = (cau || '').trim();
            const da = [0, 1, 2, 3].map(function (i) { return (dapAn[i] || '').trim(); });
            if (cau === '') { return { loi: 'Câu ' + so + ': thiếu nội dung câu hỏi.' }; }
            if (da.some(function (a) { return a === ''; })) { return { loi: 'Câu ' + so + ': cần đủ 4 đáp án A, B, C, D.' }; }
            if (!(dung >= 0 && dung <= 3)) { return { loi: 'Câu ' + so + ': chưa chỉ ra đáp án đúng.' }; }
            return { cau: { cau: cau, dapAn: da, dung: dung } };
        }

        // Đọc đề dạng văn bản (dán từ Word / file .txt)
        //   Câu 1. Nội dung ...      A. ...   B. ...   C. ...   D. ...      Đáp án: B
        //   (hoặc đánh dấu * trước đáp án đúng, ví dụ:  *B. 14)
        function phanTichVanBan(raw) {
            const reCau = /^\s*(?:câu|cau|question)\s*\d+\s*[.:)]?\s*(.*)$/i;
            const reSo = /^\s*\d+\s*[.)]\s+(.*)$/;
            const reChon = /^\s*(\*)?\s*([A-Da-d])\s*[.)]\s*(.*)$/;
            const reDap = /^\s*(?:đáp án|dap an|đ\/a|answer|ans)\s*(?:đúng)?\s*[:\-.]?\s*([A-Da-d])\b/i;

            const ketQua = [], loi = [];
            let q = null, cuoi = null;     // cuoi: 'q' hoặc chỉ số đáp án đang viết dở

            function dong() {
                if (!q) { return; }
                const r = chotCauHoi(q.cau, q.dapAn, q.dung, q.so);
                if (r.loi) { loi.push(r.loi); } else { ketQua.push(r.cau); }
                q = null; cuoi = null;
            }

            raw.replace(/\r/g, '').split('\n').forEach(function (l) {
                if (l.trim() === '') { return; }
                let m;
                if ((m = reDap.exec(l)) && q) {
                    q.dung = chiSoDapAn(m[1]); cuoi = null;
                } else if ((m = reCau.exec(l)) || (m = reSo.exec(l))) {
                    dong();
                    q = { so: ketQua.length + loi.length + 1, cau: m[1], dapAn: ['', '', '', ''], dung: -1 };
                    cuoi = 'q';
                } else if (q && (m = reChon.exec(l))) {
                    const i = m[2].toUpperCase().charCodeAt(0) - 65;
                    q.dapAn[i] = m[3];
                    if (m[1]) { q.dung = i; }
                    cuoi = i;
                } else if (q) {
                    // dòng nối tiếp của câu hỏi hoặc của đáp án đang viết dở
                    if (cuoi === 'q') { q.cau += ' ' + l.trim(); }
                    else if (cuoi !== null) { q.dapAn[cuoi] += ' ' + l.trim(); }
                }
            });
            dong();
            return { cauHoi: ketQua, loi: loi };
        }

        // Đọc đề dạng bảng: Câu hỏi | A | B | C | D | Đáp án đúng
        function phanTichBang(raw) {
            const rows = tachCSV(raw.replace(/^\uFEFF/, ''), doanDauTach(raw));
            const ketQua = [], loi = [];
            let bat = 0;
            // Bỏ dòng tiêu đề nếu có
            if (rows.length > 0 && chiSoDapAn(rows[0][5]) === -1 && /câu|cau|question|nội dung/i.test(rows[0][0] || '')) { bat = 1; }
            for (let i = bat; i < rows.length; i++) {
                const r = rows[i];
                const so = i - bat + 1;
                if (r.length < 6) { loi.push('Dòng ' + (i + 1) + ': cần 6 cột (câu hỏi, A, B, C, D, đáp án đúng).'); continue; }
                const x = chotCauHoi(r[0], [r[1], r[2], r[3], r[4]], chiSoDapAn(r[5]), so);
                if (x.loi) { loi.push(x.loi); } else { ketQua.push(x.cau); }
            }
            return { cauHoi: ketQua, loi: loi };
        }

        // Đọc đề dạng JSON: [{cau, dapAn:[4], dung}] hoặc file đề xuất ra từ hệ thống
        function phanTichJSON(raw) {
            let d;
            try { d = JSON.parse(raw); } catch (e) { return { cauHoi: [], loi: ['File JSON không đọc được (sai cú pháp).'] }; }
            if (d && !Array.isArray(d) && Array.isArray(d.cauHoi)) { d = d.cauHoi; }
            if (!Array.isArray(d)) { return { cauHoi: [], loi: ['JSON cần là một danh sách câu hỏi.'] }; }
            const ketQua = [], loi = [];
            d.forEach(function (it, i) {
                it = it || {};
                const dung = typeof it.dung === 'number' ? it.dung : chiSoDapAn(it.dung);
                const x = chotCauHoi(it.cau, Array.isArray(it.dapAn) ? it.dapAn.map(String) : [], dung, i + 1);
                if (x.loi) { loi.push(x.loi); } else { ketQua.push(x.cau); }
            });
            return { cauHoi: ketQua, loi: loi };
        }

        // Tự nhận biết định dạng rồi đọc
        function phanTichDe(raw) {
            const t = raw.replace(/^\uFEFF/, '').trim();
            if (t === '') { return { cauHoi: [], loi: [] }; }
            if (t[0] === '[' || t[0] === '{') { return phanTichJSON(t); }
            const dau = t.split('\n').find(function (l) { return l.trim() !== ''; }) || '';
            const laVanBan = /^\s*(?:câu|cau|question)\s*\d+/i.test(dau) || /^\s*\d+\s*[.)]\s+/.test(dau);
            if (!laVanBan && tachCSV(dau + '\n', doanDauTach(t))[0].length >= 6) { return phanTichBang(t); }
            return phanTichVanBan(t);
        }

        // Mật khẩu ngẫu nhiên (bỏ các ký tự dễ nhầm như 0/O, 1/l/I)
        function taoMatKhau(n) {
            const bang = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
            const a = new Uint32Array(n);
            crypto.getRandomValues(a);
            return Array.prototype.map.call(a, function (x) { return bang[x % bang.length]; }).join('');
        }

        // Đọc danh sách học sinh: Họ tên | Email | Mật khẩu (có thể trống) | Lớp | SĐT
        function phanTichHocSinh(raw, daCo) {
            const rows = tachCSV(raw.replace(/^\uFEFF/, ''), doanDauTach(raw));
            const moi = [], trung = [], loi = [];
            const thay = {};
            daCo.forEach(function (e) { thay[e] = true; });
            let bat = 0;
            if (rows.length > 0 && /email|họ|tên|ten/i.test((rows[0][1] || '') + ' ' + (rows[0][0] || '')) && !/@/.test(rows[0][1] || '')) { bat = 1; }
            for (let i = bat; i < rows.length; i++) {
                const r = rows[i].map(function (o) { return o.trim(); });
                const ten = r[0] || '', email = (r[1] || '').toLowerCase(), mk = r[2] || '';
                const stt = 'Dòng ' + (i + 1) + ': ';
                if (ten === '') { loi.push(stt + 'thiếu họ tên.'); continue; }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { loi.push(stt + 'email "' + email + '" chưa đúng định dạng.'); continue; }
                if (mk !== '' && mk.length < 6) { loi.push(stt + 'mật khẩu cần ít nhất 6 ký tự (hoặc để trống để tự tạo).'); continue; }
                if (thay[email]) { trung.push(email); continue; }
                thay[email] = true;
                moi.push({ ten: ten, email: email, matKhau: mk, lop: r[3] || '', sdt: r[4] || '' });
            }
            return { moi: moi, trung: trung, loi: loi };
        }

        // ---- DOM ----
        // ---------- Phần giao diện ----------

        const FILE_MAU_VAN_BAN =
            'Câu 1. Giá trị của biểu thức 2 + 3 × 4 là?\nA. 20\nB. 14\nC. 24\nD. 12\nĐáp án: B\n\n' +
            'Câu 2. Thủ đô của Việt Nam là thành phố nào?\nA. Huế\nB. Đà Nẵng\n*C. Hà Nội\nD. Hải Phòng\n\n' +
            'Câu 3. Nước nguyên chất sôi ở bao nhiêu độ C?\nA. 50\nB. 80\nC. 100\nD. 120\nĐáp án: C\n';
        const FILE_MAU_BANG =
            '\uFEFFCâu hỏi,A,B,C,D,Đáp án đúng\n' +
            '"Giá trị của 2 + 3 × 4 là?",20,14,24,12,B\n' +
            '"Thủ đô của Việt Nam là?",Huế,Đà Nẵng,Hà Nội,Hải Phòng,C\n';
        const FILE_MAU_HS =
            '\uFEFFHọ tên,Email,Mật khẩu,Lớp,Số điện thoại\n' +
            'Nguyễn Văn A,vana@gmail.com,,12A1,0901234567\n' +
            'Trần Thị B,thib@gmail.com,matkhau123,12A2,\n';

        // Đọc file chọn từ máy rồi đưa chữ vào ô textarea
        function docFileVaoO(inputFile, oChu, khiXong) {
            const f = inputFile.files[0];
            if (!f) { return; }
            if (f.size > 3 * 1024 * 1024) { hienToast('File quá lớn (tối đa 3 MB).'); inputFile.value = ''; return; }
            const doc = new FileReader();
            doc.onload = function () {
                const chu = String(doc.result);
                if (chu.indexOf('\uFFFD') !== -1) { hienToast('File có ký tự lỗi. Hãy lưu file ở dạng UTF-8 rồi thử lại.'); }
                oChu.value = chu;
                khiXong();
            };
            doc.readAsText(f, 'UTF-8');
            inputFile.value = '';
        }

        // ----- Nhập đề thi -----
        function moNhapDe() {
            moDialog(
                '<h3>Đưa đề thi lên</h3>' +
                '<p class="modal-sub">Chọn file hoặc dán nội dung đề (copy từ Word / Excel). Hệ thống tự nhận diện các câu hỏi.</p>' +
                '<div class="form-2col">' +
                    '<div class="field full"><label for="i-ten">Tên đề thi</label><input id="i-ten" placeholder="Ví dụ: Đề thi thử TSA số 2"></div>' +
                    '<div class="field"><label for="i-phong">Phòng luyện</label><select id="i-phong"><option value="tsa">Phòng TSA</option><option value="hsa">Phòng HSA</option></select></div>' +
                    '<div class="field"><label for="i-goi">Gói đề</label><select id="i-goi">' + goiOptions() + '</select></div>' +
                    '<div class="field"><label for="i-phut">Thời gian làm bài (phút)</label><input id="i-phut" type="number" min="1" max="300" value="60"></div>' +
                    '<label class="check full"><input type="checkbox" id="i-hien" checked> Cho học sinh làm đề này ngay</label>' +
                '</div>' +
                '<div class="field"><label for="i-file">Chọn file đề (.txt, .csv, .json)</label><input type="file" id="i-file" accept=".txt,.csv,.tsv,.json,text/plain,text/csv,application/json"></div>' +
                '<div class="field"><label for="i-chu">Hoặc dán nội dung đề vào đây</label>' +
                    '<textarea id="i-chu" rows="9" class="mono" placeholder="Câu 1. Nội dung câu hỏi\nA. Đáp án A\nB. Đáp án B\nC. Đáp án C\nD. Đáp án D\nĐáp án: B"></textarea></div>' +
                '<div class="imp-links">Tải file mẫu: <a href="#" id="i-mau-txt">văn bản (.txt)</a> · <a href="#" id="i-mau-csv">bảng Excel (.csv)</a></div>' +
                '<div class="imp-result" id="i-kq"></div>' +
                '<div class="form-error" id="i-loi"></div>' +
                '<div class="dialog-actions"><button class="btn-sec" id="i-huy">Hủy</button><button class="btn-link" id="i-luu">Lưu đề thi</button></div>',
                true
            );

            const oChu = document.getElementById('i-chu');
            const oKq = document.getElementById('i-kq');
            let kq = { cauHoi: [], loi: [] };

            function capNhat() {
                kq = phanTichDe(oChu.value);
                let h = '';
                if (oChu.value.trim() === '') { oKq.innerHTML = ''; return; }
                if (kq.cauHoi.length > 0) {
                    h += '<div class="imp-ok">✔ Nhận diện được <b>' + kq.cauHoi.length + '</b> câu hợp lệ.</div>';
                    h += '<ol class="imp-list">' + kq.cauHoi.slice(0, 4).map(function (c) {
                        return '<li>' + thoat(c.cau.length > 90 ? c.cau.slice(0, 90) + '…' : c.cau) + ' <small>(đúng: ' + 'ABCD'.charAt(c.dung) + ')</small></li>';
                    }).join('') + '</ol>';
                    if (kq.cauHoi.length > 4) { h += '<div class="imp-more">… và ' + (kq.cauHoi.length - 4) + ' câu nữa</div>'; }
                }
                if (kq.loi.length > 0) {
                    h += '<div class="imp-err"><b>Có ' + kq.loi.length + ' lỗi cần sửa:</b><ul>' +
                         kq.loi.slice(0, 6).map(function (x) { return '<li>' + thoat(x) + '</li>'; }).join('') +
                         (kq.loi.length > 6 ? '<li>… và ' + (kq.loi.length - 6) + ' lỗi khác</li>' : '') + '</ul></div>';
                }
                if (kq.cauHoi.length === 0 && kq.loi.length === 0) {
                    h += '<div class="imp-err">Chưa nhận diện được câu hỏi nào. Hãy kiểm tra lại định dạng theo file mẫu.</div>';
                }
                oKq.innerHTML = h;
            }

            oChu.addEventListener('input', capNhat);
            document.getElementById('i-file').addEventListener('change', function () { docFileVaoO(this, oChu, capNhat); });
            document.getElementById('i-mau-txt').addEventListener('click', function (e) { e.preventDefault(); taiFile('mau-de-thi.txt', '\uFEFF' + FILE_MAU_VAN_BAN, 'text/plain'); });
            document.getElementById('i-mau-csv').addEventListener('click', function (e) { e.preventDefault(); taiFile('mau-de-thi.csv', FILE_MAU_BANG, 'text/csv'); });
            document.getElementById('i-huy').addEventListener('click', dongDialog);

            document.getElementById('i-luu').addEventListener('click', function () {
                const loi = document.getElementById('i-loi');
                const ten = document.getElementById('i-ten').value.trim();
                const phut = parseInt(document.getElementById('i-phut').value, 10);
                capNhat();
                if (ten === '') { baoLoi(loi, 'Vui lòng nhập tên đề thi.'); return; }
                if (!(phut >= 1 && phut <= 300)) { baoLoi(loi, 'Thời gian làm bài phải từ 1 đến 300 phút.'); return; }
                if (kq.cauHoi.length === 0) { baoLoi(loi, 'Chưa có câu hỏi hợp lệ nào để lưu.'); return; }
                if (kq.loi.length > 0) { baoLoi(loi, 'Hãy sửa hết các lỗi ở trên rồi lưu (để tránh mất câu hỏi).'); return; }

                deThi.push({ id: taoId(), ten: ten, phong: document.getElementById('i-phong').value, goi: document.getElementById('i-goi').value, phut: phut,
                             hienThi: document.getElementById('i-hien').checked, cauHoi: kq.cauHoi,
                             ngayTao: new Date().toISOString(), nguoiTao: nguoiDung ? nguoiDung.email : '' });
                luuDe();
                dongDialog();
                veQuanTri();
                hienToast('Đã đưa lên đề "' + ten + '" (' + kq.cauHoi.length + ' câu) ✔');
            });
        }

        // ----- Nhập học sinh hàng loạt -----
        function moNhapHocSinh() {
            moDialog(
                '<h3>Nhập danh sách học sinh</h3>' +
                '<p class="modal-sub">Mỗi dòng một học sinh theo thứ tự: <b>Họ tên, Email, Mật khẩu, Lớp, SĐT</b>. Để trống mật khẩu thì hệ thống tự tạo.</p>' +
                '<div class="field"><label for="n-file">Chọn file (.csv, .txt)</label><input type="file" id="n-file" accept=".csv,.tsv,.txt,text/csv,text/plain"></div>' +
                '<div class="field"><label for="n-chu">Hoặc dán danh sách vào đây (copy từ Excel được)</label>' +
                    '<textarea id="n-chu" rows="8" class="mono" placeholder="Nguyễn Văn A, vana@gmail.com, , 12A1, 0901234567"></textarea></div>' +
                '<div class="imp-links">Tải file mẫu: <a href="#" id="n-mau">danh sách học sinh (.csv)</a></div>' +
                '<div class="imp-result" id="n-kq"></div>' +
                '<div class="dialog-actions"><button class="btn-sec" id="n-huy">Hủy</button><button class="btn-link" id="n-luu">Tạo tài khoản</button></div>',
                true
            );
            const oChu = document.getElementById('n-chu');
            const oKq = document.getElementById('n-kq');
            let kq = { moi: [], trung: [], loi: [] };

            function capNhat() {
                kq = phanTichHocSinh(oChu.value, danhSach.map(function (u) { return u.email; }));
                if (oChu.value.trim() === '') { oKq.innerHTML = ''; return; }
                let h = '<div class="imp-ok">✔ Sẽ tạo mới <b>' + kq.moi.length + '</b> tài khoản.</div>';
                if (kq.trung.length > 0) { h += '<div class="imp-warn">⚠ Bỏ qua ' + kq.trung.length + ' email đã có tài khoản.</div>'; }
                if (kq.loi.length > 0) {
                    h += '<div class="imp-err"><b>' + kq.loi.length + ' dòng lỗi (sẽ bị bỏ qua):</b><ul>' +
                         kq.loi.slice(0, 5).map(function (x) { return '<li>' + thoat(x) + '</li>'; }).join('') +
                         (kq.loi.length > 5 ? '<li>…</li>' : '') + '</ul></div>';
                }
                oKq.innerHTML = h;
            }
            oChu.addEventListener('input', capNhat);
            document.getElementById('n-file').addEventListener('change', function () { docFileVaoO(this, oChu, capNhat); });
            document.getElementById('n-mau').addEventListener('click', function (e) { e.preventDefault(); taiFile('mau-hoc-sinh.csv', FILE_MAU_HS, 'text/csv'); });
            document.getElementById('n-huy').addEventListener('click', dongDialog);

            document.getElementById('n-luu').addEventListener('click', function () {
                capNhat();
                if (kq.moi.length === 0) { hienToast('Không có tài khoản hợp lệ nào để tạo.'); return; }
                const bay = new Date().toISOString();
                const daTao = kq.moi.map(function (h) {
                    const mk = h.matKhau !== '' ? h.matKhau : taoMatKhau(8);
                    danhSach.push({ ten: h.ten, email: h.email, matKhau: mk, vaiTro: 'hocsinh', lop: h.lop, sdt: h.sdt,
                                    ghiChu: '', khoa: false, ngayTao: bay });
                    return { ten: h.ten, email: h.email, matKhau: mk, lop: h.lop };
                });
                luuTaiKhoan();
                veQuanTri();
                dongDialog();
                hienThongTinDangNhap('Đã tạo ' + daTao.length + ' tài khoản', daTao);
            });
        }

        // Hộp thoại cho admin xem / tải thông tin đăng nhập vừa tạo để phát cho học sinh
        function hienThongTinDangNhap(tieuDe, ds) {
            moDialog(
                '<h3>' + thoat(tieuDe) + '</h3>' +
                '<p class="modal-sub">Hãy lưu lại mật khẩu ngay bây giờ và gửi cho học sinh. Bạn vẫn có thể đặt lại mật khẩu sau này bằng nút 🔑.</p>' +
                '<div class="table-wrap cred-wrap"><table class="tbl"><thead><tr><th>Họ tên</th><th>Email đăng nhập</th><th>Mật khẩu</th><th>Lớp</th></tr></thead><tbody>' +
                ds.map(function (h) {
                    return '<tr><td>' + thoat(h.ten) + '</td><td>' + thoat(h.email) + '</td><td><code>' + thoat(h.matKhau) + '</code></td><td>' + thoat(h.lop || '-') + '</td></tr>';
                }).join('') + '</tbody></table></div>' +
                '<div class="dialog-actions"><button class="btn-sec" id="c-dong">Đóng</button><button class="btn-link" id="c-tai">Tải danh sách (.csv)</button></div>',
                true
            );
            document.getElementById('c-dong').addEventListener('click', dongDialog);
            document.getElementById('c-tai').addEventListener('click', function () {
                const dong = [['Họ tên', 'Email đăng nhập', 'Mật khẩu', 'Lớp']].concat(ds.map(function (h) { return [h.ten, h.email, h.matKhau, h.lop || '']; }));
                const csv = dong.map(function (r) { return r.map(function (o) { return '"' + String(o).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
                taiFile('tai-khoan-moi.csv', '\uFEFF' + csv, 'text/csv');
            });
        }

        // ----- Đặt lại mật khẩu từng tài khoản (nút 🔑 trong bảng) -----
        document.getElementById('hs-body').addEventListener('click', function (e) {
            const nut = e.target.closest('button[data-act="mk"]');
            if (!nut) { return; }
            const u = timTaiKhoan(nut.dataset.email);
            if (!u) { return; }
            if (!confirm('Đặt lại mật khẩu cho "' + u.ten + '"? Mật khẩu cũ sẽ không còn dùng được.')) { return; }
            u.matKhau = taoMatKhau(8);
            luuTaiKhoan();
            hienThongTinDangNhap('Mật khẩu mới của ' + u.ten, [{ ten: u.ten, email: u.email, matKhau: u.matKhau, lop: u.lop }]);
        });

        document.getElementById('de-nhap').addEventListener('click', moNhapDe);
        document.getElementById('hs-nhap').addEventListener('click', moNhapHocSinh);

        // Vẽ lại bảng ngay để hiện nút 🔑 mới thêm
        if (typeof veHocSinh === 'function') { veHocSinh(); }

        // ----- Khôi phục tài khoản mẫu (không xóa dữ liệu khác) -----
        if (document.getElementById('khoi-phuc-tk')) document.getElementById('khoi-phuc-tk').addEventListener('click', function (e) {
            e.preventDefault();
            [['Quản trị viên', 'admin@skyedu.vn', 'admin123', 'admin'], ['Học viên thử', 'demo@skyedu.vn', '123456', 'hocsinh']].forEach(function (m) {
                let u = timTaiKhoan(m[1]);
                if (!u) {
                    u = { ten: m[0], email: m[1], matKhau: m[2], vaiTro: m[3], lop: m[3] === 'admin' ? '' : '12A1', sdt: '', ghiChu: '', khoa: false, ngayTao: new Date().toISOString() };
                    danhSach.push(u);
                }
                u.matKhau = m[2]; u.vaiTro = m[3]; u.khoa = false;
            });
            luuTaiKhoan();
            document.getElementById('login-email').value = 'admin@skyedu.vn';
            document.getElementById('login-pass').value = '';
            baoLoi(document.getElementById('login-error'), '');
            hienToast('Đã khôi phục. Đăng nhập admin: admin@skyedu.vn / admin123');
        });
    