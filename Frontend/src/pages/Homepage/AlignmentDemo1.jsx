import { useEffect, useState } from "react";
import axiosClient from "../../util/axiosClient";
import { Carousel } from "primereact/carousel";
import styles from "../homepage/Homepage.module.css";
import { Rating } from "primereact/rating";

export default function AlignmentDemo1() {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
            const res = await axiosClient.get("products");
            const result = res.data?.data || res.data;

            const formattedProducts = Array.isArray(result) ? result.map(item => {
                let parsedImages = [];
                try {
                    parsedImages = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
                } catch (e) {
                    parsedImages = [];
                }
                return {
                    ...item,
                    parsedImages: Array.isArray(parsedImages) ? parsedImages : []
                };
            }) : [];

            setProducts(formattedProducts);
        } catch (error) {
            console.log(error);
        }
    };

    const responsiveOptions = [
        { breakpoint: "1200px", numVisible: 3, numScroll: 1 },
        { breakpoint: "992px", numVisible: 2, numScroll: 1 },
        { breakpoint: "768px", numVisible: 2, numScroll: 1 }, // Từ 768px đổ xuống hiển thị 2 sản phẩm
    ];

    const productTemplate = (product) => {
        const primaryImg = product.parsedImages?.[0] || product.image_url;
        const hoverImg = product.parsedImages?.[1] || null;

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
                            justifyContent: "center"
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
                                display: "block"
                            }}
                        />
                        {hoverImg && (
                            <div
                                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                style={{
                                    background: '#fff',
                                    opacity: 0,
                                    transition: 'opacity 0.3s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                            >
                                <img
                                    src={hoverImg}
                                    alt={product.name}
                                    className={styles.hoverImage}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        display: "block"
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-3 d-flex flex-column align-items-center text-center">
                        <Rating value={5} disabled cancel={false} />

                        <h4 className={styles.name} style={{ fontSize: "1rem", marginTop: "8px", minHeight: "40px" }}>
                            {product.name}
                        </h4>

                        <h4 className={styles.price} style={{ fontWeight: "bold", marginTop: "4px" }}>
                            {typeof product.price === 'number'
                                ? product.price.toLocaleString("vi-VN") + "₫"
                                : Number(product.price || 0).toLocaleString("vi-VN") + "₫"}
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
                <h2 className="d-flex justify-content-center">Sản phẩm đóng gói</h2>
                <h6 className="d-flex justify-content-center">Nhâm nhi mỗi ngày với những loại cà phê đặc biệt như Arabica, Robusta, Espresso và nhiều hơn nữa!</h6>
            </div>
            <Carousel
                value={products}
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