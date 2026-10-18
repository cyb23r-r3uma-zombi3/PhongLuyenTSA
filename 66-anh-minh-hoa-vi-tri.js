
        // Ảnh minh họa câu: kích cỡ (%), căn trái / giữa / phải, vị trí trên hoặc dưới nội dung
        function anhViTri(q) { return (q.anhCo && q.anhCo.vitri) || 'duoi'; }
        function anhCauHTML(q, stt) {
            const co = q.anhCo || {};
            const rong = co.rong || 70;
            const canh = co.canh || 'giua';
            const can = canh === 'trai' ? 'flex-start' : (canh === 'phai' ? 'flex-end' : 'center');
            return '<div class="cau-anh" style="display:flex;justify-content:' + can + ';margin:10px 0 12px">' +
                   '<img class="x-anh" alt="Ảnh minh họa câu ' + stt + '" src="' + q.anh + '" style="width:' + rong + '%;max-width:100%;max-height:none;margin:0">' +
                   '</div>';
        }
    