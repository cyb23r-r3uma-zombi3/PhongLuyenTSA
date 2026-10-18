
        // Xem lại bài đã làm từ mục Lịch sử làm bài
        document.getElementById('lh-body').addEventListener('click', function (e) {
            const b = e.target.closest('.lh-ct');
            if (!b) { return; }
            const kq = ketQua.find(function (k) { return k.id === b.dataset.kq; });
            if (!kq) { hienToast('Không tìm thấy lần làm bài này.'); return; }
            if (!Array.isArray(kq.ans)) { hienToast('Lần làm này được lưu trước khi có tính năng xem lại nên không có đáp án chi tiết.'); return; }
            const de = deThi.find(function (d) { return d.id === kq.deId; });
            if (!de) { hienToast('Đề này đã bị xóa nên không xem lại được.'); return; }
            window.kqSnap = { de: de, ans: kq.ans.slice(), chips: null, kq: kq };
            moChiTietLuyen();
        });
    