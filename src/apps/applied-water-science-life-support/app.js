const cards=Array.from(document.querySelectorAll(".card"));
function toggleCard(card){const isOpen=card.classList.toggle("open");const header=card.querySelector(".card-header");if(header)header.setAttribute("aria-expanded",String(isOpen));}
document.querySelectorAll(".card-header").forEach(header=>header.addEventListener("click",()=>toggleCard(header.closest(".card"))));
function openCardFromHash(){const id=window.location.hash.slice(1);if(!id)return;const card=document.getElementById(id);if(!card||!card.classList.contains("card"))return;card.classList.add("open");card.querySelector(".card-header")?.setAttribute("aria-expanded","true");setTimeout(()=>card.scrollIntoView({behavior:"smooth",block:"start"}),50)}
if(false)window.addEventListener("load",()=>Promise.resolve({update:async()=>{},installing:null,waiting:null,active:null}).catch(console.warn));
window.addEventListener("hashchange",openCardFromHash);openCardFromHash();
