'use strict';
(() => {
  const $=id=>document.getElementById(id);
  const positions=[[25,14],[50,11],[75,14],[87,35],[87,65],[65,88],[35,88],[13,65],[13,35]];
  const suits={s:'♠',h:'♥',d:'♦',c:'♣'},names={s:'пики',h:'червы',d:'бубны',c:'трефы'};
  let answer,round=0,tie=false;
  function card(value){const el=document.createElement('span');el.className='card'+('hd'.includes(value[1])?' red':'');const r=document.createElement('span'),s=document.createElement('span');r.textContent=value[0]==='T'?'10':value[0];s.textContent=suits[value[1]];s.className='suit';el.append(r,s);el.setAttribute('aria-label',`${r.textContent} ${names[value[1]]}`);return el;}
  function pick(seat,equal){answer.pick(seat,equal);if(!answer.groups.length)tie=false;render();}
  function render(){
    $('round').textContent=`Раздача ${round} · ${Object.keys(answer.deal.hands).length} игроков`;
    $('board').replaceChildren(...answer.deal.board.map(card));
    $('seats').replaceChildren();
    positions.forEach(([x,y],i)=>{
      const seat=i+1,cards=answer.deal.hands[seat],button=document.createElement('button');
      button.type='button';button.className='seat';button.style.setProperty('--x',x+'%');button.style.setProperty('--y',y+'%');
      if(!cards){button.classList.add('empty');button.textContent=seat;button.disabled=true;button.setAttribute('aria-label',`Место ${seat} свободно`);}
      else{
        const group=answer.groups.findIndex(g=>g.includes(seat));
        const label=document.createElement('span');label.className='label';label.textContent=`Место ${seat}`;
        const badge=document.createElement('span');badge.className='badge';badge.textContent=group<0?'':`#${group+1}`;label.append(badge);
        const hand=document.createElement('span');hand.className='cards';hand.append(...cards.map(card));button.append(label,hand);
        button.setAttribute('aria-pressed',String(group>=0));if(group>=0)button.classList.add('selected');
        button.addEventListener('click',()=>pick(seat,tie));button.addEventListener('contextmenu',e=>{e.preventDefault();pick(seat,true);});
      }
      $('seats').append(button);
    });
    $('progress').textContent=`Выбрано ${answer.selected.length} из ${Object.keys(answer.deal.hands).length}`;
    $('sequence').textContent=Poker.format(answer.groups)||'Выберите самую сильную руку';
    $('result').replaceChildren();$('result').className='';
    if(answer.complete){const correct=answer.isCorrect;$('result').className=correct?'success':'error';const title=document.createElement('strong');title.textContent=correct?'Верно':'Неверно';$('result').append(title,document.createTextNode('Правильно: '+Poker.format(correct?answer.groups:answer.correct)));}
    $('tie').disabled=!answer.groups.length||answer.complete;$('tie').setAttribute('aria-pressed',String(tie));
    $('hint').textContent=answer.message||(tie?'Делёжка включена. Выбирайте равные руки. Нажмите «=», чтобы выключить.':'Выбирайте по старшинству. «=» включает режим делёжки.');
  }
  function next(){answer=new Poker.Answer(Poker.deal());round++;tie=false;render();}
  function reset(){answer.reset();tie=false;render();}
  $('next').addEventListener('click',next);$('reset').addEventListener('click',reset);
  $('tie').addEventListener('click',()=>{tie=!tie;render();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')reset();});
  next();
  if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(async()=>{await navigator.serviceWorker.ready;$('offline').textContent='Приложение готово к работе без интернета на этом устройстве.';}).catch(()=>{$('offline').textContent='Офлайн-режим недоступен в этом браузере. При подключении к интернету тренировка работает.';});}
})();
