
        // =====================================================
        //  GIẤY CHỨNG NHẬN KẾT QUẢ (luyện tập), theo mẫu
        // =====================================================
        function moChungChi(kq, de) {
            const ngay = new Date(kq.ngay);
            const ngayTxt = ngay.toLocaleDateString('vi-VN');
            const ma = (kq.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() || 'SKYEDU';
            const soBD = de ? soBaoDanhCua(de) : '';
            const diem10 = Number(kq.diem).toFixed(2);
            const dung = Math.round(kq.dung);
            moDialog(
                '<div class="cc-page">' +
                    '<div class="cc-head">' +
                        '<img src="' + peLogo() + '" alt="SKY EDU">' +
                        '<div><small>Kì Thi Đánh Giá Tư Duy</small><b>Hội Đồng Thi Hệ Thống SKY EDU</b><i>SKY EDU SYSTEM EXAM BOARD</i></div>' +
                    '</div>' +
                    '<div class="cc-band">GIẤY CHỨNG NHẬN KẾT QUẢ THI</div>' +
                    '<div class="cc-sub">TEST REPORT FORM</div>' +
                    '<div class="cc-body">' +
                        '<div class="cc-fields">' +
                            '<div><span>Người dự thi - Candidate name:</span><b>' + thoat(kq.ten) + '</b></div>' +
                            '<div><span>Ngày sinh - Date of birth:</span><b></b></div>' +
                            '<div><span>Giới tính - Gender:</span><b></b></div>' +
                            '<div><span>Số ID - ID number:</span><b>' + thoat('SKY' + ma) + '</b></div>' +
                            '<div><span>Ngày thi - Test date:</span><b>' + ngayTxt + '</b></div>' +
                            '<div><span>Số báo danh - Candidate ID:</span><b>' + thoat(soBD) + '</b></div>' +
                        '</div>' +
                        '<div class="cc-scores">' +
                            '<div class="cc-overall"><small>Điểm bài thi<br><i>Overall score</i></small><b>' + diem10 + '</b><span>0 - 10</span></div>' +
                            '<div class="cc-correct"><small>Số câu đúng - <i>Correct answers</i></small>' +
                                '<div class="cc-row"><em>' + dung + '</em><span>0 - ' + kq.tong + '</span><p>Tổng số câu<br><i>Total questions</i></p></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="cc-foot">' +
                        '<div class="cc-qrbox">' + svgQR('SKYEDU|' + ma + '|' + soBD + '|' + diem10 + '|' + ngayTxt, 110) +'<div class="cc-no"><small>Giấy chứng nhận số: <i>Report No.</i></small><b>' + thoat('SKY-' + ma) + '</b></div></div>' +
                        '<div class="cc-sign"><div>Hà Nội, ngày ' + ngayTxt + '</div><div>CHỦ TỊCH HỘI ĐỒNG THI</div><i>Chairman of the exam board</i></div>' +
                    '</div>' +
                    '<div class="cc-note">Chứng nhận này dành cho luyện tập trên hệ thống SKY EDU, không có giá trị như chứng chỉ thi chính thức.</div>' +
                '</div>', true);
        }
    