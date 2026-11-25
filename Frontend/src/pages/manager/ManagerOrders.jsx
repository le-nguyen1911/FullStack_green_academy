import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchManagerProducts,
  fetchOptions,
} from "../../redux/slices/managerProductSlice";
import api from "../../util/axios";
import { cld } from "../../util/image";
import { formatVND } from "../../util/format";
import Notice from "@/components/manager/Notice";
import Pagination from "@/components/Panigation";
import "@fortawesome/fontawesome-free/css/all.min.css";

const LIMIT = 10;
const SORTS = [
  { value: "newest", label: "Mới nhất" },
  { value: "name_asc", label: "Tên A đến Z" },
  { value: "name_desc", label: "Tên Z đến A" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "rating_desc", label: "Đánh giá cao nhất" },
];

const getOrderTotalRaw = (order) =>
  order?.total_amount ??
  order?.total ??
  order?.grand_total ??
  order?.final_amount ??
  order?.amount ??
  null;

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

export default function ManagerOrders() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const query = params.toString();

  const productList = useSelector((s) => s.managerProducts.list);
  const { categories, brands } = useSelector((s) => s.managerProducts.options);
  const catalogProducts = Array.isArray(productList?.items)
    ? productList.items
    : [];

  const [keyword, setKeyword] = useState(params.get("q") || "");
  const [price, setPrice] = useState({
    min: params.get("min_price") || "",
    max: params.get("max_price") || "",
  });
  const [filterError, setFilterError] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [orderPagination, setOrderPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [productDetailsMap, setProductDetailsMap] = useState({});

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

  const fetchOrders = async (signal) => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const rawParams = Object.fromEntries(new URLSearchParams(query));
      const requestedPage = Math.max(1, Number(rawParams.page) || 1);

      const requestParams = {
        ...rawParams,
        page: requestedPage,
        limit: LIMIT,
      };
      Object.keys(requestParams).forEach((key) => {
        if (requestParams[key] === "" || requestParams[key] == null) {
          delete requestParams[key];
        }
      });

      const res = await api.get("orders", {
        params: requestParams,
        signal,
      });

      const root = res?.data ?? {};
      const payload =
        root?.data && typeof root.data === "object" && !Array.isArray(root.data)
          ? root.data
          : root;

      const rawList = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.orders)
          ? payload.orders
          : Array.isArray(payload?.rows)
            ? payload.rows
            : Array.isArray(payload)
              ? payload
              : Array.isArray(root?.data)
                ? root.data
                : [];

      const totalFromApi =
        payload?.total ??
        payload?.totalItems ??
        payload?.total_items ??
        payload?.totalCount ??
        payload?.total_count ??
        payload?.count ??
        payload?.pagination?.total ??
        payload?.pagination?.totalItems ??
        payload?.meta?.total ??
        root?.total ??
        root?.pagination?.total ??
        root?.meta?.total;

      const totalPagesFromApi =
        payload?.totalPages ??
        payload?.total_pages ??
        payload?.lastPage ??
        payload?.last_page ??
        payload?.pagination?.totalPages ??
        payload?.pagination?.total_pages ??
        payload?.meta?.totalPages ??
        payload?.meta?.total_pages ??
        root?.totalPages ??
        root?.total_pages;

      const isFullUnpaginatedArray =
        rawList.length > LIMIT && totalFromApi == null && totalPagesFromApi == null;

      const total =
        totalFromApi != null ? Number(totalFromApi) || 0 : rawList.length;

      const totalPages = Math.max(
        1,
        totalPagesFromApi != null
          ? Number(totalPagesFromApi) || 1
          : Math.ceil(total / LIMIT),
      );

      const safePage = Math.min(Math.max(1, requestedPage), totalPages);

      const visibleOrders = isFullUnpaginatedArray
        ? rawList.slice((safePage - 1) * LIMIT, safePage * LIMIT)
        : rawList;

      setOrders(visibleOrders);
      setOrderPagination({
        page:
          Number(
            payload?.page ??
            payload?.currentPage ??
            payload?.current_page ??
            payload?.pagination?.page ??
            safePage,
          ) || safePage,
        totalPages,
        total,
      });
    } catch (error) {
      if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
        console.log(error);
        setOrdersError(
          error?.response?.data?.message || "Không thể tải danh sách đơn hàng",
        );
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  const openOrderDetail = async (order) => {
    if (!order?.id) return;
    setSelectedOrder(order);
    setShowOrderModal(true);

    let currentItems =
      order?.items || order?.order_items || order?.data?.items || [];

    const candidateUrls = [
      `orders/${order.id}`,
      `orders/detail/${order.id}`,
      `orders/admin/${order.id}`,
    ];

    for (const url of candidateUrls) {
      try {
        const detailRes = await api.get(url);
        const detailData = detailRes?.data?.data || detailRes?.data;
        if (detailData && typeof detailData === "object") {
          const apiItems =
            detailData.items || detailData.order_items || detailData.data?.items;
          if (Array.isArray(apiItems) && apiItems.length > 0) {
            currentItems = apiItems;
          }
          setSelectedOrder((prev) => ({
            ...prev,
            ...(detailData.order && typeof detailData.order === "object"
              ? detailData.order
              : {}),
            ...detailData,
            items: currentItems,
          }));
          break;
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          console.log(error);
          break;
        }
      }
    }

    if (Array.isArray(currentItems) && currentItems.length > 0) {
      await fetchProductVariantsForItems(currentItems);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [query]);

  useEffect(() => {
    dispatch(fetchOptions());
  }, [dispatch]);

  const loadProductsCatalog = () =>
    dispatch(
      fetchManagerProducts({
        limit: 100,
      }),
    );

  useEffect(() => {
    loadProductsCatalog();
  }, [dispatch]);

  useEffect(() => {
    const p = new URLSearchParams(query);
    setKeyword(p.get("q") || "");
    setPrice({ min: p.get("min_price") || "", max: p.get("max_price") || "" });
    setFilterError("");
  }, [query]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) =>
      v === "" || v == null ? next.delete(k) : next.set(k, v),
    );
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  };

  const applyPrice = () => {
    const min = price.min === "" ? null : Number(price.min);
    const max = price.max === "" ? null : Number(price.max);
    if (
      (min !== null && (Number.isNaN(min) || min < 0)) ||
      (max !== null && (Number.isNaN(max) || max < 0))
    )
      return setFilterError("Giá phải là số không âm");
    if (min !== null && max !== null && min > max)
      return setFilterError("Giá thấp nhất không được lớn hơn giá cao nhất");
    setFilterError("");
    update({ min_price: price.min, max_price: price.max });
  };

  const hasFilter = [...params.keys()].some((k) => k !== "page");

  return (
    <div>
      <div className="mb-4 flex items-center">
        <h2 className="text-xl font-semibold">Quản lý đơn hàng</h2>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: keyword.trim() });
          }}
          className="flex"
        >
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên..."
            className="rounded-l border px-3 py-2 outline-none"
          />
          <button className="rounded-r bg-amber-900 px-4 text-white">
            Tìm
          </button>
        </form>

        <select
          value={params.get("status") || "all"}
          onChange={(e) =>
            update({ status: e.target.value === "all" ? "" : e.target.value })
          }
          className="rounded border px-3 py-2"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Đang xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang vận chuyển</option>
          <option value="delivered">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <select
          value={params.get("category_id") || ""}
          onChange={(e) => update({ category_id: e.target.value })}
          className="rounded border px-3 py-2"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={params.get("brand_id") || ""}
          onChange={(e) => update({ brand_id: e.target.value })}
          className="rounded border px-3 py-2"
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={params.get("sort") || "newest"}
          onChange={(e) => update({ sort: e.target.value })}
          className="rounded border px-3 py-2"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            placeholder="Giá từ"
            value={price.min}
            onChange={(e) => setPrice({ ...price, min: e.target.value })}
            className="w-28 rounded border px-2 py-2"
          />
          <span>–</span>
          <input
            type="number"
            min="0"
            placeholder="đến"
            value={price.max}
            onChange={(e) => setPrice({ ...price, max: e.target.value })}
            className="w-28 rounded border px-2 py-2"
          />
          <button
            onClick={applyPrice}
            className="rounded bg-amber-900 px-3 py-2 text-white"
          >
            Lọc giá
          </button>
        </div>

        {hasFilter && (
          <button
            onClick={() => setParams({})}
            className="text-sm text-amber-900 underline"
          >
            Xóa bộ lọc
          </button>
        )}
        <span className="ml-auto text-sm text-stone-500">
          {orderPagination.total} đơn hàng
        </span>
      </div>

      <Notice type="error">{filterError}</Notice>
      <Notice type={msg.type}>{msg.text}</Notice>
      {ordersError && (
        <p className="mb-3 text-red-600">
          {ordersError}{" "}
          <button onClick={() => fetchOrders()} className="underline">
            Thử lại
          </button>
        </p>
      )}

      <div
        className={`overflow-x-auto rounded-lg border bg-white ${ordersLoading ? "opacity-60" : ""}`}
      >
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-left">
            <tr>
              <th className="p-3">Mã đơn</th>
              <th className="p-3">Người nhận</th>
              <th className="p-3">Số điện thoại</th>
              <th className="p-3">Địa chỉ</th>
              <th className="p-3">Email</th>
              <th className="p-3">Ghi chú</th>
              <th className="p-3">Tổng tiền</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && !ordersLoading && (
              <tr>
                <td colSpan="9" className="p-6 text-center text-stone-500">
                  Không có đơn hàng
                </td>
              </tr>
            )}
            {orders.map((order) => {
              const totalVal = getOrderTotalRaw(order);
              return (
                <tr key={order.id} className="border-t">
                  <td className="p-3 font-medium">
                    {order.order_code || order.id}
                  </td>
                  <td className="p-3">
                    {order.shoppers ||
                      order.recipient_name ||
                      order.user_name ||
                      "—"}
                  </td>
                  <td className="p-3">
                    {order.phone || order.recipient_phone || "—"}
                  </td>
                  <td className="p-3">{order.shipping_address || "—"}</td>
                  <td className="p-3">
                    {order.shoppping_email || order.shopping_email || "—"}
                  </td>
                  <td className="p-3">{order.shopping_notes || "—"}</td>
                  <td className="p-3">
                    {totalVal == null ? "—" : formatVND(totalVal)}
                  </td>
                  <td className="p-3">
                    {order.order_status || order.status || "—"}
                  </td>
                  <td className="whitespace-nowrap p-3 text-right">
                    <button
                      type="button"
                      onClick={() => openOrderDetail(order)}
                      className="text-amber-900 outline"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        page={orderPagination.page}
        totalPages={orderPagination.totalPages}
        onChange={(n) => update({ page: n })}
      />

      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold">
                Chi tiết đơn hàng{" "}
                {selectedOrder.order_code || `#${selectedOrder.id}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                className="rounded border px-3 py-1 text-sm"
              >
                Đóng
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <b>Shoppers:</b>{" "}
                {selectedOrder.shoppers ||
                  selectedOrder.recipient_name ||
                  selectedOrder.user_name ||
                  "—"}
              </p>
              <p>
                <b>Số điện thoại:</b>{" "}
                {selectedOrder.phone || selectedOrder.recipient_phone || "—"}
              </p>
              <p>
                <b>Địa chỉ:</b> {selectedOrder.shipping_address || "—"}
              </p>
              <p>
                <b>Email:</b>{" "}
                {selectedOrder.shoppping_email ||
                  selectedOrder.shopping_email ||
                  "—"}
              </p>
              <p>
                <b>Ghi chú:</b> {selectedOrder.shopping_notes || "—"}
              </p>
              <p>
                <b>Tổng tiền:</b>{" "}
                {getOrderTotalRaw(selectedOrder) == null
                  ? "—"
                  : formatVND(getOrderTotalRaw(selectedOrder))}
              </p>
            </div>

            {Array.isArray(selectedOrder.items) &&
              selectedOrder.items.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <h4 className="mb-2 font-semibold">Sản phẩm trong đơn</h4>
                  <div className="space-y-2 text-sm">
                    {selectedOrder.items.map((item, idx) => {
                      const catalogMatch =
                        catalogProducts.find(
                          (p) =>
                            item.product_id != null &&
                            String(p.id) === String(item.product_id),
                        ) ||
                        catalogProducts.find(
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
                      const productTitle =
                        item.product_name || matchedProduct?.name || "Sản phẩm";

                      return (
                        <div
                          key={item.id || item.variant_id || idx}
                          className="flex items-center justify-between gap-3 rounded border p-2.5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={imgSrc}
                              alt={productTitle}
                              className="h-14 w-14 rounded-lg object-cover border shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {productTitle} × {item.quantity}
                              </p>
                              {variantLabel && (
                                <p className="inline-block mt-0.5 rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
                                  {variantLabel}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="font-semibold shrink-0">
                            {formatVND(item.subtotal ?? item.price ?? 0)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}