import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Carousel } from "primereact/carousel";
import styles from "../homepage/Homepage.module.css";

export default function AlignmentDemo() {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);

    // Các Ref hỗ trợ kéo thả mượt
    const isDragging = useRef(false);
    const startX = useRef(0);
    const TOTAL_STEPS = 4;

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        try {
            const res = await axios.get("/categories");
            setProducts(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const responsiveOptions = [
        { breakpoint: "1200px", numVisible: 3, numScroll: 1 },
        { breakpoint: "992px", numVisible: 2, numScroll: 1 },
        { breakpoint: "768px", numVisible: 1, numScroll: 1 },
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

    const productTemplate = (product) => {
        return (
            <div className={styles.item}>
                <div className={styles.card}>
                    <div className={styles.imgBox}>
                        <img
                            src={product.image}
                            alt={product.name}
                            className={styles.image}
                            style={{ userSelect: "none", pointerEvents: "none" }} // Ngăn ảnh bị cản trở hành động kéo chuột
                        />
                        <h4 className={styles.name}>{product.name}</h4>
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

    if (!products || products.length === 0) return null;

    return (
        <section className="container">
            <div className="row mb-4">
                <div className="col-md-4">
                    <h2>THƠM NGON CHẤT LƯỢNG</h2>
                </div>
                <div className="col-md-8">
                    <h6>
                        Những hạt cà phê này thường được trồng theo
                        phương pháp bền vững, không sử dụng hóa chất độc hại.
                    </h6>
                </div>
            </div>

            <div
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseLeaveOrUp}
                onMouseLeave={handleMouseLeaveOrUp}
                style={{ cursor: "grab", userSelect: "none" }}
            >
                <Carousel
                    value={products}
                    itemTemplate={productTemplate}
                    numVisible={3}
                    numScroll={1}
                    circular={true}
                    responsiveOptions={responsiveOptions}
                    showIndicators={false}
                    showNavigators={false}
                    page={page}
                    onPage={(e) => setPage(e.page)}
                    touchable={true}
                />
            </div>

            <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
                <button onClick={handlePrev} className={styles.pagiBtn} aria-label="Previous">
                    <h1>&#8249;</h1>
                </button>
                <span className={styles.pagiText}>{page + 1} / {TOTAL_STEPS}</span>
                <button onClick={handleNext} className={styles.pagiBtn} aria-label="Next">
                    <h1>&#8250;</h1>
                </button>
            </div>
        </section>
    );
}