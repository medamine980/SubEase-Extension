(()=>{"use strict";const e="authToken",s="lastAuthTokenVerification",t="subease v0.1.0",a="2qsRn5gCOQ6v0Ddd97aZbad9xUuO0SVd",o=document.querySelector("[data-login-form]"),n=document.querySelector("[data-username-input]"),c=document.querySelector("[data-password-input]"),r=document.querySelector("[data-progress]"),i=document.querySelector("[data-response-message]"),l="show",u="login-form__response-message--error",d="login-form__response-message--success",p=new BroadcastChannel("login");o.addEventListener("submit",(async o=>{o.preventDefault();const m=n.value,g=c.value;i.textContent="",r.classList.add(l);const y=new Request("https://api.opensubtitles.com/api/v1/login",{method:"POST",body:JSON.stringify({username:m,password:g}),headers:{"Content-Type":"application/json",Accept:"application/json","Api-key":a,"X-User-Agent":t}}),v=await fetch(y);if(200===v.status){const t=await v.json();i.classList.remove(u),i.classList.add(d),i.textContent="Logged in successfully !",p.postMessage({type:"logged-in-successfully",token:t.token}),await chrome.storage.local.set({[e]:t.token,[s]:null})}else 401===v.status?(i.classList.remove(d),i.classList.add(u),i.textContent="Unauthorized"):(i.classList.remove(d),i.classList.add(u),i.textContent="ERROR");r.classList.remove(l)}))})();