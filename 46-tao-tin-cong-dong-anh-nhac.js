
        // =====================================================
        //  TẠO TIN CỘNG ĐỒNG: đăng ảnh và nhạc
        // =====================================================
        const KHO_TIN = 'skyedu-tin';
        let dsTin = [];
        (function napTin() {
            const da = docKho('localStorage', KHO_TIN);
            dsTin = Array.isArray(da) ? da : [];
        })();
        function luuTin() {
            try { ghiKho('localStorage', KHO_TIN, dsTin); return true; }
            catch (e) { return false; }
        }

        // Đọc ảnh và thu nhỏ để tiết kiệm bộ nhớ
        function docAnh(file) {
            return new Promise(function (resolve, reject) {
                const doc = new FileReader();
                doc.onerror = reject;
                doc.onload = function () {
                    const im = new Image();
                    im.onerror = reject;
                    im.onload = function () {
                        const toi_da = 640;
                        const k = Math.min(1, toi_da / Math.max(im.width, im.height));
                        const c = document.createElement('canvas');
                        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
                        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
                        resolve(c.toDataURL('image/jpeg', 0.82));
                    };
                    im.src = doc.result;
                };
                doc.readAsDataURL(file);
            });
        }
        function docFile(file) {
            return new Promise(function (resolve, reject) {
                const doc = new FileReader();
                doc.onerror = reject;
                doc.onload = function () { resolve(doc.result); };
                doc.readAsDataURL(file);
            });
        }

        function veTin() {
            document.querySelectorAll('#stories .story.user').forEach(function (e) { e.remove(); });
            const nut = document.getElementById('btn-tao-tin');
            let truoc = nut;
            dsTin.slice().sort(function (a, b) { return a.taoLuc < b.taoLuc ? 1 : -1; }).forEach(function (t) {
                const the = document.createElement('div');
                the.className = 'story user';
                the.dataset.id = t.id;
                if (t.anh) { the.style.backgroundImage = 'url("' + t.anh + '")'; }
                the.innerHTML =
                    '<span class="story-avatar">👤</span>' +
                    (t.nhac ? '<button class="story-play" data-play="' + t.id + '" title="Phát / dừng nhạc">▶</button>' : '') +
                    '<button class="story-xoa" data-xoa="' + t.id + '" title="Xóa tin">✕</button>' +
                    '<span class="story-name"></span>';
                the.querySelector('.story-name').textContent = t.ten;
                nut.parentElement.insertBefore(the, truoc.nextSibling);
                truoc = the;
            });
        }

        // Tạo lại nút Tạo tin để gỡ bộ lắng nghe cũ (hộp hỏi tên)
        (function () {
            const cu = document.getElementById('btn-tao-tin');
            const moi = cu.cloneNode(true);
            cu.parentNode.replaceChild(moi, cu);
        })();

        document.getElementById('btn-tao-tin').addEventListener('click', function () {
            moDialog(
                '<h3>Tạo tin mới</h3>' +
                '<p class="modal-sub">Ảnh và nhạc là không bắt buộc. Nhạc nên dưới 1,5 MB.</p>' +
                '<div class="field"><label for="tin-ten">Tên hiển thị</label><input id="tin-ten" placeholder="Nhập tên của bạn"></div>' +
                '<div class="field"><label for="tin-anh">Ảnh</label><input id="tin-anh" type="file" accept="image/*"></div>' +
                '<div id="tin-xem" style="height:140px;border-radius:10px;background:#e8f1ff;margin-bottom:14px;background-size:cover;background-position:center"></div>' +
                '<div class="field"><label for="tin-nhac">Nhạc</label><input id="tin-nhac" type="file" accept="audio/*"></div>' +
                '<div class="form-error" id="tin-loi"></div>' +
                '<div class="dialog-actions"><button class="btn-sec" id="tin-huy">Hủy</button><button class="btn-link" id="tin-dang">Đăng tin</button></div>'
            );
            const anhInput = document.getElementById('tin-anh');
            anhInput.addEventListener('change', function () {
                const f = this.files[0];
                if (!f) { return; }
                const url = URL.createObjectURL(f);
                document.getElementById('tin-xem').style.backgroundImage = 'url("' + url + '")';
            });
            document.getElementById('tin-huy').addEventListener('click', dongDialog);
            document.getElementById('tin-dang').addEventListener('click', async function () {
                const loi = document.getElementById('tin-loi');
                const ten = document.getElementById('tin-ten').value.trim();
                const fAnh = anhInput.files[0];
                const fNhac = document.getElementById('tin-nhac').files[0];
                if (ten === '') { baoLoi(loi, 'Vui lòng nhập tên hiển thị.'); return; }
                if (fNhac && fNhac.size > 1.5 * 1024 * 1024) { baoLoi(loi, 'File nhạc quá lớn. Chọn file dưới 1,5 MB.'); return; }
                try {
                    const anh = fAnh ? await docAnh(fAnh) : '';
                    const nhac = fNhac ? await docFile(fNhac) : '';
                    const tin = { id: taoId(), ten: ten, anh: anh, nhac: nhac, taoLuc: new Date().toISOString() };
                    dsTin.push(tin);
                    if (!luuTin()) {
                        dsTin.pop();
                        baoLoi(loi, 'Bộ nhớ trình duyệt không đủ. Thử ảnh hoặc nhạc nhỏ hơn.');
                        return;
                    }
                    dongDialog();
                    veTin();
                    hienToast('Đã đăng tin ✔');
                } catch (e) {
                    baoLoi(loi, 'Không đọc được file. Thử file khác.');
                }
            });
        });

        // Phát / dừng nhạc và xóa tin
        let nhacDangPhat = null;
        document.getElementById('stories').addEventListener('click', function (e) {
            const xoa = e.target.closest('button[data-xoa]');
            if (xoa) {
                e.stopPropagation();
                if (!confirm('Xóa tin này?')) { return; }
                dsTin = dsTin.filter(function (t) { return t.id !== xoa.dataset.xoa; });
                luuTin(); veTin();
                return;
            }
            const play = e.target.closest('button[data-play]');
            if (!play) { return; }
            e.stopPropagation();
            const tin = dsTin.find(function (t) { return t.id === play.dataset.play; });
            if (!tin || !tin.nhac) { return; }
            if (nhacDangPhat && nhacDangPhat.id === tin.id) {
                nhacDangPhat.audio.pause(); nhacDangPhat = null;
                play.textContent = '▶';
                return;
            }
            if (nhacDangPhat) {
                nhacDangPhat.audio.pause();
                document.querySelectorAll('.story-play').forEach(function (b) { b.textContent = '▶'; });
            }
            const au = new Audio(tin.nhac);
            au.play().catch(function () { hienToast('Trình duyệt chặn phát nhạc. Bấm lại để thử.'); });
            au.onended = function () { play.textContent = '▶'; nhacDangPhat = null; };
            nhacDangPhat = { id: tin.id, audio: au };
            play.textContent = '❚❚';
        });

        veTin();
    