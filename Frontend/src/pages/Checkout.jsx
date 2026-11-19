import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useAuth";
import axios from "axios";

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

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUser();

    const { carts = [], products = [], totalPrice = 0 } = location.state || {};

    const grandTotal = totalPrice;

    const [nameParts] = useState(() => {
        const parts = (user?.full_name || "").trim().split(/\s+/);
        const lastName = parts.slice(0, -1).join(" ");
        const firstName = parts.slice(-1).join(" ");
        return { firstName: parts.length > 1 ? firstName : "", lastName };
    });

    const [form, setForm] = useState({
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        address: user?.address || "",
        phone: user?.phone || "",
        email: user?.email || "",
        note: "",
    });
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const hasItems = carts.some((cart) => cart.items?.length > 0);

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.firstName.trim()) newErrors.firstName = "Vui lòng nhập tên";
        if (!form.lastName.trim()) newErrors.lastName = "Vui lòng nhập họ";
        if (!form.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";
        if (!form.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
        if (!form.email.trim()) newErrors.email = "Vui lòng nhập địa chỉ email";
        if (!paymentMethod)
            newErrors.paymentMethod = "Vui lòng chọn phương thức thanh toán";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!validate()) return;

        setSubmitting(true);
        try {
            const orderItems = carts.flatMap((cart) => cart.items);
            const fullName = `${form.lastName} ${form.firstName}`.trim();
            const addressParts = [
                `Người nhận: ${fullName}`,
                `SĐT: ${form.phone}`,
                `Email: ${form.email}`,
                `Địa chỉ: ${form.address}`,
            ];
            if (form.note.trim()) {
                addressParts.push(`Ghi chú: ${form.note.trim()}`);
            }
            const shippingAddress = addressParts.join(" - ");

            const payload = {
                user_id: user?.id,
                items: orderItems,
                total_amount: totalPrice,
                currency: "VND",
                status: "pending",
                payment_method: paymentMethod,
                shipping_address: shippingAddress,
                created_at: new Date().toISOString(),
                delivered_at: null,
            };

            await axios.post("orders", payload);

            await Promise.all(carts.map((cart) => axios.delete(`cart/${cart.id}`)));

            navigate("/account/orders");
        } catch (err) {
            console.error("Lỗi khi đặt hàng:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!hasItems) {
        return (
            <div className="min-h-screen bg-gray-50 py-10 text-center">
                <p>Không có dữ liệu giỏ hàng để thanh toán.</p>
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

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block font-medium">
                                    Tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.firstName}
                                    onChange={handleChange("firstName")}
                                    className="h-12 w-full rounded-lg border px-4 outline-none focus:border-[#6f4e37]"
                                />
                                {errors.firstName && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block font-medium ">
                                    Họ <span className="text-red-500">*</span>
                                </label>

                                <input
                                    value={form.lastName}
                                    onChange={handleChange("lastName")}
                                    className="h-12 w-full rounded-lg border px-4 outline-none focus:border-[#6f4e37]"
                                />
                                {errors.lastName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                                )}
                            </div>
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
                                    Địa chỉ email <span className="text-red-500">*</span>
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

                    {/* Right - Đơn hàng của bạn */}
                    <div className="h-fit rounded-2xl border bg-white p-8">
                        <h2 className="mb-6 text-2xl font-bold">Đơn Hàng Của Bạn</h2>

                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Sản phẩm</span>
                            <span>Tạm tính</span>
                        </div>

                        <div className="mt-4 space-y-4">
                            {carts.map((cart) =>
                                cart.items.map((item) => {
                                    const product = products.find(
                                        (p) => p.id === item.product_id,
                                    );

                                    return (
                                        <div
                                            key={`${cart.id}-${item.product_id}`}
                                            className="flex justify-between"
                                        >
                                            <span className="text-[#6f4e37]">
                                                {product?.name || "Sản phẩm"} ×{item.quantity}
                                            </span>
                                            <span className="font-medium">
                                                {(item.price * item.quantity).toLocaleString()}đ
                                            </span>
                                        </div>
                                    );
                                }),
                            )}
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

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                disabled={submitting}
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
