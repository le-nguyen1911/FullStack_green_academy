import { useEffect } from "react";

// Đóng bằng phím Esc, bấm nền hoặc nút ×. Khóa cuộn trang phía sau khi mở
export default function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
         onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true"
           className={`my-8 w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-lg bg-white shadow-xl`}>
        <div className="flex items-center border-b p-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Đóng" className="ml-auto text-2xl leading-none text-stone-500">×</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
