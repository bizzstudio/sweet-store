// src/component/common/Discount.js
import { AiOutlineGift } from "react-icons/ai";
import { useRef, useEffect, useState } from "react";

const Discount = ({
  slug,
  modal,
  title = '',
  search,
  card,
}) => {
  const textRef = useRef(null);
  const containerRef = useRef(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      // בדיקה אם הטקסט ארוך מהקונטיינר
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      setShouldAnimate(textWidth > containerWidth);
    }
  }, [title]);

  return (
    <div
      className={
        modal
          ? 'mb-3'
          : slug
            ? ''
            : search
              ? ''
              : card
                ? 'mb-[19px]'
                : ''
      }
    >
      {title && (
        <span
          ref={containerRef}
          className={`inline-flex items-center gap-0.5 sm:gap-1 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-black bg-mainColor rounded-lg shadow-sm overflow-hidden ${modal
            ? 'absolute end-3 top-3 ms-3 outline outline-[8px] outline-white'
            : slug
              ? 'outline outline-[8px] outline-white'
              : search
                ? 'mt-1'
                : card
                  ? 'absolute start-2 sm:start-3 top-2 sm:top-3 me-2 sm:me-3 z-10 outline outline-[5px] sm:outline-[7px] outline-white'
                  : ''
            } ${card ? 'max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-1.5rem)]' : ''}`}>
          <div className="z-10 bg-mainColor ps-2 pe-1.5 py-0.5">
            <AiOutlineGift className="w-[14px] sm:w-[18px] min-w-[14px] sm:min-w-[18px] h-[14px] sm:h-[18px] min-h-[14px] sm:min-h-[18px] relative" />
          </div>
          <span
            ref={textRef}
            className={`pe-3 whitespace-nowrap ${shouldAnimate ? 'animate-marquee' : ''}`}
            style={{
              display: 'inline-block',
            }}
          >
            {title}
          </span>
        </span>
      )}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          95% {
            transform: translateX(calc(100% + 8px));
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Discount;
