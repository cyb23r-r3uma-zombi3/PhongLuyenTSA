
        // Phòng HSA đang khóa hoàn toàn: không ai vào được, kể cả quản trị viên
        document.addEventListener('click', function (e) {
            const nut = e.target.closest('.room-btn[data-room="hsa"]');
            if (!nut) { return; }
            e.stopImmediatePropagation();
            e.preventDefault();
            hienToast('Phòng luyện HSA đang khóa. Vui lòng quay lại sau.');
        }, true);
    