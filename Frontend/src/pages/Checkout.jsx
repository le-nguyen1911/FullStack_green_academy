import React, { useEffect, useState } from "react";
import api from "../util/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useUser } from "@/hooks/UserContext";
import {
    fetchCart,
    selectSelectedItems,
    selectSelectedTotal,
} from "../redux/slices/cartSlice";

const PAYMENT_OPTIONS = [
    {
        value: "Bank Transfer",
        label: "Chuyển khoản ngân hàng",
        description:
            "Chuyển khoản trực tiếp vào tài khoản ngân hàng của chúng tôi. Vui lòng sử dụng mã đơn hàng làm nội dung chuyển khoản.",
    },
    {
        value: "COD",
        label: "Trả tiền mặt khi nhận hàng",
        description: "Trả tiền mặt khi giao hàng.",
    },
];

const getItemImage = (item) =>
    item?.image_url ||
    item?.image ||
    item?.thumbnail ||
    item?.product_image ||
    item?.product?.image_url ||
    item?.product?.image ||
    "";

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useUser() || {};

    const cartStatus = useSelector((s) => s?.cart?.status ?? "idle");
    const cartItems = useSelector((s) => s?.cart?.items ?? []);
    const reduxSelectedItems = useSelector((s) =>
        s?.cart ? selectSelectedItems(s) : [],
    );
    const reduxSelectedTotal = useSelector((s) =>
        s?.cart ? selectSelectedTotal(s) : 0,
    );

    useEffect(() => {
        if (cartStatus === "idle") {
            dispatch(fetchCart());
        }
    }, [cartStatus, dispatch]);

    const fallbackData = (() => {
        if (location.state) return location.state;
        try {
            const saved = sessionStorage.getItem("checkout_data");
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    })();

    const activeCartIds = new Set(cartItems.map((i) => i.id));
    const selectedItems =
        reduxSelectedItems.length > 0
            ? reduxSelectedItems
            : cartItems.length > 0
                ? (Array.isArray(fallbackData.selectedItems)
                    ? fallbackData.selectedItems
                    : []
                ).filter((item) => activeCartIds.has(item.id))
                : [];

    const totalPrice =
        reduxSelectedItems.length > 0
            ? reduxSelectedTotal
            : selectedItems.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.line_total ??
                        Number(item.price || 0) * Number(item.quantity || 0),
                    ),
                0,
            );

    const grandTotal = totalPrice;

    const [form, setForm] = useState({
        fullName: user?.full_name || "",
        address: user?.address || "",
        phone: user?.phone || "",
        email: user?.email || "",
        note: "",
    });
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);

    useEffect(() => {
        if (!user) return;
        setForm((prev) => ({
            ...prev,
            fullName: prev.fullName || user.full_name || "",
            address: prev.address || user.address || "",
            phone: prev.phone || user.phone || "",
            email: prev.email || user.email || "",
        }));
    }, [user]);

    const hasItems = selectedItems.length > 0;

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
        if (submitError) setSubmitError("");
    };

    const validate = () => {
        const newErrors = {};
        const phoneTrimmed = form.phone.trim();
        const emailTrimmed = form.email.trim();

        if (!form.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";
        if (!form.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";

        if (!phoneTrimmed) {
            newErrors.phone = "Vui lòng nhập số điện thoại";
        } else if (!/^0\d{9}$/.test(phoneTrimmed)) {
            newErrors.phone = "Số điện thoại gồm 10 số, bắt đầu bằng 0";
        }

        if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
            newErrors.email = "Địa chỉ email không hợp lệ";
        }

        if (!paymentMethod)
            newErrors.paymentMethod = "Vui lòng chọn phương thức thanh toán";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!hasItems) {
            navigate("/cart", { replace: true });
            return;
        }
        setSubmitError("");
        if (!validate()) return;

        if (paymentMethod !== "COD") {
            setSubmitError("Hiện tại hệ thống mới hỗ trợ thanh toán COD.");
            return;
        }

        setSubmitting(true);
        try {
            const fullNameTrimmed = form.fullName.trim();
            const emailTrimmed = form.email.trim();
            const noteTrimmed = form.note.trim();
            const shopperName =
                fullNameTrimmed || user?.full_name || user?.name || null;

            const payload = {
                cart_item_ids: selectedItems.map((item) => String(item.id)),
                shoppers: shopperName,
                recipient_name: fullNameTrimmed,
                recipient_phone: form.phone.trim(),
                shipping_address: form.address.trim(),
                shopping_email: emailTrimmed || null,
                shopping_notes: noteTrimmed || null,
                shipping_method_id: fallbackData.shipping_method_id ?? 1,
                payment_method: "COD",
            };

            const res = await api.post("orders", payload);

            try {
                sessionStorage.removeItem("checkout_data");
            } catch { }

            if (typeof dispatch === "function") {
                try {
                    await dispatch(fetchCart());
                } catch { }
            }

            const created = res?.data?.data || res?.data || {};
            setOrderSuccess({
                id: created?.id || created?.order_id || "",
                orderCode: created?.order_code || "",
                shoppers: created?.shoppers || shopperName || "",
                totalAmount: Number(created?.total_amount ?? totalPrice),
                paymentMethod: "COD",
                items: selectedItems,
            });
        } catch (err) {
            console.error("Lỗi khi đặt hàng:", err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Đặt hàng thất bại, vui lòng thử lại.";
            setSubmitError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 py-10 text-center">
                <p className="text-lg font-semibold text-green-700">
                    Đặt hàng thành công!
                </p>
                <p className="mt-2 text-sm text-gray-600">
                    {orderSuccess.orderCode
                        ? `Mã đơn hàng: ${orderSuccess.orderCode}. `
                        : orderSuccess.id
                            ? `Mã đơn hàng #${orderSuccess.id}. `
                            : "Đơn hàng của bạn đã được tạo. "}
                    Tổng thanh toán:{" "}
                    <span className="font-semibold text-[#6f4e37]">
                        {Number(orderSuccess.totalAmount).toLocaleString()}đ
                    </span>
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        className="rounded-lg bg-[#6f4e37] px-4 py-2 text-white hover:bg-[#5c4033]"
                        onClick={() => navigate("/account/orders")}
                    >
                        Kiểm tra đơn hàng
                    </button>
                    <button
                        type="button"
                        className="rounded-lg border border-[#6f4e37] px-4 py-2 text-[#6f4e37] hover:bg-[#6f4e37]/10"
                        onClick={() => navigate("/products")}
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        );
    }

    if (
        (cartStatus === "loading" || cartStatus === "idle") &&
        selectedItems.length === 0
    ) {
        return (
            <div className="min-h-screen bg-gray-50 py-10 text-center">
                <p>Đang kiểm tra giỏ hàng...</p>
            </div>
        );
    }

    if (!hasItems) {
        return (
            <div className="min-h-screen bg-gray-50 py-10 text-center">
                <p>Giỏ hàng hiện không có sản phẩm nào để thanh toán.</p>
                <button
                    className="mt-4 rounded-lg bg-[#6f4e37] px-4 py-2 text-white"
                    onClick={() => navigate("/cart")}
                >
                    Quay lại giỏ hàng
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    <div>
                        <h2 className="mb-6 text-2xl font-bold">Thông Tin Thanh Toán</h2>

                        <div>
                            <label className="mb-2 block font-medium">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={form.fullName}
                                onChange={handleChange("fullName")}
                                className="h-12 w-full rounded-lg border px-4 outline-none focus:border-[#6f4e37]"
                            />
                            {errors.fullName && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        <div className="mt-5">
                            <label className="mb-2 block font-medium">
                                Địa chỉ <span className="text-red-500">*</span>
                            </label>

                            <input
                                value={form.address}
                                onChange={handleChange("address")}
                                className="h-12 w-full rounded-lg border px-4 outline-none focus:border-[#6f4e37]"
                            />
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                            )}
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block font-medium">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>

                                <input
                                    value={form.phone}
                                    onChange={handleChange("phone")}
                                    className="h-12 w-full rounded-lg border px-4 outline-none focus:border-[#6f4e37]"
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block font-medium">
                                    Địa chỉ email
                                </label>

                                <input
                                    value={form.email}
                                    onChange={handleChange("email")}
                                    className="h-12 w-full rounded-lg border px-4 outline-none focus:border-[#6f4e37]"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="mb-4 text-xl font-semibold">Thông Tin Bổ Sung</h3>

                            <label className="mb-2 block font-medium">
                                Ghi chú đơn hàng (tuỳ chọn)
                            </label>

                            <textarea
                                rows={6}
                                value={form.note}
                                onChange={handleChange("note")}
                                className="w-full rounded-lg border p-4 outline-none focus:border-[#6f4e37]"
                                placeholder="Ghi chú về đơn đặt hàng của bạn, ví dụ: ghi chú đặc biệt để giao hàng."
                            />
                        </div>
                    </div>

                    {/* Đơn hàng của bạn */}
                    <div className="h-fit rounded-2xl border bg-white p-8">
                        <h2 className="mb-6 text-2xl font-bold">Đơn Hàng Của Bạn</h2>

                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Sản phẩm</span>
                            <span>Tạm tính</span>
                        </div>

                        <div className="mt-4 space-y-4">
                            {selectedItems.map((item) => {
                                const lineTotal =
                                    item.line_total ??
                                    Number(item.price || 0) * Number(item.quantity || 0);
                                const imgSrc = getItemImage(item);
                                const itemTitle = `${item.product_name || item.name || "Sản phẩm"}${item.variant_name ? ` (${item.variant_name})` : ""}`;

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {imgSrc && (
                                                <img
                                                    src={imgSrc}
                                                    alt={itemTitle}
                                                    className="h-12 w-12 rounded-lg object-cover border shrink-0"
                                                />
                                            )}
                                            <span className="text-[#6f4e37]">
                                                {itemTitle} ×{item.quantity}
                                            </span>
                                        </div>
                                        <span className="font-medium shrink-0">
                                            {Number(lineTotal).toLocaleString()}đ
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <hr className="my-4" />

                        <div className="flex justify-between font-medium">
                            <span>Tạm tính</span>
                            <span className="text-[#6f4e37] font-bold">
                                {totalPrice.toLocaleString()}đ
                            </span>
                        </div>

                        <hr className="my-4" />

                        <div className="flex justify-between text-lg">
                            <span className="font-medium">Tổng</span>
                            <span className="text-xl font-bold text-[#6f4e37]">
                                {grandTotal.toLocaleString()}đ
                            </span>
                        </div>

                        <div className="mt-6 rounded-lg border p-4">
                            {PAYMENT_OPTIONS.map((option) => (
                                <div key={option.value}>
                                    <label className="flex items-center gap-3 py-2">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={option.value}
                                            checked={paymentMethod === option.value}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span>{option.label}</span>
                                    </label>

                                    {paymentMethod === option.value && (
                                        <div className="mb-2 rounded bg-[#6f4e37]/10 p-3 text-sm text-gray-600">
                                            {option.description}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {errors.paymentMethod && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.paymentMethod}
                                </p>
                            )}
                        </div>

                        <p className="mt-6 text-sm text-gray-500">
                            Dữ liệu cá nhân của bạn sẽ được sử dụng để xử lý đơn đặt hàng, hỗ
                            trợ trải nghiệm của bạn trên trang web này và cho các mục đích
                            khác được mô tả trong{" "}
                            <span className="cursor-pointer font-medium text-[#6f4e37] underline">
                                Chính sách bảo mật
                            </span>{" "}
                            của chúng tôi.
                        </p>

                        {submitError && (
                            <p className="mt-4 text-sm text-red-600">{submitError}</p>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                disabled={submitting || !hasItems}
                                onClick={handlePlaceOrder}
                                className="rounded-lg bg-[#6f4e37] px-8 py-3 font-semibold text-white underline underline-offset-4 transition hover:bg-[#5c4033] disabled:opacity-60"
                            >
                                {submitting ? "Đang xử lý..." : "Đặt Hàng"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;