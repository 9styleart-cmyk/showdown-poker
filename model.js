(function(root){
  'use strict';
  const Hand = typeof module !== 'undefined' && module.exports ? require('./pokersolver.js').Hand : root.Hand;
  function randomInt(n){
    const a=new Uint32Array(1), limit=Math.floor(4294967296/n)*n;
    do { root.crypto.getRandomValues(a); } while(a[0]>=limit);
    return a[0]%n;
  }
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function deal(count=2+randomInt(8)){
    if(!Number.isInteger(count)||count<2||count>9)throw Error('2–9 players required');
    const deck=shuffle([... '23456789TJQKA'].flatMap(r=>[...'shdc'].map(s=>r+s)));
    const seats=shuffle([1,2,3,4,5,6,7,8,9]).slice(0,count).sort((a,b)=>a-b);
    return {board:deck.slice(0,5),hands:Object.fromEntries(seats.map((s,i)=>[s,deck.slice(5+2*i,7+2*i)]))};
  }
  function rank(deal){
    let remaining=Object.entries(deal.hands).map(([seat,cards])=>({seat:Number(seat),hand:Hand.solve([...deal.board,...cards])}));
    const groups=[];
    while(remaining.length){const winners=Hand.winners(remaining.map(p=>p.hand));const won=remaining.filter(p=>winners.includes(p.hand));groups.push(won.map(p=>p.seat).sort((a,b)=>a-b));remaining=remaining.filter(p=>!winners.includes(p.hand));}
    return groups;
  }
  class Answer{
    constructor(deal){this.deal=deal;this.correct=rank(deal);this.reset();}
    reset(){this.groups=[];this.message='';}
    get selected(){return this.groups.flat();}
    get complete(){return this.selected.length===Object.keys(this.deal.hands).length;}
    get isCorrect(){return this.complete&&JSON.stringify(this.groups.map(g=>[...g].sort((a,b)=>a-b)))===JSON.stringify(this.correct);}
    pick(seat,tie=false){
      if(!this.deal.hands[seat])return false;
      if(this.selected.includes(seat)){
        const last=this.groups[this.groups.length-1];
        if(last[last.length-1]!==seat){this.message='Чтобы отменить выбор, нажмите на последнюю выбранную руку.';return false;}
        last.pop();if(!last.length)this.groups.pop();
        this.message='';return true;
      }
      if(tie&&!this.groups.length){this.message='Сначала выберите самую сильную руку';return false;}
      this.message='';if(tie)this.groups[this.groups.length-1].push(seat);else this.groups.push([seat]);return true;
    }
  }
  const api={deal,rank,Answer,format:groups=>groups.map(g=>g.join(' = ')).join(' > ')};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Poker=api;
})(globalThis);
