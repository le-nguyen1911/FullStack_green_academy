import { useEffect, useState } from "react";
import axios from "axios";
import { Carousel } from "primereact/carousel";
import styles from "../homepage/Homepage.module.css";
import { Rating } from "primereact/rating";

export default function AlignmentDemo() {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);

    const TOTAL_STEPS = 5;

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        try {
            const res = await axios.get("/products");
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

    const productTemplate = (product) => {
        return (
            <div className={styles.item}>
                <div className={styles.card}>
                    <div className={styles.imageWrapper}>
                        <div className="d-flex justify-content-center">
                            <img
                                src={product.images.primary}
                                alt={product.name}
                                className={styles.defaultImage}
                                style={{
                                    maxWidth: "400px",
                                    maxHeight: "250px"
                                }}
                            />
                            {product.images.hover && (
                                <div className="d-flex justify-content-center">
                                    <img
                                        src={product.images.hover}
                                        alt={product.name}
                                        className={styles.hoverImage}
                                        style={{
                                            maxWidth: "400px",
                                            maxHeight: "250px"
                                        }}
                                    />
                                </div>

                            )}
                        </div>
                    </div>

                    <Rating value={5} disabled cancel={false} />

                    <h4 className={styles.name}>{product.name}</h4>

                    <h4 className={styles.price}>{product.price.toLocaleString("vi-VN")}₫</h4>
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
            <div >
                <h1 className=" d-flex justify-content-center">Sản phẩm đóng gói </h1>
                <h6 className=" d-flex justify-content-center">Nhâm nhi mỗi ngày với những loại cà phê đặc biệt như Arabica, Robusta, Espresso và nhiều hơn nữa!</h6>
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