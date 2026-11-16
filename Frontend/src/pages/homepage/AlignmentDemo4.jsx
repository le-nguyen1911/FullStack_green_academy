import { useState, useRef, useEffect } from "react";
import { Carousel } from "@primereact/ui/carousel";
import styles from './Homepage.module.css';
import galaxy1 from "../../assets/Coffeeflavor/galaxy-1.png";
import galaxy2 from "../../assets/Coffeeflavor/galaxy-2.png";
import galaxy3 from "../../assets/Coffeeflavor/galaxy-3.png";
import galaxy4 from "../../assets/Coffeeflavor/galaxy-4.png";
import galaxy5 from "../../assets/Coffeeflavor/galaxy-5.png";
import galaxy6 from "../../assets/Coffeeflavor/galaxy-6.png";
import galaxy7 from "../../assets/Coffeeflavor/galaxy-7.png";
import galaxy8 from "../../assets/Coffeeflavor/galaxy-8.png";

export default function AlignmentDemoStatic() {
    const [page, setPage] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Tổng số bước lướt ở mobile là 6, desktop là 3
    const TOTAL_STEPS = isMobile ? 6 : 3;

    const isDragging = useRef(false);
    const startX = useRef(0);

    const staticProducts = [
        { id: 1, name: "Cold Brew", image: galaxy1 },
        { id: 2, name: "Kalita Wave", image: galaxy2 },
        { id: 3, name: "Chemex", image: galaxy3 },
        { id: 4, name: "Espresso", image: galaxy4 },
        { id: 5, name: "Pour-Over", image: galaxy5 },
        { id: 6, name: "Flash Brew", image: galaxy6 },
        { id: 7, name: "Máy pha tự động", image: galaxy7 },
        { id: 8, name: "Hario V60", image: galaxy8 },
    ];

    const responsiveOptions = [
        { breakpoint: "1200px", numVisible: 6, numScroll: 1 },
        { breakpoint: "992px", numVisible: 6, numScroll: 1 },
        { breakpoint: "768px", numVisible: 2, numScroll: 1 }, // Đã chỉnh numVisible thành 3 trên thiết bị di động
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

    const productTemplate = (product) => (
        <div className={styles.imgBox} style={{ padding: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "transparent" }}>
                <div
                    style={{
                        width: "160px",
                        height: "160px",
                        borderRadius: "50%",
                        backgroundColor: "#FFF8EE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        padding: "10px"
                    }}
                >
                    <img
                        className={styles.items}
                        src={product.image}
                        alt={product.name}
                        style={{
                            userSelect: "none",
                            pointerEvents: "none",
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                        }}
                    />
                </div>
                <h4 style={{ fontSize: "1.05rem", marginTop: "12px", textAlign: "center", fontWeight: "600", color: "#333" }}>
                    {product.name}
                </h4>
            </div>
        </div>
    );

    const handlePrev = () => {
        setPage((prevPage) => (prevPage === 0 ? TOTAL_STEPS - 1 : prevPage - 1));
    };

    const handleNext = () => {
        setPage((prevPage) => (prevPage === TOTAL_STEPS - 1 ? 0 : prevPage + 1));
    };

    return (
      <section className="container p-0">
        <div className="mb-5 text-center">
          <h1>KHÁM PHÁ HƯƠNG VỊ CÀ PHÊ ĐA DẠNG</h1>
          <h6 className="text-muted mt-2">
            Tìm hiểu những kiến ​​thức cơ bản về pha cà phê, bao gồm các phương
            pháp pha cà phê khác nhau.
          </h6>
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
            slidesPerPage={6}
            page={page}
            onPageChange={(e) => setPage(e.page)}
          >
            <Carousel.Content>
              {staticProducts.map((product) => (
                <Carousel.Item key={product.id}>
                  {productTemplate(product)}
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