# دليل GitHub لفريق Style Aura 👩‍💻

هذا الدليل لجنى ورنيم (ولغلا كمرجع). يشرح كيف ناخذ الكود، ونحفظ شغلنا، ونرفعه، بدون ما نخرب على بعض.

**رابط المشروع:** https://github.com/Ghalaaldibani/style-aura

---

## 1. أول شي: اقبلي الدعوة (مرة وحدة بس)

غلا أضافتكم كأعضاء في المشروع، يعني تقدرون ترفعون تعديلات.

1. سجلي دخول في **github.com** بحسابك (جنى: `JanaAi1`، رنيم: `Khran6-max`).
2. افتحي هذا الرابط: **https://github.com/Ghalaaldibani/style-aura/invitations**
   (أو افتحي إيميلك، بتلقين إيميل من GitHub عنوانه "invited you to collaborate").
3. اضغطي **Accept invitation**.

> ⚠️ الدعوة تنتهي بعد **7 أيام**. لو انتهت، قولوا لغلا تعيد إرسالها.

---

## 2. كلمات لازم تعرفينها

| الكلمة | معناها ببساطة |
|---|---|
| **Repository (repo)** | مجلد المشروع على GitHub |
| **Commit** | "نقطة حفظ": لقطة من المشروع مع رسالة تقول وش تغيّر |
| **Push** | ترفعين الـ commits من اللابتوب إلى GitHub |
| **Pull** | تنزّلين آخر تعديلات من GitHub للابتوب |
| **Clone** | تنزّلين المشروع كامل أول مرة على لابتوب جديد |
| **Conflict** | لما شخصين يعدّلون نفس السطر بنفس الوقت، وGit ما يعرف أي نسخة ياخذ |

---

## 3. لو تشتغلين على لابتوب غلا (الحالة العادية عندنا)

المشروع موجود أصلًا على اللابتوب، وGitHub مربوط بحساب غلا. ما تحتاجين تثبتين أي شي.

### قبل ما تبدين الشغل
افتحي ترمنال في VS Code (**Terminal ← New Terminal**) واكتبي:
```
git pull
```
عشان تتأكدين إن عندك آخر نسخة.

### بعد ما تخلصين خطوة (وتتأكدين إنها شغّالة)

**الطريقة السهلة (بالأزرار في VS Code):**
1. اضغطي أيقونة **Source Control** في الشريط اليسار (شكلها فرع شجرة 🌿)، أو **Ctrl+Shift+G**.
2. بتشوفين قائمة الملفات اللي تغيّرت.
3. اكتبي رسالة في المربع فوق، مثلًا: `Add Sign Up screen with error hints`.
4. اضغطي **Commit**. لو سألك "stage all changes?" اختاري **Yes**.
5. اضغطي **Sync Changes** (أو **Push**).

**أو بالترمنال:**
```
git add -A
git commit -m "Add Sign Up screen with error hints"
git push
```

### عشان يبين اسمك في الشغل 🙋‍♀️
لأن اللابتوب مربوط بحساب غلا، كل الـ commits بتطلع باسمها. عشان GitHub يحسب الشغل لك بعد، أضيفي **سطر فاضي** وبعده هذا السطر في آخر رسالة الـ commit:

- جنى:
  ```
  Co-authored-by: Jana Asiri <359929567+JanaAi1@users.noreply.github.com>
  ```
- رنيم:
  ```
  Co-authored-by: Raneem Ayman <337367257+khran6-max@users.noreply.github.com>
  ```

مثال كامل بالترمنال:
```
git commit -m "Add quiz dwell-time sensor" -m "Co-authored-by: Jana Asiri <359929567+JanaAi1@users.noreply.github.com>"
```
(في VS Code: اكتبي الرسالة، واضغطي **Shift+Enter** مرتين، والصقي السطر.)

---

## 4. لو تبين تشتغلين على لابتوبك انتِ (اختياري)

### تجهيز أول مرة
1. ثبّتي هذي البرامج (كلها مجانية):
   - **Node.js** (LTS): https://nodejs.org
   - **Git**: https://git-scm.com/download/win (خلي كل الخيارات الافتراضية)
   - **VS Code**: https://code.visualstudio.com
2. لو طلع خطأ "running scripts is disabled" مع `npm`، اكتبي في PowerShell:
   ```
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```
3. نزّلي المشروع: افتحي PowerShell في مجلد Documents واكتبي:
   ```
   git clone https://github.com/Ghalaaldibani/style-aura.git
   cd style-aura
   npm install
   ```
4. **ملف `.env.local`** (إعدادات Firebase) **مو موجود في GitHub عن قصد**. اطلبيه من غلا على الخاص (واتساب)، وحطيه في مجلد `style-aura` الرئيسي، جنب `package.json`.
5. شغّلي:
   ```
   npm run dev
   ```
   وافتحي http://localhost:5173
6. أول مرة تسوين `git push` بيفتح لك المتصفح عشان تسجلين دخول GitHub. سجلي بحسابك.

بعدها نفس خطوات القسم 3: **pull قبل الشغل، وcommit وpush بعده.**

---

## 5. قواعد الفريق ✋ (عشان ما نخرب على بعض)

1. **دايمًا `git pull` قبل ما تبدين.**
2. **لا تشتغلون اثنين على نفس الملف بنفس الوقت** على لابتوبين مختلفين. اتفقوا في القروب مين ماسك أي شاشة.
3. **commit صغير وكثير** أحسن من commit واحد ضخم آخر اليوم.
4. **لا ترفعين كود خربان**: قبل الـ push تأكدي إن `npm run dev` يشتغل وإن الصفحة تفتح.
5. **لا ترفعين `.env.local` أبدًا.** هو محمي في `.gitignore`، بس لا تحاولين تغيّرين هذا.
6. **رسائل الـ commit بالإنجليزي وواضحة:** وش سويتي، مو "update" أو "تعديل".
   - ✅ `Fix password show/hide button on Log In`
   - ❌ `changes`
7. **حدّثي `PROMPT_LOG.md`** لو صار خطأ مهم أو حل جديد، لأنه داخل في درجات التقرير.

---

## 6. لو صار شي غلط 🆘

| المشكلة | الحل |
|---|---|
| `git push` يقول **rejected** أو **fetch first** | فيه تعديلات أحد رفعها قبلك. اكتبي `git pull` وبعدها `git push` |
| بعد `git pull` طلعت كلمة **CONFLICT** | لا تذعرين 😅 لا تكملين ولا تحذفين شي. اسألي Claude في VS Code: "صار conflict في git ساعدني"، أو كلمي غلا |
| تبين تلغين تعديلات ما حفظتيها (ترجعين لآخر commit) | من Source Control: كلك يمين على الملف ← **Discard Changes**. ⚠️ ما تقدرين ترجعينها بعدها |
| `npm run dev` ما يشتغل بعد pull | غالبًا فيه مكتبة جديدة. اكتبي `npm install` وبعدها `npm run dev` |
| في الـ Console (F12) يطلع تحذير `[firebase] Not configured` | ملف `.env.local` ناقص أو ما أعدتي تشغيل `npm run dev` بعد ما حطيتيه. اطلبيه من غلا وأعيدي التشغيل |
