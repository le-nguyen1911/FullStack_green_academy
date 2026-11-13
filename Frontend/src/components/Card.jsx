import React from "react";
import { Eye, ShoppingCart, Tags } from "@primeicons/react";
import { Button } from "@primereact/ui/button";
import { Card as PrimeCard } from "@primereact/ui/card";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatVND } from "../util/format";
import Stars from "./Stars";

const Card = ({ p }) => {
  const brands = useSelector((state) => state.products.brands.items);

  const brand = brands.find((b) => String(b.id) === String(p.brand_id));
  const hasRange = p.min_price !== p.max_price;

  return (
    <Link
      to={`/products/${p.id}`}
      className="no-underline! scale-100 transition-transform duration-300 hover:scale-102 shadow-md  "
    >
      <PrimeCard.Root className="max-w-sm mx-auto overflow-hidden">
        <PrimeCard.Header className="relative">
          <img
            className="w-full h-40 object-cover"
            alt={p.name}
            src={p.image_url}
          />
        </PrimeCard.Header>

        <PrimeCard.Body>
          <PrimeCard.Caption>
            <PrimeCard.Title className="font-bold! text-xl!">
              {p.name}
            </PrimeCard.Title>
          </PrimeCard.Caption>

          <PrimeCard.Content className="space-y-4">
            <p className="font-semibold text-red-700">
              {p.min_price == null
                ? "Liên hệ"
                : `${hasRange ? "" : ""}${formatVND(p.min_price)}`}
            </p>

            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Stars value={p.avg_rating} />
                <span>
                  <b>{p.avg_rating ?? 0}</b>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Tags />
                <span>{brand?.name || "Chưa phân loại"}</span>
              </div>
            </div>
          </PrimeCard.Content>

          <PrimeCard.Footer className="flex items-center gap-2 mt-4">
            <Button className="flex-1" severity="secondary" variant="outlined">
              <Eye />
              Xem chi tiết
            </Button>

            <Button className="flex-1 bg-[#6f4e37]!  border-none! hover:transform  hover:transition-all! duration-300">
              <ShoppingCart />
              Thêm vào giỏ
            </Button>
          </PrimeCard.Footer>
        </PrimeCard.Body>
      </PrimeCard.Root>
    </Link>
  );
};

export default Card;
