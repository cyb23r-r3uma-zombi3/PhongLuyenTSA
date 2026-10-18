
        // =====================================================
        //  XÁC NHẬN NỘP BÀI: hiện số câu đã trả lời, cho chọn làm tiếp hoặc nộp bài
        // =====================================================
        let nsChoNop = false;   // đang chuyển tiếp lệnh nộp bài đã được xác nhận

        function nsDemDaLam() {
            const t = (document.getElementById('x-done') || {}).textContent || '';
            const m = t.match(/\d+/);
            return m ? parseInt(m[0], 10) : 0;
        }
        function nsTongCau() {
            const n = document.querySelectorAll('#x-nums button').length;
            return n;
        }
        function nsDong() { document.getElementById('ns').classList.remove('on'); }

        document.addEventListener('click', function (e) {
            const nut = e.target.closest('#x-nop');
            if (!nut) { return; }
            if (nsChoNop) { nsChoNop = false; return; }      // lần bấm đã được xác nhận: để lớp gốc xử lý
            e.stopImmediatePropagation();
            e.preventDefault();
            const dl = nsDemDaLam(), tong = nsTongCau();
            document.getElementById('ns-n').textContent = dl + '/' + tong;
            document.getElementById('ns-text').textContent =
                'Đã trả lời ' + dl + '/' + tong + ' câu. Bạn vẫn còn thời gian làm bài, bạn có chắc chắn muốn kết thúc bài thi.';
            document.getElementById('ns').classList.add('on');
        }, true);

        document.getElementById('ns-lam').addEventListener('click', nsDong);
        document.getElementById('ns-x').addEventListener('click', nsDong);
        document.getElementById('ns').addEventListener('click', function (e) { if (e.target === this) { nsDong(); } });
        document.getElementById('ns-nop').addEventListener('click', function () {
            nsDong();
            // Bỏ hộp hỏi "còn câu chưa làm" của lớp gốc vì đã xác nhận ở đây
            const hoiGoc = window.confirm;
            window.confirm = function () { return true; };
            nsChoNop = true;
            try { document.getElementById('x-nop').click(); }
            finally { window.confirm = hoiGoc; nsChoNop = false; }
        });
    