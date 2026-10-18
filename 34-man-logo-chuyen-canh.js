
        let peLabPath = false;
        // ---------- Màn logo chuyển cảnh ----------
        // Toạ độ tính theo điểm ảnh của file logo gốc (rộng 611px). SPL_X* = độ lệch ngang của biểu tượng so với vị trí cuối.
        const SPL_X0 = 181.5;   // lúc bật ra: biểu tượng nằm giữa màn hình
        const SPL_X1 = 338;     // sau cú lướt sang phải
        const SPL_X2 = 372;     // điểm xa nhất bên phải, ngay trước khi vút về trái
        const SPL_LW = 611, SPL_TL = 206;   // bề rộng logo và mép trái của vùng chữ SKD
        const SPL = { raf: 0, to: 0, el: null, ghosts: [], w: 560 };
        function splOutCubic(p) { return 1 - Math.pow(1 - p, 3); }
        function splOutQuad(p) { return 1 - (1 - p) * (1 - p); }
        function splInOutQuart(p) { return p < 0.5 ? 8 * p * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2; }
        function splBack(p) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); }
        // Vị trí ngang của biểu tượng theo thời gian (giây)
        function splX(t) {
            if (t < 0.32) { return SPL_X0; }
            if (t < 0.62) { return SPL_X0 + (SPL_X1 - SPL_X0) * splOutCubic((t - 0.32) / 0.30); }
            if (t < 1.25) { return SPL_X1 + (SPL_X2 - SPL_X1) * splOutQuad((t - 0.62) / 0.63); }
            if (t < 1.85) { return SPL_X2 * (1 - splInOutQuart((t - 1.25) / 0.60)); }
            return 0;
        }
        function splInit() {
            const s = document.getElementById('spl');
            if (!s || SPL.el) { return; }
            const stage = s.querySelector('.spl-stage');
            SPL.el = { s: s, stage: stage, txt: s.querySelector('.spl-txt'), ico: s.querySelector('.spl-ico'), shine: s.querySelector('.spl-shine') };
            for (let i = 0; i < 6; i++) {          // các bản mờ để tạo vệt chuyển động
                const g = document.createElement('img'); g.className = 'spl-gh'; g.alt = '';
                stage.insertBefore(g, SPL.el.ico); SPL.ghosts.push(g);
            }
            const src = peLogo();
            [SPL.el.txt, SPL.el.ico].concat(SPL.ghosts).forEach(function (im) { im.src = src; if (im.decode) { im.decode().catch(function () {}); } });
            s.style.setProperty('--spl-mask', 'url("' + src + '")');
        }
        function splFrame(t) {
            const el = SPL.el, k = SPL.w / SPL_LW, x = splX(t);
            let sc = 1, rot = 0, op = 1;
            if (t < 0.32) {                          // bật ra: hơi nghiêng, nhỏ → thẳng, đủ cỡ
                const p = t / 0.32;
                sc = 0.55 + 0.45 * splBack(p);
                rot = -14 * (1 - splOutCubic(p));
                op = Math.min(1, t / 0.1);
            }
            const v = Math.min(1, Math.abs(x - splX(t - 0.02)) / 30);   // độ nhanh, 0..1
            el.ico.style.opacity = op;
            el.ico.style.transform = 'translateX(' + (x * k) + 'px) rotate(' + rot + 'deg) scale(' + (sc * (1 + 0.06 * v)) + ',' + sc + ')';
            for (let i = 0; i < SPL.ghosts.length; i++) {
                const g = SPL.ghosts[i], gx = splX(t - (i + 1) * 0.016);
                g.style.opacity = 0.28 * v * (1 - i / SPL.ghosts.length) * op;
                g.style.transform = 'translateX(' + (gx * k) + 'px) rotate(' + rot + 'deg) scale(' + sc + ')';
            }
            // Chữ SKD đứng yên, chỉ lộ ra ở phía sau biểu tượng khi nó vút về bên trái
            const L = SPL_TL + Math.max(0, x);
            el.txt.style.opacity = t >= 1.25 ? 1 : 0;
            el.txt.style.clipPath = 'polygon(' + (L / SPL_LW * 100) + '% 30.55%, 100% 30.55%, 100% 100%, ' + (L / SPL_LW * 100) + '% 100%)';
            // Vệt sáng quét ngang logo
            const sp = (t - 1.95) / 0.6;
            if (sp > 0 && sp < 1) { el.shine.style.opacity = 1; el.shine.style.backgroundPosition = ((0.95 - 0.9 * sp) * 100) + '% 0'; }
            else { el.shine.style.opacity = 0; }
            // Nhún nhẹ khi đáp xuống
            const pp = (t - 1.8) / 0.35;
            el.stage.style.transform = (pp > 0 && pp < 1) ? 'scale(' + (1 + 0.03 * Math.sin(Math.PI * pp)) + ')' : '';
        }
        splInit();
        function peSplash(cb) {
            const s = document.getElementById('spl');
            splInit();
            clearTimeout(SPL.to); cancelAnimationFrame(SPL.raf);
            // Ẩn nội dung phía dưới khi đang chạy logo để trình duyệt không phải vẽ lại cả trang
            document.body.classList.add('spl-busy');
            s.classList.remove('on'); void s.offsetWidth;
            s.classList.add('on');
            SPL.w = SPL.el.stage.offsetWidth || 560;
            if (typeof chimBay === 'function') { chimBay(); }   // chim bay qua ngay khi bấm Bắt đầu ngay
            const giam = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (giam) { splFrame(2.7); }                         // máy tắt hoạt ảnh: hiện thẳng logo hoàn chỉnh
            else {
                let t0 = null;
                splFrame(0);
                SPL.raf = requestAnimationFrame(function tick(now) {
                    if (t0 === null) { t0 = now; }
                    const t = Math.min((now - t0) / 1000, 3);
                    splFrame(t);
                    if (t < 3) { SPL.raf = requestAnimationFrame(tick); }
                });
            }
            SPL.to = setTimeout(function () {
                cancelAnimationFrame(SPL.raf);
                s.classList.remove('on');
                document.body.classList.remove('spl-busy');
                splFrame(0);                                     // đưa về trạng thái đầu cho lần sau
                cb();
            }, giam ? 1400 : 3000);
        }
    