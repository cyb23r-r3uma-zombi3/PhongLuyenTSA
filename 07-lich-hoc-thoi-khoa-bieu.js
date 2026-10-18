
        // ===== Lịch học: vẽ thời khóa biểu từ các khóa đã đăng ký =====
        const tenThu = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

        // Lịch mẫu: thu = 0 là Thứ 2, ..., 6 là Chủ nhật
        const lichMau = [
            { thu: 0, gio: '19:00 - 21:00' },
            { thu: 2, gio: '18:30 - 20:30' },
            { thu: 4, gio: '19:00 - 21:00' },
            { thu: 1, gio: '19:30 - 21:30' },
            { thu: 5, gio: '08:00 - 10:00' },
            { thu: 6, gio: '14:00 - 16:00' },
            { thu: 3, gio: '18:00 - 20:00' }
        ];

        function veLich() {
            const week = document.getElementById('week');
            const rong = document.getElementById('sch-empty');
            const coKhoa = daDangKy.size > 0;

            document.getElementById('sch-sub').textContent =
                'Lịch học cá nhân — Hiển thị các môn bạn đang tham gia (' + daDangKy.size + ' khóa)';
            rong.style.display = coKhoa ? 'none' : 'block';
            week.style.display = coKhoa ? 'grid' : 'none';
            week.innerHTML = '';

            // Hôm nay là thứ mấy? (getDay: 0 = Chủ nhật, nên đổi để Thứ 2 = 0)
            const homNay = (new Date().getDay() + 6) % 7;

            // Tạo 7 cột, mỗi cột là một ngày
            const cot = tenThu.map(function (ten, i) {
                const d = document.createElement('div');
                d.className = 'day' + (i === homNay ? ' today' : '');
                d.innerHTML = '<div class="day-name">' + ten + '</div>';
                week.appendChild(d);
                return d;
            });

            // Xếp từng khóa đã đăng ký vào đúng ngày
            khoaHoc.forEach(function (kh, i) {
                if (!daDangKy.has(kh.ten)) return;
                const l = lichMau[i % lichMau.length];
                const buoi = document.createElement('div');
                buoi.className = 'lesson';
                buoi.innerHTML = '<b></b><span>⏰ ' + l.gio + '</span>';
                buoi.querySelector('b').textContent = kh.ten;
                cot[l.thu].appendChild(buoi);
            });
        }

        veLich();
    