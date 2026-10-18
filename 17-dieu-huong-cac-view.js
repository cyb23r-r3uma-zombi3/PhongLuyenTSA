
(function(){const $=function(i){return document.getElementById(i)},lab=$('lab');
const V={home:'lv-home',luyen:'lv-goi',khao:'lv-khao',sach:'lv-sach',ls:'lv-ls',tk:'lv-tk',faq:'lv-faq'};
const dm=function(i){return i?new Date(i).toLocaleDateString('vi-VN'):'—'};
function mine(){return ketQua.filter(function(k){return nguoiDung&&k.email===nguoiDung.email}).slice().reverse()}
function show(k){lab.querySelectorAll('.l-views>.lv').forEach(function(v){v.classList.remove('on')});
 lab.querySelectorAll('.l-nav a').forEach(function(a){a.classList.toggle('act',a.dataset.v===k)});
 $(V[k]).classList.add('on');$('l-ava').src=$('l-logo').src;
 const ks=mine();
 if(k==='luyen')$('lg-q').dispatchEvent(new Event('input'));
 if(k==='home'){const tb=ks.length?(ks.reduce(function(t,x){return t+x.diem},0)/ks.length).toFixed(1):'—';
  $('lv-home').innerHTML='<div class="l-head"><h2>Xin chào, '+thoat(nguoiDung.ten||nguoiDung.email)+' 👋</h2></div><div class="stat"><div><b>'+ks.length+'</b>Lượt làm bài</div><div><b>'+tb+'</b>Điểm trung bình</div><div><b>'+deThi.filter(function(d){return d.hienThi&&d.phong===$('l-title').textContent.slice(-3).toLowerCase()}).length+'</b>Đề đang mở</div></div><button class="lbtn" id="hm-go">Bắt đầu luyện đề ▸</button>';
  $('hm-go').onclick=function(){show('luyen')}}
 if(k==='ls')$('ls-list').innerHTML=ks.length?ks.map(function(x){const d=deThi.find(function(e){return e.id===x.deId});
  return '<div class="hs"><div><span class="tg v">Đề thi</span><span class="tg v">TSA</span><span class="tg g">Hoàn thành</span><b>'+thoat(d?d.ten:'Đề đã xóa')+'</b><div class="hs-m">⏱ '+Math.ceil(x.giay/60)+' phút &nbsp; 📅 '+dm(x.ngay)+'</div></div><div class="hs-r"><div><b>'+x.dung+'/'+x.tong+'</b><small>Kết quả</small></div><div><b>'+x.diem+'</b><small>Điểm</small></div></div></div>'}).join(''):'<p class="empty-row">Chưa có lịch sử làm bài.</p>';
 if(k==='tk')$('tk-box').innerHTML='<div class="lrow"><span>Họ tên</span><b>'+thoat(nguoiDung.ten||'—')+'</b></div><div class="lrow"><span>Email</span><b>'+thoat(nguoiDung.email)+'</b></div>'}
lab.querySelectorAll('.l-nav a').forEach(function(a){a.onclick=function(){show(a.dataset.v)}});
$('l-fold').onclick=function(){lab.classList.toggle('fold')};
$('lh-x').onclick=function(){$('l-hist').classList.remove('on')};
$('ld-q').addEventListener('input',function(){const q=this.value.toLowerCase();document.querySelectorAll('#ld-list .lcard').forEach(function(c){c.style.display=c.textContent.toLowerCase().indexOf(q)>-1?'':'none'})});
const mo=window.moPhong;window.moPhong=function(x){mo(x);if(nguoiDung){lab.classList.remove('fold');show('luyen')}};
})();
