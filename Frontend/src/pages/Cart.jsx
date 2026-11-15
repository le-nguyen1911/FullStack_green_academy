import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCart,
  deselectAll,
  fetchCart,
  removeCartItem,
  selectAll,
  selectSelectedItems,
  selectSelectedTotal,
  toggleSelect,
  updateCartItem,
} from "../redux/slices/cartSlice";
import { formatVND } from "../util/format";
import { errText } from "../util/product";
import CartItemRow from "../components/CartItemRow";
const Cart = () => {
  const dispatch = useDispatch();
  const {
    items,
    totalQuantity,
    hasIssues,
    status,
    error,
    busyIds,
    deselected,
  } = useSelector((s) => s.cart);
  const selectedItems = useSelector(selectSelectedItems);
  const selectedTotal = useSelector(selectSelectedTotal);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const purchasable = items.filter((i) => i.purchasable);
  const allSelected =
    purchasable.length > 0 && selectedItems.length === purchasable.length;

  const run = async (action) => {
    setMsg({ type: "", text: "" });
    try {
      await dispatch(action).unwrap();
    } catch (e) {
      setMsg({ type: "error", text: errText(e) });
      dispatch(fetchCart());
    }
  };

  const onClear = () => {
    if (window.confirm("Xóa toàn bộ sản phẩm trong giỏ hàng?"))
      run(clearCart());
  };

  const onCheckout = () => {
    setMsg({
      type: "success",
      text: "Chức năng thanh toán sẽ được nối ở bước tiếp theo",
    });
  };

  if (status === "loading" && items.length === 0)
    return <div className="p-10 text-center">Đang tải giỏ hàng...</div>;
  if (status === "failed" && items.length === 0)
    return (
      <div className="p-10 text-center">
        <p className="text-red-600 mb-3">{error}</p>
        <button onClick={() => dispatch(fetchCart())} className="underline">
          Thử lại
        </button>
      </div>
    );
  if (items.length === 0)
    return (
      <div className="max-w-3xl mx-auto p-10 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Giỏ hàng trống</h1>
        <Link
          to="/products"
          className="inline-block px-6 py-2 bg-amber-900 text-white rounded no-underline! "
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h4 className="text-2xl font-semibold mb-6">
        Giỏ hàng ({totalQuantity} sản phẩm)
      </h4>

      {hasIssues && (
        <p className="mb-4 p-3 rounded bg-amber-50 text-amber-800 text-sm">
          Một số sản phẩm đã hết hàng, thiếu hàng hoặc ngừng bán. Những sản phẩm
          này không được tính vào tổng tiền.
        </p>
      )}
      {msg.text && (
        <p
          className={`mb-4 p-3 rounded text-sm ${msg.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}
        >
          {msg.text}
        </p>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        <section className="bg-white  rounded-lg">
          <div className="flex items-center gap-3 p-4 ">
            <input
              type="checkbox"
              id="all"
              className="h-4 w-4"
              checked={allSelected}
              disabled={purchasable.length === 0}
              onChange={() =>
                dispatch(allSelected ? deselectAll() : selectAll())
              }
            />
            <label htmlFor="all" className="text-sm">
              Chọn tất cả ({purchasable.length})
            </label>
            <button
              onClick={onClear}
              className="ml-auto text-sm text-red-600 underline"
            >
              Xóa toàn bộ
            </button>
          </div>

          <ul>
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                selected={item.purchasable && !deselected.includes(item.id)}
                busy={busyIds.includes(item.id)}
                onToggle={() => dispatch(toggleSelect(item.id))}
                onQuantity={(q) =>
                  run(updateCartItem({ itemId: item.id, quantity: q }))
                }
                onRemove={() => run(removeCartItem({ itemId: item.id }))}
              />
            ))}
          </ul>
        </section>

        <aside className="bg-white border rounded-lg p-5 space-y-3 lg:sticky lg:top-4">
          <h2 className="font-semibold">Tóm tắt đơn hàng</h2>
          <div className="flex justify-between text-sm">
            <span>Đã chọn</span>
            <span>
              {selectedItems.reduce((n, i) => n + i.quantity, 0)} sản phẩm
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-3">
            <span>Tổng cộng</span>
            <span className="text-red-700">{formatVND(selectedTotal)}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={selectedItems.length === 0}
            className="w-full py-2 bg-amber-900 text-white rounded hover:bg-amber-800 disabled:opacity-50"
          >
            Thanh toán ({selectedItems.length})
          </button>
          <Link
            to="/products"
            className="block text-center text-sm text-amber-900 underline mt-2"
          >
            Tiếp tục mua sắm
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
