
        function svgQR(text, px) {
            const lib = window.QRCodeLib;
            if (!lib) { return ''; }
            const qr = new lib.QRCode(-1, lib.QRErrorCorrectLevel.M);
            qr.addData(text);
            qr.make();
            const n = qr.getModuleCount(), q = 2, size = n + q * 2;
            let d = '';
            for (let r = 0; r < n; r++) {
                for (let c = 0; c < n; c++) {
                    if (qr.isDark(r, c)) { d += 'M' + (c + q) + ',' + (r + q) + 'h1v1h-1z'; }
                }
            }
            return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + px + '" height="' + px + '" shape-rendering="crispEdges">' +
                   '<rect width="' + size + '" height="' + size + '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
        }
    