
        // Chuyển tab Trang chủ / Cộng đồng
        const tabs = document.querySelectorAll('.tab');
        const panes = document.querySelectorAll('.pane');

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                tabs.forEach(function (t) { t.classList.remove('active'); });
                panes.forEach(function (p) { p.classList.remove('active'); });
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).classList.add('active');
            });
        });

        // Dùng lại logo ở thanh trên cùng cho ảnh đại diện bài viết
        const logoSrc = document.querySelector('.logo').src;
        document.querySelectorAll('.copy-logo').forEach(function (img) {
            img.src = logoSrc;
        });

        // Nút Thích: bấm để thích / bỏ thích
        document.querySelectorAll('.like-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                let count = Number(btn.dataset.count);
                if (btn.classList.contains('liked')) {
                    count = count - 1;
                    btn.classList.remove('liked');
                } else {
                    count = count + 1;
                    btn.classList.add('liked');
                }
                btn.dataset.count = count;
                btn.querySelector('b').textContent = count;
            });
        });

        // Tạo tin mới
        document.getElementById('btn-tao-tin').addEventListener('click', function () {
            const ten = prompt('Nhập tên hiển thị cho tin của bạn:');
            if (ten && ten.trim() !== '') {
                const tin = document.createElement('div');
                tin.className = 'story s' + (Math.floor(Math.random() * 4) + 1);
                tin.innerHTML = '<span class="story-avatar">👤</span><span class="story-name"></span>';
                tin.querySelector('.story-name').textContent = ten.trim();
                this.after(tin);
            }
        });
    