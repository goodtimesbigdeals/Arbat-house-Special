// Storage helpers
const DB = {
  key: 'arbat_demo_v1',
  load(){ try { return JSON.parse(localStorage.getItem(this.key)) || {upsells:[], hk:[], ivrMissed:[]}; } catch(e){ return {upsells:[], hk:[], ivrMissed:[]}; } },
  save(data){ localStorage.setItem(this.key, JSON.stringify(data)); }
};
let state = DB.load();

// --- AI Concierge (rule-based demo) ---
const conciergeLangSel = document.getElementById('concierge-lang');
const chatBox = document.getElementById('concierge-chat');
const chatInput = document.getElementById('concierge-input');
const chatSend = document.getElementById('concierge-send');

const messages = {
  ru: {
    greet: "Здравствуйте! Я AI‑консьерж Arbat House. Чем помочь?",
    unknown: "Я уточню у ресепшна и вернусь с ответом. Пока могу помочь с заездом, завтраком, трансфером, парковкой и подсказать маршрут.",
    intents: {
      checkin: "Заезд с 14:00, выезд до 12:00. Ранний заезд/поздний выезд — по запросу, в зависимости от загрузки.",
      breakfast: "Завтрак «шведский стол» — ежедневно с 07:00 до 10:30 на -1 этаже.",
      transfer: "Организуем трансфер из аэропорта. Фикс‑тариф, встреча с табличкой. Оставить заявку?",
      parking: "Парковка ограничена. Пожалуйста, уточните на ресепшне наличие на ваши даты.",
      route: "До Арбата — 8–10 минут пешком; до Кремля — около 20 минут или 2 остановки на метро.",
      contacts: "Телефон ресепшна: +7 (495) 000‑00‑00, email: info@arbathouse.ru"
    }
  },
  en: {
    greet: "Hello! I’m Arbat House AI concierge. How can I help?",
    unknown: "I’ll check this with the front desk. Meanwhile I can help with check‑in, breakfast, transfer, parking and directions.",
    intents: {
      checkin: "Check‑in from 14:00, check‑out until 12:00. Early/late possible on request.",
      breakfast: "Breakfast buffet daily 07:00–10:30 at floor −1.",
      transfer: "We can arrange airport transfer (fixed fare, pick‑up sign). Shall I place a request?",
      parking: "Parking is limited. Please check availability at the front desk.",
      route: "Arbat is 8–10 minutes walking; Kremlin ~20 minutes or 2 metro stops.",
      contacts: "Front desk: +7 (495) 000‑00‑00, email: info@arbathouse.ru"
    }
  },
  zh: {
    greet: "您好！这里是Arbat House AI礼宾服务。我能帮您什么？",
    unknown: "我会向前台确认。现在我可以回答：入住/退房、早餐、接送、停车和路线。",
    intents: {
      checkin: "入住14:00起，退房至12:00。可申请提前入住/延迟退房。",
      breakfast: "自助早餐每日07:00–10:30，负一层。",
      transfer: "可安排机场接送（固定价格，举牌接）。需要我登记吗？",
      parking: "停车位有限，请向前台确认是否有空位。",
      route: "步行至阿尔巴特街约8–10分钟；至克里姆林宫约20分钟或地铁两站。",
      contacts: "前台: +7 (495) 000‑00‑00, 邮件: info@arbathouse.ru"
    }
  },
  ar: {
    greet: "مرحباً! أنا مساعد Arbat House الذكي. كيف أستطيع المساعدة؟",
    unknown: "سأتأكد من الاستقبال. يمكنني الآن المساعدة بوقت الدخول/الخروج، الفطور، النقل، المواقف والاتجاهات.",
    intents: {
      checkin: "تسجيل الدخول من 14:00 والمغادرة حتى 12:00. مبكّر/متأخر عند الطلب.",
      breakfast: "بوفيه الإفطار يومياً 07:00–10:30 في الطابق −1.",
      transfer: "نرتّب نقل المطار بسعر ثابت واستقبال باللافتة. هل أسجل طلباً؟",
      parking: "المواقف محدودة. يرجى التأكد من المتوفر لدى الاستقبال.",
      route: "شارع أربات على بُعد 8–10 دقائق مشياً؛ الكرملين ~20 دقيقة أو محطتان بالمترو.",
      contacts: "الاستقبال: ‎+7 (495) 000‑00‑00، البريد: info@arbathouse.ru"
    }
  }
};

function chatPush(text, who='bot'){
  const el = document.createElement('div');
  el.className = `msg ${who}`;
  el.textContent = text;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function detectIntent(text){
  const t = text.toLowerCase();
  if(/check.?in|заезд|засел|入住/.test(t)) return 'checkin';
  if(/check.?out|выезд|退房/.test(t)) return 'checkin';
  if(/breakfast|завтрак|早餐|restaurant|ресторан/.test(t)) return 'breakfast';
  if(/transfer|трансфер|такси|airport|аэропорт/.test(t)) return 'transfer';
  if(/parking|парковк/.test(t)) return 'parking';
  if(/route|как добраться|арбат|кремл/.test(t)) return 'route';
  if(/contact|телефон|почта|email|почту/.test(t)) return 'contacts';
  return null;
}
function conciergeReply(input){
  const lang = conciergeLangSel.value;
  const dict = messages[lang];
  const intent = detectIntent(input);
  chatPush(input,'guest');
  if(intent && dict.intents[intent]) chatPush(dict.intents[intent],'bot');
  else chatPush(dict.unknown,'bot');
}
chatPush(messages[conciergeLangSel.value].greet,'bot');
chatSend.onclick = () => { if(chatInput.value.trim()) { conciergeReply(chatInput.value.trim()); chatInput.value=''; } };
chatInput.addEventListener('keydown', e=>{ if(e.key==='Enter'){ chatSend.click(); }});
conciergeLangSel.addEventListener('change', ()=>{
  chatBox.innerHTML=''; chatPush(messages[conciergeLangSel.value].greet,'bot');
});

// --- Upsells ---
const upsellForm = document.getElementById('upsell-form');
const upsellTable = document.getElementById('upsell-table');
const upsellCount = document.getElementById('upsell-count');
const upsellSum = document.getElementById('upsell-sum');

function renderUpsells(){
  upsellTable.innerHTML = '<tr><th>Гость/бронь</th><th>Услуга</th><th>Цена</th><th>Время</th></tr>' +
    state.upsells.map(x=>`<tr><td>${x.guest}</td><td>${x.item}</td><td>${x.price} ₽</td><td>${new Date(x.ts).toLocaleString()}</td></tr>`).join('');
  upsellCount.textContent = state.upsells.length;
  upsellSum.textContent = state.upsells.reduce((s,x)=>s+Number(x.price||0),0);
}
upsellForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(upsellForm);
  const item = {guest: fd.get('guest').trim(), item: fd.get('item'), price: Number(fd.get('price')), ts: Date.now()};
  state.upsells.push(item); DB.save(state); renderUpsells(); upsellForm.reset();
});
renderUpsells();

// --- Reviews (templates) ---
const reviewText = document.getElementById('review-text');
const reviewTone = document.getElementById('review-tone');
const reviewDraft = document.getElementById('review-draft');
document.getElementById('review-generate').onclick = ()=>{
  const t = (reviewText.value||'').trim();
  if(!t){ reviewDraft.value = 'Введите текст отзыва слева'; return; }
  const neg = /гряз|шум|холод|долго|плохо|ужас|разочар|проблем|bad|dirty|noisy|cold/i.test(t);
  const pos = /чист|вкусн|прекрас|хорош|отлич|friendly|great|amazing|clean/i.test(t);
  const tone = reviewTone.value;
  const opener = tone==='formal' ? "Благодарим вас за обратную связь." :
                  tone==='upbeat' ? "Спасибо вам за такой подробный отзыв!" :
                                     "Спасибо, что поделились впечатлениями.";
  const ack = neg ? "Сожалеем, что ожидания не полностью оправдались." :
              pos ? "Рады, что вам понравилось проживание у нас!" :
                    "Ценим вашу оценку и комментарии.";
  const fix = neg ? "Мы уже передали информацию ответственным службам и усилим контроль по указанным пунктам." :
                    "Передадим тёплые слова команде — это лучшая мотивация.";
  const close = "Будем рады видеть вас снова в Arbat House. Если удобно, свяжитесь с нами по info@arbathouse.ru для подробностей.";
  reviewDraft.value = `${opener} ${ack} ${fix} ${close}`;
};
document.getElementById('review-copy').onclick = ()=>{
  reviewDraft.select(); document.execCommand('copy');
};

// --- Housekeeping / QR links ---
const hkRoom = document.getElementById('hk-room');
const hkLink = document.getElementById('hk-link');
const hkQR   = document.getElementById('hk-qr');
const hkTable= document.getElementById('hk-table');
function renderHK(){
  hkTable.innerHTML = '<tr><th>Время</th><th>Комната</th><th>Описание</th><th>Статус</th><th></th></tr>' +
    state.hk.map((x,i)=>`<tr>
       <td>${new Date(x.ts).toLocaleString()}</td>
       <td>${x.room}</td>
       <td>${x.text}</td>
       <td>${x.status}</td>
       <td><button data-i="${i}" class="mini">Готово</button></td>
     </tr>`).join('');
  hkTable.querySelectorAll('button.mini').forEach(btn=>{
    btn.onclick = ()=>{ const i = Number(btn.dataset.i); state.hk[i].status = 'готово'; DB.save(state); renderHK(); };
  });
}
document.getElementById('hk-make').onclick = ()=>{
  const room = (hkRoom.value||'').trim();
  if(!room) { alert('Укажите номер комнаты'); return; }
  const link = `${location.origin}${location.pathname}?guestHK=1&room=${encodeURIComponent(room)}`;
  hkLink.value = link;
  hkQR.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
};
renderHK();

// Гостевая подача заявки по ссылке ?guestHK=1
(function guestHKCapture(){
  const url = new URL(location.href);
  if(url.searchParams.get('guestHK')==='1'){
    const room = url.searchParams.get('room') || 'N/A';
    const text = prompt(`Комната ${room}. Опишите проблему (например, лампочка, кондиционер, чайник):`);
    if(text && text.trim()){
      state.hk.unshift({ts:Date.now(), room, text:text.trim(), status:'новая'});
      DB.save(state);
      alert('Заявка отправлена. Спасибо!');
      // Уберём геттер из URL
      url.searchParams.delete('guestHK'); history.replaceState({},'',url.toString());
    }
  }
})();

// --- WiFi portal consent ---
document.getElementById('wifi-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const record = {
    fio: fd.get('fio'),
    phone: fd.get('phone'),
    email: fd.get('email'),
    consent_data: !!fd.get('consent_data'),
    consent_marketing: !!fd.get('consent_marketing'),
    ts: Date.now()
  };
  const data = DB.load();
  if(!data.wifi) data.wifi=[];
  data.wifi.push(record); DB.save(data); state = data;
  alert('Подключение разрешено — добро пожаловать в сеть Arbat House!');
  e.target.reset();
});

// --- IVR simulator ---
const ivrScenario = document.getElementById('ivr-scenario');
const ivrInput = document.getElementById('ivr-input');
const ivrOutput = document.getElementById('ivr-output');
const ivrMissed = document.getElementById('ivr-missed');
function renderMissed(){
  ivrMissed.innerHTML = '<tr><th>Время</th><th>Номер</th><th>Причина</th></tr>' +
    state.ivrMissed.map(x=>`<tr><td>${new Date(x.ts).toLocaleString()}</td><td>${x.phone}</td><td>${x.reason}</td></tr>`).join('');
}
document.getElementById('ivr-run').onclick = ()=>{
  const s = ivrScenario.value;
  const digit = (ivrInput.value||'').trim();
  let res='';
  if(s==='default'){
    if(digit==='1') res='→ Соединяем с отделом бронирования';
    else if(digit==='2') res='→ Соединяем с ресепшн';
    else if(digit==='3') res='→ Переводим на менеджера мероприятий';
    else res='Неверный ввод, добавлен коллбек';
  } else if(s==='night'){
    if(digit==='1') res='→ Соединяем с дежурным менеджером';
    else if(digit==='2') res='→ Голосовой автоответчик + письмо на email';
    else res='Неверный ввод, добавлен коллбек';
  } else if(s==='peak'){
    if(digit==='1'){ res='→ Ставим в очередь коллбека (перезвон)'; state.ivrMissed.unshift({ts:Date.now(), phone:'+7•••', reason:'Коллбек (пик)'}); DB.save(state); renderMissed(); }
    else if(digit==='2') res='→ Соединяем с ресепшн';
    else if(digit==='3') res='→ Автопоиск брони по телефону, затем смс‑ссылка';
    else res='Неверный ввод, добавлен коллбек';
  }
  if(res.includes('Неверный')){ state.ivrMissed.unshift({ts:Date.now(), phone:'+7•••', reason:'Неверный ввод'}); DB.save(state); renderMissed(); }
  ivrOutput.textContent = res;
};
renderMissed();

// --- MICE calculator ---
const miceForm = document.getElementById('mice-form');
const miceQuote = document.getElementById('mice-quote');
function formatRuble(n){ return new Intl.NumberFormat('ru-RU').format(n); }
miceForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(miceForm);
  const pax = Number(fd.get('pax'));
  const hours = Number(fd.get('hours'));
  const coffee = !!fd.get('coffee');
  const lunch  = !!fd.get('lunch');
  const tech   = !!fd.get('tech');
  const roomRatePerHour = 3500;
  const coffeePP = 350;
  const lunchPP = 900;
  const techFlat = 3000;
  const total = roomRatePerHour*hours + (coffee?coffeePP*pax:0) + (lunch?lunchPP*pax:0) + (tech?techFlat:0);
  miceQuote.innerHTML = `
    <div><strong>Гостей:</strong> ${pax}</div>
    <div><strong>Часы зала:</strong> ${hours} (по ${formatRuble(roomRatePerHour)} ₽/ч)</div>
    <div><strong>Кофе‑брейк:</strong> ${coffee?('да, '+formatRuble(coffeePP)+' ₽ × '+pax):'нет'}</div>
    <div><strong>Обед:</strong> ${lunch?('да, '+formatRuble(lunchPP)+' ₽ × '+pax):'нет'}</div>
    <div><strong>Техника:</strong> ${tech?('да, '+formatRuble(techFlat)+' ₽'):'нет'}</div>
    <hr>
    <div class="kpi">Итого: <strong>${formatRuble(total)} ₽</strong> (с НДС)</div>
  `;
});
document.getElementById('mice-print').onclick = ()=>{ window.print(); };

// --- Realtime Translator ---
const trStart = document.getElementById('tr-start');
const trStop  = document.getElementById('tr-stop');
const trSrcSel= document.getElementById('tr-src');
const trDstSel= document.getElementById('tr-dst');
const trSrcTxt= document.getElementById('tr-src-text');
const trDstTxt= document.getElementById('tr-dst-text');

let recog = null;
function startRecognizer(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ alert('В этом браузере нет Web Speech API для распознавания. Попробуйте Chrome.'); return; }
  recog = new SR();
  const map = {ru:'ru-RU', en:'en-US', zh:'zh-CN', ar:'ar-SA'};
  recog.lang = map[trSrcSel.value] || 'ru-RU';
  recog.interimResults = true;
  recog.continuous = true;
  recog.onresult = async (e)=>{
    let txt = '';
    for(let i=e.resultIndex;i<e.results.length;i++){
      txt += e.results[i][0].transcript;
    }
    trSrcTxt.value = txt;
    const translated = await translateText(txt, trSrcSel.value, trDstSel.value);
    trDstTxt.value = translated || '';
    speak(translated, trDstSel.value);
  };
  recog.onerror = (e)=> console.warn('SR error', e);
  recog.onend = ()=> { trStart.disabled=false; trStop.disabled=true; };
  recog.start();
  trStart.disabled=true; trStop.disabled=false;
}
function stopRecognizer(){ if(recog){ recog.stop(); recog=null; } trStart.disabled=false; trStop.disabled=true; }

async function translateText(text, src, dst){
  if(!text || !text.trim()) return '';
  try{
    const res = await fetch('https://libretranslate.com/translate', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ q:text, source: src, target: dst, format:'text' })
    });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    return data.translatedText || '';
  }catch(err){
    console.warn('Translate error', err);
    return '[ошибка перевода] ' + text;
  }
}
function speak(text, lang){
  if(!text) return;
  const utter = new SpeechSynthesisUtterance(text);
  const map = {ru:'ru-RU', en:'en-US', zh:'zh-CN', ar:'ar-SA'};
  utter.lang = map[lang] || 'ru-RU';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}
trStart.onclick = startRecognizer;
trStop.onclick = stopRecognizer;

// --- Admin export/wipe ---
const adminJSON = document.getElementById('admin-json');
document.getElementById('admin-export').onclick = ()=>{
  adminJSON.value = JSON.stringify(DB.load(), null, 2);
};
document.getElementById('admin-wipe').onclick = ()=>{
  if(confirm('Очистить все демо‑данные?')){
    localStorage.removeItem(DB.key);
    state = DB.load();
    renderUpsells(); renderHK(); renderMissed();
    adminJSON.value='';
    alert('Очищено.');
  }
};
