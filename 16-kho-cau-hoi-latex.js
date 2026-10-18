
// =====================================================
//  KHO CÂU HỎI: SOẠN BẰNG LaTeX (kiểu TeXstudio / ex_test), XEM TRƯỚC TRỰC TIẾP
// =====================================================
const KHO_KHO = 'skyedu-kho-cau-hoi';
const KHO_MON = ['Toán', 'Vật lí', 'Hóa học', 'Sinh học', 'Ngữ văn', 'Tiếng Anh', 'Khác'];
const KHO_MUC = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];
const TEX_MACROS = {
    '\\heva': '\\left\\{\\begin{aligned}#1\\end{aligned}\\right.',
    '\\hoac': '\\left[\\begin{aligned}#1\\end{aligned}\\right.',
    '\\overarc': '\\overset{\\frown}{#1}',
    '\\Oxy': 'Oxy', '\\Oxyz': 'Oxyz'
};

let khoCH = docKho('localStorage', KHO_KHO);
if (!Array.isArray(khoCH)) { khoCH = []; }
function luuKho() { ghiKho('localStorage', KHO_KHO, khoCH); if (window.khoDongBoDay) { window.khoDongBoDay(); } }

// ---------- Hiển thị LaTeX -> HTML (an toàn: văn bản luôn được escape) ----------
function toanHoc(body, hienRieng) {
    body = body.replace(/\u0001/g, '\\$');
    if (window.katex) {
        try {
            return window.katex.renderToString(body, { displayMode: hienRieng, throwOnError: false, strict: 'ignore', macros: TEX_MACROS });
        } catch (e) { /* rơi xuống bản chữ thô */ }
    }
    return '<code>' + thoat(body) + '</code>';
}
function vanBanTex(t) {
    let h = thoat(t.replace(/\u0001/g, '$'));
    for (let i = 0; i < 2; i++) {
        h = h.replace(/\\textbf\{([^{}]*)\}/g, '<b>$1</b>')
             .replace(/\\(?:textit|emph)\{([^{}]*)\}/g, '<i>$1</i>')
             .replace(/\\underline\{([^{}]*)\}/g, '<u>$1</u>')
             .replace(/\\text(?:rm|normal)\{([^{}]*)\}/g, '$1');
    }
    h = h.replace(/\\begin\{center\}/g, '<div style="text-align:center">').replace(/\\end\{center\}/g, '</div>')
         .replace(/\\begin\{itemize\}/g, '<ul>').replace(/\\end\{itemize\}/g, '</ul>')
         .replace(/\\begin\{enumerate\}/g, '<ol>').replace(/\\end\{enumerate\}/g, '</ol>')
         .replace(/\\item\s*/g, '<li>')
         .replace(/\\\\\s*/g, '<br>').replace(/\\newline\s*/g, '<br>')
         .replace(/\\(?:hfill|noindent|medskip|bigskip|smallskip)\b\s*/g, '')
         .replace(/\\vspace\*?\{[^{}]*\}/g, '')
         .replace(/\\(?:ldots|dots)\b/g, '…')
         .replace(/\\%/g, '%').replace(/\\&amp;/g, '&amp;').replace(/\\#/g, '#').replace(/\\_/g, '_')
         .replace(/\\\{/g, '{').replace(/\\\}/g, '}')
         .replace(/~/g, '&nbsp;')
         .replace(/\n[ \t]*\n+/g, '<br><br>').replace(/\n/g, ' ');
    return h;
}
// =====================================================
//  TRÌNH VẼ TikZ -> SVG (tập con phổ biến trong đề Toán / Lý)
//  Hỗ trợ: \draw \fill \filldraw \path \node \coordinate \foreach \def \pgfmathsetmacro
//  --, -|, |-, rectangle, circle, ellipse, arc, grid, .. controls .., node, cycle, màu a!50!b,
//  mũi tên (->, <->, -stealth), nét đứt, độ dày, scale, tọa độ cực / tương đối.
// =====================================================
const TK_PX = 40, TK_PT = 1 / 28.4528;       // 1 cm = 40 px
let TK_UID = 0;
const TK_COL = { red: '#e53935', blue: '#1e5bd8', green: '#2e9e44', black: '#000000', white: '#ffffff', gray: '#808080', grey: '#808080',
    orange: '#ff8000', yellow: '#ffe000', cyan: '#00bcd4', magenta: '#d81b9a', brown: '#8b5a2b', purple: '#8e24aa', violet: '#7e57c2',
    pink: '#ff7eb6', teal: '#00897b', lime: '#9be000', olive: '#808000', darkgray: '#404040', lightgray: '#bfbfbf' };

function tkIsColor(k) { return /^[a-zA-Z]+(![0-9.]+(![a-zA-Z]+)?)*$/.test(k) && Object.prototype.hasOwnProperty.call(TK_COL, k.split('!')[0].toLowerCase()); }
function tkRgb(n) {
    n = n.trim();
    const h = /^#[0-9a-f]{6}$/i.test(n) ? n : (TK_COL[n.toLowerCase()] || '#000000');
    return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); });
}
function tkColor(spec) {
    if (!spec || spec === true) { return null; }
    const p = String(spec).trim().split('!'); let c = tkRgb(p[0]);
    for (let i = 1; i < p.length; i += 2) {
        let t = parseFloat(p[i]); t = isNaN(t) ? 1 : Math.max(0, Math.min(100, t)) / 100;
        const o = p[i + 1] ? tkRgb(p[i + 1]) : [255, 255, 255];
        c = c.map(function (v, k) { return Math.round(v * t + o[k] * (1 - t)); });
    }
    return 'rgb(' + c.join(',') + ')';
}

// Biểu thức số học kiểu TikZ: 2*cos(30)+1cm, sqrt(3)/2, ...  (kết quả tính bằng cm; sin/cos theo độ)
function tkEval(str) {
    const s = String(str).replace(/[{}]/g, '').replace(/\s+/g, '');
    const UN = { cm: 1, mm: 0.1, pt: TK_PT, 'in': 2.54, em: 0.35, ex: 0.15 };
    let i = 0;
    function primary() {
        if (s[i] === '(') { i++; const v = expr(); if (s[i] === ')') { i++; } return v; }
        let m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
        if (m) {
            i += m[0].length; let v = parseFloat(m[0]);
            const u = /^(cm|mm|pt|in|em|ex)/.exec(s.slice(i));
            if (u) { i += u[0].length; v *= UN[u[0]]; }
            return v;
        }
        m = /^[a-zA-Z]+/.exec(s.slice(i));
        if (m) {
            const nm = m[0].toLowerCase(); i += nm.length;
            if (nm === 'pi') { return Math.PI; }
            const F = { sqrt: Math.sqrt, abs: Math.abs, ln: Math.log, exp: Math.exp, floor: Math.floor, ceil: Math.ceil,
                        sin: function (x) { return Math.sin(x * Math.PI / 180); }, cos: function (x) { return Math.cos(x * Math.PI / 180); },
                        tan: function (x) { return Math.tan(x * Math.PI / 180); }, deg: function (x) { return x * 180 / Math.PI; }, rad: function (x) { return x * Math.PI / 180; } };
            if (F[nm] && s[i] === '(') { i++; const v = expr(); if (s[i] === ')') { i++; } return F[nm](v); }
            throw new Error('không hiểu "' + m[0] + '" trong biểu thức');
        }
        throw new Error('biểu thức lạ: "' + s + '"');
    }
    function unary() { if (s[i] === '-') { i++; return -unary(); } if (s[i] === '+') { i++; return unary(); } return primary(); }
    function power() { let b = unary(); while (s[i] === '^') { i++; b = Math.pow(b, unary()); } return b; }
    function term() { let v = power(); while (s[i] === '*' || s[i] === '/') { const o = s[i++]; const r = power(); v = o === '*' ? v * r : v / r; } return v; }
    function expr() { let v = term(); while (s[i] === '+' || s[i] === '-') { const o = s[i++]; const r = term(); v = o === '+' ? v + r : v - r; } return v; }
    if (s === '') { throw new Error('thiếu giá trị'); }
    const v = expr();
    if (i < s.length) { throw new Error('biểu thức lạ: "' + s + '"'); }
    return v;
}

// Tách chuỗi theo dấu sep nhưng bỏ qua ngoặc (), [], {}
function tkSplit(s, sep) {
    const out = []; let d = 0, cur = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === '\\') { cur += c + (s[i + 1] || ''); i++; continue; }
        if (c === '(' || c === '[' || c === '{') { d++; } else if (c === ')' || c === ']' || c === '}') { d--; }
        if (c === sep && d <= 0) { out.push(cur); cur = ''; } else { cur += c; }
    }
    out.push(cur);
    return out;
}
function tkMatch(s, i, open, close) {          // vị trí dấu đóng tương ứng s[i]
    let d = 0;
    for (let j = i; j < s.length; j++) {
        if (s[j] === '\\') { j++; continue; }
        if (s[j] === open) { d++; } else if (s[j] === close) { d--; if (d === 0) { return j; } }
    }
    throw new Error('thiếu dấu ' + close);
}
function tkOpts(str) {
    const o = {};
    tkSplit(str || '', ',').forEach(function (e) {
        e = e.trim(); if (!e) { return; }
        const k = e.indexOf('=');
        if (k > 0 && !/^[-<>|]/.test(e)) {
            o[e.slice(0, k).trim().replace(/\s+/g, ' ').toLowerCase()] = e.slice(k + 1).trim().replace(/^\{([\s\S]*)\}$/, '$1');
        } else {
            const key = e.replace(/\s+/g, ' ');
            o[key.toLowerCase() === key ? key : key.toLowerCase()] = true;
            if (tkIsColor(key)) { o.color = key; }
        }
    });
    if (o['help lines']) { if (!o.color) { o.color = 'gray!50'; } o['very thin'] = true; }
    return o;
}

const TK_LW = { 'ultra thin': 0.1, 'very thin': 0.2, 'thin': 0.4, 'semithick': 0.6, 'thick': 0.8, 'very thick': 1.2, 'ultra thick': 1.6 };
function tkStyle(opts, cmd, ctx) {
    const st = { draw: false, fill: null, stroke: tkColor(opts.draw) || tkColor(opts.color) || '#000000', lw: 1, dash: '', a0: '', a1: '', op: 1, fop: 1, dop: 1 };
    st.draw = cmd === 'draw' || cmd === 'filldraw' || cmd === 'shadedraw' || opts.draw !== undefined;
    if (opts.fill && opts.fill !== true) { st.fill = tkColor(opts.fill); }
    if (cmd === 'fill' || cmd === 'filldraw') { st.fill = st.fill || tkColor(opts.color) || '#000000'; }
    let pt = 0.4;
    Object.keys(TK_LW).forEach(function (k) { if (opts[k]) { pt = TK_LW[k]; } });
    if (opts['line width']) { try { pt = tkEval(opts['line width']) / TK_PT; } catch (e) {} }
    st.lw = Math.max(1, pt * 2.2);
    if (opts.dotted || opts['densely dotted'] || opts['loosely dotted']) { st.dash = '0.1 ' + (opts['densely dotted'] ? 3 : opts['loosely dotted'] ? 7 : 5); }
    else if (opts.dashed || opts['densely dashed'] || opts['loosely dashed']) { st.dash = opts['densely dashed'] ? '5 3' : opts['loosely dashed'] ? '9 7' : '7 5'; }
    ['opacity', 'fill opacity', 'draw opacity'].forEach(function (k) {
        if (opts[k] !== undefined) { const v = parseFloat(opts[k]); if (!isNaN(v)) { if (k === 'opacity') { st.op = v; } else if (k === 'fill opacity') { st.fop = v; } else { st.dop = v; } } }
    });
    const tips = [opts.arrows].concat(Object.keys(opts));
    tips.forEach(function (k) {
        if (typeof k !== 'string') { return; }
        const m = /^(<|>|stealth|latex|to|<<|>>)?-(>|<|stealth|latex|to|>>|<<)?$/.exec(k.replace(/^\{|\}$/g, ''));
        if (m && (m[1] || m[2])) { if (m[1]) { st.a0 = m[1]; } if (m[2]) { st.a1 = m[2]; } }
    });
    return st;
}

function tkSub(s, name, val) {
    // Không thay tên biến ngay sau \\pgfmathsetmacro{ hoặc \\def (đó là chỗ đặt tên biến mới)
    return s.replace(new RegExp('(?<!\\\\pgfmathsetmacro\\s*\\{|\\\\def\\s*)' + name.replace(/\\/g, '\\\\') + '(?![a-zA-Z])', 'g'), function () { return val; });
}
const tkNum = function (n) { return String(Math.round(n * 1e6) / 1e6); };

function tkForVals(list) {
    const it = tkSplit(list, ',').map(function (x) { return x.trim(); }).filter(function (x) { return x !== ''; });
    const out = [];
    for (let k = 0; k < it.length; k++) {
        if (it[k] === '...' || it[k] === '\\ldots' || it[k] === '\\dots' || it[k] === '…') {
            if (out.length === 0 || k + 1 >= it.length) { throw new Error('dấu ... dùng sai trong \\foreach'); }
            const b = tkEval(out[out.length - 1]), end = tkEval(it[k + 1]);
            const step = out.length >= 2 ? b - tkEval(out[out.length - 2]) : (end >= b ? 1 : -1);
            if (step === 0 || (end - b) * step < 0) { throw new Error('dãy ... trong \\foreach không hợp lệ'); }
            for (let v = b + step, n = 0; (step > 0 ? v < end - 1e-9 : v > end + 1e-9) && n < 500; v += step, n++) { out.push(tkNum(v)); }
        } else { out.push(it[k]); }
    }
    if (out.length > 500) { throw new Error('\\foreach quá dài'); }
    return out;
}


// Tọa độ dạng biểu thức: $(A)+(x,y)$, $(A)-(B)$, $(A)!t!(B)$ (trung điểm và chia đoạn)
function tkCoordNguyenTu(inner, ctx) {
    const s = inner.trim();
    if (/^[A-Za-z][\w.\- ]*$/.test(s) && !/^(sqrt|sin|cos|tan|pi)$/.test(s)) {
        const nm = s.split('.')[0].trim();
        if (ctx.names[nm]) { return { x: ctx.names[nm].x, y: ctx.names[nm].y }; }
        throw new Error('chưa có điểm tên "' + nm + '"');
    }
    const phan = tkSplit(s, ',');
    if (phan.length === 1 && tkSplit(s, ':').length === 2) {
        const q = tkSplit(s, ':'); const a = tkEval(q[0]), r = tkEval(q[1]) * ctx.sc;
        return { x: r * Math.cos(a * Math.PI / 180), y: r * Math.sin(a * Math.PI / 180) };
    }
    if (phan.length === 2) { return { x: tkEval(phan[0]) * ctx.sc, y: tkEval(phan[1]) * ctx.sc }; }
    throw new Error('tọa độ "(' + s + ')" chưa được hỗ trợ');
}
function tkCoordExpr(s, ctx) {
    let i = 0; const n = s.length;
    function khoangTrang() { while (i < n && /\s/.test(s[i])) { i++; } }
    function nhom() {
        khoangTrang();
        if (s[i] !== '(') { throw new Error('biểu thức tọa độ thiếu dấu ('); }
        const e = tkMatch(s, i, '(', ')');
        const v = tkCoordNguyenTu(s.slice(i + 1, e), ctx);
        i = e + 1; return v;
    }
    let ketQua = nhom();
    khoangTrang();
    while (i < n) {
        const c = s[i];
        if (c === '+' || c === '-') {
            i++; const v = nhom();
            const sg = c === '+' ? 1 : -1;
            ketQua = { x: ketQua.x + sg * v.x, y: ketQua.y + sg * v.y };
        } else if (c === '!') {
            const e2 = s.indexOf('!', i + 1); if (e2 < 0) { throw new Error('biểu thức ! thiếu dấu !'); }
            const t = tkEval(s.slice(i + 1, e2)); i = e2 + 1;
            const v = nhom();
            ketQua = { x: ketQua.x + t * (v.x - ketQua.x), y: ketQua.y + t * (v.y - ketQua.y) };
        } else { throw new Error('biểu thức tọa độ không hiểu "' + c + '"'); }
        khoangTrang();
    }
    return ketQua;
}

function tkCoord(raw, ctx) {
    const t = raw.trim();
    if (/^\$[\s\S]*\$$/.test(t)) { return tkCoordExpr(t.slice(1, -1), ctx); }
    if (/^[A-Za-z][\w.\- ]*$/.test(t) && !/^(sqrt|sin|cos|tan|pi)$/.test(t)) {
        const nm = t.split('.')[0].trim();
        if (ctx.names[nm]) { return { x: ctx.names[nm].x, y: ctx.names[nm].y }; }
        throw new Error('chưa có điểm tên "' + nm + '"');
    }
    const parts = tkSplit(t, ',');
    if (parts.length === 1 && tkSplit(t, ':').length === 2) {
        const q = tkSplit(t, ':'); const a = tkEval(q[0]), r = tkEval(q[1]) * ctx.sc;
        return { x: r * Math.cos(a * Math.PI / 180), y: r * Math.sin(a * Math.PI / 180) };
    }
    if (parts.length === 2) { return { x: tkEval(parts[0]) * ctx.sc, y: tkEval(parts[1]) * ctx.sc }; }
    throw new Error('tọa độ "' + t + '" chưa được hỗ trợ (chỉ dạng 2D)');
}

function tkMarker(ctx, color) {
    if (!ctx.markers[color]) { ctx.markers[color] = 'tkm' + ctx.uid + '_' + Object.keys(ctx.markers).length; }
    return ctx.markers[color];
}

function tkNodeSvg(n, ctx) {
    const o = n.opts; let dx = 0, dy = 0;
    Object.keys(o).forEach(function (k) {
        k.split(' ').forEach(function (w) { if (w === 'above') { dy = -1; } else if (w === 'below') { dy = 1; } else if (w === 'left') { dx = -1; } else if (w === 'right') { dx = 1; } });
    });
    if (typeof o.anchor === 'string') {
        if (/north/.test(o.anchor)) { dy = 1; } if (/south/.test(o.anchor)) { dy = -1; }
        if (/west/.test(o.anchor)) { dx = 1; } if (/east/.test(o.anchor)) { dx = -1; }
    }
    const W = 140, H = 44, gap = 4;
    const px = n.pos.x * TK_PX, py = -n.pos.y * TK_PX;
    const x = dx > 0 ? px + gap : dx < 0 ? px - gap - W : px - W / 2;
    const y = dy > 0 ? py + gap : dy < 0 ? py - gap - H : py - H / 2;
    ctx.bbPt(px - 60, py - 34); ctx.bbPt(px + 60, py + 34);
    const col = tkColor(o.text) || tkColor(o.color) || '#1a1a1a';
    let box = '';
    if (o.draw !== undefined) { box += 'border:1px solid ' + (o.draw === true ? (tkColor(o.color) || '#000') : tkColor(o.draw)) + ';'; }
    if (o.fill && o.fill !== true) { box += 'background:' + tkColor(o.fill) + ';'; }
    box += o.circle ? 'border-radius:50%;padding:3px 6px;' : 'padding:1px 4px;';
    const just = dx > 0 ? 'flex-start' : dx < 0 ? 'flex-end' : 'center';
    const alg = dy > 0 ? 'flex-start' : dy < 0 ? 'flex-end' : 'center';
    return '<foreignObject x="' + tkNum(x) + '" y="' + tkNum(y) + '" width="' + W + '" height="' + H + '" style="overflow:visible">' +
        '<div style="display:flex;width:100%;height:100%;justify-content:' + just + ';align-items:' + alg + ';font-size:14px;line-height:1.25;color:' + col + ';">' +
        '<span style="' + box + 'text-align:center;white-space:nowrap">' + tex(n.text) + '</span></div></foreignObject>';
}

function tkPath(s, ctx, cmd, opts) {
    const st = tkStyle(opts, cmd, ctx), S = TK_PX;
    let d = '', cp = null, start = null, rel = null, pend = null, lastSeg = null, bez = null;
    const nodes = [];
    const P = function (p) { ctx.bbPt(p.x * S, -p.y * S); return tkNum(p.x * S) + ' ' + tkNum(-p.y * S); };
    function move(p) { d += 'M' + P(p) + ' '; cp = start = p; }
    function lineTo(p) { if (!cp) { move(p); return; } d += 'L' + P(p) + ' '; lastSeg = { a: cp, b: p }; cp = p; }
    function needCp() { if (!cp) { throw new Error('thiếu điểm bắt đầu'); } }
    function skipWs(i) { while (i < s.length && /\s/.test(s[i])) { i++; } return i; }

    function apply(p) {
        if (bez && !bez.closing) { bez.pts.push(p); return; }
        if (bez && bez.closing) {
            const c1 = bez.pts[0], c2 = bez.pts[1] || bez.pts[0];
            needCp(); d += 'C' + P(c1) + ',' + P(c2) + ',' + P(p) + ' '; cp = p; bez = null; return;
        }
        if (pend === null) { move(p); }
        else if (pend === '--') { lineTo(p); }
        else if (pend === '-|') { needCp(); lineTo({ x: p.x, y: cp.y }); lineTo(p); }
        else if (pend === '|-') { needCp(); lineTo({ x: cp.x, y: p.y }); lineTo(p); }
        else if (pend === 'rect') {
            needCp();
            d += 'M' + P(cp) + 'L' + P({ x: p.x, y: cp.y }) + 'L' + P(p) + 'L' + P({ x: cp.x, y: p.y }) + 'Z ';
            cp = p;
        } else if (pend && pend.grid) {
            needCp();
            const stx = pend.sx, sty = pend.sy;
            const x0 = Math.min(cp.x, p.x), x1 = Math.max(cp.x, p.x), y0 = Math.min(cp.y, p.y), y1 = Math.max(cp.y, p.y);
            let n = 0;
            for (let x = Math.ceil(x0 / stx - 1e-9) * stx; x <= x1 + 1e-9 && n < 300; x += stx, n++) { d += 'M' + P({ x: x, y: y0 }) + 'L' + P({ x: x, y: y1 }) + ' '; }
            for (let y = Math.ceil(y0 / sty - 1e-9) * sty, m = 0; y <= y1 + 1e-9 && m < 300; y += sty, m++) { d += 'M' + P({ x: x0, y: y }) + 'L' + P({ x: x1, y: y }) + ' '; }
            cp = p;
        }
        pend = null;
    }

    let i = 0, relMode = 0;
    while (i < s.length) {
        const c = s[i];
        if (/\s/.test(c)) { i++; continue; }
        if (c === '+') {
            relMode = s[i + 1] === '+' ? 2 : 1; i += relMode; i = skipWs(i);
            if (s[i] !== '(') { relMode = 0; }
            continue;
        }
        if (c === '(') {
            const e = tkMatch(s, i, '(', ')'); const raw = s.slice(i + 1, e); i = e + 1;
            let p = tkCoord(raw, ctx);
            if (relMode) {
                const b = relMode === 2 ? cp : rel;
                if (!b) { throw new Error('tọa độ tương đối cần có điểm bắt đầu'); }
                p = { x: b.x + p.x, y: b.y + p.y };
                if (relMode === 2) { rel = p; }
                relMode = 0;
            } else { rel = p; }
            apply(p); continue;
        }
        if (c === '[') { i = tkMatch(s, i, '[', ']') + 1; continue; }
        if (c === '{') { i = tkMatch(s, i, '{', '}') + 1; continue; }
        if (s.startsWith('--', i)) { pend = '--'; i += 2; continue; }
        if (s.startsWith('-|', i)) { pend = '-|'; i += 2; continue; }
        if (s.startsWith('|-', i)) { pend = '|-'; i += 2; continue; }
        if (s.startsWith('..', i)) {
            i += 2;
            if (!bez) { bez = { pts: [], closing: false }; } else if (bez.pts.length > 0) { bez.closing = true; }
            continue;
        }
        const w = /^[a-zA-Z]+/.exec(s.slice(i));
        if (!w) { i++; continue; }
        i += w[0].length;
        const kw = w[0];
        if (kw === 'cycle') { if (cp) { d += 'Z '; cp = start; } pend = null; }
        else if (kw === 'rectangle') { pend = 'rect'; }
        else if (kw === 'to') { pend = '--'; }
        else if (kw === 'grid') {
            i = skipWs(i); let gs = { grid: true, sx: 1, sy: 1 };
            if (s[i] === '[') {
                const e = tkMatch(s, i, '[', ']'); const go = tkOpts(s.slice(i + 1, e)); i = e + 1;
                if (go.step) { gs.sx = gs.sy = tkEval(go.step) * ctx.sc; }
                if (go.xstep) { gs.sx = tkEval(go.xstep) * ctx.sc; } if (go.ystep) { gs.sy = tkEval(go.ystep) * ctx.sc; }
            }
            if (gs.sx <= 0 || gs.sy <= 0) { throw new Error('bước lưới phải > 0'); }
            pend = gs;
        }
        else if (kw === 'circle' || kw === 'ellipse') {
            needCp(); i = skipWs(i); let ro = {};
            if (s[i] === '[') { const e = tkMatch(s, i, '[', ']'); ro = tkOpts(s.slice(i + 1, e)); i = e + 1; i = skipWs(i); }
            let raw = ro.radius || '';
            if (s[i] === '(') { const e = tkMatch(s, i, '(', ')'); raw = s.slice(i + 1, e); i = e + 1; }
            const pr = raw.split(/\band\b/);
            const rx = tkEval(pr[0]) * ctx.sc, ry = pr[1] ? tkEval(pr[1]) * ctx.sc : rx;
            const cx = cp.x * S, cy = -cp.y * S, a = rx * S, b = ry * S;
            ctx.bbPt(cx - a, cy - b); ctx.bbPt(cx + a, cy + b);
            d += 'M' + tkNum(cx + a) + ' ' + tkNum(cy) + 'A' + tkNum(a) + ' ' + tkNum(b) + ' 0 1 0 ' + tkNum(cx - a) + ' ' + tkNum(cy) +
                 'A' + tkNum(a) + ' ' + tkNum(b) + ' 0 1 0 ' + tkNum(cx + a) + ' ' + tkNum(cy) + 'Z ';
        }
        else if (kw === 'arc') {
            needCp(); i = skipWs(i);
            if (s[i] !== '(') { throw new Error('arc cần dạng (góc đầu:góc cuối:bán kính)'); }
            const e = tkMatch(s, i, '(', ')'); const q = tkSplit(s.slice(i + 1, e), ':'); i = e + 1;
            if (q.length !== 3) { throw new Error('arc cần dạng (góc đầu:góc cuối:bán kính)'); }
            const a0 = tkEval(q[0]), a1 = tkEval(q[1]), pr = q[2].split(/\band\b/);
            const rx = tkEval(pr[0]) * ctx.sc, ry = pr[1] ? tkEval(pr[1]) * ctx.sc : rx;
            const rad = Math.PI / 180;
            const ctr = { x: cp.x - rx * Math.cos(a0 * rad), y: cp.y - ry * Math.sin(a0 * rad) };
            const en = { x: ctr.x + rx * Math.cos(a1 * rad), y: ctr.y + ry * Math.sin(a1 * rad) };
            ctx.bbPt((ctr.x - rx) * S, -(ctr.y + ry) * S); ctx.bbPt((ctr.x + rx) * S, -(ctr.y - ry) * S);
            d += 'A' + tkNum(rx * S) + ' ' + tkNum(ry * S) + ' 0 ' + (Math.abs(a1 - a0) > 180 ? 1 : 0) + ' ' + (a1 > a0 ? 0 : 1) + ' ' + P(en) + ' ';
            cp = en;
        }
        else if (kw === 'node') {
            const n = { opts: {}, text: '', pos: null }; let at = null, name = null, got = false;
            while (i < s.length && !got) {
                i = skipWs(i);
                if (s[i] === '[') { const e = tkMatch(s, i, '[', ']'); Object.assign(n.opts, tkOpts(s.slice(i + 1, e))); i = e + 1; }
                else if (s[i] === '(') { const e = tkMatch(s, i, '(', ')'); name = s.slice(i + 1, e).trim(); i = e + 1; }
                else if (/^at(?![a-zA-Z])/.test(s.slice(i))) {
                    i = skipWs(i + 2);
                    if (s[i] !== '(') { throw new Error('thiếu tọa độ sau "at"'); }
                    const e = tkMatch(s, i, '(', ')'); at = tkCoord(s.slice(i + 1, e), ctx); i = e + 1;
                }
                else if (s[i] === '{') { const e = tkMatch(s, i, '{', '}'); n.text = s.slice(i + 1, e); i = e + 1; got = true; }
                else { throw new Error('node viết sai cú pháp'); }
            }
            let pos = at;
            if (!pos) {
                pos = cp || { x: 0, y: 0 };
                let t = null;
                if (n.opts.midway) { t = 0.5; } if (n.opts['at start']) { t = 0; } if (n.opts['at end']) { t = 1; }
                if (n.opts['near start']) { t = 0.25; } if (n.opts['near end']) { t = 0.75; }
                if (typeof n.opts.pos === 'string') { t = parseFloat(n.opts.pos); }
                if (t !== null && !isNaN(t) && lastSeg) { pos = { x: lastSeg.a.x + (lastSeg.b.x - lastSeg.a.x) * t, y: lastSeg.a.y + (lastSeg.b.y - lastSeg.a.y) * t }; }
            }
            n.pos = pos; if (name) { ctx.names[name] = pos; }
            nodes.push(n);
        }
        // các từ khác (controls, and, edge, ...) được bỏ qua
    }

    if (d.trim() !== '' && (st.draw || st.fill)) {
        let a = 'd="' + d.trim() + '" fill="' + (st.fill || 'none') + '"';
        if (st.fill) { a += ' fill-opacity="' + (st.fop * st.op) + '"'; }
        if (st.draw) {
            a += ' stroke="' + st.stroke + '" stroke-width="' + tkNum(st.lw) + '" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="' + (st.dop * st.op) + '"';
            if (st.dash) { a += ' stroke-dasharray="' + st.dash + '"'; }
            if (st.a1) { a += ' marker-end="url(#' + tkMarker(ctx, st.stroke) + ')"'; }
            if (st.a0) { a += ' marker-start="url(#' + tkMarker(ctx, st.stroke) + ')"'; }
        } else { a += ' stroke="none"'; }
        ctx.out.push('<path ' + a + '/>');
    }
    nodes.forEach(function (n) { ctx.out.push(tkNodeSvg(n, ctx)); });
}


// Vẽ đường cong y = f(x) (lệnh plot trong TikZ): lấy mẫu theo domain và samples
function tkPlot(rest, optRaw, opts, ctx, cmd) {
    let r = rest.replace(/^\s*plot\s*/, '');
    let po = {};
    if (r[0] === '[') { const e = tkMatch(r, 0, '[', ']'); po = tkOpts(r.slice(1, e)); r = r.slice(e + 1).trim(); }
    const tatCa = tkOpts(optRaw || '');
    const mien = String(po.domain || tatCa.domain || '').trim();
    const md = /^(.+?):(.+)$/.exec(mien);
    if (!md) { throw new Error('plot cần domain=a:b'); }
    const a = tkEval(md[1]), b = tkEval(md[2]);
    const n = Math.max(2, Math.min(400, parseInt(po.samples || tatCa.samples || '25', 10) || 25));
    if (r[0] !== '(') { throw new Error('plot viết sai cú pháp'); }
    const e = tkMatch(r, 0, '(', ')');
    const phan = tkSplit(r.slice(1, e), ',').map(function (s) { s = s.trim(); return /^\{[\s\S]*\}$/.test(s) ? s.slice(1, -1) : s; });
    if (phan.length !== 2) { throw new Error('plot chỉ hỗ trợ hình 2D (x, y)'); }
    const pts = [];
    for (let k = 0; k < n; k++) {
        const t = a + (b - a) * k / (n - 1);
        const thay = function (bt) { return tkEval(bt.replace(/\\x/g, '(' + t.toFixed(6) + ')')); };
        const x = thay(phan[0]), y = thay(phan[1]);
        if (!isFinite(x) || !isFinite(y)) { continue; }
        pts.push('(' + x.toFixed(4) + ',' + y.toFixed(4) + ')');
    }
    if (pts.length < 2) { throw new Error('plot không có điểm nào để vẽ'); }
    tkPath(pts.join(' -- '), ctx, cmd === 'fill' || cmd === 'filldraw' ? cmd : 'draw', opts);
}

// Đánh dấu góc \tkzMarkAngle(P,V,Q) và ghi nhãn \tkzLabelAngle(P,V,Q){nhãn}
function tkMarkAngle(bo, opts, ctx, nhan) {
    const ten = String(bo || '').split(',').map(function (s) { return s.trim(); });
    if (ten.length !== 3) { throw new Error('góc cần 3 điểm (P,V,Q)'); }
    const diem = function (nm) {
        const p = ctx.names[nm.split('.')[0]];
        if (!p) { throw new Error('chưa có điểm tên "' + nm + '"'); }
        return { x: p.x / ctx.sc, y: p.y / ctx.sc };
    };
    const P = diem(ten[0]), V = diem(ten[1]), Q = diem(ten[2]);
    const a1 = Math.atan2(P.y - V.y, P.x - V.x);
    let delta = Math.atan2(Q.y - V.y, Q.x - V.x) - a1;
    while (delta > Math.PI) { delta -= 2 * Math.PI; }
    while (delta < -Math.PI) { delta += 2 * Math.PI; }
    const r = opts.size ? tkEval(opts.size) : 0.6;
    const mau = opts.color || 'black';
    if (nhan === null) {
        const cung = [];
        for (let k = 0; k <= 12; k++) {
            const g = a1 + delta * k / 12;
            cung.push('(' + (V.x + r * Math.cos(g)).toFixed(4) + ',' + (V.y + r * Math.sin(g)).toFixed(4) + ')');
        }
        tkPath(cung.join(' -- '), ctx, 'draw', { color: mau, thin: true });
    } else {
        const g = a1 + delta / 2, rn = r * 1.6;
        tkPath('node at (' + (V.x + rn * Math.cos(g)).toFixed(4) + ',' + (V.y + rn * Math.sin(g)).toFixed(4) + ') {' + nhan + '}', ctx, 'path', { color: mau });
    }
}


// =====================================================
//  BẢNG BIẾN THIÊN (gói tkz-tab): \tkzTabInit, \tkzTabLine, \tkzTabVar
// =====================================================
function tkTabNhan(s) {
    return String(s).trim().replace(/^\$|\$$/g, '').replace(/\\infty/g, '∞').replace(/\\/g, '').replace(/[{}]/g, '').replace(/'/g, '′').trim();
}
function tkTabDongBoPhan(nd) { return String(nd).split(','); }
function tkTabInit(st, ctx) {
    const m = /^\\tkzTabInit(?![a-zA-Z])\s*(\[[^\]]*\])?\s*/.exec(st);
    const r1 = st.slice(m[0].length);
    const g1 = nhomCan(r1, 0); if (!g1) { throw new Error('tkzTabInit thiếu nhóm nhãn hàng'); }
    const g2 = nhomCan(r1.slice(g1.het).trim(), 0); if (!g2) { throw new Error('tkzTabInit thiếu nhóm giá trị x'); }
    const hang = tkTabDongBoPhan(g1.nd).map(function (p) {
        const q = p.split('/');
        return { nhan: tkTabNhan(q[0]), h: q[1] ? (parseFloat(q[1]) || 0.6) : 0.6 };
    });
    const xs = tkTabDongBoPhan(g2.nd).map(tkTabNhan);
    ctx.tab = { hang: hang, xs: xs, dong: null, bien: null };
}
function tkTabLine(st, ctx) {
    if (!ctx.tab) { throw new Error('tkzTabLine cần tkzTabInit đứng trước'); }
    const r = st.replace(/^\\tkzTabLine(?![a-zA-Z])\s*/, '');
    const g = nhomCan(r, 0); if (!g) { throw new Error('tkzTabLine thiếu { }'); }
    ctx.tab.dong = tkTabDongBoPhan(g.nd).map(function (x) { return x.trim(); });
}
function tkTabVar(st, ctx) {
    if (!ctx.tab) { throw new Error('tkzTabVar cần tkzTabInit đứng trước'); }
    const r = st.replace(/^\\tkzTabVar(?![a-zA-Z])\s*/, '');
    const g = nhomCan(r, 0); if (!g) { throw new Error('tkzTabVar thiếu { }'); }
    ctx.tab.bien = tkTabDongBoPhan(g.nd).map(function (e) { return e.trim().split('/').map(function (x) { return x.trim(); }); });
    tkTabVe(ctx);
}
function tkTabVe(ctx) {
    const T = ctx.tab, n = T.xs.length, cm = TK_PX;
    const colW = 2.4 * cm, labW = 1.2 * cm;
    const hs = T.hang.map(function (r) { return r.h * cm * 1.1; });
    const rowY = []; let yy = 0; hs.forEach(function (hh) { rowY.push(yy); yy += hh; });
    const Ht = yy, Wt = labW + colW * n;
    const X = function (i) { return labW + colW * (i + 0.5); };
    const isD = function (i) { return !!(T.bien[i] && /D/.test(T.bien[i][0])); };
    const dau = function (i) { return (T.bien[i][0] || '').replace(/D/g, '').replace(/\s/g, '')[0] || ''; };
    const out = [];
    const mk = tkMarker(ctx, '#000');
    const line = function (x1, y1, x2, y2, ex) { out.push('<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#000" stroke-width="1.3" ' + (ex || '') + '/>'); };
    const text = function (x, y, s, ex) { const w = Math.max(10, s.length * 9); out.push('<rect x="' + (x - w / 2).toFixed(1) + '" y="' + (y - 9).toFixed(1) + '" width="' + w.toFixed(1) + '" height="18" fill="#fff"/>'); out.push('<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="15" font-family="Times New Roman,serif" fill="#111" ' + (ex || '') + '>' + s + '</text>'); };
    // Khung ngang và dọc
    rowY.forEach(function (y) { line(0, y, Wt, y); });
    line(0, Ht, Wt, Ht); line(0, 0, 0, Ht); line(Wt, 0, Wt, Ht);
    line(labW, 0, labW, Ht);
    for (let i = 0; i < n; i++) { if (i > 0) { line(labW + colW * i, 0, labW + colW * i, Ht); } }
    // Nhãn hàng
    T.hang.forEach(function (r, k) { text(labW / 2, rowY[k] + hs[k] / 2, r.nhan); });
    // Hàng x: giá trị
    T.xs.forEach(function (s, i) { text(X(i), rowY[0] + hs[0] / 2, s); });
    // Hàng y': dấu và điểm 0 / không xác định
    const yP = 1, yY = T.hang.length - 1;
    if (T.dong) {
        T.dong.forEach(function (ch, j) {
            if (j % 2 === 0) {
                const p = j / 2; if (p >= n) { return; }
                if (ch === 'd') { const ym = rowY[yP] + hs[yP] / 2; line(X(p) - 2.5, ym - 7, X(p) - 2.5, ym + 7); line(X(p) + 2.5, ym - 7, X(p) + 2.5, ym + 7); }
                else if (ch === '0') { text(X(p), rowY[yP] + hs[yP] / 2, '0'); }
            } else {
                const q = (j - 1) / 2; if (q + 1 >= n) { return; }
                if (ch === '+' || ch === '-') { text((X(q) + X(q + 1)) / 2, rowY[yP] + hs[yP] / 2, ch === '+' ? '+' : '−'); }
            }
        });
    }
    // Hàng y: giá trị và mũi tên
    const yTop = rowY[yY] + hs[yY] * 0.3, yBot = rowY[yY] + hs[yY] * 0.7, yMid = rowY[yY] + hs[yY] / 2;
    for (let i = 0; i < n; i++) {
        const v = (T.bien[i] || []).slice(1).map(tkTabNhan);
        if (isD(i)) {
            line(X(i) - 3, rowY[yY], X(i) - 3, rowY[yY] + hs[yY]);
            line(X(i) + 3, rowY[yY], X(i) + 3, rowY[yY] + hs[yY]);
            if (v[0] !== undefined) { text(X(i), yTop, v[0]); }
            if (v[1] !== undefined) { text(X(i), yBot, v[1]); }
        } else if (v[0] !== undefined) { text(X(i), yMid, v[0]); }
    }
    // Mũi tên giữa các điểm
    for (let i = 0; i + 1 < n; i++) {
        const s = (T.dong && T.dong[2 * i + 1] && /^[+-]$/.test(T.dong[2 * i + 1])) ? T.dong[2 * i + 1] : dau(i + 1);
        const tang = s === '+';
        let x1, y1, x2, y2;
        if (isD(i)) { x1 = X(i) + 6; y1 = tang ? yTop : yBot; }
        else { x1 = X(i) + 16; y1 = tang ? yBot : yTop; }
        if (isD(i + 1)) { x2 = X(i + 1) - 6; y2 = tang ? yTop : yBot; }
        else { x2 = X(i + 1) - 16; y2 = tang ? yTop : yBot; }
        line(x1, y1, x2, y2, 'marker-end="url(#' + mk + ')"');
    }
    ctx.out.push('<g>' + out.join('') + '</g>');
    ctx.bbPt(0, 0); ctx.bbPt(Wt, Ht);
    T.bo = { X: X, rowY: rowY, hs: hs, n: n, text: text };
}


// \tkzTabVal{i}{j}{t}{hàng}{nhãn}: ghi giá trị giữa cột i và j, ở vị trí t (0..1), trên hàng số "hàng"
function tkTabVal(st, ctx) {
    if (!ctx.tab || !ctx.tab.bo) { throw new Error('tkzTabVal cần đặt sau tkzTabVar'); }
    const r = st.replace(/^\\tkzTabVal(?![a-zA-Z])\s*/, '');
    const a = [], g = [];
    let pos = 0;
    for (let k = 0; k < 5; k++) {
        pos = boKhoang(r, pos);
        const e = nhomCan(r, pos); if (!e) { throw new Error('tkzTabVal thiếu tham số'); }
        a.push(e.nd.trim()); pos = e.het;
    }
    const i = parseInt(a[0], 10), j = parseInt(a[1], 10), t = parseFloat(a[2]), hang = parseInt(a[3], 10);
    const B = ctx.tab.bo;
    const x1 = B.X(i - 1), x2 = B.X(j - 1);
    const xv = x1 + (x2 - x1) * (isNaN(t) ? 0.5 : t);
    const yv = B.rowY[hang - 1] + B.hs[hang - 1] / 2;
    B.text(xv, yv, tkTabNhan(a[4]));
}

function tkRun(text, ctx, depth) {
    if (depth > 4) { throw new Error('\\foreach lồng nhau quá sâu'); }
    text = String(text).replace(/(\\(?:def|pgfmathsetmacro|definecolor|tkzTabInit|tkzTabLine|tkzTabVar|tkzTabVal|tkzLabelAngle)(?![a-zA-Z])[^;]*?\})(?=\s*\\)/g, '$1;');
    tkSplit(text, ';').forEach(function (st0) {
        let st = st0.trim(); if (st === '') { return; }
        if (++ctx.count > 3000) { throw new Error('hình vẽ quá phức tạp'); }
        // Không thay biến vào tên biến đang được định nghĩa (\\side trong \\pgfmathsetmacro{\\side}{...})
        const dau = /^(\\pgfmathsetmacro\s*\{\\[a-zA-Z]+\}|\\def\s*\\[a-zA-Z]+)/.exec(st);
        const phanDau = dau ? dau[0] : '', phanSau = dau ? st.slice(dau[0].length) : st;
        let thaySau = phanSau;
        Object.keys(ctx.vars).sort(function (a, b) { return b.length - a.length; }).forEach(function (v) { thaySau = tkSub(thaySau, v, ctx.vars[v]); });
        st = phanDau + thaySau;
        try {
            let m;
            if (/^\\foreach(?![a-zA-Z])/.test(st)) {
                m = /^\\foreach\s+(\\[a-zA-Z]+)(?:\s*\/\s*(\\[a-zA-Z]+))?\s*in\s*/.exec(st);
                if (!m) { throw new Error('\\foreach viết sai cú pháp'); }
                let rest = st.slice(m[0].length);
                if (rest[0] !== '{') { throw new Error('\\foreach cần danh sách trong { }'); }
                const g = nhomCan(rest, 0); if (!g) { throw new Error('\\foreach thiếu dấu }'); }
                let body, after = '';
                const r2 = rest.slice(g.het).trim();
                if (r2[0] === '{') { const g2 = nhomCan(r2, 0); if (!g2) { throw new Error('thân \\foreach thiếu dấu }'); } body = g2.nd; after = r2.slice(g2.het); } else { body = r2; }
                tkForVals(g.nd).forEach(function (v) {
                    let b = body;
                    if (m[2]) { const pr = v.split('/'); b = tkSub(tkSub(b, m[1], (pr[0] || '').trim()), m[2], (pr[1] || '').trim()); }
                    else { b = tkSub(b, m[1], v); }
                    tkRun(b + ';', ctx, depth + 1);
                });
                if (after.trim() !== '') { tkRun(after, ctx, depth); }
            } else if ((m = /^\\(draw|fill|filldraw|path|node|shade|shadedraw)(?![a-zA-Z])\s*/.exec(st))) {
                const cmd = m[1]; let rest = st.slice(m[0].length), opts = {}, optRaw = '';
                if (cmd === 'node') { rest = 'node ' + rest; }
                else if (rest[0] === '[') { const e = tkMatch(rest, 0, '[', ']'); optRaw = rest.slice(1, e); opts = tkOpts(optRaw); rest = rest.slice(e + 1); }
                if (/^\s*plot(?![a-zA-Z])/.test(rest)) { tkPlot(rest, optRaw, opts, ctx, cmd); }
                else { tkPath(rest, ctx, cmd === 'node' ? 'path' : cmd, opts); }
            } else if (/^\\coordinate(?![a-zA-Z])/.test(st)) {
                const mm = /^\\coordinate\s*(?:\[[^\]]*\])?\s*\(([^)]+)\)\s*at\s*\(/.exec(st);
                if (!mm) { throw new Error('\\coordinate viết sai cú pháp'); }
                const from = mm[0].length - 1; const e = tkMatch(st, from, '(', ')');
                ctx.names[mm[1].trim()] = tkCoord(st.slice(from + 1, e), ctx);
            } else if ((m = /^\\definecolor\s*\{([a-zA-Z]+)\}\s*\{(RGB|rgb|HTML)\}\s*\{([^}]*)\}$/.exec(st))) {
                if (m[2] === 'HTML') { TK_COL[m[1]] = '#' + m[3].trim().replace('#', ''); }
                else {
                    const v = m[3].split(',').map(function (x) { return Math.max(0, Math.min(255, Math.round(parseFloat(x) || 0))); });
                    TK_COL[m[1]] = '#' + v.map(function (n) { return n.toString(16).padStart(2, '0'); }).join('');
                }
            } else if (/^\\tkzTabInit(?![a-zA-Z])/.test(st)) {
                tkTabInit(st, ctx);
            } else if (/^\\tkzTabLine(?![a-zA-Z])/.test(st)) {
                tkTabLine(st, ctx);
            } else if (/^\\tkzTabVar(?![a-zA-Z])/.test(st)) {
                tkTabVar(st, ctx);
            } else if (/^\\tkzTabVal(?![a-zA-Z])/.test(st)) {
                tkTabVal(st, ctx);
            } else if ((m = /^\\tkzMarkAngle(?![a-zA-Z])\s*(\[[^\]]*\])?\s*\(([^)]*)\)/.exec(st))) {
                tkMarkAngle(m[2], m[1] ? tkOpts(m[1].slice(1, -1)) : {}, ctx, null);
            } else if ((m = /^\\tkzLabelAngle(?![a-zA-Z])\s*(\[[^\]]*\])?\s*\(([^)]*)\)\s*\{/.exec(st))) {
                const br = st.indexOf('{', m[0].length - 1), e = tkMatch(st, br, '{', '}');
                tkMarkAngle(m[2], m[1] ? tkOpts(m[1].slice(1, -1)) : {}, ctx, st.slice(br + 1, e));
            } else if ((m = /^\\def\s*(\\[a-zA-Z]+)\s*\{([\s\S]*)\}$/.exec(st))) {
                ctx.vars[m[1]] = m[2];
            } else if ((m = /^\\pgfmathsetmacro\s*\{(\\[a-zA-Z]+)\}\s*\{([\s\S]*)\}$/.exec(st))) {
                ctx.vars[m[1]] = tkNum(tkEval(m[2]));
            } else if (/^\\(usetikzlibrary|tikzset|begin|end|centering|small|large|footnotesize|clip)/.test(st)) {
                if (/^\\clip/.test(st)) { ctx.warn.push('\\clip (cắt hình) chưa được hỗ trợ'); }
            } else {
                ctx.warn.push('chưa hỗ trợ lệnh: ' + st.slice(0, 28) + (st.length > 28 ? '…' : ''));
            }
        } catch (e) {
            ctx.warn.push(e.message + ' — trong: ' + st.slice(0, 32) + (st.length > 32 ? '…' : ''));
        }
    });
}

function tkSvg(src, optStr) {
    const ctx = { names: {}, vars: {}, out: [], markers: {}, warn: [], sc: 1, uid: ++TK_UID, count: 0,
                  bb: { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 } };
    ctx.bbPt = function (x, y) { const b = ctx.bb; b.x0 = Math.min(b.x0, x); b.y0 = Math.min(b.y0, y); b.x1 = Math.max(b.x1, x); b.y1 = Math.max(b.y1, y); };
    try {
        const po = tkOpts((optStr || '').replace(/^\[|\]$/g, ''));
        if (po.scale) { ctx.sc = tkEval(po.scale); }
        tkRun(src.replace(/(^|[^\\])%.*$/gm, '$1'), ctx, 0);
    } catch (e) { ctx.warn.push(e.message); }
    let html = '';
    const b = ctx.bb;
    if (b.x0 <= b.x1) {
        const pad = 10, x0 = b.x0 - pad, y0 = b.y0 - pad, w = b.x1 - b.x0 + 2 * pad, h = b.y1 - b.y0 + 2 * pad;
        const defs = Object.keys(ctx.markers).map(function (c) {
            return '<marker id="' + ctx.markers[c] + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse" markerUnits="strokeWidth"><path d="M0,0 L10,5 L0,10 z" fill="' + c + '"/></marker>';
        }).join('');
        html = '<svg class="tk-svg" xmlns="http://www.w3.org/2000/svg" viewBox="' + [x0, y0, w, h].map(tkNum).join(' ') + '" width="' + Math.round(w) + '" height="' + Math.round(h) + '" style="max-width:100%;height:auto;overflow:visible">' +
               (defs ? '<defs>' + defs + '</defs>' : '') + ctx.out.join('') + '</svg>';
    }
    if (ctx.warn.length) {
        html += '<div class="tk-warn">⚠ ' + ctx.warn.slice(0, 3).map(thoat).join('<br>⚠ ') + (ctx.warn.length > 3 ? '<br>… và ' + (ctx.warn.length - 3) + ' cảnh báo khác' : '') + '</div>';
    }
    return '<div class="tk-wrap">' + (html || '<div class="tk-warn">Hình TikZ chưa có nét vẽ nào.</div>') + '</div>';
}

window.__labFns = { tex: tex, loaiCau: loaiCau, daLam: daLam, chamCau: chamCau, cauGon: (typeof cauGon === 'function' ? cauGon : null) };

// Bảng \begin{tabular}{...} ... \end{tabular} thành bảng HTML (có \hline, \multicolumn, |)
function tkTabularHTML(spec, body, opt) {
    const cot = []; let k = 0;
    const spec2 = String(spec).replace(/\s/g, '');
    const viền = []; let bar = 0;
    for (let c = 0; c < spec2.length; c++) {
        const ch = spec2[c];
        if (ch === '|') { bar++; continue; }
        if (/[lcr]/.test(ch)) { cot.push({ al: ch, tr: bar }); bar = 0; }
    }
    viền.push(bar);
    const cuoi = bar;
    let rows = String(body).replace(/\\\\(?![a-zA-Z])/g, '\u0001');
    rows = rows.split('\u0001');
    let html = '<table class="tk-tabular"><tbody>';
    rows.forEach(function (dong, idx) {
        let d = dong.trim();
        const dau = [];
        while (/^\\hline(?![a-zA-Z])/.test(d)) { dau.push(1); d = d.replace(/^\\hline(?![a-zA-Z])\s*/, ''); }
        d = d.replace(/\\\[[^\]]*\]$/, '').trim();
        if (d === '') {
            // Dòng trống chỉ có \hline: kẻ đường ngang ở đáy dòng trước, không tạo dòng mới
            if (dau.length && html.lastIndexOf('<tr') > html.lastIndexOf('</tbody>')) { html = html.replace(/<\/tr>$/, '</tr>'); }
            if (dau.length) { html = html.replace(/<tr([^>]*)>((?:(?!<tr)[\s\S])*)$/, function (mm, a, b2) { return '<tr' + a.replace(/ class="tk-hl-sau"/, '') + ' class="tk-hl-sau"' + '>' + b2; }); }
            return;
        }
        const ocLast = /\\hline\s*$/.test(dong.trim());
        const tr = [];
        let cell = 0;
        const oc = d.split('&');
        oc.forEach(function (o) {
            let span = 1, al = null, nd = o.trim();
            const mc = /^\\multicolumn\s*\{(\d+)\}\s*\{([^}]*)\}\s*\{([\s\S]*)\}\s*$/.exec(nd);
            if (mc) { span = parseInt(mc[1], 10); al = mc[2].replace(/[|\s]/g, '')[0] || 'c'; nd = mc[3].trim(); }
            tr.push({ span: span, al: al, nd: nd });
        });
        html += '<tr' + (dau.length ? ' class="tk-hl"' : '') + (ocLast ? ' class="tk-hl-sau"' : '') + '>';
        tr.forEach(function (ce) {
            const cl = cot[cell] || { al: 'c', tr: 0 };
            const al = ce.al || cl.al;
            const al2 = al === 'l' ? 'left' : al === 'r' ? 'right' : 'center';
            const cuoiCot = cell + ce.span - 1;
            const vTrai = cl.tr > 0 ? 'border-left:1.2px solid #000;' : '';
            const vPhai = (cuoiCot + 1 < cot.length ? cot[cuoiCot + 1].tr > 0 : cuoi > 0) ? 'border-right:1.2px solid #000;' : '';
            html += '<td colspan="' + ce.span + '" style="text-align:' + al2 + ';' + vTrai + vPhai + '">' + tex(ce.nd, opt) + '</td>';
            cell += ce.span;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
}
// Đưa môi trường toán (array, cases, matrix, ...) ra ngoài dấu $ nếu chưa nằm trong công thức
function tkBaoToanMoiTruong(s) {
    return s.replace(/\\begin\{(array|cases|matrix|pmatrix|bmatrix|vmatrix|Vmatrix|aligned|align\*?|gathered)\}[\s\S]*?\\end\{\1\}/g, function (m, ten, off, all) {
        const truoc = all.slice(0, off).replace(/\\\$/g, '');
        const soDola = (truoc.match(/\$/g) || []).length;
        return soDola % 2 === 1 ? m : '$$' + m + '$$';
    });
}

function tex(s, opt) {
    opt = opt || {};
    s = String(s === undefined || s === null ? '' : s);
    const H = [];
    const giu = function (h) { H.push(h); return '\u0002' + (H.length - 1) + '\u0003'; };
    // 1. \immini{chữ}{hình}: chữ bên trái, hình bên phải
    let k;
    while ((k = s.search(/\\immini(?![a-zA-Z])/)) !== -1) {
        let i = boKhoang(s, k + 7);
        if (s[i] === '[') { const e = s.indexOf(']', i); i = boKhoang(s, e === -1 ? i + 1 : e + 1); }
        const g1 = s[i] === '{' ? nhomCan(s, i) : null;
        if (!g1) { s = s.slice(0, k) + s.slice(k + 7); continue; }
        const j = boKhoang(s, g1.het), g2 = s[j] === '{' ? nhomCan(s, j) : null;
        if (!g2) { s = s.slice(0, k) + g1.nd + s.slice(g1.het); continue; }
        s = s.slice(0, k) + giu('<div class="tk-immini"><div>' + tex(g1.nd, opt) + '</div><div>' + tex(g2.nd, opt) + '</div></div>') + s.slice(g2.het);
    }
    // 1b. bảng tabular
    s = s.replace(/\\begin\{tabular\}\s*\{([^}]*)\}([\s\S]*?)\\end\{tabular\}/g, function (m, spec, body) { return giu(tkTabularHTML(spec, body, opt)); });
    // 1c. môi trường toán ngoài dấu $
    s = tkBaoToanMoiTruong(s);
    // 2. môi trường tikzpicture
    let coHinh = false;
    s = s.replace(/\\begin\{tikzpicture\}(\[[^\]]*\])?([\s\S]*?)\\end\{tikzpicture\}/g, function (m, o, body) {
        coHinh = true;
        return giu(opt.khongHinh ? '<i class="tk-ph">[hình vẽ TikZ]</i>' : tkSvg(body, o || ''));
    });
    // 3. dán lệnh \draw... mà quên \begin{tikzpicture}: tự bọc lại
    if (!coHinh && /\\(draw|fill|filldraw|node|coordinate|foreach)(?![a-zA-Z])/.test(s) && s.indexOf('\u0002') === -1) {
        const a = s.search(/\\(draw|fill|filldraw|node|coordinate|foreach)(?![a-zA-Z])/), z = s.lastIndexOf(';');
        if (z > a) {
            const body = s.slice(a, z + 1);
            s = s.slice(0, a) + giu(opt.khongHinh ? '<i class="tk-ph">[hình vẽ TikZ]</i>' : tkSvg(body, '')) + s.slice(z + 1);
        }
    }
    // 4. công thức toán và văn bản
    s = s.replace(/\\\$/g, '\u0001');
    const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$|\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g;
    let out = '', last = 0, m;
    while ((m = re.exec(s)) !== null) {
        out += vanBanTex(s.slice(last, m.index));
        const rieng = m[1] !== undefined || m[4] !== undefined;
        const nd = m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4];
        out += toanHoc(nd, rieng);
        last = re.lastIndex;
    }
    out += vanBanTex(s.slice(last));
    return out.replace(/\u0002(\d+)\u0003/g, function (x, n) { return H[+n]; });
}

// ---------- Đọc mã LaTeX dạng ex_test: \begin{ex} ... \choice{}{}{}{} \loigiai{} \end{ex} ----------
function nhomCan(s, i) {                       // s[i] === '{' -> {nd, het}
    let d = 0;
    for (let j = i; j < s.length; j++) {
        const c = s[j];
        if (c === '\\') { j++; continue; }
        if (c === '{') { d++; }
        else if (c === '}') { d--; if (d === 0) { return { nd: s.slice(i + 1, j), het: j + 1 }; } }
    }
    return null;
}
function boKhoang(s, i) { while (i < s.length && /\s/.test(s[i])) { i++; } return i; }
function boChuThich(s) { return s.replace(/(^|[^\\])%.*$/gm, '$1'); }

// ---------- Các dạng câu hỏi: tn (trắc nghiệm) · ds (đúng/sai) · dien (điền khuyết) · keo (kéo thả) ----------
const LOAI_TEN = { tn: 'Trắc nghiệm', ds: 'Đúng / Sai', nhieu: 'Nhiều đáp án', dien: 'Điền khuyết', keo: 'Kéo thả' };
// true: câu nhiều ý / nhiều ô được tính điểm từng phần; false: phải đúng hết mới được điểm câu đó
const CHAM_TUNG_PHAN = true;
function loaiCau(q) { return q && q.loai && LOAI_TEN[q.loai] ? q.loai : 'tn'; }
function nhanLoai(q) { const lo = loaiCau(q); return lo === 'tn' ? '' : '<span class="lq-tag ' + lo + '">' + LOAI_TEN[lo] + '</span>'; }

// Tách các lệnh trong nội dung câu: điền khuyết \blank{đáp án}; kéo thả \drop{đáp án đúng} và \decoy{ô nhiễu}.
// Chỗ trống được thay bằng ký hiệu \u0004B<n>\u0005 (điền khuyết) hoặc \u0004D<n>\u0005 (kéo thả).
function tachCau(cau, loai) {
    const keo = loai === 'keo', o = [], nhieu = [];
    const re = keo ? /\\(drop|decoy)(?![a-zA-Z])/g : /\\(blank)(?![a-zA-Z])/g;
    let out = '', last = 0, m;
    while ((m = re.exec(cau)) !== null) {
        const j = boKhoang(cau, m.index + m[0].length);
        if (cau[j] !== '{') { continue; }
        const g = nhomCan(cau, j);
        if (!g) { continue; }
        out += cau.slice(last, m.index);
        if (m[1] === 'decoy') { nhieu.push(g.nd.trim()); }
        else { o.push(g.nd.trim()); out += '\u0004' + (keo ? 'D' : 'B') + (o.length - 1) + '\u0005'; }
        last = g.het; re.lastIndex = g.het;
    }
    return { text: out + cau.slice(last), o: o, nhieu: nhieu };
}
function dapAnChap(raw) { return String(raw).split('||').map(function (x) { return x.trim(); }).filter(function (x) { return x !== ''; }); }

// Hiển thị câu có chỗ trống: fnB(n, đápán) cho ô điền khuyết, fnD(n, đápán) cho ô kéo thả
function cauHTML(q, fnB, fnD, opt) {
    const t = tachCau(q.cau, loaiCau(q));
    const h = tex(t.text, opt).replace(/\u0004([BD])(\d+)\u0005/g, function (x, k, n) {
        return k === 'B' ? (fnB ? fnB(+n, t.o[+n]) : '') : (fnD ? fnD(+n, t.o[+n]) : '');
    });
    return { h: h, t: t };
}
function cauGon(q, opt) {            // câu hỏi dạng ngắn gọn: chỗ trống thành gạch dưới
    const lo = loaiCau(q);
    if (lo === 'dien' || lo === 'keo') {
        const g = function () { return '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>'; };
        return cauHTML(q, g, g, opt).h;
    }
    return tex(q.cau, opt);
}

// So khớp đáp án điền: không phân biệt hoa/thường, bỏ khoảng trắng, "1,5" = "1.5", -0 = 0...
function chuanHoa(s) {
    return String(s === undefined || s === null ? '' : s).normalize('NFC')
        .replace(/\\(?:dfrac|tfrac)(?![a-zA-Z])/g, '\\frac').replace(/\\(?:left|right)(?![a-zA-Z])/g, '')
        .replace(/\\[,;:! ]/g, '').replace(/∞/g, '\\infty').replace(/[−–—]/g, '-')
        .replace(/[$\s{}]/g, '').replace(/,/g, '.').toLowerCase();
}
function khopDapAn(nguoi, raw) {
    const n = chuanHoa(nguoi);
    if (n === '') { return false; }
    const so = /^-?\d+(\.\d+)?$/;
    return dapAnChap(raw).some(function (x) {
        const c = chuanHoa(x);
        return c === n || (so.test(c) && so.test(n) && parseFloat(c) === parseFloat(n));
    });
}

// Trạng thái bài làm ban đầu của một câu
function khoiTaoDapAn(q) {
    const lo = loaiCau(q);
    if (lo === 'nhieu') { return q.menh.map(function () { return false; }); }
    if (lo === 'ds') { return q.menh.map(function () { return null; }); }
    if (lo === 'dien' || lo === 'keo') { return tachCau(q.cau, lo).o.map(function () { return lo === 'dien' ? '' : -1; }); }
    return -1;
}
function daLam(q, a) {
    const lo = loaiCau(q);
    if (lo === 'tn') { return a !== -1; }
    if (lo === 'nhieu') { return a.some(function (x) { return x === true; }); }
    if (lo === 'ds') { return a.some(function (x) { return x !== null; }); }
    if (lo === 'dien') { return a.some(function (x) { return String(x).trim() !== ''; }); }
    return a.some(function (x) { return x !== -1; });
}
function taoChip(q) {               // kéo thả: các ô cần kéo = đáp án đúng + ô nhiễu, xáo trộn
    if (loaiCau(q) !== 'keo') { return null; }
    const t = tachCau(q.cau, 'keo'), ds = t.o.concat(t.nhieu).map(function (x) { return { t: x }; });
    for (let i = ds.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)), x = ds[i]; ds[i] = ds[j]; ds[j] = x; }
    return ds;
}

// Chấm một câu -> { diem: 0..1, ct: [chi tiết từng ý / ô] }
function chamCau(q, a, chips) {
    const lo = loaiCau(q), ct = [];
    if (lo === 'tn') { return { diem: a === q.dung ? 1 : 0, ct: ct }; }
    if (lo === 'nhieu') {   // chọn nhiều đáp án: điểm = (số đáp án đúng đã chọn - số ô chọn nhầm) / số đáp án đúng, không âm
        let trung = 0, nham = 0, can = 0;
        q.menh.forEach(function (m, i) {
            const chon = a[i] === true, ok = chon === !!m.dung;
            if (m.dung) { can++; if (chon) { trung++; } } else if (chon) { nham++; }
            ct.push({ ok: ok, nd: m.nd, nguoiH: chon ? 'Đã chọn' : '<i>(không chọn)</i>', dapAnH: m.dung ? 'Cần chọn' : 'Không chọn' });
        });
        let d;
        if (!CHAM_TUNG_PHAN) { d = (can > 0 && trung === can && nham === 0) ? 1 : 0; }
        else { d = can ? Math.max(0, (trung - nham) / can) : 0; }
        return { diem: d, ct: ct };
    }
    let dung = 0, tong = 0;
    if (lo === 'ds') {
        tong = q.menh.length;
        q.menh.forEach(function (m, i) {
            const ok = a[i] === m.dung; if (ok) { dung++; }
            ct.push({ ok: ok, nd: m.nd, nguoiH: a[i] === null ? '<i>(bỏ trống)</i>' : a[i] ? 'Đúng' : 'Sai', dapAnH: m.dung ? 'Đúng' : 'Sai' });
        });
    } else {
        const t = tachCau(q.cau, lo); tong = t.o.length;
        t.o.forEach(function (raw, i) {
            let ok, nguoiH;
            if (lo === 'dien') { const v = String(a[i] || ''); ok = khopDapAn(v, raw); nguoiH = v.trim() === '' ? '<i>(bỏ trống)</i>' : thoat(v); }
            else { const c = a[i] !== -1 && chips ? chips[a[i]] : null; ok = !!c && khopDapAn(c.t, raw); nguoiH = c ? tex(c.t) : '<i>(bỏ trống)</i>'; }
            if (ok) { dung++; }
            ct.push({ ok: ok, nguoiH: nguoiH, dapAnH: lo === 'dien' ? dapAnChap(raw).map(function (x) { return tex(x); }).join(' / ') : tex(raw) });
        });
    }
    let diem;
    if (!CHAM_TUNG_PHAN) { diem = dung === tong ? 1 : 0; }
    else if (lo === 'ds' && tong === 4) { diem = [0, 0.1, 0.25, 0.5, 1][dung]; }   // thang điểm đúng/sai 4 ý
    else { diem = tong ? dung / tong : 0; }
    return { diem: diem, ct: ct };
}

// Phần "xem lại" sau khi nộp bài cho một câu chưa đạt điểm tối đa
function xemLaiCau(q, stt, a, r) {
    const lo = loaiCau(q);
    let h = '<div class="rv"><div><b>Câu ' + stt + '.</b> ' + (lo === 'tn' ? '' : nhanLoai(q) + ' ') + (lo === 'dien' || lo === 'keo' ? cauGon(q) : tex(q.cau)) +
            (lo === 'tn' ? '' : '<span class="rv-score">(' + (Math.round(r.diem * 100) / 100) + ' / 1 điểm)</span>') + '</div>';
    if (lo === 'tn') {
        h += '<div class="rv-sai">Bạn chọn: ' + (a === -1 ? '(bỏ trống)' : tex(q.dapAn[a])) + '</div>' +
             '<div class="rv-dung">Đáp án đúng: ' + tex(q.dapAn[q.dung]) + '</div>';
    } else {
        h += '<div class="rv-part">' + r.ct.map(function (c, i) {
            const dau = c.ok ? '<span class="okk">✔</span>' : '<span class="nok">✖</span>';
            const ten = (lo === 'ds' || lo === 'nhieu') ? 'abcdefgh'.charAt(i) + ') ' + tex(c.nd) + (lo === 'ds' ? ' — Bạn chọn: ' : ' — Bạn: ') : 'Ô ' + (i + 1) + ': ' + (lo === 'dien' ? 'bạn điền ' : 'bạn thả ');
            return '<div>' + dau + ' ' + ten + '<b>' + c.nguoiH + '</b>' + (c.ok ? '' : ' · Đáp án: <b>' + c.dapAnH + '</b>') + '</div>';
        }).join('') + '</div>';
    }
    return h + (q.loiGiai ? '<div class="kh-ls"><b>Lời giải.</b> ' + tex(q.loiGiai) + '</div>' : '') + '</div>';
}

// Sao chép / gán các trường của câu hỏi (kể cả dạng mới)
function truongCau(x) {
    const r = { cau: x.cau, dapAn: x.dapAn || [], dung: typeof x.dung === 'number' ? x.dung : -1, loiGiai: x.loiGiai || '', nguon: x.nguon };
    if (x.loai && x.loai !== 'tn') { r.loai = x.loai; }
    if (x.menh) { r.menh = x.menh.map(function (m) { return { nd: m.nd, dung: !!m.dung }; }); }
    return r;
}
function ganCau(q, x) { delete q.loai; delete q.menh; Object.assign(q, truongCau(x)); }
function saoCau(q) { const r = truongCau(q); r.dapAn = r.dapAn.slice(); delete r.nguon; return r; }

// Đọc các dạng câu mới trong khối \begin{ex}; trả về null nếu là trắc nghiệm thường (\choice)
function phanTichDangMoi(body, loiGiai) {
    const mu = body.search(/\\choiceMulti(?![a-zA-Z])/);
    if (mu !== -1) {                                   // ---- Nhiều đáp án (chọn nhiều ô vuông) ----
        const cau = body.slice(0, mu).trim();
        if (cau === '') { return { loi: 'thiếu nội dung câu hỏi (phần trước \\choiceMulti).' }; }
        let i = boKhoang(body, mu + 12);
        if (body[i] === '[') { const e = body.indexOf(']', i); i = boKhoang(body, e === -1 ? i + 1 : e + 1); }
        const menh = []; let soDung = 0;
        while (body[i] === '{') {
            const g = nhomCan(body, i);
            if (!g) { return { loi: 'dấu { } ở đáp án ' + (menh.length + 1) + ' chưa đóng đúng.' }; }
            let nd = g.nd.trim(), dung = false;
            if (/^\\True(?![a-zA-Z])/.test(nd)) { nd = nd.replace(/^\\True\s*/, ''); dung = true; soDung++; }
            if (nd === '') { return { loi: 'đáp án ' + (menh.length + 1) + ' của \\choiceMulti đang để trống.' }; }
            menh.push({ nd: nd, dung: dung }); i = boKhoang(body, g.het);
        }
        if (menh.length < 2) { return { loi: '\\choiceMulti cần ít nhất 2 đáp án {..}; đáp án nào đúng thì thêm \\True ở đầu, ví dụ {\\True Đáp án đúng}.' }; }
        if (menh.length > 8) { return { loi: '\\choiceMulti tối đa 8 đáp án.' }; }
        if (soDung === 0) { return { loi: 'chưa đánh dấu đáp án đúng nào bằng \\True (câu nhiều đáp án cần ít nhất 1 đáp án đúng).' }; }
        return { loai: 'nhieu', cau: cau, menh: menh, dapAn: [], dung: -1, loiGiai: loiGiai };
    }
    const tf = body.search(/\\choiceTF(?![a-zA-Z])/);
    if (tf !== -1) {                                   // ---- Đúng / Sai ----
        const cau = body.slice(0, tf).trim();
        if (cau === '') { return { loi: 'thiếu nội dung câu hỏi (phần trước \\choiceTF).' }; }
        let i = boKhoang(body, tf + 9);
        if (body[i] === '[') { const e = body.indexOf(']', i); i = boKhoang(body, e === -1 ? i + 1 : e + 1); }
        const menh = [];
        while (body[i] === '{') {
            const g = nhomCan(body, i);
            if (!g) { return { loi: 'dấu { } ở ý ' + (menh.length + 1) + ' chưa đóng đúng.' }; }
            let nd = g.nd.trim(), dung = false;
            if (/^\\True(?![a-zA-Z])/.test(nd)) { nd = nd.replace(/^\\True\s*/, ''); dung = true; }
            if (nd === '') { return { loi: 'ý ' + (menh.length + 1) + ' của \\choiceTF đang để trống.' }; }
            menh.push({ nd: nd, dung: dung }); i = boKhoang(body, g.het);
        }
        if (menh.length < 2) { return { loi: '\\choiceTF cần ít nhất 2 ý {..}; ý nào đúng thì thêm \\True ở đầu, ví dụ {\\True Mệnh đề đúng}.' }; }
        if (menh.length > 8) { return { loi: '\\choiceTF tối đa 8 ý.' }; }
        return { loai: 'ds', cau: cau, menh: menh, dapAn: [], dung: -1, loiGiai: loiGiai };
    }
    if (/\\choice(?![a-zA-Z])/.test(body)) { return null; }
    const khungTrong = function (t) { return t.text.replace(/\u0004[BD]\d+\u0005/g, '').trim() === ''; };
    if (/\\drop(?![a-zA-Z])/.test(body)) {             // ---- Kéo thả ----
        const t = tachCau(body, 'keo');
        if (t.o.length === 0) { return { loi: 'lệnh \\drop cần có dạng \\drop{đáp án đúng}.' }; }
        if (t.o.some(function (x) { return x === ''; }) || t.nhieu.some(function (x) { return x === ''; })) { return { loi: 'có ô \\drop{} hoặc \\decoy{} đang để trống.' }; }
        if (khungTrong(t)) { return { loi: 'thiếu nội dung câu hỏi.' }; }
        return { loai: 'keo', cau: body.trim(), dapAn: [], dung: -1, loiGiai: loiGiai };
    }
    const sa = body.search(/\\shortans(?![a-zA-Z])/);
    if (sa !== -1 || /\\blank(?![a-zA-Z])/.test(body)) {   // ---- Điền khuyết ----
        let cau = body;
        if (sa !== -1) {
            const j = boKhoang(body, sa + 9), g = body[j] === '{' ? nhomCan(body, j) : null;
            if (!g) { return { loi: '\\shortans cần có dạng \\shortans{đáp án}.' }; }
            cau = (body.slice(0, sa) + body.slice(g.het)).trim() + ' \\blank{' + g.nd.trim() + '}';
        }
        cau = cau.trim();
        const t = tachCau(cau, 'dien');
        if (t.o.length === 0) { return { loi: 'lệnh \\blank cần có dạng \\blank{đáp án}.' }; }
        if (t.o.some(function (x) { return dapAnChap(x).length === 0; })) { return { loi: 'có ô \\blank{} đang để trống đáp án.' }; }
        if (khungTrong(t)) { return { loi: 'thiếu nội dung câu hỏi.' }; }
        return { loai: 'dien', cau: cau, dapAn: [], dung: -1, loiGiai: loiGiai };
    }
    return null;
}

function phanTichEx(body) {
    body = boChuThich(body);
    let loiGiai = '';
    const k = body.indexOf('\\loigiai');
    if (k !== -1) {
        const i = boKhoang(body, k + 8);
        if (body[i] === '{') {
            const g = nhomCan(body, i);
            if (g) { loiGiai = g.nd.trim(); body = body.slice(0, k) + body.slice(g.het); }
        }
    }
    const moi = phanTichDangMoi(body, loiGiai);
    if (moi) { return moi; }
    const c = body.search(/\\choice(?![a-zA-Z])/);
    if (c === -1) { return { loi: 'chưa nhận dạng được dạng câu: dùng \\choice (trắc nghiệm), \\choiceTF (đúng/sai), \\choiceMulti (nhiều đáp án), \\blank{} hoặc \\shortans{} (điền khuyết), \\drop{} (kéo thả).' }; }
    const cau = body.slice(0, c).trim();
    if (cau === '') { return { loi: 'thiếu nội dung câu hỏi (phần trước \\choice).' }; }
    let i = boKhoang(body, c + 7);
    if (body[i] === '[') { const e = body.indexOf(']', i); i = boKhoang(body, e === -1 ? i + 1 : e + 1); }
    const dapAn = []; let dung = -1, soDung = 0;
    for (let n = 0; n < 4; n++) {
        i = boKhoang(body, i);
        if (body[i] !== '{') { return { loi: 'chỉ tìm thấy ' + n + ' đáp án, cần đủ 4 nhóm {..}.' }; }
        const g = nhomCan(body, i);
        if (!g) { return { loi: 'dấu { } ở đáp án ' + 'ABCD'[n] + ' chưa đóng đúng.' }; }
        let nd = g.nd.trim();
        if (/^\\True(?![a-zA-Z])/.test(nd)) { nd = nd.replace(/^\\True\s*/, ''); dung = n; soDung++; }
        if (nd === '') { return { loi: 'đáp án ' + 'ABCD'[n] + ' đang để trống.' }; }
        dapAn.push(nd); i = g.het;
    }
    if (soDung === 0) { return { loi: 'chưa đánh dấu đáp án đúng bằng \\True (ví dụ {\\True 5}).' }; }
    if (soDung > 1) { return { loi: 'có ' + soDung + ' đáp án \\True, chỉ được 1.' }; }
    return { cau: cau, dapAn: dapAn, dung: dung, loiGiai: loiGiai };
}

function taoTex(q) {                           // đối tượng câu hỏi -> mã LaTeX ex
    const lo = loaiCau(q), lg = q.loiGiai ? '\n  \\loigiai{\n    ' + q.loiGiai + '\n  }' : '';
    if (lo === 'ds') {
        return '\\begin{ex}\n  ' + q.cau + '\n  \\choiceTF\n' +
            q.menh.map(function (m) { return '  {' + (m.dung ? '\\True ' : '') + m.nd + '}'; }).join('\n') + lg + '\n\\end{ex}';
    }
    if (lo === 'nhieu') {
        return '\\begin{ex}\n  ' + q.cau + '\n  \\choiceMulti\n' +
            q.menh.map(function (m) { return '  {' + (m.dung ? '\\True ' : '') + m.nd + '}'; }).join('\n') + lg + '\n\\end{ex}';
    }
    if (lo === 'dien' || lo === 'keo') { return '\\begin{ex}\n  ' + q.cau + lg + '\n\\end{ex}'; }
    return '\\begin{ex}\n  ' + q.cau + '\n  \\choice\n' +
        q.dapAn.map(function (a, j) { return '  {' + (j === q.dung ? '\\True ' : '') + a + '}'; }).join('\n') +
        (q.loiGiai ? '\n  \\loigiai{\n    ' + q.loiGiai + '\n  }' : '') + '\n\\end{ex}';
}

// Đọc nhiều câu: ưu tiên mã \begin{ex}, nếu không thì dùng bộ đọc văn bản / bảng / JSON có sẵn
function phanTichKho(raw) {
    raw = String(raw).replace(/^\uFEFF/, '');
    const ds = [], loi = [];
    if (/\\begin\{ex\}/.test(raw)) {
        const re = /\\begin\{ex\}([\s\S]*?)\\end\{ex\}/g; let m, n = 0;
        while ((m = re.exec(raw)) !== null) {
            n++;
            const r = phanTichEx(m[1]);
            if (r.loi) { loi.push('Câu ' + n + ': ' + r.loi); }
            else { r.nguon = '\\begin{ex}' + m[1].replace(/\s+$/, '') + '\n\\end{ex}'; ds.push(r); }
        }
        if (n === 0) { loi.push('Có \\begin{ex} nhưng thiếu \\end{ex}.'); }
    } else if (/\\(?:choice|choiceTF|choiceMulti|shortans|drop|blank)(?![a-zA-Z])/.test(raw)) {
        const r = phanTichEx(raw);
        if (r.loi) { loi.push('Câu 1: ' + r.loi); } else { r.nguon = taoTex(r); ds.push(r); }
    } else if (raw.trim() !== '') {
        const r = phanTichDe(raw);
        r.cauHoi.forEach(function (q) { q.nguon = taoTex(q); ds.push(q); });
        r.loi.forEach(function (x) { loi.push(x); });
    }
    return { ds: ds, loi: loi };
}

// ---------- Khối hiển thị một câu hỏi ----------
function khoXemHTML(q) {
    const lo = loaiCau(q), nhan = nhanLoai(q);
    const ls = q.loiGiai ? '<div class="kh-ls"><b>Lời giải.</b> ' + tex(q.loiGiai) + '</div>' : '';
    if (lo === 'ds') {
        return '<div class="kh-q"><div class="kh-qt">' + nhan + tex(q.cau) + '</div>' +
            q.menh.map(function (m, j) {
                return '<div class="kh-op ' + (m.dung ? 'ok' : 'sai') + '"><b>' + 'abcdefgh'.charAt(j) + ')</b><span>' + tex(m.nd) + '</span>' +
                       '<b style="margin-left:auto;white-space:nowrap;color:' + (m.dung ? '#0f8a5f' : '#d93025') + '">' + (m.dung ? '✔ Đúng' : '✖ Sai') + '</b></div>';
            }).join('') + ls + '</div>';
    }
    if (lo === 'nhieu') {
        return '<div class="kh-q"><div class="kh-qt">' + nhan + tex(q.cau) + '</div>' +
            q.menh.map(function (m, j) {
                return '<div class="kh-op' + (m.dung ? ' ok' : '') + '"><b>' + 'ABCDEFGH'.charAt(j) + '.</b><span>' + tex(m.nd) + '</span>' +
                       (m.dung ? '<b style="margin-left:auto;white-space:nowrap;color:#0f8a5f">✔ Đáp án đúng</b>' : '') + '</div>';
            }).join('') + ls + '</div>';
    }
    if (lo === 'dien') {
        const r = cauHTML(q, function (n, a) { return '<span class="kh-ans">' + dapAnChap(a).map(function (x) { return tex(x); }).join(' / ') + '</span>'; }, null);
        return '<div class="kh-q"><div class="kh-qt">' + nhan + r.h + '</div>' + ls + '</div>';
    }
    if (lo === 'keo') {
        const r = cauHTML(q, null, function (n, a) { return '<span class="kh-ans dr">' + tex(a) + '</span>'; });
        return '<div class="kh-q"><div class="kh-qt">' + nhan + r.h + '</div>' +
            (r.t.nhieu.length ? '<div class="kh-lb">Ô nhiễu (học sinh thấy thêm các ô này nhưng không có chỗ đúng)</div><div class="kh-chips">' +
                r.t.nhieu.map(function (x) { return '<span class="x-chip dc">' + tex(x) + '</span>'; }).join('') + '</div>' : '') + ls + '</div>';
    }
    return '<div class="kh-q"><div class="kh-qt">' + tex(q.cau) + '</div>' +
        q.dapAn.map(function (a, j) {
            return '<div class="kh-op' + (j === q.dung ? ' ok' : '') + '"><b>' + 'ABCD'[j] + '.</b><span>' + tex(a) + '</span></div>';
        }).join('') + ls + '</div>';
}

// ---------- Danh sách trong trang quản trị ----------
const khoTT = { gioiHan: 50, chon: new Set() };

function khoLoc() {
    const tk = document.getElementById('kho-tim').value.trim().toLowerCase();
    const mon = document.getElementById('kho-mon').value, muc = document.getElementById('kho-muc').value, dang = document.getElementById('kho-loai').value;
    return khoCH.filter(function (q) {
        if (mon && q.mon !== mon) { return false; }
        if (muc && q.mucDo !== muc) { return false; }
        if (dang && loaiCau(q) !== dang) { return false; }
        return !tk || (q.cau + ' ' + (q.chuDe || '') + ' ' + q.dapAn.join(' ') + ' ' + (q.menh || []).map(function (m) { return m.nd; }).join(' ')).toLowerCase().indexOf(tk) !== -1;
    });
}

function veKho() {
    const sm = document.getElementById('kho-mon'), sc = document.getElementById('kho-muc');
    if (sm.options.length === 0) {
        sm.innerHTML = '<option value="">Tất cả môn</option>' + KHO_MON.map(function (m) { return '<option>' + m + '</option>'; }).join('');
        sc.innerHTML = '<option value="">Mọi mức độ</option>' + KHO_MUC.map(function (m) { return '<option>' + m + '</option>'; }).join('');
    }
    const sl = document.getElementById('kho-loai');
    if (sl.options.length === 0) {
        sl.innerHTML = '<option value="">Mọi dạng câu</option>' + Object.keys(LOAI_TEN).map(function (k) { return '<option value="' + k + '">' + LOAI_TEN[k] + '</option>'; }).join('');
    }
    const ds = khoLoc();
    const hien = ds.slice(0, khoTT.gioiHan);
    const body = document.getElementById('kho-body');
    if (hien.length === 0) {
        body.innerHTML = '<tr><td colspan="7" class="empty-row">' + (khoCH.length === 0 ? 'Kho còn trống. Bấm "+ Soạn câu hỏi" hoặc "Nhập .tex / dán" để thêm câu đầu tiên.' : 'Không có câu hỏi nào phù hợp.') + '</td></tr>';
    } else {
        body.innerHTML = hien.map(function (q, i) {
            const id = thoat(q.id);
            return '<tr><td><input type="checkbox" class="kh-sel" data-id="' + id + '"' + (khoTT.chon.has(q.id) ? ' checked' : '') + '></td>' +
                '<td>' + (i + 1) + '</td><td><div class="kh-cell">' + nhanLoai(q) + cauGon(q, { khongHinh: true }) + '</div></td>' +
                '<td>' + thoat(q.mon || '-') + '</td><td>' + thoat(q.chuDe || '-') + '</td>' +
                '<td><span class="tag tag-blue">' + thoat(q.mucDo || '-') + '</span></td>' +
                '<td class="acts">' +
                    '<button class="icon-btn" data-act="xem" data-id="' + id + '" title="Xem">👁</button>' +
                    '<button class="icon-btn" data-act="sua" data-id="' + id + '" title="Sửa mã LaTeX">✏️</button>' +
                    '<button class="icon-btn" data-act="nhan" data-id="' + id + '" title="Nhân bản">📄</button>' +
                    '<button class="icon-btn" data-act="xoa" data-id="' + id + '" title="Xóa">🗑</button></td></tr>';
        }).join('');
    }
    document.getElementById('kho-dem').textContent = 'Hiển thị ' + hien.length + ' / ' + ds.length + ' câu lọc được (kho có ' + khoCH.length + ' câu) · Đã chọn ' + khoTT.chon.size + ' câu';
    document.getElementById('kho-more').innerHTML = ds.length > hien.length ? '<button class="btn-sec" id="kho-xem-them">Xem thêm 50 câu</button>' : '';
    const nutThem = document.getElementById('kho-xem-them');
    if (nutThem) { nutThem.addEventListener('click', function () { khoTT.gioiHan += 50; veKho(); }); }
    document.getElementById('kho-all').checked = hien.length > 0 && hien.every(function (q) { return khoTT.chon.has(q.id); });
}

['kho-tim', 'kho-mon', 'kho-muc', 'kho-loai'].forEach(function (id) {
    document.getElementById(id).addEventListener(id === 'kho-tim' ? 'input' : 'change', function () { khoTT.gioiHan = 50; veKho(); });
});
document.getElementById('kho-all').addEventListener('change', function () {
    const bat = this.checked;
    khoLoc().forEach(function (q) { if (bat) { khoTT.chon.add(q.id); } else { khoTT.chon.delete(q.id); } });
    veKho();
});
document.getElementById('kho-body').addEventListener('change', function (e) {
    const o = e.target.closest('input[data-id]'); if (!o) { return; }
    if (o.checked) { khoTT.chon.add(o.dataset.id); } else { khoTT.chon.delete(o.dataset.id); }
    veKho();
});
document.getElementById('kho-body').addEventListener('click', function (e) {
    const nut = e.target.closest('button[data-act]'); if (!nut) { return; }
    const q = khoCH.find(function (x) { return x.id === nut.dataset.id; }); if (!q) { return; }
    const act = nut.dataset.act;
    if (act === 'xem') {
        moDialog('<h3>Xem câu hỏi</h3><p class="modal-sub">' + thoat(q.mon || '') + (q.chuDe ? ' · ' + thoat(q.chuDe) : '') + (q.mucDo ? ' · ' + thoat(q.mucDo) : '') + '</p>' +
            khoXemHTML(q) + '<div class="dialog-actions"><button class="btn-sec" id="kx-dong">Đóng</button><button class="btn-link" id="kx-sua">Sửa mã LaTeX</button></div>', true);
        document.getElementById('kx-dong').addEventListener('click', dongDialog);
        document.getElementById('kx-sua').addEventListener('click', function () { moSoanKho(q.id); });
    } else if (act === 'sua') {
        moSoanKho(q.id);
    } else if (act === 'nhan') {
        const ban = JSON.parse(JSON.stringify(q)); ban.id = taoId(); ban.ngayTao = new Date().toISOString();
        khoCH.push(ban); luuKho(); veQuanTri(); hienToast('Đã nhân bản câu hỏi.');
    } else if (act === 'xoa') {
        if (!confirm('Xóa câu hỏi này khỏi kho? (Các đề đã tạo từ câu này không bị ảnh hưởng)')) { return; }
        khoCH = khoCH.filter(function (x) { return x.id !== q.id; }); khoTT.chon.delete(q.id);
        luuKho(); veQuanTri(); hienToast('Đã xóa câu hỏi.');
    }
});

// ---------- Trình soạn LaTeX + xem trước ----------
const KHO_MAU = [
    '\\begin{ex}',
    '  Tính giá trị của biểu thức $A=\\dfrac{1}{2}+\\dfrac{1}{3}$.',
    '  \\choice',
    '  {$\\dfrac{2}{5}$}',
    '  {\\True $\\dfrac{5}{6}$}',
    '  {$\\dfrac{1}{6}$}',
    '  {$1$}',
    '  \\loigiai{',
    '    Ta có $A=\\dfrac{3}{6}+\\dfrac{2}{6}=\\dfrac{5}{6}$.',
    '  }',
    '\\end{ex}',
    ''
].join('\n');

const KHO_MAU_DS = [
    '\\begin{ex}',
    '  Cho phương trình $3\\cos x+1=0$. Các khẳng định sau là đúng hay sai?',
    '  \\choiceTF',
    '  {\\True Phương trình có $2$ nghiệm phân biệt trong khoảng $(0;2\\pi)$}',
    '  {Tổng các nghiệm trong khoảng $(0;2\\pi)$ bằng $\\pi$}',
    '  {\\True Phương trình tương đương $\\cos x=-\\dfrac{1}{3}$}',
    '  \\loigiai{',
    '    Ta có $\\cos x=-\\dfrac{1}{3}$ nên có hai nghiệm $x_1$, $x_2=2\\pi-x_1$ trong $(0;2\\pi)$, tổng hai nghiệm bằng $2\\pi$.',
    '  }',
    '\\end{ex}',
    ''
].join('\n');
const KHO_MAU_NHIEU = [
    '\\begin{ex}',
    '  Cho một vật thể được tạo ra bằng cách quay miền giới hạn bởi $y=e^{-x}$, $x=0$, $x=1$ và $y=0$ quanh trục $Ox$.',
    '  \\choiceMulti',
    '  {\\True Thể tích của vật thể được tính bằng $V=\\pi\\int\\limits_0^1 e^{-2x}\\,\\mathrm{d}x$.}',
    '  {\\True Thể tích của vật thể là $\\dfrac{\\pi\\left(e^2-1\\right)}{2e^2}$.}',
    '  {\\True Diện tích của miền phẳng ban đầu là $1-\\dfrac{1}{e}$.}',
    '  {Vật thể này có hình dạng giống một hình nón.}',
    '  \\loigiai{',
    '    $V=\\pi\\int\\limits_0^1 e^{-2x}\\,\\mathrm{d}x=\\pi\\cdot\\dfrac{1-e^{-2}}{2}=\\dfrac{\\pi\\left(e^2-1\\right)}{2e^2}$; diện tích miền phẳng là $\\int\\limits_0^1 e^{-x}\\,\\mathrm{d}x=1-\\dfrac{1}{e}$. Đường $y=e^{-x}$ không phải đường thẳng nên vật thể không phải hình nón.',
    '  }',
    '\\end{ex}',
    ''
].join('\n');
const KHO_MAU_DIEN = [
    '\\begin{ex}',
    '  Trong không gian $Oxyz$, cho phương trình $x^2+y^2+z^2-2x-2my-2z+m+4=0$ ($m$ là tham số). Số các số nguyên dương $m$ nhỏ hơn $10$ để phương trình đã cho là phương trình mặt cầu là \\blank{7}.',
    '  \\loigiai{',
    '    Điều kiện: $1+m^2+1-(m+4)>0\\Leftrightarrow m^2-m-2>0\\Leftrightarrow m>2$ hoặc $m<-1$. Vậy $m\\in\\{3;4;\\dots;9\\}$, có $7$ giá trị.',
    '  }',
    '\\end{ex}',
    ''
].join('\n');
const KHO_MAU_KEO = [
    '\\begin{ex}',
    '  Hàm số $y=\\log\\left(x^2+1\\right)$ có tập xác định là \\drop{$\\mathbb{R}$} và tập giá trị là \\drop{$[0;+\\infty)$}.',
    '  \\decoy{$(-\\infty;0)$}',
    '  \\decoy{$(1;-\\infty)$}',
    '  \\decoy{$(-\\infty;1)$}',
    '  \\loigiai{',
    '    Vì $x^2+1>0$ với mọi $x$ nên tập xác định là $\\mathbb{R}$; $x^2+1\\ge 1$ nên $\\log(x^2+1)\\ge 0$.',
    '  }',
    '\\end{ex}',
    ''
].join('\n');

// Nút chèn nhanh. Dấu | là vị trí con trỏ sau khi chèn.
const KHO_NUT = [
    ['Mẫu trắc nghiệm', KHO_MAU, 'tpl'], ['Mẫu Đúng/Sai', KHO_MAU_DS, 'tpl'], ['Mẫu Nhiều đáp án', KHO_MAU_NHIEU, 'tpl'], ['Mẫu Điền khuyết', KHO_MAU_DIEN, 'tpl'], ['Mẫu Kéo thả', KHO_MAU_KEO, 'tpl'],
    ['$ $', '$|$'], ['\\frac', '\\dfrac{|}{}'], ['\\sqrt', '\\sqrt{|}'], ['x^n', '^{|}'], ['x_n', '_{|}'],
    ['\\int', '\\int\\limits_{|}^{}'], ['\\sum', '\\sum\\limits_{i=1}^{|}'], ['\\lim', '\\lim\\limits_{x\\to |}'],
    ['\\heva', '\\heva{|}'], ['\\vec', '\\overrightarrow{|}'], ['\\True', '\\True '],
    ['TikZ', '\\begin{tikzpicture}\n  \\draw[->] (0,0) -- (4,0) node[right] {$x$};\n  \\draw[->] (0,0) -- (0,3) node[above] {$y$};\n  \\draw[thick, blue] (0,0) rectangle (2,1.5);\n  \\fill[red] (2,1.5) circle (0.06) node[above right] {$A$};\n  |\n\\end{tikzpicture}'],
    ['\\loigiai', '\\loigiai{\n  |\n}'], ['\\choice', '\\choice\n{|}\n{}\n{}\n{}'],
    ['\\choiceTF', '\\choiceTF\n{\\True |}\n{}\n{}\n{}'], ['\\choiceMulti', '\\choiceMulti\n{\\True |}\n{}\n{}\n{}'], ['\\blank', '\\blank{|}'], ['\\shortans', '\\shortans{|}'], ['\\drop', '\\drop{|}'], ['\\decoy', '\\decoy{|}']
];

function moSoanKho(id) {
    const q = id ? khoCH.find(function (x) { return x.id === id; }) : null;
    moDialog(
        '<h3>' + (q ? 'Sửa câu hỏi (mã LaTeX)' : 'Soạn câu hỏi bằng LaTeX') + '</h3>' +
        '<p class="modal-sub">Gõ mã như trong TeXstudio (định dạng <b>ex_test</b>), bên phải hiện kết quả ngay. Phím <b>Tab</b> thụt 2 dấu cách.<br>' +
        '<b>5 dạng câu:</b> <code>\\choice</code> trắc nghiệm · <code>\\choiceTF</code> đúng/sai (ý đúng thêm <code>\\True</code>) · <code>\\choiceMulti</code> nhiều đáp án (mỗi đáp án đúng thêm <code>\\True</code>, được chọn nhiều ô) · <code>\\blank{đáp án}</code> hoặc <code>\\shortans{đáp án}</code> điền khuyết (nhiều đáp án chấp nhận: <code>a || b</code>) · ' +
        '<code>\\drop{đáp án đúng}</code> + <code>\\decoy{ô nhiễu}</code> kéo thả. Đặt <code>\\blank</code>, <code>\\drop</code> ngoài cặp <code>$…$</code>.' +
        (q ? '' : ' Dán nhiều khối <code>\\begin{ex}…\\end{ex}</code> thì lưu được nhiều câu cùng lúc.') + '</p>' +
        '<div class="kh-meta">' +
            '<div class="field"><label for="k-mon">Môn</label><select id="k-mon">' + KHO_MON.map(function (m) { return '<option>' + m + '</option>'; }).join('') + '</select></div>' +
            '<div class="field"><label for="k-cd">Chủ đề</label><input id="k-cd" placeholder="Ví dụ: Hàm số, Tích phân…"></div>' +
            '<div class="field"><label for="k-muc">Mức độ</label><select id="k-muc">' + KHO_MUC.map(function (m) { return '<option>' + m + '</option>'; }).join('') + '</select></div>' +
        '</div>' +
        '<div class="kh-split">' +
            '<div class="kh-left"><div class="kh-lb">MÃ LaTeX</div><div class="kh-tools" id="k-tools"></div>' +
                '<textarea id="k-src" class="kh-src" spellcheck="false" autocomplete="off"></textarea><div class="kh-st" id="k-st"></div></div>' +
            '<div class="kh-right"><div class="kh-lb">XEM TRƯỚC</div><div class="kh-prev" id="k-prev"></div></div>' +
        '</div>' +
        '<div class="form-error" id="k-loi"></div>' +
        '<div class="dialog-actions"><button class="btn-sec" id="k-huy">Hủy</button><button class="btn-link" id="k-luu">Lưu vào kho</button></div>',
        true
    );
    document.querySelector('#dialog .modal-box').classList.add('xl');

    const o = document.getElementById('k-src'), st = document.getElementById('k-st'), pv = document.getElementById('k-prev');
    o.value = q ? (q.nguon || taoTex(q)) : KHO_MAU;
    if (q) { document.getElementById('k-mon').value = q.mon || 'Toán'; document.getElementById('k-cd').value = q.chuDe || ''; document.getElementById('k-muc').value = q.mucDo || KHO_MUC[0]; }

    let hen = null, kq = { ds: [], loi: [] };
    function capNhat() {
        kq = phanTichKho(o.value);
        let h = '';
        kq.ds.forEach(function (x, i) {
            h += (kq.ds.length > 1 ? '<div class="kh-lb">CÂU ' + (i + 1) + '</div>' : '') + khoXemHTML(x) + (i < kq.ds.length - 1 ? '<hr style="margin:16px 0;border:0;border-top:1px dashed #d9e2f3">' : '');
        });
        pv.innerHTML = h || '<p class="tbl-foot">Chưa có câu hỏi hợp lệ để xem trước.</p>';
        if (kq.loi.length > 0) { st.className = 'kh-st er'; st.innerHTML = '✖ ' + thoat(kq.loi[0]) + (kq.loi.length > 1 ? ' (và ' + (kq.loi.length - 1) + ' lỗi khác)' : ''); }
        else if (kq.ds.length > 0) { st.className = 'kh-st ok'; st.textContent = '✔ Hợp lệ: ' + kq.ds.length + ' câu.'; }
        else { st.className = 'kh-st'; st.textContent = ''; }
    }
    o.addEventListener('input', function () { clearTimeout(hen); hen = setTimeout(capNhat, 150); });
    o.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const a = o.selectionStart; o.setRangeText('  ', a, o.selectionEnd, 'end'); o.dispatchEvent(new Event('input'));
        }
    });

    const tools = document.getElementById('k-tools');
    KHO_NUT.forEach(function (n) {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = n[0]; if (n[2]) { b.className = n[2]; }
        b.addEventListener('click', function () {
            let s = n[1];
            if (n[2] === 'tpl') {
                if (o.value.trim() !== '' && !confirm('Thay toàn bộ nội dung đang soạn bằng mẫu câu hỏi?')) { return; }
                o.value = s; capNhat(); o.focus(); return;
            }
            const vt = s.indexOf('|'); s = s.replace('|', '');
            const a = o.selectionStart, z = o.selectionEnd, chon = o.value.slice(a, z);
            if (chon && vt !== -1) { s = s.slice(0, vt) + chon + s.slice(vt); }
            o.setRangeText(s, a, z, 'end');
            const pos = a + (vt === -1 ? s.length : vt + chon.length);
            o.setSelectionRange(pos, pos); o.focus(); capNhat();
        });
        tools.appendChild(b);
    });
    capNhat();

    document.getElementById('k-huy').addEventListener('click', dongDialog);
    document.getElementById('k-luu').addEventListener('click', function () {
        const loi = document.getElementById('k-loi');
        capNhat();
        if (kq.loi.length > 0) { baoLoi(loi, 'Hãy sửa lỗi trước khi lưu: ' + kq.loi[0]); return; }
        if (kq.ds.length === 0) { baoLoi(loi, 'Chưa có câu hỏi hợp lệ nào để lưu.'); return; }
        const meta = { mon: document.getElementById('k-mon').value, chuDe: document.getElementById('k-cd').value.trim(), mucDo: document.getElementById('k-muc').value };
        if (q) {
            const x = kq.ds[0];
            ganCau(q, x);
            q.mon = meta.mon; q.chuDe = meta.chuDe; q.mucDo = meta.mucDo;
            hienToast(kq.ds.length > 1 ? 'Đã cập nhật câu hỏi (chỉ lấy câu đầu tiên).' : 'Đã cập nhật câu hỏi ✔');
        } else {
            const bay = new Date().toISOString();
            kq.ds.forEach(function (x) { khoCH.push(Object.assign({ id: taoId(), mon: meta.mon, chuDe: meta.chuDe, mucDo: meta.mucDo, ngayTao: bay }, truongCau(x))); });
            hienToast('Đã thêm ' + kq.ds.length + ' câu vào kho ✔');
        }
        luuKho(); dongDialog(); veQuanTri();
    });
}
document.getElementById('kho-them').addEventListener('click', function () { moSoanKho(null); });

// ---------- Nhập hàng loạt từ file .tex / dán ----------
const KHO_FILE_MAU = [
    '% File mẫu kho câu hỏi SKY EDU (định dạng ex_test)',
    KHO_MAU,
    '\\begin{ex}',
    '  Phương trình $x^2-5x+6=0$ có hai nghiệm là',
    '  \\choice',
    '  {$1;6$}',
    '  {$-2;-3$}',
    '  {\\True $2;3$}',
    '  {$-1;-6$}',
    '  \\loigiai{ Ta có $(x-2)(x-3)=0$ nên $x=2$ hoặc $x=3$. }',
    '\\end{ex}',
    ''
].join('\n');

document.getElementById('kho-nhap').addEventListener('click', function () {
    moDialog(
        '<h3>Nhập câu hỏi từ file .tex</h3>' +
        '<p class="modal-sub">Chọn file <b>.tex</b> (UTF-8) hoặc dán mã. Mỗi câu nằm trong <code>\\begin{ex} … \\end{ex}</code> (trắc nghiệm <code>\\choice</code>, đúng/sai <code>\\choiceTF</code>, nhiều đáp án <code>\\choiceMulti</code>, điền khuyết <code>\\blank</code>/<code>\\shortans</code>, kéo thả <code>\\drop</code>); cũng đọc được định dạng "Câu 1. / A. B. C. D. / Đáp án: B".</p>' +
        '<div class="kh-meta">' +
            '<div class="field"><label for="n-mon">Môn</label><select id="n-mon">' + KHO_MON.map(function (m) { return '<option>' + m + '</option>'; }).join('') + '</select></div>' +
            '<div class="field"><label for="n-cd">Chủ đề</label><input id="n-cd" placeholder="Áp dụng cho tất cả câu"></div>' +
            '<div class="field"><label for="n-muc">Mức độ</label><select id="n-muc">' + KHO_MUC.map(function (m) { return '<option>' + m + '</option>'; }).join('') + '</select></div>' +
        '</div>' +
        '<div class="field"><label for="n-file">Chọn file (.tex, .txt)</label><input type="file" id="n-file" accept=".tex,.txt,text/plain"></div>' +
        '<div class="field"><label for="n-chu">Hoặc dán mã LaTeX vào đây</label><textarea id="n-chu" rows="9" class="mono" spellcheck="false"></textarea></div>' +
        '<div class="imp-links">Tải file mẫu: <a href="#" id="n-mau">mau-kho-cau-hoi.tex</a></div>' +
        '<div class="imp-result" id="n-kq"></div>' +
        '<div class="dialog-actions"><button class="btn-sec" id="n-huy">Hủy</button><button class="btn-link" id="n-luu">Thêm vào kho</button></div>',
        true
    );
    const oChu = document.getElementById('n-chu'), oKq = document.getElementById('n-kq');
    let kq = { ds: [], loi: [] };
    function capNhat() {
        kq = phanTichKho(oChu.value);
        if (oChu.value.trim() === '') { oKq.innerHTML = ''; return; }
        let h = kq.ds.length ? '<div class="imp-ok">✔ Nhận diện được <b>' + kq.ds.length + '</b> câu hợp lệ.</div>' : '';
        if (kq.loi.length) {
            h += '<div class="imp-err"><b>' + kq.loi.length + ' lỗi (các câu lỗi sẽ không được thêm):</b><ul>' +
                kq.loi.slice(0, 6).map(function (x) { return '<li>' + thoat(x) + '</li>'; }).join('') + (kq.loi.length > 6 ? '<li>…</li>' : '') + '</ul></div>';
        }
        if (!kq.ds.length && !kq.loi.length) { h = '<div class="imp-err">Chưa nhận diện được câu hỏi nào.</div>'; }
        oKq.innerHTML = h;
    }
    oChu.addEventListener('input', capNhat);
    document.getElementById('n-file').addEventListener('change', function () { docFileVaoO(this, oChu, capNhat); });
    document.getElementById('n-mau').addEventListener('click', function (e) { e.preventDefault(); taiFile('mau-kho-cau-hoi.tex', '\uFEFF' + KHO_FILE_MAU + '\n' + KHO_MAU_DS + '\n' + KHO_MAU_DIEN + '\n' + KHO_MAU_KEO, 'application/x-tex'); });
    document.getElementById('n-huy').addEventListener('click', dongDialog);
    document.getElementById('n-luu').addEventListener('click', function () {
        capNhat();
        if (!kq.ds.length) { hienToast('Không có câu hợp lệ nào để thêm.'); return; }
        const mon = document.getElementById('n-mon').value, cd = document.getElementById('n-cd').value.trim(), muc = document.getElementById('n-muc').value, bay = new Date().toISOString();
        kq.ds.forEach(function (x) { khoCH.push(Object.assign({ id: taoId(), mon: mon, chuDe: cd, mucDo: muc, ngayTao: bay }, truongCau(x))); });
        luuKho(); dongDialog(); veQuanTri();
        hienToast('Đã thêm ' + kq.ds.length + ' câu vào kho ✔' + (kq.loi.length ? ' (bỏ qua ' + kq.loi.length + ' câu lỗi)' : ''));
    });
});

// ---------- Đồng bộ đám mây tự động (Firebase Firestore) ----------
const KHO_FIREBASE = {
    apiKey: "AIzaSyBCl_5FHbsbShN_eWcsFtG29O8eXQNJWc0",
    authDomain: "skyyyyedu.firebaseapp.com",
    projectId: "skyyyyedu",
    storageBucket: "skyyyyedu.firebasestorage.app",
    messagingSenderId: "104577778934",
    appId: "1:104577778934:web:f9fb9da7fe96a2b9b518d7"
};
(function () {
    const el = document.getElementById('kho-cloud');
    function tt(t) { if (el) { el.textContent = t; } }
    if (!window.firebase || !firebase.firestore) { tt('☁ Chưa kết nối (đang dùng dữ liệu trên máy này)'); return; }
    let col;
    try {
        if (!firebase.apps.length) { firebase.initializeApp(KHO_FIREBASE); }
        col = firebase.firestore().collection('khoCauHoi');
    } catch (e) { tt('☁ Lỗi kết nối đám mây'); return; }

    const daDay = {};          // id -> chuỗi JSON đã có trên đám mây
    let sanSang = false, hen = null, dangDay = false, lai = false;

    function lamMoi() { try { veKho(); } catch (e) {} }
    function demTt() { tt('☁ Đã đồng bộ · ' + khoCH.length + ' câu'); }

    function day() {
        if (dangDay) { lai = true; return; }
        const ids = new Set(), ops = [];
        khoCH.forEach(function (q) {
            ids.add(q.id);
            const j = JSON.stringify(q);
            if (daDay[q.id] !== j) { ops.push({ id: q.id, j: j }); }
        });
        Object.keys(daDay).forEach(function (id) { if (!ids.has(id)) { ops.push({ id: id, xoa: true }); } });
        if (!ops.length) { demTt(); return; }
        dangDay = true; tt('☁ Đang đồng bộ…');
        const cum = [];
        for (let i = 0; i < ops.length; i += 200) { cum.push(ops.slice(i, i + 200)); }
        cum.reduce(function (p, nhom) {
            return p.then(function () {
                const bt = firebase.firestore().batch();
                nhom.forEach(function (o) {
                    const ref = col.doc(o.id);
                    if (o.xoa) { bt.delete(ref); } else { bt.set(ref, { json: o.j, capNhat: Date.now() }); }
                });
                return bt.commit().then(function () {
                    nhom.forEach(function (o) { if (o.xoa) { delete daDay[o.id]; } else { daDay[o.id] = o.j; } });
                });
            });
        }, Promise.resolve()).then(function () {
            dangDay = false; demTt();
            if (lai) { lai = false; day(); }
        }).catch(function (e) {
            dangDay = false; tt('☁ Đồng bộ lỗi, sẽ thử lại khi bạn lưu tiếp');
            if (window.console) { console.warn('Đồng bộ kho lỗi', e); }
        });
    }

    window.khoDongBoDay = function () {
        if (!sanSang) { return; }
        clearTimeout(hen); hen = setTimeout(day, 400);
    };

    col.onSnapshot(function (snap) {
        let doi = false;
        snap.docChanges().forEach(function (ch) {
            const id = ch.doc.id;
            if (ch.type === 'removed') {
                delete daDay[id];
                const k = khoCH.findIndex(function (q) { return q.id === id; });
                if (k >= 0) { khoCH.splice(k, 1); doi = true; }
                return;
            }
            const j = ch.doc.get('json');
            if (typeof j !== 'string') { return; }
            if (ch.doc.metadata.hasPendingWrites) { return; }   // bản do chính máy này vừa ghi
            if (daDay[id] === j) { return; }
            let q; try { q = JSON.parse(j); } catch (e) { return; }
            if (!q || typeof q.id !== 'string') { return; }
            daDay[id] = j;
            const k = khoCH.findIndex(function (x) { return x.id === id; });
            if (k >= 0) { if (JSON.stringify(khoCH[k]) !== j) { khoCH[k] = q; doi = true; } }
            else { khoCH.push(q); doi = true; }
        });
        if (doi) { ghiKho('localStorage', KHO_KHO, khoCH); lamMoi(); }
        if (!sanSang) { sanSang = true; day(); } else if (doi) { demTt(); }
    }, function (e) {
        tt('☁ Không kết nối được đám mây (kiểm tra mạng hoặc quy tắc Firestore)');
        if (window.console) { console.warn('Firestore lỗi', e); }
    });
})();

// ---------- Đồng bộ kho giữa nhiều máy (gộp theo id, không ghi đè/xóa câu đang có) ----------
document.getElementById('kho-dong-bo-xuat').addEventListener('click', function () {
    if (!khoCH.length) { hienToast('Kho đang trống, chưa có gì để xuất.'); return; }
    const ngay = new Date().toISOString().slice(0, 10);
    taiFile('skyedu-kho-' + ngay + '.json', JSON.stringify({ loai: 'skyedu-kho', xuatLuc: new Date().toISOString(), khoCauHoi: khoCH }, null, 1), 'application/json');
    hienToast('Đã xuất ' + khoCH.length + ' câu. Mở file này ở máy kia bằng "Gộp kho từ máy khác".');
});
document.getElementById('kho-dong-bo-nhap').addEventListener('click', function () { document.getElementById('kho-dong-bo-file').click(); });
document.getElementById('kho-dong-bo-file').addEventListener('change', function () {
    const f = this.files[0]; this.value = '';
    if (!f) { return; }
    const doc = new FileReader();
    doc.onload = function () {
        try {
            const g = JSON.parse(doc.result);
            const ds = Array.isArray(g) ? g : g.khoCauHoi;
            if (!Array.isArray(ds)) { throw new Error('sai dinh dang'); }
            const co = new Set(khoCH.map(function (q) { return q.id; }));
            let them = 0, trung = 0;
            ds.forEach(function (q) {
                if (!q || typeof q.id !== 'string' || !Array.isArray(q.dapAn)) { return; }
                if (co.has(q.id)) { trung++; return; }
                co.add(q.id); khoCH.push(q); them++;
            });
            luuKho(); veQuanTri();
            hienToast('Đã gộp thêm ' + them + ' câu mới (' + trung + ' câu đã có sẵn). ✔');
        } catch (err) {
            hienToast('File không đúng định dạng kho câu hỏi SKY EDU.');
        }
    };
    doc.readAsText(f);
});

// ---------- Xuất ra file .tex biên dịch được trong TeXstudio ----------
document.getElementById('kho-xuat').addEventListener('click', function () {
    let ds = khoCH.filter(function (q) { return khoTT.chon.has(q.id); });
    if (ds.length === 0) { ds = khoLoc(); }
    if (ds.length === 0) { hienToast('Kho đang trống, chưa có gì để xuất.'); return; }
    const dau = ['\\documentclass[a4paper,12pt]{article}', '\\usepackage[utf8]{inputenc}', '\\usepackage[T5]{fontenc}', '\\usepackage[vietnamese]{babel}',
                 '\\usepackage{amsmath,amssymb}', '\\usepackage[loigiai]{ex_test}',
                 '% Lệnh cho câu điền khuyết / kéo thả (dùng trên web, in ra thành chỗ trống)',
                 '\\providecommand{\\blank}[1]{\\underline{\\hspace{2.5cm}}}', '\\providecommand{\\drop}[1]{\\fbox{\\rule{0pt}{1.1em}\\hspace{2cm}}}',
                 '\\providecommand{\\decoy}[1]{}', '\\providecommand{\\shortans}[1]{\\par\\textbf{Đáp án:} #1}',
                 '\\begin{document}', ''].join('\n');
    const noi = ds.map(function (q) { return q.nguon || taoTex(q); }).join('\n\n');
    taiFile('kho-cau-hoi.tex', '\uFEFF' + dau + noi + '\n\n\\end{document}\n', 'application/x-tex');
    hienToast('Đã xuất ' + ds.length + ' câu ra file .tex');
});

// ---------- Tạo đề thi từ các câu đã chọn ----------
document.getElementById('kho-de').addEventListener('click', function () {
    const ds = khoCH.filter(function (q) { return khoTT.chon.has(q.id); });
    if (ds.length === 0) { hienToast('Hãy tick chọn ít nhất một câu trong bảng.'); return; }
    moDialog(
        '<h3>Tạo đề thi từ kho</h3><p class="modal-sub">Đề gồm <b>' + ds.length + '</b> câu đã chọn (sao chép sang đề, sửa kho sau này không đổi đề).</p>' +
        '<div class="form-2col">' +
            '<div class="field full"><label for="t-ten">Tên đề thi</label><input id="t-ten" placeholder="Ví dụ: Đề thi thử TSA số 2"></div>' +
            '<div class="field"><label for="t-phong">Phòng luyện</label><select id="t-phong"><option value="tsa">Phòng TSA</option><option value="hsa">Phòng HSA</option></select></div>' +
            '<div class="field"><label for="t-goi">Gói đề</label><select id="t-goi">' + goiOptions() + '</select></div>' +
            '<div class="field"><label for="t-phut">Thời gian (phút)</label><input id="t-phut" type="number" min="1" max="300" value="' + Math.max(5, ds.length * 2) + '"></div>' +
            '<label class="check full"><input type="checkbox" id="t-hien" checked> Cho học sinh làm đề này ngay</label>' +
        '</div><div class="form-error" id="t-loi"></div>' +
        '<div class="dialog-actions"><button class="btn-sec" id="t-huy">Hủy</button><button class="btn-link" id="t-luu">Tạo đề</button></div>', true);
    document.getElementById('t-huy').addEventListener('click', dongDialog);
    document.getElementById('t-luu').addEventListener('click', function () {
        const loi = document.getElementById('t-loi');
        const ten = document.getElementById('t-ten').value.trim(), phut = parseInt(document.getElementById('t-phut').value, 10);
        if (ten === '') { baoLoi(loi, 'Vui lòng nhập tên đề thi.'); return; }
        if (!(phut >= 1 && phut <= 300)) { baoLoi(loi, 'Thời gian làm bài phải từ 1 đến 300 phút.'); return; }
        deThi.push({ id: taoId(), ten: ten, phong: document.getElementById('t-phong').value, goi: document.getElementById('t-goi').value, phut: phut,
                     hienThi: document.getElementById('t-hien').checked,
                     cauHoi: ds.map(saoCau),
                     ngayTao: new Date().toISOString(), nguoiTao: nguoiDung ? nguoiDung.email : '' });
        luuDe(); khoTT.chon.clear(); dongDialog(); veQuanTri();
        hienToast('Đã tạo đề "' + ten + '" (' + ds.length + ' câu) ✔');
    });
});

veKho();
    