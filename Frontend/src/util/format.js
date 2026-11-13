export const formatVND = (n) =>
  n == null || n === ""
    ? ""
    : new Intl.NumberFormat("vi-VN").format(Number(n)) + "₫";
export const GRIND_LABELS = {
  WHOLE_BEAN: "Nguyên hạt",
  FINE: "Xay mịn",
  MEDIUM: "Xay vừa",
  COARSE: "Xay thô",
};
