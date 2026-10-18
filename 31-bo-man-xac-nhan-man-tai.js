
        // Bỏ màn xác nhận và màn tải của phòng luyện: mình tự hiển thị thay, rồi bấm vào bài thi
        document.getElementById('lm-go').addEventListener('click', function () {
            let dem = 0;
            const theo = setInterval(function () {
                dem++;
                const xn = document.getElementById('l-conf');
                if ((xn && xn.classList.contains('on')) || dem > 90) {
                    clearInterval(theo);
                    if (xn) { xn.classList.remove('on'); }
                    const bat = document.getElementById('c-go');
                    if (bat) { bat.click(); }
                }
            }, 60);
            let dem2 = 0;
            const theoBai = setInterval(function () {
                dem2++;
                const ex = document.getElementById('l-exam');
                if ((ex && ex.classList.contains('on')) || dem2 > 200) {
                    clearInterval(theoBai);
                    if (peLabPath) { peDong(); }
                }
            }, 60);
        }, false);
    