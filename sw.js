'use strict';
const PREFIX='showdown-poker-'+self.registration.scope;
const CACHE=PREFIX+'v2';
const FILES=['./','index.html','style.css','pokersolver.js','pokersolver-LICENSE.md','model.js','app.js','manifest.webmanifest','icon-192.png','icon-512.png','maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(event.request.mode==='navigate'){
      try{const response=await fetch(event.request);if(response.ok)return response;}catch{}
      return (await cache.match('./'))||Response.error();
    }
    return (await cache.match(event.request))||fetch(event.request);
  })());
});
