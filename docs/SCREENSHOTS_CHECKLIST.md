# قائمة الصور اللي نحتاجها للتقرير 📸

صوّروا من **الرابط المنشور** (Vercel)، على الجوال أو على اللابتوب بإطار الجوال. اسم كل ملف مكتوب بين الأقواس.

## الشاشات الأساسية
- [ ] Welcome (`01-welcome.png`)
- [ ] Sign Up (`02-signup.png`)
- [ ] Log In (`03-login.png`)
- [ ] Quiz Intro + سؤال من الكويز (`04-quiz.png`)
- [ ] Style Result (`05-result.png`)
- [ ] Home / Outfit Boards (`06-home.png`)
- [ ] Product Detail (`07-product.png`)
- [ ] Wardrobe + Add Item (`08-wardrobe.png`, `09-add-item.png`)
- [ ] Create Outfit: حالة "Styling your outfit…" وهي تحمل + النتيجة مع "Why this outfit?" (`10-ai-loading.png`, `11-ai-result.png`)
- [ ] Event Planner (اللي عندك واللي ناقص) (`12-event.png`)
- [ ] Avatar (`13-avatar.png`)
- [ ] Favorites (`14-favorites.png`)
- [ ] Share + Feed + Post Detail (`15-share.png`, `16-feed.png`, `17-post.png`)
- [ ] Profile → Accessibility (`18-settings.png`)

## إثبات الميزات التكيّفية (أهم صور للدرجة)
- [ ] **تكيّف الأخطاء:** في Sign Up اكتبوا إيميل غلط واضغطوا Sign Up **مرتين**، بيطلع الصندوق الوردي 💡 مع مثال (`20-adaptive-hint.png`)
- [ ] **التباين التلقائي:** بعد **3 محاولات** فاشلة يطلع البانر "We increased contrast…" وفيه Undo (`21-auto-contrast.png`)
- [ ] **حساس التردد في الكويز:** انتظروا **15 ثانية** في سؤال بدون ما تختارون، بيطلع وصف تحت كل خيار (`22-dwell-help.png`)
- [ ] **تبسيط الواجهة:** افتحوا Create Outfit → Create Manually، ولا تلمسون شي **20 ثانية**، بتختفي الفلاتر ويطلع اقتراح AI Suggest (`23-simplified.png`)
- [ ] **سجل التفاعل في قاعدة البيانات:** Profile → My interaction log (`24-log.png`)
- [ ] **Firestore Console:** صورة من Firebase → Firestore → `users/{uid}/interactionLogs` تثبت إن البيانات انحفظت (بونص) (`25-firestore.png`)

## إمكانية الوصول
- [ ] تقرير **Lighthouse** (Chrome/Edge → F12 → Lighthouse → Mobile → Accessibility) لصفحات: Log In، Home، Create Outfit. اكتبوا الدرجات هنا:
  - Log In: ____
  - Home: ____
  - Create Outfit: ____
- [ ] التنقّل بالكيبورد: صورة لإطار التركيز البنفسجي على زر (`26-focus.png`)
- [ ] وضع High contrast شغّال (`27-high-contrast.png`)
