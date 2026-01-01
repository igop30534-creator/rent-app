/* ===== 簡單穩定離線快取（Cache First） ===== */
var CACHE_NAME = "wutai-kaohsiung-v1";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS);
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE_NAME) return caches.delete(k);
      }));
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(event){
  // 只處理同網域/同範圍請求
  event.respondWith(
    caches.match(event.request).then(function(res){
      if(res) return res;
      return fetch(event.request).then(function(netRes){
        // 動態快取（可讓之後離線更穩）
        var copy = netRes.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(event.request, copy);
        });
        return netRes;
      }).catch(function(){
        // 斷網時至少回首頁
        return caches.match("./index.html");
      });
    })
  );
});
