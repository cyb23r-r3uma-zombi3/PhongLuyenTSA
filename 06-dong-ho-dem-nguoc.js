
        // ===== Đồng hồ đếm ngược thật =====
        function pad(n) { return String(n).padStart(2, '0'); }   // 5 -> "05"

        document.querySelectorAll('.countdown').forEach(function (cd) {
            const mucTieu = new Date(cd.dataset.target).getTime();   // ngày thi (từ data-target)
            const o = cd.querySelectorAll('.time b');                // 4 ô: ngày, giờ, phút, giây

            function capNhat() {
                const conLai = Math.max(0, mucTieu - Date.now());    // số mili-giây còn lại
                const tongGiay = Math.floor(conLai / 1000);

                const ngay = Math.floor(tongGiay / 86400);
                const gio  = Math.floor((tongGiay % 86400) / 3600);
                const phut = Math.floor((tongGiay % 3600) / 60);
                const giay = tongGiay % 60;

                [ngay, gio, phut, giay].forEach(function (v, i) {
                    o[i].textContent = pad(v);
                });
            }

            capNhat();                       // chạy ngay một lần
            setInterval(capNhat, 1000);      // rồi lặp lại mỗi 1 giây
        });
    