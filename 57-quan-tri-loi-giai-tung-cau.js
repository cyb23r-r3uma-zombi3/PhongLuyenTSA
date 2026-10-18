
        // Quản trị: nhập lời giải cho từng câu của đề
        (function () {
            const veDeTruocLG = veDe;
            veDe = function () {
                veDeTruocLG();
                document.querySelectorAll('#de-luoi .de-card').forEach(function (the) {
                    const acts = the.querySelector('.de-acts');
                    const nut = the.querySelector('button[data-act]');
                    if (!acts || !nut || the.querySelector('[data-loigiai-id]')) { return; }
                    const b = document.createElement('button');
                    b.className = 'icon-btn';
                    b.dataset.loigiaiId = nut.dataset.id;
                    b.title = 'Lời giải từng câu';
                    b.textContent = '📝 Lời giải';
                    acts.insertBefore(b, acts.firstChild);
                });
            };
            document.getElementById('de-luoi').addEventListener('click', function (e) {
                const b = e.target.closest('button[data-loigiai-id]');
                if (b) { e.stopPropagation(); moLoiGiai(b.dataset.loigiaiId); }
            }, true);
        })();

        function moLoiGiai(deId) {
            const de = deThi.find(function (d) { return d.id === deId; });
            if (!de) { return; }
            let noi = '<h3>Lời giải từng câu</h3>' +
                '<p class="modal-sub">' + thoat(de.ten) + '. Lời giải hiện khi học sinh bấm "Xem đáp án chi tiết". Có thể dùng công thức LaTeX như $x^2$.</p>';
            de.cauHoi.forEach(function (q, i) {
                noi += '<div class="field"><label>Câu ' + (i + 1) + ': ' + thoat(q.cau.slice(0, 60)) + (q.cau.length > 60 ? '…' : '') + '</label>' +
                       '<textarea class="lg-in" data-i="' + i + '" rows="3" style="width:100%;padding:10px;border:1px solid #d9e2f3;border-radius:8px;font-family:inherit">' +
                       thoat(q.loiGiai || '') + '</textarea></div>';
            });
            noi += '<div class="form-error" id="lg-loi"></div>' +
                   '<div class="dialog-actions"><button class="btn-sec" id="lg-huy">Hủy</button><button class="btn-link" id="lg-luu">Lưu lời giải</button></div>';
            moDialog(noi, true);
            document.getElementById('lg-huy').addEventListener('click', dongDialog);
            document.getElementById('lg-luu').addEventListener('click', function () {
                document.querySelectorAll('.lg-in').forEach(function (o) {
                    de.cauHoi[Number(o.dataset.i)].loiGiai = o.value.trim();
                });
                luuDe();
                dongDialog();
                veQuanTri();
                hienToast('Đã lưu lời giải cho đề.');
            });
        }
    