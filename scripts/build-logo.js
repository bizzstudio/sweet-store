// scripts/build-logo.js
//
// מחולל את כל נכסי הלוגו מהגדרה אחת. עד כה לא היה גנרטור ברפו: ה-SVG-ים היו
// מעודכנים ידנית וה-PNG-ים נבנו פעם אחת, כך שכל שינוי מותג חייב לגעת ב-15
// קבצים בלי מקור אמת אחד.
//
// מבנה הלוגו: סמל (סוכרייה עטופה) + שם המותג. השם הוא <text> חי בפונט
// AssistantEmbed — woff2 מוקטן (subset) שמוטמע כ-base64 ב-<defs>. ה-<defs>
// מועתק כלשונו מ-logo-mark.svg המקורי, ולכן **רק אותיות שכבר בסאבסט ירונדרו**;
// שינוי שם המותג לאותיות חדשות יצא ריק. הסמל הוא path טהור ואינו תלוי בפונט.
//
// הרצה:  node scripts/build-logo.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const LOGO_DIR = path.join(__dirname, "..", "public", "logo");
const GREEN = "#0d9e6d";
const WHITE = "#ffffff";

// ── מידות הטקסט, נמדדו מה-SVG המקורי ────────────────────────────────────────
// ה-viewBox המקורי היה "212 14.5 655.5 155.5" עם 30 יחידות ריפוד מכל צד,
// והבסיס (baseline) ב-y=118. מכאן: גובה הדיו 95.5, והבסיס יושב 73.5 מתחת
// לראש הדיו. שמירת המספרים האלה היא מה שמונע לוגו מרופד לא נכון.
const TEXT_INK_W = 595.5;
const TEXT_INK_H = 95.5;
const BASELINE_FROM_INK_TOP = 73.5;
const FONT_SIZE = 100;
const WORDMARK = "מתוקיה של בני";

const GAP = 46; // מרווח בין הסמל לשם
const PAD = 30; // ריפוד חיצוני, כמו במקור

// ── מידות הסמל ──────────────────────────────────────────────────────────────
// הסמל מצויר בתיבת 130x130, אבל הדיו שלו תופס רק 114.8x60 במרכזה. יישור לפי
// התיבה (ולא לפי הדיו) הוא מה שגרם לסמל להיראות קטן ולשבת נמוך מדי ביחס לשם.
const MARK_BOX = 130;
const MARK_INK_W = 114.8;
const MARK_INK_H = 60;
// גובה היעד של הסמל = גובה האותיות מעל הבסיס, כדי שהמשקל החזותי יתאים לשם
const MARK_TARGET_H = 78;
const MARK_SCALE = MARK_TARGET_H / MARK_INK_H;

// ── הסמל ────────────────────────────────────────────────────────────────────
// גוף גדול + מניפות קטנות עם "פיתול" קעור במפגש. היחס הזה קריטי: מניפות
// בגובה הגוף גורמות לסמל להיקרא כעניבת פרפר ולא כסוכרייה.
const candy = (fill, cx = 65, cy = 65) => `
    <g transform="translate(${cx - 65} ${cy - 65})">
      <circle cx="65" cy="65" r="30" fill="${fill}"/>
      <path d="M34 57 L12 44 Q7 41 8.5 47 L13 65 L8.5 83 Q7 89 12 86 L34 73 Q30 65 34 57 Z" fill="${fill}"/>
      <path d="M96 57 L118 44 Q123 41 121.5 47 L117 65 L121.5 83 Q123 89 118 86 L96 73 Q100 65 96 57 Z" fill="${fill}"/>
    </g>`;

// תג מרובע-מעוגל עם הסוכרייה בלבן — הגרסה שעובדת גם כ-favicon 16px
const badge = (size, bg = GREEN, fg = WHITE) => {
  const s = size / MARK_BOX;
  return `<rect width="${size}" height="${size}" rx="${34 * s}" fill="${bg}"/>
    <g transform="scale(${s})">${candy(fg)}</g>`;
};

// ── חילוץ בלוק הפונט מה-SVG המקורי ──────────────────────────────────────────
const readFontDefs = () => {
  const src = fs.readFileSync(path.join(LOGO_DIR, "logo-mark.svg"), "utf8");
  const m = src.match(/<defs>[\s\S]*?<\/defs>/);
  if (!m) throw new Error("לא נמצא בלוק <defs> עם הפונט ב-logo-mark.svg");
  return m[0];
};

const FONT_FAMILY =
  "'AssistantEmbed','Assistant','Arial Hebrew','Noto Sans Hebrew',sans-serif";

// ── הרכבת הנעילה (סמל + שם) ─────────────────────────────────────────────────
const lockup = (defs, color) => {
  const markInkW = MARK_INK_W * MARK_SCALE;
  const w = PAD * 2 + TEXT_INK_W + GAP + markInkW;
  const h = PAD * 2 + TEXT_INK_H;

  const inkTop = PAD;
  const baseline = inkTop + BASELINE_FROM_INK_TOP;
  const textCenterX = PAD + TEXT_INK_W / 2;

  // RTL: הסמל בצד ימין — הצד שממנו מתחילים לקרוא.
  // מרכזו האנכי מיושר למרכז החזותי של האותיות (חצי הגובה שמעל הבסיס) ולא
  // למרכז תיבת הטקסט, שכולל את ירידת ה-ק' ולכן מושך את הסמל מטה.
  const markCx = w - PAD - markInkW / 2;
  const markCy = inkTop + BASELINE_FROM_INK_TOP / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${WORDMARK}"><title>${WORDMARK}</title>${defs}
  <g transform="translate(${markCx} ${markCy}) scale(${MARK_SCALE}) translate(${-MARK_BOX / 2} ${-MARK_BOX / 2})">${candy(color)}</g>
  <text x="${textCenterX}" y="${baseline}" text-anchor="middle" direction="rtl" font-family="${FONT_FAMILY}" font-size="${FONT_SIZE}" font-weight="700" letter-spacing="0" fill="${color}">${WORDMARK}</text>
</svg>`;
};

const squareSvg = (bg, fg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${WORDMARK}"><title>${WORDMARK}</title>${badge(512, bg, fg)}</svg>`;

// המתכון המדויק שבו נבנו ה-PNG-ים המקוריים (אומת pixel-for-pixel בעבר)
const toPng = (svg, w, h, out) =>
  sharp(Buffer.from(svg), { density: 300 })
    .resize(w, h, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(LOGO_DIR, out));

(async () => {
  const defs = readFontDefs();
  const dark = lockup(defs, GREEN);
  const light = lockup(defs, WHITE);
  const square = squareSvg(GREEN, WHITE);
  const squareLight = squareSvg(WHITE, GREEN);

  // יחס הנעילה נשמר; הגובה נגזר מהרוחב כדי שלא ייווצר ריפוד שקוף מיותר
  const W = PAD * 2 + TEXT_INK_W + GAP + MARK_INK_W * MARK_SCALE;
  const H = PAD * 2 + TEXT_INK_H;
  const at = (px) => [px, Math.round((px * H) / W)];

  const files = [
    ["logo-mark.svg", dark], ["logo-color.svg", dark],
    ["logo-full.svg", dark], ["logo-mark-light.svg", light],
    ["logo-full-light.svg", light], ["logo-square.svg", square],
  ];
  for (const [name, svg] of files) fs.writeFileSync(path.join(LOGO_DIR, name), svg);

  await toPng(dark, ...at(1312), "logo-mark.png");
  await toPng(dark, ...at(1312), "logo-color.png");
  await toPng(dark, ...at(1600), "logo-full.png");
  await toPng(light, ...at(1312), "logo-mark-light.png");
  await toPng(light, ...at(1600), "logo-full-light.png");
  await toPng(square, 512, 512, "logo-square.png");
  await toPng(square, 192, 192, "logo-square-192.png");
  await toPng(square, 180, 180, "logo-square-180.png");
  await toPng(square, 64, 64, "logo-square-64.png");

  console.log(`נעילה: ${W}x${H} (יחס ${(W / H).toFixed(2)}:1)`);
  for (const f of fs.readdirSync(LOGO_DIR).filter((f) => !f.includes("legacy")).sort()) {
    const { size } = fs.statSync(path.join(LOGO_DIR, f));
    console.log(`  ${f.padEnd(24)} ${(size / 1024).toFixed(0)}KB`);
  }
  console.log(
    "\nשימו לב: public/service-worker.js מצמיד כל /logo/* ל-md5 שלו.\n" +
    "חובה להריץ npm run build אחרי השינוי, אחרת מבקרים חוזרים יקבלו את הלוגו הישן מהמטמון."
  );
})().catch((e) => { console.error(e); process.exit(1); });
