import api from "./axios";

export const MAX_FILE_MB = 5;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const validateImage = (file) => {
  if (!ALLOWED_TYPES.includes(file.type))
    return `${file.name}: chỉ nhận JPG, PNG, WEBP`;
  if (file.size > MAX_FILE_MB * 1024 * 1024)
    return `${file.name}: vượt quá ${MAX_FILE_MB}MB`;
  return null;
};

export const uploadImages = async (
  files,
  { folder = "products", onProgress } = {},
) => {
  const body = new FormData();
  files.forEach((f) => body.append("images", f)); 

  const { data } = await api.post("/manager/uploads/images", body, {
    params: { folder },
    onUploadProgress: (e) =>
      e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
  });
  return data.images; 
};
