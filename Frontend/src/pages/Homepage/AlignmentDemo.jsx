import { useEffect, useState, useRef } from "react";
import { Carousel } from "primereact/carousel";
import styles from "../homepage/Homepage.module.css";
import axiosClient from "../../util/axiosClient";

export default function AlignmentDemo() {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);

    const isDragging = useRef(false);
    const startX = useRef(0);
    const TOTAL_STEPS = 4;

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        try {
            const res = await axiosClient.get("categories");
            const result = res.data?.data || res.data;
            setProducts(Array.isArray(result) ? result : []);
        } catch (error) {
            console.log(error);
        }
    };

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

    const productTemplate = (product) => {
        return (
            <div className={styles.item}>
                <div className={styles.card}>
                    <div className={styles.imgBox} style={{ height: "auto" }}>
                        <img
                            src={product.image_categories}
                            alt={product.name}
                            className={styles.image}
                            style={{
                                userSelect: "none",
                                pointerEvents: "none",
                                width: "100%",
                                aspectRatio: "1 / 1",
                                objectFit: "cover",
                                borderRadius: "50%"
                            }}
                        />
                        <h4 className={styles.name} style={{ fontSize: "1rem", marginTop: "10px" }}>{product.name}</h4>
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
        <section className="container p-0">
            <div className="row mb-3 align-items-center">
                <div className="col-12 col-md-5 mb-2 mb-md-0 text-center text-md-start">
                    <h2>THƠM NGON CHẤT LƯỢNG</h2>
                </div>
                <div className="col-12 col-md-7 text-center text-md-start">
                    <h6 className="text-muted m-0">
                        Những hạt cà phê này thường được trồng theo phương pháp bền vững, không sử dụng hóa chất độc hại, tôn trọng môi trường và người lao động.
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

            <div className="d-flex align-items-center justify-content-center gap-3 mt-3">
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