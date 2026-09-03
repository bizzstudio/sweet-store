// src/component/common/SortDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { HiOutlineSortAscending, HiOutlineSortDescending } from 'react-icons/hi';
import { BiSortAlt2 } from 'react-icons/bi';
import { AiOutlineHeart } from 'react-icons/ai';
import { HIDE_PRICES } from '@utils/priceVisibility';

const SortDropdown = ({ sortedField, setSortedField }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // בחנות ללא מחירים אין משמעות ל"מהזול ליקר" — שתי אפשרויות המיון לפי
  // מחיר יורדות מהתפריט. ‎useFilter עדיין יודע לטפל בערכים "Low"/"High",
  // כך שאין צורך לגעת בו וברירת המחדל ("Popular") נשארת תקפה.
  // ראה src/utils/priceVisibility.js
  const sortOptions = [
    { 
      value: "Alphabetical", 
      label: t("common:sortAlphabetical"),
      icon: <BiSortAlt2 className="w-[17px] h-[17px]" />
    },
    ...(HIDE_PRICES ? [] : [
      { 
        value: "Low", 
        label: t("common:sortPriceLowToHigh"),
        icon: <HiOutlineSortAscending className="w-4 h-4 mt-[1px]" />
      },
      { 
        value: "High", 
        label: t("common:sortPriceHighToLow"),
        icon: <HiOutlineSortDescending className="w-4 h-4 mt-[2px]" />
      },
    ]),
    { 
      value: "Popular", 
      label: t("common:sortByBestSelling"),
      icon: <AiOutlineHeart className="w-4 h-4 mt-[1px]" />
    },
  ];

  const selectedOption = sortOptions.find(option => option.value === sortedField);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (value) => {
    setSortedField(value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        {/* Custom Select Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          // התפריט נפתח ונסגר בלי שום הכרזה לקורא מסך: אין ‎aria-expanded, אין
          // קשר בין הכפתור לרשימה, ואי אפשר לסגור ב-Escape.
          //
          // ‎aria-haspopup לא מוצהר כאן: ערכיו ("menu"/"listbox") מבטיחים
          // מודל מקלדת מסוים (חצים + ‎aria-activedescendant) שאינו ממומש —
          // כאן כל אפשרות היא כפתור רגיל בסדר ה-Tab. ‎aria-expanded לבדו
          // תקין על כפתור ומוסר בדיוק את מה שקורה: נפתח / נסגר.
          aria-expanded={isOpen}
          aria-controls="sort-options"
          aria-label={`${t("common:sortBy")}: ${selectedOption?.label ?? ""}`}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          className={`
            w-full min-w-[225px] px-3 py-2 bg-white 
            border-2 border-gray-200 rounded-xl
            text-sm font-medium text-gray-800
            hover:border-mainColor-dark hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-mainColor-dark/20 focus:border-mainColor-dark
            transition-all duration-200 ease-in-out
            flex items-center justify-between gap-3
            ${isOpen ? 'border-mainColor-dark shadow-lg ring-2 ring-mainColor-dark/20' : ''}
          `}
        >
          <div className="flex items-center gap-1">
            {/* ‎text-gray-400 על לבן = 2.54:1 ונופל מתחת לתקן */}
            <span aria-hidden="true" className="text-gray-600 text-sm font-medium me-1">
              {t("common:sortBy")}:
            </span>
            <span aria-hidden="true" className="text-mainColor-dark">
              {selectedOption?.icon}
            </span>
            <span className="text-left">
              {selectedOption?.label}
            </span>
          </div>
          
          <span aria-hidden="true" className={`text-mainColor-dark transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <FiChevronDown className="w-4 h-4" />
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          // ‎role="listbox" הוסר: ‎listbox רשאי להכיל רק ‎option, וכאן יש
          // ‎<div> ביניים; ובנוסף ‎role="option" על ‎<button> מוחק את סמנטיקת
          // הכפתור ומחייב ניווט בחצים שאינו קיים כאן.
          // קבוצה מסומנת בשם + ‎aria-current על הנבחר תקינה ומספיקה.
          <div
            id="sort-options"
            role="group"
            aria-label={t("common:sortBy")}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsOpen(false);
            }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-current={sortedField === option.value ? "true" : undefined}
                  onClick={() => handleOptionClick(option.value)}
                  className={`
                    w-full px-4 py-3 text-sm font-medium text-left
                    hover:bg-mainColor-dark/5 hover:text-mainColor-dark
                    flex items-center gap-3 transition-all duration-150
                    ${sortedField === option.value 
                      ? 'bg-mainColor-dark/10 text-mainColor-superDark font-bold border-r-4 border-mainColor-dark' 
                      : 'text-gray-800'
                    }
                  `}
                >
                  <span aria-hidden="true" className={`${sortedField === option.value ? 'text-mainColor-dark' : 'text-gray-500'}`}>
                    {option.icon}
                  </span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SortDropdown; 