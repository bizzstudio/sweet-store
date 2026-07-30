import React from "react";
import { IoClose } from "react-icons/io5";
import { MdCelebration, MdEmojiEvents } from "react-icons/md";

const SESSION_KEY_PREFIX = "lotteryPopupSeen_";

export function wasLotteryPopupSeen(lotteryId, popupType) {
  if (typeof window === "undefined") return false;
  return !!sessionStorage.getItem(SESSION_KEY_PREFIX + popupType + "_" + lotteryId);
}

export function markLotteryPopupSeen(lotteryId, popupType) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY_PREFIX + popupType + "_" + lotteryId, "1");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ────────── פופאפ הגרלה פעילה ────────── */
function ActiveLotteryContent({ lottery, onClose }) {
  return (
    <>
      <div className="mb-3 text-mainColor">
        <MdCelebration size={52} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">🎉 הגרלה פעילה!</h2>
      <p className="text-xl font-semibold text-mainColor mb-3">{lottery.title}</p>
      <p className="text-sm text-gray-500 mb-4">
        {formatDate(lottery.startDate)} – {formatDate(lottery.endDate)}
      </p>
      <p className="text-base text-gray-700 leading-relaxed">
        כל הזמנה שתבצעו בתקופה זו מהווה כרטיס הגרלה.
        <br />
        <span className="font-bold text-mainColor">
          הזוכה יקבל החזר מלא על סכום ההזמנה שלו!
        </span>
      </p>
      <button
        onClick={onClose}
        className="mt-6 px-8 py-2.5 bg-mainColor text-white font-semibold rounded-xl border-b-4 border-mainColor-dark hover:brightness-110 hover:-translate-y-[1px] active:translate-y-[2px] active:border-b-2 transition-all"
      >
        אחלה, אני משתתף! 🎊
      </button>
    </>
  );
}

/* ────────── פופאפ הכרזת זוכה ────────── */
function WinnerLotteryContent({ lottery, onClose }) {
  return (
    <>
      <div className="mb-3 text-yellow-500">
        <MdEmojiEvents size={60} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">🏆 יש לנו זוכה!</h2>
      <p className="text-lg font-semibold text-mainColor mb-3">{lottery.title}</p>
      {lottery.winnerName && (
        <div className="bg-mainColor-superLight rounded-xl px-6 py-3 mb-3 w-full text-center">
          <p className="text-sm text-gray-500 mb-0.5">הזוכה הוא</p>
          <p className="text-2xl font-bold text-mainColor">{lottery.winnerName}</p>
          {lottery.winnerInvoice && (
            <p className="text-sm text-gray-400 mt-0.5">הזמנה #{lottery.winnerInvoice}</p>
          )}
        </div>
      )}
      <p className="text-base text-gray-700 leading-relaxed">
        מזל טוב לזוכה! 🎉
        <br />
        <span className="font-bold text-mainColor">
          סכום ההזמנה יוחזר במלואו.
        </span>
      </p>
      <button
        onClick={onClose}
        className="mt-6 px-8 py-2.5 bg-mainColor text-white font-semibold rounded-xl border-b-4 border-mainColor-dark hover:brightness-110 hover:-translate-y-[1px] active:translate-y-[2px] active:border-b-2 transition-all"
      >
        מזל טוב! 🥳
      </button>
    </>
  );
}

/* ────────── קומפוננט ראשי ────────── */
const LotteryPopup = ({ lottery, onClose }) => {
  if (!lottery) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999] px-4"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-60"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center text-center z-10">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 p-1.5 rounded-full bg-mainColor text-white hover:brightness-110 transition-all"
          aria-label="סגור"
        >
          <IoClose size={18} />
        </button>

        {lottery.popupType === "winner" ? (
          <WinnerLotteryContent lottery={lottery} onClose={onClose} />
        ) : (
          <ActiveLotteryContent lottery={lottery} onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default LotteryPopup;
