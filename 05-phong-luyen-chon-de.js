
        // ===== Phòng luyện: cửa sổ chọn đề thi =====
        const phong = {
            tsa: {
                tieuDe: 'Phòng TSA',
                de: [
                    { ten: 'Đề thi thử TSA số 1', phut: 150, cau: 50 },
                    { ten: 'Đề thi thử TSA số 2', phut: 150, cau: 50 },
                    { ten: 'Đề thi thử TSA số 3', phut: 150, cau: 50 }
                ]
            },
            hsa: {
                tieuDe: 'Phòng HSA',
                de: [
                    { ten: 'Đề thi thử HSA số 1', phut: 195, cau: 150 },
                    { ten: 'Đề thi thử HSA số 2', phut: 195, cau: 150 },
                    { ten: 'Đề thi thử HSA số 3', phut: 195, cau: 150 }
                ]
            }
        };

        const modal = document.getElementById('modal');
        const modalList = document.getElementById('modal-list');
        const modalNote = document.getElementById('modal-note');

        function moPhong(loai) {
            const p = phong[loai];
            document.getElementById('modal-title').textContent = p.tieuDe;
            modalNote.textContent = '';
            modalList.innerHTML = '';

            p.de.forEach(function (d) {
                const dong = document.createElement('div');
                dong.className = 'exam';
                dong.innerHTML =
                    '<div><div class="exam-name">' + d.ten + '</div>' +
                    '<div class="exam-info">⏱ ' + d.phut + ' phút · ' + d.cau + ' câu</div></div>' +
                    '<button>Làm bài</button>';
                dong.querySelector('button').addEventListener('click', function () {
                    modalNote.textContent = '✔ Bạn đã chọn "' + d.ten + '". Phần làm bài sẽ được thêm ở bài sau.';
                });
                modalList.appendChild(dong);
            });

            modal.classList.add('open');
        }

        function dongPhong() { modal.classList.remove('open'); }

        document.querySelectorAll('.room-btn').forEach(function (btn) {
            btn.addEventListener('click', function () { moPhong(btn.dataset.room); });
        });
        document.getElementById('modal-close').addEventListener('click', dongPhong);
        modal.addEventListener('click', function (e) {
            if (e.target === modal) { dongPhong(); }   // bấm ra ngoài hộp thì đóng
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { dongPhong(); }   // phím Esc cũng đóng
        });
    