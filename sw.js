/* Carnet Athlète : ouverture hors connexion.
   Réseau d'abord : si tu es en ligne, tu as toujours la dernière version ;
   sans réseau, le carnet s'ouvre depuis la copie gardée sur l'iPhone. */
var CACHE = "carnet-athlete-v1";
var FILES = ["./", "./index.html", "./apple-touch-icon.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req=e.request;
  if(req.method!=="GET") return;
  var url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  e.respondWith(
    fetch(req).then(function(res){
      if(res && res.ok){ var copy=res.clone(); caches.open(CACHE).then(function(c){ c.put(req,copy); }); }
      return res;
    }).catch(function(){
      return caches.match(req).then(function(m){ return m || caches.match("./index.html"); });
    })
  );
});
