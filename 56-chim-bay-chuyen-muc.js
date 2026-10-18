
        // Chim bay qua khi chuyển mục để che khoảng chuyển cảnh
        function chimBay() {
            const cu = document.querySelector('.bird-fly');
            if (cu) { cu.remove(); }
            const chim = document.createElement('div');
            chim.className = 'bird-fly';
            chim.setAttribute('aria-hidden', 'true');
            chim.innerHTML =
                '<svg viewBox="0 0 110 60">' +
                  '<path class="bw bw2" d="M50 30 C36 6, 18 4, 6 14 C18 16, 30 22, 50 30 Z" fill="#60a5fa"/>' +
                  '<path class="bw" d="M50 30 C64 6, 82 4, 94 14 C82 16, 70 22, 50 30 Z" fill="#2563eb"/>' +
                  '<ellipse cx="50" cy="32" rx="13" ry="7" fill="#1e3a8a"/>' +
                  '<circle cx="62" cy="28" r="5" fill="#1e3a8a"/>' +
                  '<path d="M66 28 L76 30 L66 32 Z" fill="#f59e0b"/>' +
                  '<circle cx="63" cy="27" r="1.2" fill="#fff"/>' +
                '</svg>';
            document.body.appendChild(chim);
            setTimeout(function () { chim.remove(); }, 2700);
        }

        // Khi vào một mục (trừ đăng nhập / đăng ký) thì chim bay qua
        const showPageTruocChim = showPage;
        showPage = function (name) {
            showPageTruocChim(name);
            if (nguoiDung && name !== 'login' && name !== 'register') { chimBay(); }
        };
    