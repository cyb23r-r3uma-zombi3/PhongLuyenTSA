
        // Quản trị: ảnh minh họa cho từng câu của đề
        (function () {
            const veDeTruocAnh = veDe;
            veDe = function () {
                veDeTruocAnh();
                document.querySelectorAll('#de-luoi .de-card').forEach(function (the) {
                    const acts = the.querySelector('.de-acts');
                    const nut = the.querySelector('button[data-act]');
                    if (!acts || !nut || the.querySelector('[data-anhcau-id]')) { return; }
                    const b = document.createElement('button');
                    b.className = 'icon-btn';
                    b.dataset.anhcauId = nut.dataset.id;
                    b.title = 'Ảnh minh họa từng câu';
                    b.textContent = '🖼 Ảnh câu';
                    acts.insertBefore(b, acts.firstChild);
                });
            };
            document.getElementById('de-luoi').addEventListener('click', function (e) {
                const b = e.target.closest('button[data-anhcau-id]');
                if (b) { e.stopPropagation(); moAnhCau(b.dataset.anhcauId); }
            }, true);
        })();

        // Thu nhỏ ảnh minh họa để nhẹ dữ liệu
        function thuNhoAnhCau(file) {
            return new Promise(function (resolve, reject) {
                const doc = new FileReader();
                doc.onerror = reject;
                doc.onload = function () {
                    const im = new Image();
                    im.onerror = reject;
                    im.onload = function () {
                        const toi = 900;
                        const k = Math.min(1, toi / Math.max(im.width, im.height));
                        const c = document.createElement('canvas');
                        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
                        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
                        resolve(c.toDataURL('image/jpeg', 0.86));
                    };
                    im.src = doc.result;
                };
                doc.readAsDataURL(file);
            });
        }

        function moAnhCau(deId) {
            const de = deThi.find(function (d) { return d.id === deId; });
            if (!de) { return; }
            let noi = '<h3>Ảnh minh họa từng câu</h3>' +
                '<p class="modal-sub">' + thoat(de.ten) + '. Ảnh hiện ngay trên nội dung câu khi học sinh làm bài và khi xem lại.</p>';
            de.cauHoi.forEach(function (q, i) {
                noi += '<div class="field" style="border-bottom:1px dashed #e5e7eb;padding-bottom:12px;margin-bottom:12px">' +
                       '<label>Câu ' + (i + 1) + ': ' + thoat((q.cau || '').replace(/\\[a-zA-Z]+\{[^}]*\}/g, '').slice(0, 60)) + '…</label>' +
                       '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">' +
                       '<div id="ac-xem-' + i + '" style="width:120px;height:80px;border-radius:8px;background:#f3f4f6 ' + (q.anh ? 'url(' + q.anh + ') center/contain no-repeat' : '') + ';border:1px solid #e5e7eb"></div>' +
                       '<input type="file" accept="image/*" class="ac-file" data-i="' + i + '">' +
                       (q.anh ? '<button class="btn-sec ac-xoa" data-i="' + i + '">Gỡ ảnh</button>' : '') +
                       '</div>' +
                       (q.anh ? '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:10px">' +
                         '<label style="font-size:14px">Kích cỡ <b id="ac-rv-' + i + '">' + ((q.anhCo && q.anhCo.rong) || 70) + '%</b><br><input type="range" min="20" max="100" step="5" class="ac-rong" data-i="' + i + '" value="' + ((q.anhCo && q.anhCo.rong) || 70) + '" style="width:200px"></label>' +
                         '<label style="font-size:14px">Căn lề<br><select class="ac-canh" data-i="' + i + '"><option value="trai"' + ((q.anhCo && q.anhCo.canh) === 'trai' ? ' selected' : '') + '>Trái</option><option value="giua"' + (!(q.anhCo && q.anhCo.canh) || q.anhCo.canh === 'giua' ? ' selected' : '') + '>Giữa</option><option value="phai"' + ((q.anhCo && q.anhCo.canh) === 'phai' ? ' selected' : '') + '>Phải</option></select></label>' +
                         '<label style="font-size:14px">Vị trí<br><select class="ac-vitri" data-i="' + i + '"><option value="tren"' + ((q.anhCo && q.anhCo.vitri) === 'tren' ? ' selected' : '') + '>Trên nội dung</option><option value="duoi"' + (!(q.anhCo && q.anhCo.vitri) || q.anhCo.vitri === 'duoi' ? ' selected' : '') + '>Dưới nội dung</option></select></label>' +
                         '</div>' : '') +
                       '</div>';
            });
            noi += '<div class="form-error" id="ac-loi"></div>' +
                   '<div class="dialog-actions"><button class="btn-sec" id="ac-dong">Đóng</button></div>';
            moDialog(noi, true);
            document.getElementById('ac-dong').addEventListener('click', dongDialog);
            document.querySelectorAll('.ac-file').forEach(function (o) {
                o.addEventListener('change', async function () {
                    const f = this.files[0]; if (!f) { return; }
                    const i = Number(this.dataset.i);
                    try {
                        de.cauHoi[i].anh = await thuNhoAnhCau(f);
                        luuDe();
                        hienToast('Đã gắn ảnh cho câu ' + (i + 1));
                        moAnhCau(deId);
                    } catch (e) { baoLoi(document.getElementById('ac-loi'), 'Không đọc được ảnh. Thử ảnh khác.'); }
                });
            });
            function luuCo(i, khoa, gia) {
                const q = de.cauHoi[i];
                q.anhCo = Object.assign({ rong: 70, canh: 'giua', vitri: 'duoi' }, q.anhCo || {});
                q.anhCo[khoa] = gia;
                luuDe();
            }
            document.querySelectorAll('.ac-rong').forEach(function (o) {
                o.addEventListener('input', function () {
                    const i = Number(o.dataset.i);
                    document.getElementById('ac-rv-' + i).textContent = o.value + '%';
                });
                o.addEventListener('change', function () { luuCo(Number(o.dataset.i), 'rong', Number(o.value)); hienToast('Đã lưu kích cỡ ảnh'); });
            });
            document.querySelectorAll('.ac-canh').forEach(function (o) {
                o.addEventListener('change', function () { luuCo(Number(o.dataset.i), 'canh', o.value); hienToast('Đã lưu căn lề ảnh'); });
            });
            document.querySelectorAll('.ac-vitri').forEach(function (o) {
                o.addEventListener('change', function () { luuCo(Number(o.dataset.i), 'vitri', o.value); hienToast('Đã lưu vị trí ảnh'); });
            });
            document.querySelectorAll('.ac-xoa').forEach(function (b) {
                b.addEventListener('click', function () {
                    delete de.cauHoi[Number(b.dataset.i)].anh;
                    luuDe();
                    moAnhCau(deId);
                });
            });
        }
    