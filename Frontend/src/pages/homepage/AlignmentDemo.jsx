import { useEffect, useState, useRef } from "react";
import { Carousel } from "@primereact/ui/carousel";
import styles from "../homepage/Homepage.module.css";
import axios from "../../util/axios";
import cate1 from "../../assets/categories/h28-cate4.png";
import cate2 from "../../assets/categories/h28-cate5.png";
import cate3 from "../../assets/categories/h28-cate6.png";
export default function AlignmentDemo() {
  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Cà phê Xay",
      image_categories: cate1,
    },
    {
      id: 2,
      name: "Cà phê Hạt",
      image_categories: cate2,
    },
    {
      id: 3,
      name: "Cà phê Đặc Sản ",
      image_categories: cate3,
    },
  ]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const TOTAL_STEPS = isMobile
    ? 5
    : categories.length > 0
      ? categories.length
      : 4;

  const isDragging = useRef(false);
  const startX = useRef(0);

  const responsiveOptions = [
    { breakpoint: "1200px", numVisible: 3, numScroll: 1 },
    { breakpoint: "992px", numVisible: 2, numScroll: 1 },
    { breakpoint: "576px", numVisible: 2, numScroll: 1 },
  ];

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handleMouseLeaveOrUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const diffX = e.clientX - startX.current;
    if (diffX < -40) handleNext();
    else if (diffX > 40) handlePrev();
  };

  const categorieTemplate = (categorie) => {
    return (
      <div className={styles.item}>
        <div className={styles.card}>
          <div className={styles.imgBox} style={{ height: "auto" }}>
            <img
              src={categorie.image_categories}
              alt={categorie.name}
              className={styles.image}
              style={{
                userSelect: "none",
                pointerEvents: "none",
                width: "100%",
                aspectRatio: "1 / 1",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
            <h4
              className={styles.name}
              style={{ fontSize: "1rem", marginTop: "20px" }}
            >
              {categorie.name}
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

  if (!categories || categories.length === 0) return null;

  return (
    <section className="container p-0">
      <div className="row mb-3 align-items-center">
        <div className="col-12 col-md-5 mb-2 mb-md-0 text-center text-md-start">
          <h2>THƠM NGON CHẤT LƯỢNG</h2>
        </div>
        <div className="col-12 col-md-7 text-center text-md-start">
          <h6 className="text-muted m-0">
            Những hạt cà phê này thường được trồng theo phương pháp bền vững,
            không sử dụng hóa chất độc hại, tôn trọng môi trường và người lao
            động.
          </h6>
        </div>
      </div>

      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseLeave={handleMouseLeaveOrUp}
        style={{ cursor: "grab", userSelect: "none" }}
      >
        <Carousel.Root
          align="start"
          loop
          slidesPerPage={3}
          spacing={16}
          page={page}
          D
          onPageChange={(e) => setPage(e.page)}
        >
          <Carousel.Content>
            {categories.map((category) => (
              <Carousel.Item key={category.id}>
                {categorieTemplate(category)}
              </Carousel.Item>
            ))}
          </Carousel.Content>
        </Carousel.Root>
      </div>

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
