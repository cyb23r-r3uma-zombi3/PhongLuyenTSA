
        // =====================================================
        //  NỘI DUNG CÁC MỤC CHÂN TRANG (DỰ THẢO)
        //  Cần rà soát pháp lý và điền thông tin thật trước khi công bố.
        // =====================================================
        const CHAN_TRANG = {
            'Điều khoản dịch vụ': {
                tieu: 'Điều khoản dịch vụ',
                noi: [
                    ['1. Giới thiệu', 'SKY EDU cung cấp nền tảng học tập, luyện đề và khảo thí thi thử trực tuyến cho học sinh THPT.'],
                    ['2. Tài khoản', 'Người dùng chịu trách nhiệm bảo mật tài khoản và mật khẩu, không chia sẻ cho người khác. Thông tin khai khi đăng ký và dự thi phải đúng sự thật.'],
                    ['3. Nội dung', 'Đề thi, lời giải, tài liệu và video trên hệ thống thuộc quyền của SKY EDU. Không được sao chép, phát tán hoặc đăng lại dưới bất kỳ hình thức nào.'],
                    ['4. Hành vi bị cấm', 'Gian lận khi làm bài, dùng công cụ tự động, tấn công hoặc can thiệp vào hệ thống, mạo danh người khác.'],
                    ['5. Giá trị kết quả', 'Điểm trên hệ thống phục vụ mục đích luyện tập. Đây không phải kết quả thi chính thức và không thay thế chứng chỉ của các kỳ thi do cơ quan có thẩm quyền tổ chức.'],
                    ['6. Thay đổi', 'SKY EDU có thể cập nhật điều khoản và sẽ thông báo trên website trước khi áp dụng.']
                ]
            },
            'Quyền & nghĩa vụ hai bên': {
                tieu: 'Quyền và nghĩa vụ hai bên',
                noi: [
                    ['Quyền của SKY EDU', 'Cung cấp dịch vụ đúng như mô tả; tạm ngừng để bảo trì có thông báo trước; khóa tài khoản vi phạm điều khoản.'],
                    ['Nghĩa vụ của SKY EDU', 'Bảo vệ dữ liệu cá nhân theo chính sách bảo mật; hỗ trợ kỹ thuật trong giờ làm việc; kích hoạt khóa học sau khi nhận đủ thanh toán.'],
                    ['Quyền của học sinh, phụ huynh', 'Được sử dụng dịch vụ đã đăng ký; được yêu cầu xem, sửa hoặc xóa dữ liệu cá nhân; được khiếu nại theo quy định.'],
                    ['Nghĩa vụ của học sinh, phụ huynh', 'Cung cấp thông tin chính xác; thanh toán đúng hạn; tuân thủ quy định thi và không sao chép nội dung.']
                ]
            },
            'Điều kiện hạn chế cung cấp': {
                tieu: 'Điều kiện hạn chế cung cấp dịch vụ',
                noi: [
                    ['Trường hợp tạm ngừng', 'Bảo trì, nâng cấp hệ thống, sự cố kỹ thuật ngoài tầm kiểm soát, hoặc yêu cầu của cơ quan có thẩm quyền.'],
                    ['Trường hợp khóa tài khoản', 'Phát hiện gian lận, cung cấp thông tin sai, chia sẻ tài khoản, sao chép hoặc phát tán nội dung.'],
                    ['Hệ quả', 'Tài khoản bị khóa không được sử dụng dịch vụ cho đến khi vấn đề được xử lý. Học phí đã đóng không được hoàn trong trường hợp khóa do vi phạm.']
                ]
            },
            'Chính sách khiếu nại': {
                tieu: 'Chính sách khiếu nại',
                noi: [
                    ['Cách gửi', 'Gửi qua email contact@skyedu.vn hoặc hotline 0123 456 789. Ghi rõ họ tên, email đăng ký, nội dung khiếu nại và đính kèm bằng chứng nếu có.'],
                    ['Thời gian xử lý', 'Tiếp nhận trong 24 giờ làm việc và phản hồi trong 7 ngày làm việc.'],
                    ['Khiếu nại về kết quả chấm', 'Hệ thống kiểm tra lại bài làm trong 3 ngày làm việc kể từ khi nhận khiếu nại.']
                ]
            },
            'Chính sách bảo mật': {
                tieu: 'Chính sách bảo mật',
                noi: [
                    ['Dữ liệu thu thập', 'Họ và tên, email, số điện thoại, lớp, trường, tỉnh hoặc thành phố, lịch sử làm bài và kết quả.'],
                    ['Mục đích sử dụng', 'Cung cấp dịch vụ, cấp số báo danh, xác nhận kết quả, liên hệ hỗ trợ và cải thiện nội dung học tập.'],
                    ['Chia sẻ', 'Không bán hoặc chia sẻ dữ liệu cho bên thứ ba vì mục đích thương mại. Chỉ cung cấp khi có yêu cầu của cơ quan có thẩm quyền.'],
                    ['Quyền của bạn', 'Được yêu cầu xem, sửa, xóa dữ liệu cá nhân hoặc rút lại sự đồng ý bằng cách liên hệ contact@skyedu.vn.'],
                    ['Bảo vệ dữ liệu', 'SKY EDU áp dụng biện pháp kỹ thuật và tổ chức phù hợp để hạn chế truy cập trái phép.']
                ]
            },
            'Chính sách thanh toán': {
                tieu: 'Chính sách thanh toán',
                noi: [
                    ['Hình thức', 'Chuyển khoản ngân hàng hoặc cổng thanh toán được hiển thị khi đăng ký khóa học.'],
                    ['Kích hoạt', 'Sau khi nhận thanh toán, quản trị viên mở quyền truy cập trong vòng [số] giờ làm việc.'],
                    ['Hóa đơn', 'Xuất hóa đơn hoặc biên lai theo yêu cầu, cung cấp mã số thuế nếu cần.']
                ]
            },
            'Chính sách giá': {
                tieu: 'Chính sách giá',
                noi: [
                    ['Niêm yết', 'Giá khóa học và các gói đề hiển thị trên trang Khóa học. Các khoản đã bao gồm hoặc chưa bao gồm thuế được ghi rõ.'],
                    ['Thay đổi giá', 'SKY EDU có thể điều chỉnh giá. Giá áp dụng là giá hiển thị tại thời điểm thanh toán.'],
                    ['Nội dung miễn phí', 'Các đề và đợt thi thử được ghi nhãn "Miễn phí" trên hệ thống.']
                ]
            },
            'Vận chuyển & đổi trả': {
                tieu: 'Vận chuyển và đổi trả',
                noi: [
                    ['Khóa học', 'Khóa học là sản phẩm số, được kích hoạt trên tài khoản. Không có vận chuyển vật lý.'],
                    ['Tài liệu in (nếu có)', 'Gửi trong vòng [số] ngày làm việc kể từ khi xác nhận đơn hàng.'],
                    ['Hoàn tiền', 'Yêu cầu trong 7 ngày kể từ khi thanh toán nếu chưa truy cập quá [20]% nội dung, hoặc gặp lỗi kỹ thuật không khắc phục được.'],
                    ['Phí xử lý', 'Có thể trừ [số]% phí xử lý khi hoàn tiền. Thời gian hoàn tiền tối đa [số] ngày làm việc.']
                ]
            },
            'Giới thiệu SKY EDU': {
                tieu: 'Giới thiệu SKY EDU',
                noi: [
                    ['Sứ mệnh', 'Đồng hành cùng học sinh THPT trên hành trình phát triển tư duy và chinh phục các kỳ thi đánh giá năng lực, đánh giá tư duy.'],
                    ['Nền tảng', 'Hệ thống luyện đề theo chuyên đề, thi thử theo ca, khóa học và theo dõi kết quả cá nhân.'],
                    ['Liên hệ', 'Email contact@skyedu.vn · Hotline 0123 456 789 · Địa chỉ [điền địa chỉ].']
                ]
            },
            'Kích hoạt khóa học': {
                tieu: 'Kích hoạt khóa học',
                noi: [
                    ['Bước 1', 'Đăng ký tài khoản bằng email và tạo mật khẩu.'],
                    ['Bước 2', 'Thanh toán học phí theo hướng dẫn trong mục Chính sách thanh toán.'],
                    ['Bước 3', 'Chờ quản trị viên mở quyền truy cập, hoặc nhập mã truy cập do trung tâm cung cấp bằng nút Mã truy cập.'],
                    ['Bước 4', 'Vào mục Học sinh trong khóa để làm đề luyện.']
                ]
            },
            'Tra cứu kết quả thi': {
                tieu: 'Tra cứu kết quả thi',
                noi: [
                    ['Nơi xem', 'Mục Khảo thí thi thử, nút Xem kết quả trên thẻ ca thi, hoặc mục Lịch sử làm bài.'],
                    ['Chi tiết', 'Nút Chi tiết hiển thị đúng sai từng câu và đáp án đúng.'],
                    ['Giấy chứng nhận', 'Giấy chứng nhận có mã QR và số giấy để đối chiếu. Giấy này chỉ dùng cho luyện tập, không có giá trị như chứng chỉ thi chính thức.']
                ]
            }
        };

        function moChanTrang(ten) {
            const muc = CHAN_TRANG[ten];
            if (!muc) { return; }
            let noi = '<h3>' + muc.tieu + '</h3>' +
                '<p class="modal-sub" style="color:#b45309">Nội dung dự thảo, cần rà soát pháp lý trước khi công bố.</p>';
            muc.noi.forEach(function (d) {
                noi += '<h4 style="margin:14px 0 4px;color:#1e5bd8">' + d[0] + '</h4><p style="margin:0;line-height:1.6">' + d[1] + '</p>';
            });
            noi += '<div class="dialog-actions"><button class="btn-sec" id="ctr-dong">Đóng</button></div>';
            moDialog(noi, true);
            document.getElementById('ctr-dong').addEventListener('click', dongDialog);
        }

        document.querySelectorAll('.site-footer a').forEach(function (a) {
            const ten = a.textContent.trim();
            if (CHAN_TRANG[ten]) {
                a.href = '#';
                a.addEventListener('click', function (e) { e.preventDefault(); moChanTrang(ten); });
            }
        });
    