
        // Bật / tắt hiển thị kỳ thi đã kết thúc (mặc định hiện tất cả)
        let anKetThuc = false;
        document.getElementById('ex-tat').addEventListener('click', function () {
            anKetThuc = !anKetThuc;
            this.textContent = anKetThuc ? 'Xem tất cả kỳ thi' : 'Ẩn kỳ thi đã kết thúc';
            veKhaoThi();
        });
    