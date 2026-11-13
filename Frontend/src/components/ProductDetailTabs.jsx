import { useState } from "react";

export default function ProductDetailTabs({ description = "", reviews = [] }) {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    {
      id: "description",
      label: "MÔ TẢ",
    },
    {
      id: "reviews",
      label: `ĐÁNH GIÁ (${reviews.length})`,
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
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-stone-100 pb-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-stone-800">
                    {review.user_name}
                  </p>

                  <span className="text-xs text-stone-400">
                    {review.created_at}
                  </span>
                </div>

                <div className="my-2 flex gap-1 text-amber-600">
                  {Array.from({ length: 5 }, (_, index) => (
                    <i
                      key={index}
                      className={
                        index < Number(review.rating)
                          ? "pi pi-star-fill"
                          : "pi pi-star"
                      }
                    />
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-stone-600">
                  {review.comment}
                </p>
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
              <i className="pi pi-comments text-3xl text-stone-300" />
              <p className="mt-3 text-sm text-stone-500">
                Chưa có đánh giá nào cho sản phẩm này.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
