import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Carousel } from "@primereact/ui/carousel";
import { Button } from "@primereact/ui/button";
import { ChevronLeft } from "@primeicons/react/chevron-left";
import { ChevronRight } from "@primeicons/react/chevron-right";
import ProductCard from "./Card";

export default function RelatedProducts() {
  const { items = [], status } = useSelector((s) => s.products.related);

  const [screenSlides, setScreenSlides] = useState(4);

  useEffect(() => {
    const updateSlides = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setScreenSlides(2);
      } else if (width < 1024) {
        setScreenSlides(3);
      } else {
        setScreenSlides(4);
      }
    };
    updateSlides();
    window.addEventListener("resize", updateSlides);
    return () => {
      window.removeEventListener("resize", updateSlides);
    };
  }, []);
  if (status !== "loading" && items.length === 0) {
    return null;
  }
  const slidesPerPage = Math.min(screenSlides, Math.max(items.length, 1));
  return (
    <section className="mt-10 sm:mt-12 w-full min-w-0 ">
      <Carousel.Root
        className="w-full min-w-0"
        slidesPerPage={slidesPerPage}
        spacing={16}
        loop={false}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-stone-900">
            SẢN PHẨM LIÊN QUAN
          </h2>

          {status !== "loading" && items.length > slidesPerPage && (
            <div className="flex shrink-0 items-center gap-2">
              <Carousel.Prev
                as={Button}
                size="small"
                severity="secondary"
                variant="outlined"
                iconOnly
                aria-label="Sản phẩm trước"
                className="h-9! w-9!"
              >
                <ChevronLeft />
              </Carousel.Prev>

              <Carousel.Next
                as={Button}
                size="small"
                severity="secondary"
                variant="outlined"
                iconOnly
                aria-label="Sản phẩm tiếp theo"
                className="h-9! w-9!"
              >
                <ChevronRight />
              </Carousel.Next>
            </div>
          )}
        </div>

        {status === "loading" ? (
          <p className="py-6 text-center text-sm text-stone-500">
            Đang tải sản phẩm...
          </p>
        ) : (
          <Carousel.Content className="min-w-0 mb-2">
            {items.map((product) => (
              <Carousel.Item key={product.id} className="min-w-0">
                <ProductCard p={product} />
              </Carousel.Item>
            ))}
          </Carousel.Content>
        )}
      </Carousel.Root>
    </section>
  );
}
