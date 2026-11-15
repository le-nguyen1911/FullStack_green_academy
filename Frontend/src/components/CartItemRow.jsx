import { Link } from "react-router-dom";
import { formatVND } from "../util/format";
import QuantityStepper from "./QuantityStepper";

export default function CartItemRow({
  item,
  selected,
  busy,
  onToggle,
  onQuantity,
  onRemove,
}) {
  const soldOut = item.stock === 0;
  const tooMany = item.stock > 0 && item.quantity > item.stock;

  return (
    <li
      className={`flex gap-4 p-4 items-center rounded-2xl border mt-2 hover:border-amber-900! transition-all duration-300 ease-in-out ${busy ? "opacity-60" : ""}`}
    >
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 roundedd-full! "
        checked={selected}
        disabled={!item.purchasable || busy}
        onChange={onToggle}
        aria-label={`Chọn ${item.product_name}`}
      />

      <Link to={`/products/${item.product_id}`} className="shrink-0">
        <img
          src={item.image_url}
          alt=""
          className="w-20 h-20 object-contain border rounded bg-white w_160,f_auto,q_auto"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${item.product_id}`}
          className="block font-medium text-stone-800! no-underline! hover:text-amber-900 line-clamp-2"
        >
          {item.product_name}
        </Link>
        <p className="text-sm text-stone-500">{item.variant_name}</p>
        <p className="text-sm text-red-700 font-semibold mt-1">
          {formatVND(item.price)}
        </p>

        {!item.available && (
          <p className="text-sm text-red-600 mt-1">
            Sản phẩm đã ngừng bán, hãy xóa khỏi giỏ
          </p>
        )}
        {item.available && soldOut && (
          <p className="text-sm text-red-600 mt-1">Hết hàng</p>
        )}
        {item.available && tooMany && (
          <p className="text-sm text-amber-700 mt-1">
            Kho chỉ còn {item.stock}.{" "}
            <button
              onClick={() => onQuantity(item.stock)}
              disabled={busy}
              className="underline"
            >
              Giảm còn {item.stock}
            </button>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 mt-3">
          <QuantityStepper
            value={item.quantity}
            max={item.available ? item.max_quantity : 0}
            disabled={busy}
            onChange={onQuantity}
          />
        </div>
      </div>

      <div className="text-right font-semibold w-28 shrink-0">
        {item.purchasable ? formatVND(item.line_total) : "—"}
      </div>
      <button
        onClick={onRemove}
        disabled={busy}
        className=" text-red-600 underline"
      >
        <i class="pi pi-trash text-xl!"></i>
      </button>
    </li>
  );
}
