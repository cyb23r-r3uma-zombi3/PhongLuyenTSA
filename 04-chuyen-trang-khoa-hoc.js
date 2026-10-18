
        // ===== Chuyển giữa trang chủ và trang Khóa học =====
        const container = document.querySelector('.container');
        const navIcons = document.querySelectorAll('.navbar-center span');

        function showPage(name) {
            if (name === 'practice' && nguoiDung && !duocLuyenDe(nguoiDung.email)) {
                hienToast('Mục này dành cho học sinh trong khóa. Nhập mã truy cập (nút Mã truy cập) hoặc đăng ký khảo thí thi thử.');
                name = 'exams';
            }
            // Chưa đăng nhập thì chỉ được xem trang đăng nhập / đăng ký
            const congKhai = (name === 'login' || name === 'register');
            if (!nguoiDung && !congKhai) {
                name = 'login';
                hienToast('Vui lòng đăng nhập để tiếp tục');
            }
            // Trang quản trị chỉ dành cho tài khoản quản trị
            if (name === 'admin' && !(typeof laAdmin === 'function' && laAdmin())) {
                name = 'home';
                hienToast('Chỉ tài khoản quản trị mới vào được trang này');
            }
            container.className = 'container' + (name !== 'home' ? ' ' + name + '-mode' : '');
            if (name === 'exams' && typeof veKhaoThi === 'function') { veKhaoThi(); }
            if (name === 'admin' && typeof veQuanTri === 'function') { veQuanTri(); }
            if (name === 'docs' && typeof veTaiLieu === 'function') { veTaiLieu(); }
            navIcons.forEach(function (icon) {
                icon.classList.toggle('active', icon.dataset.go === name);
            });
            window.scrollTo(0, 0);
        }

        document.querySelectorAll('[data-go]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                showPage(el.dataset.go);
            });
        });

        // ===== Dữ liệu khóa học (mảng các đối tượng) =====
        const khoaHoc = [
            { loai: 'tsa',  mon: 'LOGO',      ten: 'Tinh hoa tư duy Toán học' },
            { loai: 'tsa',  mon: 'KHOA HỌC',  ma: 'TSA03', ten: 'Chuyên đề Khoa học TSA03',  mau: '#38b6ff, #1e5bd8' },
            { loai: 'tsa',  mon: 'TOÁN HỌC',  ma: 'TSA03', ten: 'Chuyên đề Toán học TSA03',  mau: '#1e5bd8, #0a1f5c' },
            { loai: 'tsa',  mon: 'ĐỌC HIỂU',  ma: 'TSA03', ten: 'Chuyên đề Đọc hiểu TSA03',  mau: '#6a7bff, #2a2f9e' },
            { loai: 'tsa',  mon: 'ĐỌC HIỂU',  ma: 'TSA02', ten: 'Chuyên đề Đọc hiểu TSA02',  mau: '#4fc3f7, #0277bd' },
            { loai: 'tsa',  mon: 'TOÁN HỌC',  ma: 'TSA02', ten: 'Chuyên đề Toán học TSA02',  mau: '#2d7ff9, #0a1f5c' },
            { loai: 'tsa',  mon: 'KHOA HỌC',  ma: 'TSA01', ten: 'Chuyên đề Khoa học TSA01',  mau: '#26c6da, #1565c0' },
            { loai: 'tsa',  mon: 'TOÁN HỌC',  ma: 'TSA01', ten: 'Chuyên đề Toán học TSA01',  mau: '#1e5bd8, #061538' },
            { loai: 'hsa',  mon: 'TOÁN HỌC',  ma: 'HSA01', ten: 'Chuyên đề Toán học HSA01',  mau: '#2d7ff9, #0a1f5c' },
            { loai: 'hsa',  mon: 'NGỮ VĂN',   ma: 'HSA01', ten: 'Chuyên đề Ngữ văn HSA01',   mau: '#6a7bff, #2a2f9e' },
            { loai: 'hsa',  mon: 'KHOA HỌC',  ma: 'HSA02', ten: 'Chuyên đề Khoa học HSA02',  mau: '#38b6ff, #1e5bd8' },
            { loai: 'thpt', mon: 'TOÁN',      ma: 'THPT',  ten: 'Luyện thi THPT môn Toán',   mau: '#1e5bd8, #0a1f5c' },
            { loai: 'thpt', mon: 'VẬT LÝ',    ma: 'THPT',  ten: 'Luyện thi THPT môn Vật lý', mau: '#26c6da, #1565c0' },
            { loai: 'thpt', mon: 'HÓA HỌC',   ma: 'THPT',  ten: 'Luyện thi THPT môn Hóa học', mau: '#4fc3f7, #0277bd' }
        ];

        // Danh sách khóa đã đăng ký (lưu lại trong trình duyệt để tải lại trang vẫn còn)
        let daLuu = [];
        try { daLuu = JSON.parse(localStorage.getItem('skyedu-khoa-hoc')) || []; } catch (e) { daLuu = []; }
        const daDangKy = new Set(daLuu);
        function luuDangKy() {
            try { localStorage.setItem('skyedu-khoa-hoc', JSON.stringify(Array.from(daDangKy))); } catch (e) {}
        }

        const grid = document.getElementById('course-grid');
        const logoUrl = document.querySelector('.logo').src;

        // Vẽ danh sách khóa học thuộc một danh mục
        function veKhoaHoc(loai) {
            grid.innerHTML = '';
            khoaHoc.forEach(function (kh, i) {
                if (kh.loai !== loai) return;

                const the = document.createElement('div');
                the.className = 'course';
                the.style.animationDelay = (i % 8) * 0.05 + 's';

                let thumb;
                if (kh.mon === 'LOGO') {
                    thumb = '<div class="course-thumb logo-thumb"><img src="' + logoUrl + '" alt="">' +
                            '<span class="badge">Chưa mua</span></div>';
                } else {
                    thumb = '<div class="course-thumb" style="background: linear-gradient(160deg, ' + kh.mau + ');">' +
                            '<span class="course-brand">SKY EDU</span>' +
                            '<div class="course-small">Chuyên đề</div>' +
                            '<div class="course-subject">' + kh.mon + '</div>' +
                            '<div class="course-code">Khoá<br>' + kh.ma + '</div>' +
                            '<span class="badge">Chưa mua</span></div>';
                }

                the.innerHTML = thumb +
                    '<div class="course-name">' + kh.ten + '</div>' +
                    '<div class="course-author">👤 SKY EDU</div>';

                // Bấm vào khóa học: đổi giữa "Chưa mua" và "Đã đăng ký"
                the.addEventListener('click', function () {
                    const badge = the.querySelector('.badge');
                    const daMua = badge.classList.toggle('owned');
                    badge.textContent = daMua ? 'Đã đăng ký' : 'Chưa mua';
                    if (daMua) { daDangKy.add(kh.ten); } else { daDangKy.delete(kh.ten); }
                    luuDangKy();
                    veLich();
                });

                if (daDangKy.has(kh.ten)) {
                    const b = the.querySelector('.badge');
                    b.classList.add('owned');
                    b.textContent = 'Đã đăng ký';
                }
                grid.appendChild(the);
            });
        }

        // Bấm vào danh mục thì lọc khóa học
        const cats = document.querySelectorAll('.cat');
        cats.forEach(function (cat) {
            cat.addEventListener('click', function () {
                cats.forEach(function (c) { c.classList.remove('active'); });
                cat.classList.add('active');
                veKhoaHoc(cat.dataset.cat);
            });
        });

        veKhoaHoc('tsa');   // mặc định hiện nhóm TSA
    