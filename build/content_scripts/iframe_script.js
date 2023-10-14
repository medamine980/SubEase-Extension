(()=>{"use strict";const e="element",t="track",n="fps";let o,l={},s={},i=[];document.querySelector("script[src='https://www.gstatic.com/recaptcha/releases/iZWPJyR27lB0cR4hL_xOX0GC/recaptcha__fr.js']")?.remove();let c={};const r=btoa(1e3*Math.random())+btoa(Date.now()),d=500;function a(){const{href:e}=location,t=e.match(/https?:\/\/(?:www\.)?([A-Za-z0-9]+)\..+/)?.[1];return t.charAt(0).toLocaleUpperCase()+t.slice(1)}function u(e){const t=a();return document.querySelector("title")?.text??t}function y(e,t,n){const o=new Date(`1970-01-01T${e}Z`);if(o.setSeconds((o.getSeconds()+t)/n),o.getDay()<4)return"00:00:00.000";if(o.getDay()>4)return"99:59:59.999";return`${o.getHours().toString().replace(/^(\d)$/,"0$1")}:${o.getMinutes().toString().replace(/^(\d)$/,"0$1")}:${o.getSeconds().toString().replace(/^(\d)$/,"0$1")}.${o.getMilliseconds().toString().padEnd("3","0")}`}function p(e,t,n=1){const o=e.split("\n\n"),l=/([0-9]{2}:[0-9]{2}:[0-9]{2}(?:.\d+)?)/g,s=[];return o.forEach((e=>{const o=e.match(l);if(!o)return s.push(e);{let l=[],i=!0;for(let e=0;e<o.length;e++){const s=y(o[e],t,n);if("00:00:00.000"===s&&0===e&&(i=!1),"00:00:00.000"===s&&1===e)return;if("99:59:59.999"===s&&1===e&&!i)return;l.push(s)}s.push(e.replace(/([0-9]{2}:[0-9]{2}:[0-9]{2}(?:.\d+)?) --> ([0-9]{2}:[0-9]{2}:[0-9]{2}(?:.\d+)?)/,l.join(" --\x3e ")))}})),s.join("\n\n")}function m(t){const{videoIndex:n,id:o}=t,s=l[n]?.[e];if(o===r&&s){let e=document.querySelector(`[id="frameId${o+n}"]`),{width:t,height:l,top:c,left:r}=s.getBoundingClientRect();if(e)e.style.height=`${l}px`,e.style.width=`${t}px`,e.style.left=`${r+scrollX}px`,e.style.top=`${c+scrollY}px`,"none"===e.style.display?(e.style.display="block",i[n]&&e.contentWindow.postMessage({type:"sync",syncValue:i[n]},chrome.runtime.getURL("/*")),e.contentWindow.postMessage({type:"scrollIntoInput"},chrome.runtime.getURL("/*"))):e.style.display="none";else{const y=encodeURIComponent(o),p=encodeURIComponent(n),m=u(),f=encodeURIComponent(m!==a()?m.substring(0,25):"");let g;e=document.createElement("iframe"),e.style.zIndex=2147483647,e.style.position="absolute",e.id=`frameId${o+n}`,e.style.height=`${l}px`,e.style.width=`${t}px`,e.style.left=`${r+scrollX}px`,e.style.top=`${c+scrollY}px`,e.style.boxSizing="border-box",e.src=chrome.runtime.getURL(`views/search/index.html?callerId=${y}&videoId=${p}&searchTitle=${f}${i[n]?` & syncValue=${i[n]}`:""}`),document.body.prepend(e),window.addEventListener("resize",(t=>{clearTimeout(g),g=setTimeout((()=>{const{width:t,height:n,top:o,left:l}=s.getBoundingClientRect();e.style.height=`${n}px`,e.style.width=`${t}px`,e.style.left=`${l+scrollX}px`,e.style.top=`${o+scrollY}px`}),d)})),e.contentWindow.postMessage({type:"scrollIntoInput"})}}}function f(t,n,o){const{id:s,videoIndex:i}=t,c=document.querySelector(`[id="frameId${s+i}"]`),r=l[i][e],a=document.createElement("p"),u=document.createElement("span");u.textContent=n,u.style.marginLeft="auto";const y=document.createElement("span");let p;function m(){clearTimeout(p),p=setTimeout((()=>{const{width:e,top:t,left:n}=r.getBoundingClientRect();a.style.width=`${e}px`,a.style.left=`${n+scrollX}px`,a.style.top=`${t+scrollY}px`}),d)}function f(){a.remove(),window.removeEventListener("resize",m)}y.innerHTML="&times;",y.style.fontWeight="bold",y.style.marginLeft="auto",y.style.fontSize="1.3em",y.style.cursor="pointer",y.onclick=f,a.style.cssText=c.style.cssText,a.style.display="block",a.style.fontSize="16px",a.style.padding="10px",a.style.height="auto",a.style.display="flex",a.style.justifyContent="center",a.style.alignItems="center",a.style.textAlign="center",a.style.color="white",a.style.backgroundColor=o?"#d70000":"#067500",a.append(u,y),window.addEventListener("resize",m),setTimeout((()=>{f()}),5e3),c.insertAdjacentElement("afterend",a)}function g(n,o){const{id:s,videoIndex:i}=n,c=l[i]?.[e];if(s!==r||!c)return;const a=document.querySelector(`[id="frameId${s+i}"]`);let u=document.querySelector(`[id="floatingBtnId${s+i}"]`);if(!u){u=document.createElement("button");const{right:y,top:p}=c.getBoundingClientRect();u.id=`floatingBtnId${s+i}`,u.style.cssText=a.style.cssText,u.style.left=y+scrollX-10+"px",u.style.top=`${p+scrollY+10}px`,u.style.width="auto",u.style.height="auto",document.fullscreenElement&&(u.style.display="none");const m=document.createElement("span"),f=document.createElement("img");let g;function h(){let e=document.querySelector(`[id='settingsIframeId${s+i}']`);if(!e){const{left:n,width:o,top:r}=u.getBoundingClientRect();e=document.createElement("iframe"),e.id=`settingsIframeId${s+i}`;const y=encodeURIComponent(s),p=encodeURIComponent(i);let m;e.src=chrome.runtime.getURL(`views/settings/index.html?callerId=${y}&videoIndex=${p}&isTrackAdded=${Boolean(l[i][t])}&downloadLink=${c.src??""}`),e.style.zIndex=2147483647,e.style.position="absolute",e.style.width="400px",e.style.left=n-400+scrollX-5+"px",e.style.top=`${r+scrollY}px`,e.style.borderRadius="1em",e.style.height="250px",window.addEventListener("resize",(t=>{clearTimeout(m),setTimeout((()=>{const{left:t,width:n,top:o}=u.getBoundingClientRect();e.style.width="400px",e.style.left=t-400+scrollX-5+"px",e.style.top=`${o+scrollY}px`}),d)})),a.insertAdjacentElement("afterend",e)}if("block"===e.style.display)e.style.display="none";else{const{left:t,top:n}=u.getBoundingClientRect();e.style.left=t-400+scrollX-5+"px",e.style.top=`${n+scrollY}px`,e.style.display="block"}}f.src=chrome.runtime.getURL("icons/icon128.png"),f.width=28,f.style.verticalAlign="middle",u.append(f),u.append(m),window.addEventListener("resize",(e=>{clearTimeout(g),g=setTimeout((()=>{const{right:e,top:t}=c.getBoundingClientRect();u.style.left=e+scrollX-10+"px",u.style.top=`${t+scrollY+10}px`}),d)})),window.addEventListener("fullscreenchange",(()=>{document.fullscreenElement?u.style.display="none":u.style.display="block"})),a.insertAdjacentElement("beforebegin",u),window.addEventListener("click",(e=>{if(!u.contains(e.target)){let e=document.querySelector(`[id='settingsIframeId${s+i}']`);e&&(e.style.display="none")}})),u.onclick=h}o&&(a.style.display="none")}chrome.runtime.onConnect.addListener((function(y){y.onMessage.addListener((async function(h){if("subtitles"===y.name){const{type:t}=h;if("initial"===t){let t;const n=document.querySelector("link[rel*='icon']")?.href;if(o||!1===o)o&&(t=o);else try{t=URL.createObjectURL(await(await fetch(n??"/favicon.ico")).blob()),o=t}catch{o=!1}Array.from(document.querySelectorAll("video")).forEach(((t,n)=>{l[n]||(l[n]={[e]:t})}));let s=[];for(let t in l)s[t]=u(l[t][e]);y.postMessage({id:r,type:"initial",platform:a(),videosTitle:s,activatedVideos:c,videosLength:Object.keys(l).length,icon:t})}else if("videoHover"===t){const{videoIndex:t,id:n}=h;if(n!==r||!l[t])return;const{width:o,height:s,top:i,left:c}=l[t][e].getBoundingClientRect();let d=document.querySelector(`[id="${n+t}"]`);d||(d=document.createElement("div"),d.id=n+t,document.body.appendChild(d),d.style.zIndex=2147483647,d.style.position="absolute",d.style.pointerEvents="none"),d.style.height=`${s}px`,d.style.width=`${o}px`,d.style.left=`${c+scrollX}px`,d.style.top=`${i+scrollY}px`,d.style.backgroundColor="#0098ff55",d.scrollIntoView({behavior:"smooth",block:"center"})}else if("removeVideoHover"===t){const{videoIndex:e,id:t}=h;let n=document.querySelector(`[id="${t+e}"]`);n&&(n.style.backgroundColor="transparent")}else if("videoChosen"===t){const{videoIndex:e}=h;c[e]=!0,m(h),g(h,!1),await async function(e){let t=document.querySelector(`[id="styleId${e}"]`);if(!t){t=document.createElement("style"),t.id=e;const n=await chrome.storage.local.get(["textColor","bgColor"]);t.textContent=`::cue{\n            background-color: var(--track-bg-color, ${n.bgColor??"black"});\n            color: var(--track-text-color, ${n.textColor??"white"});\n        }`,document.head.appendChild(t)}return t}()}}else if("searchIframe"===y.name){if("addTrack"===h.type){let{id:o,videoIndex:i,webvtt:c,syncValue:a=0,lang:u,fps:y}=h;if(o!==r||!l[i])return;const m=l[i][e];l[i][t]=c,g(h,!0);const x=(await chrome.storage.local.get(["autoSync"])).autoSync;if(!l[i][n]&&x){const e=function(e,t){let n=document.querySelector(`[id="autoSyncOverlay${e}"`);if(!n){let o;function l(){clearTimeout(o),o=setTimeout((()=>{const{top:e,left:o,width:l,height:s}=t.getBoundingClientRect();n.style.top=`${e+scrollY}px`,n.style.left=`${o+scrollX}px`,n.style.width=`${l}px`,n.style.height=`${s}px`}),d)}n=document.createElement("div"),n.id="autoSyncOverlay"+e;const{top:s,left:i,width:c,height:r}=t.getBoundingClientRect();n.style.position="absolute",n.style.top=`${s+scrollY}px`,n.style.left=`${i+scrollX}px`,n.style.width=`${c}px`,n.style.height=`${r}px`,n.style.display="grid",n.style.placeItems="center",n.style.fontSize="36px",n.style.color="white";const a=document.createElement("p");a.textContent="Auto Syncing";const u=document.createElement("progress");u.style.width="4em",u.max="100",n.append(a,u),n.style.backgroundColor="#5559",n.style.zIndex=2147483647,window.addEventListener("resize",l),document.body.prepend(n)}return n.style.display="grid",n}(o+i,m);l[i][n]=await function(e,t,n){let o,l,i,c=!1,r=0,d=[];return e.muted=!0,new Promise((a=>{function u(){d.pop(),c=!0}e.addEventListener("seeked",u),s[t]=e.requestVideoFrameCallback((function y(p,m){if(r>=5)return i=d.reduce(((e,t)=>e+t),0)/d.length,e.removeEventListener("seeked",u),e.muted=!1,e.pause(),a(i);const f=Math.abs(m.mediaTime-o),g=f/(m.presentedFrames-l);g&&g<1&&!c&&1===e.playbackRate&&document.hasFocus()&&(r+=f,n.value+=20*f,d.push(1/g)),c=!1,o=m.mediaTime,l=m.presentedFrames,s[t]=e.requestVideoFrameCallback(y)})),n.value=0,e.play()}))}(m,i,e.querySelector("progress")),e.style.display="none"}const $=(l[i][n]??y)/y;c=p(l[i][t],a,$);const w=URL.createObjectURL(new Blob([c],{type:"text/vtt"}));let b=document.querySelector(`[id="trackId${o+i}"]`);b||(b=document.createElement("track"),b.id=`trackId${o+i}`,b.kind="captions",b.label="SubEase",b.srclang=u,b.default=!0,b.addEventListener("load",(function(){b.track.mode="showing"})),m.prepend(b)),b.src&&URL.revokeObjectURL(b.src),b.src=w,b.track.mode="showing";const v=document.querySelector(`[id="settingsIframeId${o+i}"]`);v&&v.contentWindow.postMessage({type:"trackAdded"},"*"),f(h,"Subtitles added successfully")}"closeSearchSubtitles"===h.type&&g(h,!0)}if("settingsIframe"===y.name)if("selectSubtitles"===h.type){const{id:e,videoIndex:t}=h;if(e!==r||!l[t])return;document.querySelector(`[id='settingsIframeId${e+t}']`).style.display="none",m(h)}else if("syncSubtitles"===h.type){const{id:e,videoIndex:n,syncValue:o}=h;if(e!==r||!l[n])return;i[n]=o;const s=document.querySelector(`[id="trackId${e+n}"]`);if(!s||!l[n][t])return void f(h,"Subtitles are not loaded yet",!0);const c=p(l[n][t],o),d=URL.createObjectURL(new Blob([c],{type:"text/vtt"}));URL.revokeObjectURL(s.src),s.src=d,f(h,"Synchronized successfully")}else if("enableSubtitles"===h.type){const{id:e,videoIndex:t,enable:n}=h;if(e!==r||!l[t])return;const o=document.querySelector(`[id="trackId${e+t}"]`);o&&(n?(o.track.mode="showing",f(h,"Subtitles are enabled")):(o.track.mode="hidden",f(h,"Subtitles are disabled")))}else if("changeBgColor"===h.type){const{id:t,videoIndex:n,color:o}=h;if(t!==r||!l[n])return;l[n][e].style.setProperty("--track-bg-color",o)}else if("changeTextColor"===h.type){const{id:t,videoIndex:n,color:o}=h;if(t!==r||!l[n])return;l[n][e].style.setProperty("--track-text-color",o)}else if("download"===h.type){const{id:t,videoIndex:n}=h;if(t!==r||!l[n])return;const o=l[n][e];location.href=o.src}})),y.onDisconnect.addListener((()=>{if("subtitles"===y.name)for(let e=0;e<Object.keys(l).length;e++){let t=document.querySelector(`[id="${r+e}"]`);t&&(t.style.backgroundColor="transparent")}}))}))})();