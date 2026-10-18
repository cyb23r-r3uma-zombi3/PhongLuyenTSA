
        // Giấy chứng nhận kết quả theo bố cục mẫu (không có dấu đỏ)
        function moChungChi(kq, de) {
            const ngay = new Date(kq.ngay);
            const ngayTxt = ngay.toLocaleDateString('vi-VN');
            const ngayEn = ngay.toLocaleDateString('en-GB');
            const ma = (kq.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() || 'SKYEDU';
            const soBD = de ? soBaoDanhCua(de) : '';
            const diem10 = Number(kq.diem).toFixed(1);
            const dung = Math.round(kq.dung);
            const ten = kq.ten || '';
            const chữCái = ten.split(' ').filter(Boolean).map(function (w) { return w[0]; }).slice(-2).join('').toUpperCase();
            moDialog(
                '<div class="cx-page">' +
                    '<div class="cx-head">' +
                        '<div class="cx-logo"><img src="' + peLogo() + '" alt="SKY EDU"></div>' +
                        '<div class="cx-board"><b>HỘI ĐỒNG THI ĐÁNH GIÁ TƯ DUY</b><i>THINKING SKILLS ASSESSMENT EXAM BOARD</i></div>' +
                    '</div>' +
                    '<div class="cx-band">GIẤY CHỨNG NHẬN KẾT QUẢ THI</div>' +
                    '<div class="cx-sub">TEST REPORT FORM</div>' +
                    '<div class="cx-top">' +
                        '<div class="cx-fields">' +
                            '<div><span>Người dự thi - <i>Candidate name:</i></span><b>' + thoat(ten) + '</b></div>' +
                            '<div><span>Ngày sinh - <i>Date of birth:</i></span><b></b></div>' +
                            '<div><span>Giới tính - <i>Gender:</i></span><b></b></div>' +
                            '<div><span>Số ID - <i>ID number:</i></span><b>' + thoat('SKY' + ma) + '</b></div>' +
                            '<div><span>Ngày thi - <i>Test date:</i></span><b>' + ngayEn + '</b></div>' +
                            '<div><span>Số báo danh - <i>Candidate ID:</i></span><b>' + thoat(soBD) + '</b></div>' +
                        '</div>' +
                        '<div class="cx-photo"><div class="cx-avatar">' + thoat(chữCái || 'SK') + '</div>' +
                            '<div class="cx-ph-foot"><small>SKY EDU</small><b>' + thoat(ten) + '</b></div></div>' +
                    '</div>' +
                    '<div class="cx-mid">' +
                        '<div class="cx-score"><div class="cx-sc-l"><small>Điểm bài thi</small><i>Overall score</i>' +
                            '<b>' + diem10 + '</b></div><div class="cx-sc-r">0 - 10</div></div>' +
                        '<div class="cx-correct"><small>Số câu đúng - <i>Correct answers</i></small>' +
                            '<div class="cx-row"><div class="cx-num"><em>' + dung + '</em><span>0 - ' + kq.tong + '</span></div>' +
                            '<p>Tư duy Toán học<br><i>Mathematical thinking skills</i></p></div></div>' +
                    '</div>' +
                    '<div class="cx-foot">' +
                        '<div class="cx-qrbox">' + svgQR('SKYEDU|' + ma + '|' + soBD + '|' + diem10 + '|' + ngayTxt, 120) +
                            '<div class="cx-no"><small>Giấy chứng nhận số:<br><i>Report No.</i></small><b>' + thoat('SKY-' + ma) + '</b></div></div>' +
                        '<div class="cx-sign"><div>Hà Nội, ngày ' + ngayTxt + '</div><i>Hanoi, ' + ngayEn + '</i>' +
                            '<div class="cx-role">CHỦ TỊCH HỘI ĐỒNG THI</div><i>CHAIRMAN OF THE EXAM BOARD</i></div>' +
                    '</div>' +
                    '<div class="cx-bottom">Giấy chứng nhận này dành cho luyện tập trên hệ thống SKY EDU, không có giá trị như chứng chỉ thi chính thức.' +
                        '<br><i>This report is for practice on the SKY EDU system only.</i></div>' +
                '</div>', true);
        }
    