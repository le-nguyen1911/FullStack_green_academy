import { CheckCircle2, XCircle, X } from "lucide-react";

export default function Toast({ toasts, onRemove }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed right-5 top-5 z-[9999] flex w-[calc(100%-40px)] max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg ${
              isSuccess
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 size={20} className="shrink-0" />
            ) : (
              <XCircle size={20} className="shrink-0" />
            )}

            <p className="flex-1 text-sm font-medium">{toast.message}</p>

            <button
              type="button"
              onClick={() => onRemove(toast.id)}
              className="shrink-0 opacity-60 transition hover:opacity-100"
              aria-label="Đóng thông báo"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
