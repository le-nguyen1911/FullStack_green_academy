export const formatVND = (n) =>
  n == null || n === ""
    ? ""
    : new Intl.NumberFormat("vi-VN").format(Number(n)) + "₫";
