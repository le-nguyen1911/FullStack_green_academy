import { useEffect, useState } from "react";
import axios from "../../util/axios";
import { Carousel } from "@primereact/ui/carousel";
import styles from "../homepage/Homepage.module.css";
import { Rating } from "@primereact/ui/rating";

export default function AlignmentDemo1() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Điện thoại: 5 lần lướt | Máy tính & Máy tính bảng: 3 lần lướt
  const TOTAL_STEPS = isMobile ? 5 : 3;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    try {
      const res = await axios.get("products/all");

      const rawItems = res.data?.items || res.data?.data || res.data;

      const formattedProducts = Array.isArray(rawItems)
        ? rawItems.map((item) => {
            let parsedImages = [];
            try {
              parsedImages =
                typeof item.images === "string"
                  ? JSON.parse(item.images)
                  : item.images;
            } catch (e) {
              parsedImages = [];
            }
            return {
              ...item,
              parsedImages: Array.isArray(parsedImages) ? parsedImages : [],
            };
          })
        : [];

      setProducts(formattedProducts);
    } catch (error) {
      console.log(error);
    }
  };
  const responsiveOptions = [
    { breakpoint: "1200px", numVisible: 4, numScroll: 1 },
    { breakpoint: "992px", numVisible: 4, numScroll: 1 },
    { breakpoint: "768px", numVisible: 2, numScroll: 1 },
  ];

  const productTemplate = (product) => {
    const primaryImg = product.parsedImages?.[0] || product.image_url;
    const hoverImg = product.parsedImages?.[1] || null;

    const displayPrice =
      product.min_price !== undefined ? product.min_price : product.price;

    return (
      <div className={styles.item}>
        <div className={styles.card}>
          <div
            className={styles.imageWrapper}
            style={{
              width: "100%",
              height: "220px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={primaryImg}
              alt={product.name}
              className={styles.defaultImage}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
            {hoverImg && (
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center border!"
                style={{
                  background: "#fff",
                  opacity: 0,
                  transition: "opacity 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
              >
                <img
                  src={hoverImg}
                  alt={product.name}
                  className={styles.hoverImage}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-3 d-flex flex-column align-items-center text-center">
            <Rating.Root value={5} readOnly allowHalf={false}>
              {Array.from({ length: 5 }, (_, index) => (
                <Rating.Option key={index} index={index}>
                  <Rating.On>
                    <i className="pi pi-star-fill text-amber-500!" />
                  </Rating.On>

                  <Rating.Off>
                    <i className="pi pi-star text-gray-300!" />
                  </Rating.Off>
                </Rating.Option>
              ))}
            </Rating.Root>

            <h4
              className={styles.name}
              style={{
                fontSize: "1rem",
                marginTop: "8px",
                minHeight: "40px",
              }}
            >
              {product.name}
            </h4>

            <h4
              className={styles.price}
              style={{ fontWeight: "bold", marginTop: "4px" }}
            >
              {typeof displayPrice === "number"
                ? displayPrice.toLocaleString("vi-VN") + "₫"
                : Number(displayPrice || 0).toLocaleString("vi-VN") + "₫"}
            </h4>
          </div>
        </div>
      </div>
    );
  };

  const handlePrev = () => {
    setPage((prevPage) => (prevPage === 0 ? TOTAL_STEPS - 1 : prevPage - 1));
  };

  const handleNext = () => {
    setPage((prevPage) => (prevPage === TOTAL_STEPS - 1 ? 0 : prevPage + 1));
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="container">
      <div>
        <h2 className="d-flex justify-content-center">SẢN PHẨM ĐÓNG GÓI</h2>
        <h6 className="d-flex justify-content-center">
          Nhâm nhi mỗi ngày với những loại cà phê đặc biệt như Arabica, Robusta,
          Espresso và nhiều hơn nữa!
        </h6>
      </div>
      <Carousel.Root
        align="start"
        loop
        slidesPerPage={isMobile ? 2 : 4}
        spacing={16}
        page={page}
        onPageChange={(e) => setPage(e.page)}
      >
        <Carousel.Content>
          {products.map((product) => (
            <Carousel.Item key={product.id}>
              {productTemplate(product)}
            </Carousel.Item>
          ))}
        </Carousel.Content>
      </Carousel.Root>

      <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
        <button
          onClick={handlePrev}
          className={styles.pagiBtn}
          aria-label="Previous"
        >
          <h1>&#8249;</h1>
        </button>

        <span className={styles.pagiText}>
          {page + 1} / {TOTAL_STEPS}
        </span>

        <button
          onClick={handleNext}
          className={styles.pagiBtn}
          aria-label="Next"
        >
          <h1>&#8250;</h1>
        </button>
      </div>
    </section>
  );
}
