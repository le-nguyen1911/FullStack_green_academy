import { useEffect, useState } from "react";
import { useUser } from "../../hooks/UserContext";
import api from "../../util/axios";
import { cld } from "../../util/image";
import { formatVND } from "../../util/format";
import { Stepper } from "@primereact/ui/stepper";
import { Button } from "@primereact/ui/button";
import { Dialog } from "@primereact/ui/dialog";
import "./style/OrderStyle.css";

const parseImageList = (rawImages) => {
  if (Array.isArray(rawImages)) return rawImages;
  if (typeof rawImages === "string") {
    const trimmed = rawImages.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [];
      }
    }
    return [trimmed];
  }
  return [];
};

const getProductImage = (item, matchedProduct) => {
  const productImages = parseImageList(
    matchedProduct?.images ?? matchedProduct?.product_images,
  );
  const firstProductImg = productImages[0];

  const raw =
    item?.image_url ||
    item?.image ||
    item?.thumbnail ||
    (typeof firstProductImg === "object"
      ? firstProductImg?.url || firstProductImg?.image_url || firstProductImg?.src
      : firstProductImg) ||
    matchedProduct?.image_url ||
    matchedProduct?.image ||
    matchedProduct?.thumbnail ||
    "";

  if (!raw || typeof raw !== "string") {
    return "https://placehold.co/120x120?text=No+Image";
  }

  const clean = raw.trim();
  if (!clean || clean === "[" || clean === "]") {
    return "https://placehold.co/120x120?text=No+Image";
  }
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }
  try {
    return cld(clean, "w_120,f_auto,q_auto") || clean;
  } catch {
    return clean;
  }
};

const extractVariantsList = (source) => {
  if (!source || typeof source !== "object") return [];
  if (Array.isArray(source.variants)) return source.variants;
  if (Array.isArray(source.product_variants)) return source.product_variants;
  if (Array.isArray(source.data?.variants)) return source.data.variants;
  if (Array.isArray(source.data?.product_variants)) {
    return source.data.product_variants;
  }
  return [];
};

const getMatchedVariant = (item, product) => {
  const variants = extractVariantsList(product);

  const itemVariantId =
    item?.variant_id ??
    item?.product_variant_id ??
    item?.variant?.id ??
    null;

  if (itemVariantId != null && itemVariantId !== "") {
    const byId = variants.find((v) => String(v.id) === String(itemVariantId));
    if (byId) return byId;
  }

  const itemVariantLabel = String(
    item?.variant_name ||
    item?.variant_title ||
    item?.option_name ||
    item?.variant?.variant_name ||
    item?.variant?.name ||
    "",
  ).trim();

  if (itemVariantLabel) {
    const lowerLabel = itemVariantLabel.toLowerCase();
    const byName = variants.find((v) => {
      const vName = String(
        v.variant_name || v.name || v.title || v.label || "",
      ).toLowerCase();
      return (
        vName && (vName.includes(lowerLabel) || lowerLabel.includes(vName))
      );
    });
    if (byName) return byName;
  }

  return null;
};

const getVariantLabel = (item, product) => {
  const matchedVariant = getMatchedVariant(item, product);
  return (
    item?.variant_name ||
    item?.variant_title ||
    item?.option_name ||
    item?.variant?.variant_name ||
    item?.variant?.name ||
    matchedVariant?.variant_name ||
    matchedVariant?.name ||
    matchedVariant?.title ||
    ""
  );
};

const getVariantWeightGram = (item, product) => {
  const variant = getMatchedVariant(item, product);

  const raw =
    item?.weight_grams ??
    item?.variant?.weight_grams ??
    variant?.weight_grams ??
    variant?.weight_gram ??
    variant?.weight ??
    item?.weight_gram ??
    null;

  if (raw != null && raw !== "" && !Number.isNaN(Number(raw))) {
    const num = Number(raw);
    return num > 0 ? `${num}g` : "—";
  }

  const text = [
    item?.variant_name,
    variant?.variant_name,
    variant?.name,
    item?.product_name,
    product?.name,
  ]
    .filter(Boolean)
    .join(" ");

  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(?:g|gram|grams)\b/i);
  return match ? `${match[1].replace(",", ".")}g` : "—";
};

const Order = () => {
  const userCtx = useUser();
  const user =
    userCtx?.user ??
    (() => {
      try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productDetailsMap, setProductDetailsMap] = useState({});
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

  const getOrderDate = (order) => order?.order_date || order?.created_at || "";

  const fetchProductVariantsForItems = async (items = []) => {
    const productIds = [
      ...new Set(
        items
          .map((item) => item?.product_id)
          .filter((id) => id != null && id !== ""),
      ),
    ];

    const missingIds = productIds.filter((id) => !productDetailsMap[String(id)]);
    if (missingIds.length === 0) return;

    const results = await Promise.all(
      missingIds.map(async (id) => {
        try {
          const res = await api.get(`products/${id}`);
          const detail =
            res?.data?.data?.product || res?.data?.data || res?.data;
          let variants = extractVariantsList(detail);

          if (variants.length === 0) {
            for (const vUrl of [
              `products/${id}/variants`,
              `product-variants?product_id=${id}`,
            ]) {
              try {
                const vRes = await api.get(vUrl);
                const vPayload = vRes?.data?.data ?? vRes?.data;
                const vList = Array.isArray(vPayload?.items)
                  ? vPayload.items
                  : Array.isArray(vPayload)
                    ? vPayload
                    : [];
                if (vList.length > 0) {
                  variants = vList;
                  break;
                }
              } catch { }
            }
          }

          return [
            String(id),
            detail && typeof detail === "object"
              ? { ...detail, variants }
              : { variants },
          ];
        } catch {
          return [String(id), null];
        }
      }),
    );

    setProductDetailsMap((prev) => {
      const next = { ...prev };
      for (const [id, detail] of results) {
        if (detail && typeof detail === "object") {
          next[id] = detail;
        }
      }
      return next;
    });
  };

  const openOrderDetail = async (order) => {
    setSelectedOrder(order);
    setShowModal(true);

    let currentItems = Array.isArray(order?.items) ? order.items : [];

    try {
      const detailRes = await api.get(`orders/${order.id}`);
      const detailData = detailRes?.data?.data || detailRes?.data;
      if (detailData && typeof detailData === "object") {
        const apiItems =
          detailData.items || detailData.order_items || detailData.data?.items;
        if (Array.isArray(apiItems) && apiItems.length > 0) {
          currentItems = apiItems;
        }
        setSelectedOrder((prev) => ({
          ...prev,
          ...detailData,
          items: currentItems,
        }));
      }
    } catch (error) {
      console.log(error);
    }

    if (currentItems.length > 0) {
      await fetchProductVariantsForItems(currentItems);
    }
  };

  const hanlerCancelOrder = async (id) => {
    try {
      await api.patch(`orders/${id}`, {
        status: "cancelled",
        order_status: "CANCELLED",
      });

      setOrders((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "cancelled", order_status: "CANCELLED" }
            : item,
        ),
      );

      setSelectedOrder((prev) =>
        prev
          ? { ...prev, status: "cancelled", order_status: "CANCELLED" }
          : prev,
      );

      setShowModalCancel(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handlerReceiveOrder = async (id) => {
    try {
      await api.patch(`orders/${id}`, {
        status: "delivered",
        order_status: "DELIVERED",
      });

      setOrders((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "delivered", order_status: "DELIVERED" }
            : item,
        ),
      );

      setSelectedOrder((prev) =>
        prev
          ? { ...prev, status: "delivered", order_status: "DELIVERED" }
          : prev,
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let orderList = [];
        for (const endpoint of ["orders/my-orders", "orders"]) {
          try {
            const res = await api.get(endpoint);
            const payload = res?.data?.data ?? res?.data;
            const list = Array.isArray(payload?.items)
              ? payload.items
              : Array.isArray(payload)
                ? payload
                : [];
            orderList =
              endpoint === "orders" && user?.id
                ? list.filter(
                  (o) => !o.user_id || String(o.user_id) === String(user.id),
                )
                : list;
            if (orderList.length > 0 || endpoint === "orders") break;
          } catch { }
        }
        setOrders(orderList);

        try {
          const productRes = await api.get("products");
          const pData =
            productRes?.data?.data?.items ??
            productRes?.data?.data ??
            productRes?.data ??
            [];
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
                const rawSt = order.order_status || order.status;
                const normSt = normalizeStatus(rawSt);
                const status = getStatus(rawSt);
                const totalAmt = Number(order.total_amount || 0);
                const orderDate = getOrderDate(order);

                return (
                  <tr key={order.id} className="border-b!">
                    <td className="px-3 md:px-6 py-5 text-center font-semibold">
                      {order.order_code || `#${order.id}`}
                    </td>

                    <td className="hidden sm:table-cell px-3 md:px-6 py-5 text-center">
                      {orderDate
                        ? new Date(orderDate).toLocaleDateString("vi-VN")
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
                      Chi tiết đơn hàng{" "}
                      {selectedOrder?.order_code || `#${selectedOrder?.id}`}
                    </Dialog.Title>

                    <Dialog.HeaderActions>
                      <Dialog.Close className="cursor-pointer" />
                    </Dialog.HeaderActions>
                  </Dialog.Header>

                  <Dialog.Content className="p-6">
                    {selectedOrder && (
                      <>
                        <Stepper.Root
                          value={getStep(
                            selectedOrder.order_status || selectedOrder.status,
                          )}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold">Thông tin đơn hàng</h3>
                            <p>
                              <b>Mã đơn:</b>{" "}
                              {selectedOrder.order_code || `#${selectedOrder.id}`}
                            </p>
                            {(selectedOrder.shoppers ||
                              selectedOrder.recipient_name ||
                              selectedOrder.user_name) && (
                                <p>
                                  <b>Người nhận:</b>{" "}
                                  {selectedOrder.shoppers ||
                                    selectedOrder.recipient_name ||
                                    selectedOrder.user_name}
                                </p>
                              )}
                            {(selectedOrder.phone || selectedOrder.recipient_phone) && (
                              <p>
                                <b>Số điện thoại:</b>{" "}
                                {selectedOrder.phone || selectedOrder.recipient_phone}
                              </p>
                            )}
                            <p>
                              <b>Ngày đặt:</b>{" "}
                              {getOrderDate(selectedOrder)
                                ? new Date(
                                  getOrderDate(selectedOrder),
                                ).toLocaleDateString("vi-VN")
                                : ""}
                            </p>
                            <p>
                              <b>Địa chỉ:</b> {selectedOrder.shipping_address}
                            </p>
                            <p>
                              <b>Email:</b> {selectedOrder.shopping_email}
                            </p>
                            <p>
                              <b>Ghi Chú:</b> {selectedOrder.shopping_notes}
                            </p>
                            <p>
                              <b>Thanh toán:</b>{" "}
                              {selectedOrder.payment_method ||
                                (selectedOrder.payment_method_id ? "COD" : "COD")}{" "}
                              {selectedOrder.payment_status
                                ? `(${selectedOrder.payment_status})`
                                : ""}
                            </p>
                            <p>
                              <b>Tổng tiền:</b>{" "}
                              <span className="text-red-500 font-bold">
                                {formatVND(selectedOrder.total_amount || 0)}
                              </span>
                            </p>
                          </div>

                          <div className="space-y-3">
                            {(selectedOrder.items || []).map((item, idx) => {
                              const catalogMatch =
                                products.find(
                                  (p) =>
                                    item.product_id != null &&
                                    String(p.id) === String(item.product_id),
                                ) ||
                                products.find(
                                  (p) =>
                                    item.product_name &&
                                    p.name?.toLowerCase() ===
                                    String(item.product_name).toLowerCase(),
                                );
                              const detailMatch =
                                item.product_id != null
                                  ? productDetailsMap[String(item.product_id)]
                                  : null;
                              const matchedProduct = {
                                ...catalogMatch,
                                ...detailMatch,
                                variants:
                                  extractVariantsList(detailMatch).length > 0
                                    ? extractVariantsList(detailMatch)
                                    : extractVariantsList(catalogMatch),
                              };

                              const imgSrc = getProductImage(item, matchedProduct);
                              const variantLabel = getVariantLabel(item, matchedProduct);
                              const weightGram = getVariantWeightGram(item, matchedProduct);
                              const productTitle =
                                item.product_name || matchedProduct?.name || "Sản phẩm";
                              const lineTotal =
                                item.subtotal ??
                                Number(item.unit_price ?? item.price ?? 0) *
                                Number(item.quantity || 1);

                              return (
                                <div
                                  key={item.id || item.product_id || idx}
                                  className="flex items-center justify-between gap-3 rounded-xl border p-3 text-xs"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={imgSrc}
                                      alt={productTitle}
                                      className="h-16 w-16 rounded-lg object-cover border shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <h4 className="font-semibold text-sm truncate">
                                        {productTitle}
                                      </h4>
                                      {variantLabel && (
                                        <p className="text-[11px] text-stone-600 mt-0.5 truncate">
                                          {variantLabel}
                                        </p>
                                      )}
                                      <p className="text-xs text-stone-700 mt-1">
                                        Số lượng: <b>{item.quantity}</b>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <p className="text-[#6f4e37] font-bold text-xs">
                                      {formatVND(lineTotal)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
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