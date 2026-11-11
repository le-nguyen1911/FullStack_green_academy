import { useEffect, useState } from "react";
import axios from "axios";
import { Stepper } from "@primereact/ui/stepper";
import { Button } from "@primereact/ui/button";
import "./style/OrderStyle.css";
import { useAuth } from "@/hooks/useAuth";
const Order = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalCancel, setShowModalCancel] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getStatus = (status) => {
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
          text: status,
          className: "border border-gray-400 bg-gray-50 text-gray-600",
        };
    }
  };
  const getStep = (status) => {
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
  const hanlerCancelOrder = async (id) => {
    try {
      await axios.patch(`orders/${id}`, {
        status: "cancelled",
      });

      setOrders((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "cancelled" } : item,
        ),
      );

      setSelectedOrder((prev) => ({
        ...prev,
        status: "cancelled",
      }));

      setShowModalCancel(false);
    } catch (error) {
      console.log(error);
    }
  };
  const handlerReceiveOrder = async (id) => {
    try {
      await axios.patch(`orders/${id}`, {
        status: "delivered",
      });

      setOrders((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "delivered" } : item,
        ),
      );

      setSelectedOrder((prev) => ({
        ...prev,
        status: "delivered",
      }));
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [orderRes, productRes] = await Promise.all([
          axios.get("orders"),
          axios.get("products"),
        ]);

        setOrders(orderRes.data.filter((o) => o.user_id === user.id));

        setProducts(productRes.data);
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
                const status = getStatus(order.status);

                return (
                  <tr key={order.id} className="border-b!">
                    <td className="px-3 md:px-6 py-5 text-center font-semibold">
                      #{order.id}
                    </td>

                    <td className="hidden sm:table-cell px-3 md:px-6 py-5 text-center">
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </td>

                    <td className="px-3 md:px-6 py-5 text-center">
                      <span
                        className={`text-xs md:text-sm font-medium ${status.className}`}
                      >
                        {status.text}
                      </span>
                    </td>

                    <td className="hidden md:table-cell px-3 md:px-6 py-5 text-center font-semibold">
                      {order.total_amount.toLocaleString()}đ
                    </td>

                    <td className="px-3 md:px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          className="bg-[#6f4e37]! text-white text-xs md:text-sm px-3 md:px-4 py-2 border-none!"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                        >
                          Xem
                        </Button>

                        {order.status === "pending" && (
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
                        {order.status === "shipping" && (
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
                      Chi tiết đơn hàng #{selectedOrder?.id}
                    </Dialog.Title>

                    <Dialog.HeaderActions>
                      <Dialog.Close className="cursor-pointer" />
                    </Dialog.HeaderActions>
                  </Dialog.Header>

                  <Dialog.Content className="p-6">
                    {selectedOrder && (
                      <>
                        <Stepper.Root
                          value={getStep(selectedOrder.status)}
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
                            <b>Mã đơn:</b> #{selectedOrder.id}
                          </p>
                          <p>
                            <b>Ngày đặt:</b>{" "}
                            {new Date(
                              selectedOrder.created_at,
                            ).toLocaleDateString("vi-VN")}
                          </p>
                          <p>
                            <b>Địa chỉ:</b> {selectedOrder.shipping_address}
                          </p>
                          <p>
                            <b>Thanh toán:</b> {selectedOrder.payment_method}
                          </p>
                          <p>
                            <b>Tổng tiền:</b>{" "}
                            <span className="text-red-500 font-bold">
                              {selectedOrder.total_amount.toLocaleString()}đ
                            </span>
                          </p>
                        </div>
                        <div className="mt-6 space-y-4">
                          {selectedOrder.items.map((item) => {
                            const product = products.find(
                              (p) => p.id === item.product_id,
                            );

                            return (
                              <div
                                key={item.product_id}
                                className="flex flex-col sm:flex-row gap-4 rounded-xl border p-4"
                              >
                                <img
                                  src={
                                    product?.images?.[0] ||
                                    "https://placehold.co/120x120?text=No+Image"
                                  }
                                  alt={product?.name || "Không có ảnh"}
                                  className="h-24 w-24 rounded-lg object-cover border"
                                />

                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg">
                                    {product?.name}
                                  </h4>
                                  <p>Số lượng: {item.quantity}</p>
                                  <p className="text-[#6f4e37] font-bold">
                                    {item.price.toLocaleString()}đ
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
