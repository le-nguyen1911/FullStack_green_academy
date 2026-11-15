import { useState, useRef, useEffect } from "react";
import { Carousel } from "primereact/carousel";
import { Rating } from "primereact/rating";
import styles from "../homepage/Homepage.module.css";

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

    const TOTAL_STEPS = isMobile ? 5 : 3;

    const isDragging = useRef(false);
    const startX = useRef(0);

    const staticProducts = [
        {
            id: 1,
            name: "Hữu Phước",
            role: "Khách hàng",
            title: "Cà phê thơm ngon",
            review: "Cà phê thơm ngon, vị đậm đà, uống rất vừa miệng. Đóng gói cẩn thận, giao hàng nhanh. Sẽ tiếp tục ủng hộ shop!"
        },
        {
            id: 2,
            name: "Hải Yến",
            role: "Khách hàng",
            title: "Chất lượng tuyệt vời",
            review: "Chất lượng sản phẩm rất tốt, cafe có mùi thơm đặc trưng, pha lên rất ngon. Giá cả hợp lý, rất đáng mua nhé!"
        },
        {
            id: 3,
            name: "Trọng Nghĩa",
            role: "Khách hàng",
            title: "Hương vị chuẩn gu",
            review: "Cafe thơm, vị ngon, không bị đắng gắt. Rất thích hợp để thưởng thức mỗi buổi sáng. Sẽ mua lại lần sau!"
        },
        {
            id: 4,
            name: "Trọng Nhân",
            role: "Khách hàng",
            title: "Shop tư vấn nhiệt tình",
            review: "Shop tư vấn nhiệt tình, giao hàng nhanh, đóng gói cẩn thận. Sản phẩm đúng mô tả, rất hài lòng!"
        },
        {
            id: 5,
            name: "Hoài An",
            role: "Khách hàng",
            title: "Trải nghiệm rất tốt",
            review: "Lần đầu mua tại shop nhưng trải nghiệm rất tốt. Nhân viên hỗ trợ chu đáo, hàng được đóng gói đẹp và sạch sẽ."
        },
        {
            id: 6,
            name: "Thiện Nhân",
            role: "Khách hàng",
            title: "Sản phẩm rất đáng tiền",
            review: "Shop bán hàng có tâm, chất lượng tốt, giá cả hợp lý. Sẽ giới thiệu bạn bè và tiếp tục ủng hộ shop lâu dài!"
        },
    ];

    const responsiveOptions = [
        { breakpoint: "1200px", numVisible: 4, numScroll: 1 },
        { breakpoint: "992px", numVisible: 4, numScroll: 1 },
        { breakpoint: "768px", numVisible: 2, numScroll: 1 },
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
            <div className={styles.item} style={{ padding: "10px", height: "100%" }}>
                <div
                    className={styles.card}
                    style={{
                        padding: "24px",
                        borderRadius: "12px",
                        border: "1px solid #eaeaea",
                        backgroundColor: "#fff",
                        height: "100%",
                        minHeight: "280px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div className={`d-flex justify-content-center align-items-center mb-3 ${styles.starSpacing}`} style={{ width: "100%", color: "#ffe920" }}>
                            <Rating value={5} readOnly cancel={false} stars={5} />
                        </div>

                        <h5 style={{ fontSize: "1.05rem", fontWeight: "bold", textAlign: "center", marginBottom: "10px", color: "#494949" }}>
                            {product.title}
                        </h5>

                        <p style={{ fontSize: "0.9rem", color: "#666", textAlign: "center", lineHeight: "1.5", margin: 0 }}>
                            "{product.review}"
                        </p>
                    </div>

                    <div className="text-center mt-3 pt-3" style={{ borderTop: "1px solid #f0f0f0" }}>
                        <span style={{ fontWeight: "600", fontSize: "0.95rem", color: "#333" }}>{product.name}</span>
                        <span style={{ fontSize: "0.85rem", color: "#888" }}> - {product.role}</span>
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

    return (
        <section className="container p-0">
            <div className="mb-5 text-center">
                <h1>KHÁCH HÀNG ĐÁNH GIÁ</h1>
                <h6 className="text-muted mt-2">
                    Nhâm nhi mỗi ngày với những loại cà phê đặc biệt như Arabica, Robusta, Espresso và nhiều hơn nữa!
                </h6>
            </div>

            <div
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseLeaveOrUp}
                onMouseLeave={handleMouseLeaveOrUp}
                style={{ cursor: "grab", userSelect: "none" }}
            >
                <Carousel
                    value={staticProducts}
                    itemTemplate={productTemplate}
                    numVisible={4}
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