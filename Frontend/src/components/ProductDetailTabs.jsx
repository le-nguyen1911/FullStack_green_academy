import { useState } from "react";
import ReviewSection from "./ReviewSection";

export default function ProductDetailTabs({ description = "", productId }) {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    {
      id: "description",
      label: "MÔ TẢ",
    },
    {
      id: "reviews",
      label: "ĐÁNH GIÁ",
    },
  ];

  const paragraphs = description
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <section className="w-full bg-white px-5 py-8 md:px-10 md:py-12">
      <div className="flex items-center gap-8 border-b border-stone-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative pb-3 text-sm font-medium transition-colors
              ${
                activeTab === tab.id
                  ? "text-amber-900"
                  : "text-stone-800 hover:text-amber-900"
              }
            `}
          >
            {tab.label}

            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-amber-900" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "description" && (
        <div className="space-y-4 text-[18px] leading-relaxed text-stone-700">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p className="text-stone-400">Chưa có mô tả cho sản phẩm này.</p>
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-5">
          <ReviewSection productId={productId} />
        </div>
      )}
    </section>
  );
}
