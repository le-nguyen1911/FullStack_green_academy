import { useRef, useState } from "react";
import { cld } from "../../util/image";
import { MAX_FILE_MB, uploadImages, validateImage } from "../../util/upload";
import { getError } from "../../util/axios";

// Dùng cho ảnh đại diện (max=1) và ảnh phụ (max=10). Tải xong gọi onChange với mảng URL.
// File KHÔNG đưa vào Redux (không serialize được); Redux chỉ nhận URL khi bấm Lưu sản phẩm
export default function ImageUploader({
  value = [], onChange, max = 1, folder = "products", disabled = false, onBusyChange,
}) {
  const inputRef = useRef(null);
  // Luôn đọc được giá trị mới nhất, kể cả khi người dùng xóa ảnh khác trong lúc đang tải
  const valueRef = useRef(value);
  valueRef.current = value;

  const [progress, setProgress] = useState(null);   // null = không tải | số = % đang gửi lên
  const [error, setError] = useState("");

  const single = max === 1;
  const full = !single && value.length >= max;
  const busy = progress !== null;

  const pick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";   // cho phép chọn lại cùng một tệp
    if (!files.length) return;
    setError("");

    const room = single ? 1 : max - valueRef.current.length;
    if (files.length > room)
      return setError(single ? "Chỉ chọn một ảnh" : `Chỉ thêm được tối đa ${room} ảnh nữa`);
    const invalid = files.map(validateImage).find(Boolean);
    if (invalid) return setError(invalid);

    setProgress(0);
    onBusyChange?.(true);
    try {
      const uploaded = await uploadImages(files, { folder, onProgress: setProgress });
      const urls = uploaded.map((i) => i.url);
      onChange(single ? urls : [...new Set([...valueRef.current, ...urls])]);
    } catch (err) {
      setError(getError(err, "Không tải được ảnh lên"));
    } finally {
      setProgress(null);
      onBusyChange?.(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div key={url} className="relative h-24 w-24 rounded border bg-white">
            <img src={cld(url, "w_200,h_200,c_fit,f_auto,q_auto")} alt="" className="h-full w-full rounded object-contain" />
            {!disabled && (
              <button type="button" aria-label="Xóa ảnh" disabled={busy}
                      onClick={() => onChange(value.filter((u) => u !== url))}
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-600 text-xs text-white disabled:opacity-50">
                ✕
              </button>
            )}
          </div>
        ))}

        {!disabled && !full && (
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()}
                  className="h-24 w-24 rounded border-2 border-dashed text-sm text-stone-500 hover:border-amber-800 disabled:opacity-60">
            {busy ? (progress >= 100 ? "Đang xử lý..." : `${progress}%`) : single && value.length ? "Đổi ảnh" : "+ Thêm ảnh"}
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple={!single} hidden onChange={pick} />

      {busy && (
        <div className="mt-2 h-1.5 max-w-xs rounded bg-stone-200">
          <div className="h-full rounded bg-amber-800 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <p className="mt-1 text-xs text-stone-500">
        JPG, PNG, WEBP · tối đa {MAX_FILE_MB}MB{!single && ` · ${value.length}/${max} ảnh`}
      </p>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
