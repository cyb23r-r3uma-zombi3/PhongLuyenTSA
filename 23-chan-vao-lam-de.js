
        // Chặn mọi đường vào làm đề trong phòng luyện (nút Vào làm, Làm lại) khi chưa được tích / chưa nhập mã
        document.addEventListener('click', function (e) {
            const nut = e.target.closest('.lbtn, #r-lai');
            if (!nut) { return; }
            const laVaoLam = nut.id === 'r-lai' || /Vào làm/.test(nut.textContent);
            if (!laVaoLam) { return; }
            if (nguoiDung && !duocLuyenDe(nguoiDung.email)) {
                e.stopImmediatePropagation();
                e.preventDefault();
                hienToast('Mục này dành cho học sinh trong khóa. Nhập mã truy cập (nút Mã truy cập) hoặc đăng ký khảo thí thi thử.');
                return;
            }
            if (!duocLuyenDe(nguoiDung && nguoiDung.email)) {
                e.stopImmediatePropagation();
                e.preventDefault();
                hienToast('Phòng luyện đề cần được mở khóa (đã đóng tiền khóa học) hoặc nhập mã truy cập.');
                moMoKhoaLuyen();
            }
        }, true);
    