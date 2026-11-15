import { useEffect, useState, useRef } from "react";
import { Carousel } from "primereact/carousel";
import styles from "../homepage/Homepage.module.css";
import axios from "../../util/axios";

export default function AlignmentDemo() {
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        getcategories();
    }, []);

    const getcategories = async () => {
        try {
            const res = await axios.get("categories");
            const result = res.data?.data || res.data;
            setCategories(Array.isArray(result) ? result : []);
        } catch (error) {
            console.log(error);
        }
    };

    // Nếu là mobile giới hạn tối đa 5 bước lướt, ngược lại lấy theo số lượng categories thực tế (hoặc tối thiểu là 4)
    const TOTAL_STEPS = isMobile ? 5 : (categories.length > 0 ? categories.length : 4);

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
                                borderRadius: "50%"
                            }}
                        />
                        <h4 className={styles.name} style={{ fontSize: "1.2rem", marginTop: "20px" }}>{categorie.name}</h4>
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
                    value={categories}
                    itemTemplate={categorieTemplate}
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