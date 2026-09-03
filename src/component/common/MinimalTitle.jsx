// src/component/common/MinimalTitle.jsx
import React from "react";
import { useInView } from "react-intersection-observer";

/**
 * כותרת עם פס צבע וכניסה מונפשת.
 *
 * שינוי חשוב: קודם הרכיב הזה ייצר תמיד ‎<h1> לכותרת ו-‎<h2> לתת-הכותרת.
 * הוא מופיע בכ-20 מקומות — כותרות מקטעים בדף הבית, כותרות מודלים, טפסי
 * התחברות — כך שבדף הבית לבדו היו שלושה ‎<h1> שונים, וב-PageHeader הוא היה
 * מקונן בתוך ‎<h2> חיצוני (‎<h1> בתוך ‎<h2> — HTML לא חוקי).
 * המשמעות המעשית: רשימת הכותרות שקורא מסך מציג ככלי הניווט המרכזי שלו
 * הייתה חסרת מבנה לחלוטין.
 *
 * עכשיו ברירת המחדל היא ‎<h2> (כותרת מקטע), ומי שהוא באמת כותרת העמוד
 * מעביר ‎as="h1". תת-הכותרת הפכה ל-‎<p>: היא תיאור, לא כותרת.
 *
 * @param {"h1"|"h2"|"h3"|"h4"} as רמת הכותרת. ברירת מחדל ‎h2.
 */
const MinimalTitle = ({ title, subtitle, as = "h2" }) => {
    const { ref, inView } = useInView({
        threshold: 0.01,
        triggerOnce: true, // גורם לכך שהאנימציה תתרחש רק פעם אחת
    });

    const Heading = as;

    return (
        <div className="flex gap-3 items-stretch h-full" ref={ref}>
            <div aria-hidden="true" className="w-1.5 min-w-[6px] bg-mainColor rounded self-stretch" />
            <div className="flex flex-col justify-center overflow-hidden">
                {title && (
                    <Heading
                        className={`md:text-4xl text-lg font-bold text-start text-gray-900 ${inView ? 'animate-title' : 'opacity-0'}`}
                        key={title}
                    >
                        {title}
                    </Heading>
                )}
                {subtitle && (
                    <p
                        className={`md:text-2xl text-sm font-light text-start text-gray-700 ${inView ? 'animate-subtitle' : 'opacity-0'}`}
                        key={subtitle}
                    >
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};

export default MinimalTitle;
