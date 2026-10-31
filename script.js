(function(){
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const fmt=n=>'$'+n.toFixed(2);

  /* announcement rotator */
  const msgs=$$('#announce p');let mi=0;
  setInterval(()=>{msgs[mi].classList.remove('is-on');mi=(mi+1)%msgs.length;msgs[mi].classList.add('is-on')},4200);

  /* header shadow + mobile sticky CTA */
  const header=$('#header'),sticky=$('#sticky');
  let footIn=false;
  const onScroll=()=>{const y=scrollY;header.classList.toggle('is-stuck',y>10);sticky.classList.toggle('on',y>innerHeight*.7&&!footIn)};
  if('IntersectionObserver' in window){new IntersectionObserver(es=>{footIn=es[0].isIntersecting;onScroll()}).observe(document.querySelector('.footer'))}
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* scroll progress */
  const bar=$('#progress i');
  const prog=()=>{const m=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(m>0?scrollY/m:0)+')'};
  addEventListener('scroll',prog,{passive:true});prog();

  /* press logo marquee: duplicate for seamless loop */
  const pl=$('#pressList');if(pl){[...pl.children].forEach(li=>{const c=li.cloneNode(true);c.setAttribute('aria-hidden','true');c.querySelector('img').alt='';pl.appendChild(c)})}



  /* mobile nav */
  const nav=$('#nav'),menuBtn=$('#menuBtn');
  menuBtn.addEventListener('click',()=>{const o=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',o)});
  document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!nav.contains(e.target)&&!menuBtn.contains(e.target))nav.classList.remove('open')});
  $('.has-mega>a').addEventListener('click',e=>{if(innerWidth<=900){e.preventDefault();e.currentTarget.parentElement.classList.toggle('open')}});

  /* tabs */
  const tabs=$$('[role=tab]');
  tabs.forEach(t=>t.addEventListener('click',()=>sel(t)));
  $('.tabs').addEventListener('keydown',e=>{
    const i=tabs.indexOf(document.activeElement);if(i<0)return;
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=tabs[(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];n.focus();sel(n)}
  });
  function sel(t){
    tabs.forEach(x=>{const on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;
      const p=document.getElementById(x.getAttribute('aria-controls'));p.hidden=!on;p.classList.toggle('is-on',on)});
  }

  /* cart */
  const cart=[];const drawer=$('#drawer'),scrim=$('#scrim');
  const FREE=70,GIFT=150;
  function openCart(){scrim.hidden=false;requestAnimationFrame(()=>{scrim.classList.add('on');drawer.classList.add('on');drawer.setAttribute('aria-hidden','false')})}
  function closeCart(){scrim.classList.remove('on');drawer.classList.remove('on');drawer.setAttribute('aria-hidden','true');setTimeout(()=>scrim.hidden=true,300)}
  $('#cartBtn').addEventListener('click',openCart);$('#closeCart').addEventListener('click',closeCart);scrim.addEventListener('click',closeCart);
  addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();nav.classList.remove('open');if(!modal.hidden)hideModal()}});
  function render(){
    const total=cart.reduce((a,i)=>a+i.price*i.qty,0),count=cart.reduce((a,i)=>a+i.qty,0);
    const cc=$('#cartCount');cc.textContent=count;cc.classList.add('bump');setTimeout(()=>cc.classList.remove('bump'),250);
    $('#subtotal').textContent=fmt(total);
    $('#meter').style.width=Math.min(100,total/GIFT*100)+'%';
    const gm=$('#gwpMsg');if(gm){gm.textContent=total>=GIFT?'Gift unlocked! It will be added at checkout':`Add ${fmt(GIFT-total)} to unlock your gift`;$('#gwpAmt').textContent='$'+Math.min(total,GIFT).toFixed(0)+' / $'+GIFT;$('#gwpBar').style.width=Math.min(100,total/GIFT*100)+'%'}
    $('#shipMsg').textContent=total>=FREE?'🎉 You’ve unlocked free shipping':`You’re ${fmt(FREE-total)} away from free shipping`;
    $('#giftMsg').textContent=total>=GIFT?'🎁 Free 500mL Dermastrength Conditioner added':`Spend ${fmt(GIFT-total)} more for a free 500mL Conditioner`;
    $('#cartList').innerHTML=cart.length?cart.map((i,k)=>`<li><img src="${i.img}" alt=""><div><b>${i.name}</b><span>${fmt(i.price)} × ${i.qty}</span><br><button data-rm="${k}">Remove</button></div><strong>${fmt(i.price*i.qty)}</strong></li>`).join(''):'<li class="empty">Your cart is empty.</li>';
  }
  $('#cartList').addEventListener('click',e=>{const k=e.target.dataset.rm;if(k!==undefined){cart.splice(+k,1);render()}});
  $$('.card .btn--add').forEach(b=>b.addEventListener('click',()=>{
    const c=b.closest('.card'),id=c.dataset.id,f=cart.find(i=>i.id===id);
    f?f.qty++:cart.push({id,name:c.dataset.name,price:+c.dataset.price,img:c.dataset.img,qty:1});
    render();b.textContent='Added ✓';b.classList.add('is-done');setTimeout(()=>{label(b);b.classList.remove('is-done')},1400);openCart();
  }));
  const label=b=>b.textContent='ADD · $'+b.closest('.card').dataset.price;
  $$('.card .btn--add').forEach(label);
  render();$('#cartCount').textContent='0';

  /* carousels */
  $$('.arrows').forEach(a=>{
    const rail=document.getElementById(a.dataset.rail),bar=rail.parentElement.querySelector('.rail-bar i');
    a.addEventListener('click',e=>{const d=e.target.dataset.dir;if(d)rail.scrollBy({left:d*rail.clientWidth*.8,behavior:'smooth'})});
    const upd=()=>{const max=rail.scrollWidth-rail.clientWidth,w=Math.min(100,rail.clientWidth/rail.scrollWidth*100);bar.style.width=w+'%';bar.style.left=(max>0?rail.scrollLeft/max*(100-w):0)+'%'};
    rail.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
  });

  /* drag-to-scroll for the bestseller slider (mouse) */
  const dr=$('#grid');let dx=0,ds=0,dn=false,dm=false;
  dr.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;dn=true;dm=false;dx=e.clientX;ds=dr.scrollLeft});
  addEventListener('pointermove',e=>{if(!dn)return;const d=e.clientX-dx;if(Math.abs(d)>5){dm=true;dr.classList.add('is-drag')}if(dm)dr.scrollLeft=ds-d});
  addEventListener('pointerup',()=>{dn=false;dr.classList.remove('is-drag')});

  /* welcome popup: pick a concern -> routine tab */
  const modal=$('#modal');
  const showModal=()=>{modal.hidden=false;requestAnimationFrame(()=>modal.classList.add('on'))};
  const hideModal=()=>{modal.classList.remove('on');setTimeout(()=>modal.hidden=true,350);try{sessionStorage.setItem('ampModal','1')}catch(e){}};
  let seen=false;try{seen=sessionStorage.getItem('ampModal')}catch(e){}
  if(!seen)setTimeout(()=>{if(!drawer.classList.contains('on'))showModal()},9000);
  $('#modalX').addEventListener('click',hideModal);$('#modalNo').addEventListener('click',hideModal);
  modal.addEventListener('click',e=>{if(e.target===modal)hideModal()});
  $$('.modal__chips button').forEach(b=>b.addEventListener('click',()=>{hideModal();sel(document.getElementById(b.dataset.tab));setTimeout(()=>$('#routines').scrollIntoView({behavior:'smooth'}),380)}));

  /* newsletter */
  $('#newsForm').addEventListener('submit',e=>{e.preventDefault();const v=$('#email').value.trim(),m=$('#newsMsg');
    if(/^\S+@\S+\.\S+$/.test(v)){m.textContent='Thank you, you’re on the list.';m.style.color='#1b6b3a';e.target.reset()}
    else{m.textContent='Please enter a valid email address.';m.style.color='#b3261e'}});

  /* scroll reveal */
  const targets=$$('.sec__head,.concerns li,.card,.why__grid>*,.panel.is-on,.review,.learn li,.story__grid>*,.faq__grid>*,.gwp__in>*,.quiz__in');
  targets.forEach(t=>t.classList.add('rv'));
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.08,rootMargin:'0px 0px -40px'});
    targets.forEach(t=>io.observe(t));
  }else targets.forEach(t=>t.classList.add('in'));
})();
