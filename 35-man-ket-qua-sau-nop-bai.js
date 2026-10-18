
        // =====================================================
        //  MÀN KẾT QUẢ SAU KHI NỘP BÀI (phòng luyện), theo mẫu
        // =====================================================
        function renderKetQuaLuyen() {
            const box = document.getElementById('l-res-box');
            const res = document.getElementById('l-res');
            if (!box || !res || !res.classList.contains('on')) { return; }
            if (box.querySelector('.kq-wrap')) { return; }             // đã vẽ rồi
            const kq = ketQua.filter(function (k) { return nguoiDung && k.email === nguoiDung.email; })
                             .sort(function (a, b) { return a.ngay < b.ngay ? 1 : -1; })[0];
            if (!kq || !kq.tong) { return; }

            window.kqChiTietHTML = box.innerHTML;                      // bản chi tiết từng câu của phòng luyện
            if (window.__lab && window.__lab.L && window.__lab.L.de) {
                const LL = window.__lab.L;
                window.kqSnap = { de: LL.de, ans: LL.ans.slice(), chips: LL.chips ? LL.chips.slice() : null, kq: kq };
                if (!kq.ans) { kq.ans = LL.ans.slice(); luuKetQua(); }
            }
            const de = deThi.find(function (d) { return d.id === kq.deId; });
            const ten = kq.tenDe || (de ? de.ten : '');
            const dung = Math.round(kq.dung);
            const ti = Math.round(kq.dung / kq.tong * 100);
            const CU = 2 * Math.PI * 70;
            const ngay = new Date(kq.ngay);
            const gio = ngay.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const ngayTxt = ngay.toLocaleDateString('vi-VN');
            const phut = Math.round(kq.giay / 60);

            box.className = 'kq-box';
            box.innerHTML =
                '<div class="kq-wrap">' +
                    '<div class="kq-brand"><img src="' + peLogo() + '" alt="SKY EDU"><div><small>Kì Thi Đánh Giá Tư Duy</small><b>Phòng Luyện Đề SKY EDU</b></div></div>' +
                    '<div class="kq-title">' + thoat(ten.toUpperCase()) + '</div>' +
                    '<div class="kq-info">' +
                        '<div><small>Họ và tên</small><b>' + thoat(kq.ten) + '</b></div>' +
                        '<div><small>Số báo danh</small><b>' + thoat(soBaoDanhCua(de || { id: kq.deId })) + '</b></div>' +
                        '<div><small>Thời gian làm bài</small><b>' + phut + ' phút</b></div>' +
                    '</div>' +
                    '<div class="kq-date">🕒 ' + gio + ' &nbsp;&nbsp; 📅 ' + ngayTxt + '</div>' +
                    '<div class="kq-main">' +
                        '<div class="kq-ringbox">' +
                            '<svg viewBox="0 0 160 160" class="kq-ring">' +
                                '<circle cx="80" cy="80" r="70" class="kq-track"></circle>' +
                                '<circle cx="80" cy="80" r="70" class="kq-fill" style="stroke-dasharray:' + CU + ';stroke-dashoffset:' + (CU * (1 - kq.dung / kq.tong)) + '"></circle>' +
                            '</svg>' +
                            '<div class="kq-num"><small>Số câu đúng</small><b>' + dung + '/' + kq.tong + '</b></div>' +
                        '</div>' +
                        '<div class="kq-parts">' +
                            '<div class="kq-part"><div class="kq-pname"><b>Ôn Luyện 01: ' + thoat(ten) + '</b><span>' + dung + '/' + kq.tong + '</span>' +
                                '<div class="kq-bar"><i style="width:' + ti + '%"></i></div></div>' +
                                '<button class="kq-btn" id="kq-ct">CHI TIẾT</button></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="kq-foot">' +
                        '<button class="kq-cc" id="kq-cc">XEM CHỨNG CHỈ</button>' +
                        '<button class="kq-ve" id="kq-ve">VỀ TRANG LUYỆN ĐỀ</button>' +
                    '</div>' +
                '</div>';

            document.getElementById('kq-ct').addEventListener('click', function () {
                moChiTietLuyen();
            });
            document.getElementById('kq-cc').addEventListener('click', function () {
                moChungChi(kq, de);
            });
            document.getElementById('kq-ve').addEventListener('click', function () {
                res.classList.remove('on');
                document.getElementById('l-exam').classList.remove('on');
                document.getElementById('l-mode').classList.remove('on');
                peDong();
                showPage('practice');
            });
        }
        setInterval(renderKetQuaLuyen, 200);
    