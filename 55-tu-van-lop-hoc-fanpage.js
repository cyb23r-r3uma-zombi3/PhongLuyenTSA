
        // =====================================================
        //  TƯ VẤN LỚP HỌC: gửi về fanpage Facebook
        //  Trang tĩnh không tự gửi tin lên Facebook được. Hệ thống sẽ chép nội dung
        //  vào bộ nhớ tạm rồi mở Messenger của fanpage để học sinh dán và gửi.
        // =====================================================
        const FANPAGE_MESSENGER = 'https://m.me/phongluyenthiskyedu.vn';
        document.getElementById('tv-gui').addEventListener('click', function () {
            const ten = document.getElementById('tv-ten').value.trim();
            const namSinh = document.getElementById('tv-namsinh').value.trim();
            const sdt = document.getElementById('tv-sdt').value.trim();
            const quanTam = document.getElementById('tv-quantam').value;
            if (ten === '' || sdt === '') {
                hienToast('Vui lòng nhập họ tên và số điện thoại.');
                return;
            }
            const noi = 'Tư vấn lớp học\n' +
                'Họ và tên: ' + ten + '\n' +
                'Năm sinh: ' + (namSinh || 'không ghi') + '\n' +
                'Số điện thoại: ' + sdt + '\n' +
                'Quan tâm: ' + (quanTam || 'chưa chọn');
            const mo = function () { window.open(FANPAGE_MESSENGER, '_blank', 'noopener'); };
            if (navigator.clipboard) {
                navigator.clipboard.writeText(noi).then(function () {
                    hienToast('Đã chép thông tin. Dán vào Messenger của fanpage để gửi nhé!');
                    mo();
                }, function () { hienToast('Không chép được. Mở fanpage và gửi thông tin thủ công.'); mo(); });
            } else { mo(); }
        });
    