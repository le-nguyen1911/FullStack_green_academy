import { useEffect, useState } from "react";
import { useUser } from "../../hooks/UserContext";
import axios from "axios";
import { Stepper } from "@primereact/ui/stepper";
import { Dialog } from "primereact/dialog";
import { Button } from "@primereact/ui/button";
import "./style/OrderStyle.css";

const Order = () => {
    const { user } = useUser();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showModalCancel, setShowModalCancel] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const normalizeStatus = (status) => {
        const s = String(status || "").toLowerCase();
        if (s === "pending_confirmation" || s === "pending") return "pending";
        if (s === "confirmed") return "confirmed";
        if (s === "shipping") return "shipping";
        if (s === "delivered" || s === "completed") return "delivered";
        if (s === "cancelled" || s === "canceled") return "cancelled";
        return s || "pending";
    };

    const getStatus = (rawStatus) => {
        const status = normalizeStatus(rawStatus);
        switch (status) {
            case "pending":
                return {
                    text: "Đang xử lý",
                    className:
                        "border border-yellow-500 bg-yellow-50 text-yellow-600 p-[5px] rounded-2xl",
                };

            case "confirmed":
                return {
                    text: "Đã xác nhận",
                    className:
                        "border border-blue-500 bg-blue-50 text-blue-600 p-[5px] rounded-2xl",
                };

            case "shipping":
                return {
                    text: "Đang vận chuyển",
                    className:
                        "border border-purple-500 bg-purple-50 text-purple-600 p-[5px] rounded-2xl",
                };

            case "delivered":
                return {
                    text: "Giao thành công",
                    className:
                        "border border-green-500 bg-green-50 text-green-600 p-[5px] rounded-2xl",
                };

            case "cancelled":
                return {
                    text: "Đã hủy",
                    className:
                        "border border-red-500 bg-red-50 text-red-600 p-[5px] rounded-2xl",
                };

            default:
                return {
                    text: rawStatus,
                    className: "border border-gray-400 bg-gray-50 text-gray-600",
                };
        }
    };

    const getStep = (rawStatus) => {
        const status = normalizeStatus(rawStatus);
        switch (status) {
            case "pending":
                return "1";

            case "confirmed":
                return "2";

            case "shipping":
                return "3";

            case "delivered":
                return "4";

            case "cancelled":
                return "5";

            default:
                return "1";
        }
    };

    const openOrderDetail = async (order) => {
        setSelectedOrder(order);
        setShowModal(true);
        try {
            const detailRes = await axios.get(`orders/${order.id}`);
            const detailData = detailRes?.data?.data || detailRes?.data;
            if (detailData && typeof detailData === "object") {
                setSelectedOrder((prev) => ({ ...prev, ...detailData }));
            }
        } catch {
        }
    };

    const hanlerCancelOrder = async (id) => {
        try {
            await axios.patch(`orders/${id}`, {
                status: "cancelled",
                order_status: "CANCELLED",
            });

            setOrders((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, status: "cancelled", order_status: "CANCELLED" } : item,
                ),
            );

            setSelectedOrder((prev) =>
                prev ? { ...prev, status: "cancelled", order_status: "CANCELLED" } : prev,
            );

            setShowModalCancel(false);
        } catch (error) {
            console.log(error);
        }
    };

    const handlerReceiveOrder = async (id) => {
        try {
            await axios.patch(`orders/${id}`, {
                status: "delivered",
                order_status: "DELIVERED",
            });

            setOrders((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, status: "delivered", order_status: "DELIVERED" } : item,
                ),
            );

            setSelectedOrder((prev) =>
                prev ? { ...prev, status: "delivered", order_status: "DELIVERED" } : prev,
            );
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                let orderList = [];
                try {
                    const myOrdersRes = await axios.get("orders/my-orders");
                    const payload = myOrdersRes?.data?.data ?? myOrdersRes?.data;
                    orderList = Array.isArray(payload?.items)
                        ? payload.items
                        : Array.isArray(payload)
                            ? payload
                            : [];
                } catch {
                    const orderRes = await axios.get("orders");
                    const raw = orderRes?.data?.data?.items ?? orderRes?.data?.data ?? orderRes?.data ?? [];
                    orderList = Array.isArray(raw)
                        ? raw.filter((o) => !o.user_id || o.user_id === user.id)
                        : [];
                }

                setOrders(orderList);

                try {
                    const productRes = await axios.get("products");
                    const pData = productRes?.data?.data?.items ?? productRes?.data?.data ?? productRes?.data ?? [];
                    setProducts(Array.isArray(pData) ? pData : []);
                } catch {
                    setProducts([]);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [user]);

    return (
        <>
            <h3>Đơn Hàng của tôi</h3>
            {orders.length === 0 ? (
                <p className="font-bold text-xl">Bạn chưa có đơn hàng nào</p>
            ) : (
                <div className="hidden relative md:block overflow-x-auto rounded-lg border bg-white mt-2">
                    <table className="w-full">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-3 md:px-6 py-4 text-center">Đơn hàng</th>

                                <th className="hidden sm:table-cell px-3 md:px-6 py-4 text-center">
                                    Ngày
                                </th>

                                <th className="px-3 md:px-6 py-4 text-center">Trạng thái</th>

                                <th className="hidden md:table-cell px-3 md:px-6 py-4 text-center">
                                    Tổng
                                </th>

                                <th className="px-3 md:px-6 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => {
                                const rawSt = order.status || order.order_status;
                                const normSt = normalizeStatus(rawSt);
                                const status = getStatus(rawSt);
                                const totalAmt = Number(order.total_amount || 0);

                                return (
                                    <tr key={order.id} className="border-b!">
                                        <td className="px-3 md:px-6 py-5 text-center font-semibold">
                                            {order.order_code || `#${order.id}`}
                                        </td>

                                        <td className="hidden sm:table-cell px-3 md:px-6 py-5 text-center">
                                            {order.created_at
                                                ? new Date(order.created_at).toLocaleDateString("vi-VN")
                                                : ""}
                                        </td>

                                        <td className="px-3 md:px-6 py-5 text-center">
                                            <span
                                                className={`text-xs md:text-sm font-medium ${status.className}`}
                                            >
                                                {status.text}
                                            </span>
                                        </td>

                                        <td className="hidden md:table-cell px-3 md:px-6 py-5 text-center font-semibold">
                                            {totalAmt.toLocaleString()}đ
                                        </td>

                                        <td className="px-3 md:px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    className="bg-[#6f4e37]! text-white text-xs md:text-sm px-3 md:px-4 py-2 border-none!"
                                                    onClick={() => openOrderDetail(order)}
                                                >
                                                    Xem
                                                </Button>

                                                {normSt === "pending" && (
                                                    <Button
                                                        severity="danger"
                                                        className="text-xs md:text-sm px-3 md:px-4 py-2"
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setShowModalCancel(true);
                                                        }}
                                                    >
                                                        Hủy đơn
                                                    </Button>
                                                )}
                                                {normSt === "shipping" && (
                                                    <Button
                                                        severity="success"
                                                        onClick={() => handlerReceiveOrder(order.id)}
                                                    >
                                                        Xác nhận đã nhận hàng
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {showModalCancel && (
                        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50">
                            <div className="w-105 rounded-xl bg-white p-6 shadow-xl">
                                <h2 className="text-xl font-bold">Xác nhận hủy đơn</h2>

                                <p className="mt-3 text-gray-600">
                                    Bạn có chắc chắn muốn hủy đơn hàng này không?
                                </p>

                                <div className="mt-6 flex justify-end gap-3">
                                    <Button
                                        severity="secondary"
                                        onClick={() => setShowModalCancel(false)}
                                    >
                                        Không
                                    </Button>

                                    <Button
                                        severity="danger"
                                        onClick={() => hanlerCancelOrder(selectedOrder.id)}
                                    >
                                        Đồng ý
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    <Dialog.Root
                        open={showModal}
                        onOpenChange={(e) => {
                            setShowModal(e.open);
                            if (!e.open) setSelectedOrder(null);
                        }}
                    >
                        <Dialog.Portal>
                            <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50" />
                            <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <Dialog.Popup className="relative w-225 max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                                    <Dialog.Header className="flex items-center justify-between border-b px-6 py-4">
                                        <Dialog.Title className="text-xl font-bold">
                                            Chi tiết đơn hàng {selectedOrder?.order_code || `#${selectedOrder?.id}`}
                                        </Dialog.Title>

                                        <Dialog.HeaderActions>
                                            <Dialog.Close className="cursor-pointer" />
                                        </Dialog.HeaderActions>
                                    </Dialog.Header>

                                    <Dialog.Content className="p-6">
                                        {selectedOrder && (
                                            <>
                                                <Stepper.Root
                                                    value={getStep(selectedOrder.status || selectedOrder.order_status)}
                                                    className="w-full mb-8 orderStepper"
                                                >
                                                    <Stepper.List>
                                                        <Stepper.Step value="1">
                                                            <Stepper.Header>
                                                                <Stepper.Number>1</Stepper.Number>
                                                                <Stepper.Title>Đang xử lý</Stepper.Title>
                                                            </Stepper.Header>
                                                            <Stepper.Separator className={"bg-[#6f4e37]!"} />
                                                        </Stepper.Step>

                                                        <Stepper.Step value="2">
                                                            <Stepper.Header>
                                                                <Stepper.Number>2</Stepper.Number>
                                                                <Stepper.Title>Đã xác nhận</Stepper.Title>
                                                            </Stepper.Header>
                                                            <Stepper.Separator className={"bg-[#6f4e37]!"} />
                                                        </Stepper.Step>

                                                        <Stepper.Step value="3">
                                                            <Stepper.Header>
                                                                <Stepper.Number>3</Stepper.Number>
                                                                <Stepper.Title>Đang vận chuyển</Stepper.Title>
                                                            </Stepper.Header>
                                                            <Stepper.Separator className={"bg-[#6f4e37]!"} />
                                                        </Stepper.Step>

                                                        <Stepper.Step value="4">
                                                            <Stepper.Header>
                                                                <Stepper.Number>4</Stepper.Number>
                                                                <Stepper.Title>Đã giao</Stepper.Title>
                                                            </Stepper.Header>
                                                            <Stepper.Separator className={"bg-[#6f4e37]!"} />
                                                        </Stepper.Step>

                                                        <Stepper.Step value="5">
                                                            <Stepper.Header>
                                                                <Stepper.Number>5</Stepper.Number>
                                                                <Stepper.Title>Đã hủy</Stepper.Title>
                                                            </Stepper.Header>
                                                        </Stepper.Step>
                                                    </Stepper.List>
                                                </Stepper.Root>
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-bold">
                                                        Thông tin đơn hàng
                                                    </h3>
                                                    <p>
                                                        <b>Mã đơn:</b> {selectedOrder.order_code || `#${selectedOrder.id}`}
                                                    </p>
                                                    <p>
                                                        <b>Ngày đặt:</b>{" "}
                                                        {selectedOrder.created_at
                                                            ? new Date(selectedOrder.created_at).toLocaleDateString("vi-VN")
                                                            : ""}
                                                    </p>
                                                    <p>
                                                        <b>Địa chỉ:</b> {selectedOrder.shipping_address}
                                                    </p>
                                                    <p>
                                                        <b>Thanh toán:</b>{" "}
                                                        {selectedOrder.payment_method ||
                                                            (selectedOrder.payment_method_id ? "COD" : "")}
                                                    </p>
                                                    <p>
                                                        <b>Tổng tiền:</b>{" "}
                                                        <span className="text-red-500 font-bold">
                                                            {Number(selectedOrder.total_amount || 0).toLocaleString()}đ
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="mt-6 space-y-4">
                                                    {(selectedOrder.items || []).map((item) => {
                                                        const product = products.find(
                                                            (p) => p.id === item.product_id,
                                                        );
                                                        const unitPrice = Number(item.price ?? item.unit_price ?? 0);

                                                        return (
                                                            <div
                                                                key={item.id || item.product_id}
                                                                className="flex flex-col sm:flex-row gap-4 rounded-xl border p-4"
                                                            >
                                                                <img
                                                                    src={
                                                                        product?.images?.[0] ||
                                                                        product?.image_url ||
                                                                        product?.image ||
                                                                        "https://placehold.co/120x120?text=No+Image"
                                                                    }
                                                                    alt={item.product_name || product?.name || "Không có ảnh"}
                                                                    className="h-24 w-24 rounded-lg object-cover border"
                                                                />

                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-lg">
                                                                        {item.product_name || product?.name}
                                                                    </h4>
                                                                    <p>Số lượng: {item.quantity}</p>
                                                                    <p className="text-[#6f4e37] font-bold">
                                                                        {unitPrice.toLocaleString()}đ
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}
                                        <div className="flex justify-end gap-2 mt-3">
                                            <Dialog.Close as={Button} severity="secondary">
                                                Đóng
                                            </Dialog.Close>
                                        </div>
                                    </Dialog.Content>
                                </Dialog.Popup>
                            </Dialog.Positioner>
                        </Dialog.Portal>
                    </Dialog.Root>
                </div>
            )}
        </>
    );
};

export default Order;