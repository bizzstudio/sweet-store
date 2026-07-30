// src/component/product/ProductTrustBadges.jsx
import Image from "next/image";
import useTranslation from "next-translate/useTranslation";

const BADGES = [
  { key: "trustSecurePurchase", src: "/trust-badges/secure-purchase.png" },
  { key: "trustFastDelivery", src: "/trust-badges/fast-delivery.png" },
  { key: "trustFreshness", src: "/trust-badges/freshness.png" },
  { key: "trustDirectFromFarmer", src: "/trust-badges/farmer.png" },
  { key: "trustBlueWhite", src: "/trust-badges/blue-white.png" },
];

const ProductTrustBadges = ({ className = "" }) => {
  const { t } = useTranslation();

  return (
    <div
      className={`grid grid-cols-3 sm:grid-cols-5 gap-x-2 gap-y-4 mt-8 pt-6 border-t border-gray-100 ${className}`}
    >
      {BADGES.map(({ key, src }) => (
        <div key={key} className="flex flex-col items-center text-center">
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <Image
              src={src}
              alt={t(`common:${key}`)}
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
          <span className="mt-2 text-[11px] md:text-xs font-serif font-semibold text-gray-700 leading-tight">
            {t(`common:${key}`)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ProductTrustBadges;
