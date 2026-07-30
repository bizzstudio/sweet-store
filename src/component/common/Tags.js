import React from 'react';

const Tags = ({ product }) => {
  // פענוח בטוח: אם product.tag חסר או אינו JSON תקין, לא מפילים את כרטיס המוצר
  let tags = [];
  try {
    if (product?.tag && product.tag.length !== 0) {
      const parsed = JSON.parse(product.tag);
      if (Array.isArray(parsed)) tags = parsed;
    }
  } catch (e) {
    tags = [];
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-row gap-1 flex-wrap mt-1">
      {tags.map((t, i) => (
        <span
          key={i + 1}
          className="bg-gray-100 border-0 text-gray-600 rounded-full inline-flex items-center justify-center px-3 py-1 text-xs font-semibold font-serif"
        >
          {t}
        </span>
      ))}
    </div>
  );
};

export default Tags;
