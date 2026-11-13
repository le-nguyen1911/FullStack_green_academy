import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Carousel } from "primereact/carousel";
import { Rating } from "primereact/rating";
import { Image } from "primereact/image";
import { Divider } from "primereact/divider";
import styles from "../homepage/Homepage.module.css";
import axiosClient from "../../util/axiosClient";

const Homepage = () => {
    // --- State cho Phần Danh Mục---
    const [categories, setCategories] = useState([]);
    const [categoryPage, setCategoryPage] = useState(0);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const TOTAL_CATEGORY_STEPS = 4;


    // --- State cho Phần Sản Phẩm Đóng Gói---
    const [packagedProducts, setPackagedProducts] = useState([]);
    const [packagedPage, setPackagedPage] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const TOTAL_PACKAGED_STEPS = isMobile ? 5 : 3;


    // --- Hiệu ứng & Xử lý dữ liệu ---
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        getCategories();
        getPackagedProducts();
    }, []);

    const getCategories = async () => {
        try {
            const res = await axiosClient.get("categories");
            const result = res.data?.data || res.data;
            setCategories(Array.isArray(result) ? result : []);
        } catch (error) {
            console.log(error);
        }
    };

    const getPackagedProducts = async () => {
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

            setPackagedProducts(formattedProducts);
        } catch (error) {
            console.log(error);
        }
    };

    const responsiveOptions = [
        { breakpoint: "1200px", numVisible: 3, numScroll: 1 },
        { breakpoint: "992px", numVisible: 2, numScroll: 1 },
        { breakpoint: "768px", numVisible: 2, numScroll: 1 },
        { breakpoint: "576px", numVisible: 2, numScroll: 1 },
    ];

    // --- Handlers cho Danh Mục ---
    const handleMouseDown = (e) => {
        isDragging.current = true;
        startX.current = e.clientX;
    };

    const handleMouseLeaveOrUp = (e) => {
        if (!isDragging.current) return;
        isDragging.current = false;

        const diffX = e.clientX - startX.current;
        if (diffX < -40) handleCategoryNext();
        else if (diffX > 40) handleCategoryPrev();
    };

    const handleCategoryPrev = () => {
        setCategoryPage((prev) => (prev === 0 ? TOTAL_CATEGORY_STEPS - 1 : prev - 1));
    };

    const handleCategoryNext = () => {
        setCategoryPage((prev) => (prev === TOTAL_CATEGORY_STEPS - 1 ? 0 : prev + 1));
    };

    const categoryTemplate = (product) => {
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

    // --- Handlers cho Sản Phẩm Đóng Gói ---
    const handlePackagedPrev = () => {
        setPackagedPage((prev) => (prev === 0 ? TOTAL_PACKAGED_STEPS - 1 : prev - 1));
    };

    const handlePackagedNext = () => {
        setPackagedPage((prev) => (prev === TOTAL_PACKAGED_STEPS - 1 ? 0 : prev + 1));
    };

    const packagedProductTemplate = (product) => {
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

    const featuresList = [
        { id: '01', title: 'Hạt cà phê chất lượng' },
        { id: '02', title: 'Rang xay tại chỗ' },
        { id: '03', title: 'Đa dạng sản phẩm' },
    ];

    return (
        <div className={styles.homepageWrapper}>
            {/* Hero Video Section */}
            <section className={styles.heroVideo}>
                <iframe
                    className={styles.heroVideoIframe}
                    src="https://www.youtube.com/embed/87eb45AYeBE?autoplay=1&mute=1&controls=0&rel=0&playsinline=1&start=336&end=405&enablejsapi=1&modestbranding=1&iv_load_policy=3&disablekb=1"
                    title="Coffee Background"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                />
                <div className={styles.videoOverlay}></div>
            </section>

            {/* Section 1: Cà Phê Nguyên Chất & Danh Mục*/}
            <div className="container my-5">
                <div className="container my-5">
                    <div className="row">
                        <div className="col-12 col-md-5 mb-2 mb-md-0 text-center text-md-start">
                            <h2 className="text-center text-md-start">CÀ PHÊ NGUYÊN CHẤT</h2>
                            <h6 className="text-muted mt-2 text-center text-md-start">
                                Cà phê nguyên chất được chế biến 100% nguyên chất,
                                không pha trộn với bất kỳ loại hạt cà phê nào khác.
                            </h6>
                            <Link
                                to="/san-pham"
                                className="nav-link text-dark d-flex align-items-center gap-2 mt-3 fw-bold"
                            >
                                <span>Khám Phá</span>
                                <i className="pi pi-arrow-right"></i>
                            </Link>

                            <img
                                src="https://cafengon.monamedia.net/wp-content/uploads/2024/12/Frame-13020.png"
                                alt="Coffee"
                                className="img-fluid mt-3"
                            />
                        </div>

                        <div className="col-12 col-md-6">
                            {categories && categories.length > 0 && (
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
                                            itemTemplate={categoryTemplate}
                                            numVisible={3}
                                            numScroll={1}
                                            circular={true}
                                            responsiveOptions={responsiveOptions}
                                            showIndicators={false}
                                            showNavigators={false}
                                            page={categoryPage}
                                            onPage={(e) => setCategoryPage(e.page)}
                                            touchable={true}
                                        />
                                    </div>

                                    <div className="d-flex align-items-center justify-content-center gap-3 mt-3">
                                        <button onClick={handleCategoryPrev} className={styles.pagiBtn} aria-label="Previous">
                                            <h1>&#8249;</h1>
                                        </button>
                                        <span className={styles.pagiText}>{categoryPage + 1} / {TOTAL_CATEGORY_STEPS}</span>
                                        <button onClick={handleCategoryNext} className={styles.pagiBtn} aria-label="Next">
                                            <h1>&#8250;</h1>
                                        </button>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Sản Phẩm Đóng Gói*/}
            <div className="container my-5">
                {packagedProducts && packagedProducts.length > 0 && (
                    <section className="container">
                        <div>
                            <h2 className="d-flex justify-content-center">Sản phẩm đóng gói</h2>
                            <h6 className="d-flex justify-content-center">Nhâm nhi mỗi ngày với những loại cà phê đặc biệt như Arabica, Robusta, Espresso và nhiều hơn nữa!</h6>
                        </div>
                        <Carousel
                            value={packagedProducts}
                            itemTemplate={packagedProductTemplate}
                            numVisible={4}
                            numScroll={1}
                            circular={true}
                            responsiveOptions={responsiveOptions}
                            showIndicators={false}
                            showNavigators={false}
                            page={packagedPage}
                            onPage={(e) => setPackagedPage(e.page)}
                            touchable={true}
                        />

                        <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
                            <button onClick={handlePackagedPrev} className={styles.pagiBtn} aria-label="Previous">
                                <h1>&#8249;</h1>
                            </button>
                            <span className={styles.pagiText}>
                                {packagedPage + 1} / {TOTAL_PACKAGED_STEPS}
                            </span>
                            <button onClick={handlePackagedNext} className={styles.pagiBtn} aria-label="Next">
                                <h1>&#8250;</h1>
                            </button>
                        </div>
                    </section>
                )}
            </div>

            {/* Section 3: Sự Vượt Trội Hàng Đầu*/}
            <div className="container my-5">
                <div className="container" style={{
                    overflow: 'hidden',
                    border: '1px solid #c4c4c4',
                    borderRadius: '10px',
                    width: '94%',
                    height: 'auto',
                    paddingBottom: '20px'
                }}>
                    <div className="row align-items-center">
                        <div className="col-12 col-md-6 max-w-30rem mx-auto my-3 overflow-hidden font-sans">
                            <div className="p-3 p-md-5 text-center">
                                <h2 className="text-3xl font-extrabold uppercase mt-2 mb-3" style={{ color: '#3d180a' }}>
                                    SỰ VƯỢT TRỘI HÀNG ĐẦU
                                </h2>

                                <p className="text-color-secondary text-sm line-height-3 mb-5 px-2">
                                    Khám phá yếu tố chất lượng hàng đầu của sản phẩm cà phê tại cửa hàng của chúng tôi, nơi mang đến cho bạn trải nghiệm thưởng thức cà phê nguyên chất tuyệt vời nhất.
                                </p>

                                <div className="row justify-content-center mb-5">
                                    <div className="col-12 d-flex flex-column align-items-start px-4">
                                        {featuresList.map((item) => (
                                            <div key={item.id} className="w-100">
                                                <div className="d-flex justify-content-start py-2" style={{
                                                    color: '#3d180a',
                                                    fontSize: '25px'
                                                }}>
                                                    <span className="text-xl font-medium text-800 me-4">{item.id}</span>
                                                    <span className="text-xl font-medium text-900">{item.title}</span>
                                                </div>
                                                <Divider className="my-1 border-gray w-100" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Link
                                    to="/san-pham"
                                    className="no-underline inline-block font-semibold px-5 py-3 border-round-lg shadow-2 transition-colors transition-duration-200"
                                    style={{ backgroundColor: '#6f3f22', color: '#ffffff', width: '200px', borderRadius: "8px", textDecoration: "none" }}
                                >
                                    Khám Phá Ngay
                                </Link>
                            </div>
                        </div>

                        <div className="col-12 col-md-6 text-center py-3">
                            <Image
                                src="https://chapelyard.co.uk/wp-content/uploads/2025/02/cafe-dereham.png"
                                alt="Image"
                                width="100%"
                                style={{ maxWidth: '500px', height: '100%' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Hành Trình Sản Xuất Cà Phê*/}
            <div className="container my-5">
                <div className='container my-5' style={{ maxWidth: '1100px' }}>
                    <div className="mb-5 text-center">
                        <h1>Hành trình sản xuất cà phê</h1>
                        <h6 className="text-muted mt-2">
                            Khám phá quy trình chất lượng hàng đầu của sản phẩm cà phê tại cửa hàng của chúng tôi.
                        </h6>
                    </div>

                    <div className='row g-3 g-md-4'>
                        <div className="col-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="row g-0 align-items-center">
                                    <div className="col-md-5">
                                        <div className={styles.imgBox}>
                                            <img
                                                src="https://cafengon.monamedia.net/wp-content/uploads/2024/12/h28-step1.png"
                                                alt="Trồng và thu hoạch"
                                                className="img-fluid rounded-start w-100"
                                                style={{ height: '220px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-7">
                                        <div className="card-body p-2 p-md-3">
                                            <h5 className="card-title mt-1">
                                                <Link to="gioi-thieu" className="text-decoration-none text-dark">
                                                    <span className="fs-6 fs-md-5 fw-bold">Trồng Và Thu Hoạch</span>
                                                </Link>
                                            </h5>
                                            <p className="card-text text-muted small mt-2 d-none d-md-block">
                                                Quy trình bắt đầu với việc chọn lựa những quả cà phê chín màu đỏ đậm, sau đó tiến hành thu hoạch kỹ lưỡng.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="row g-0 align-items-center">
                                    <div className="col-md-5">
                                        <div className={styles.imgBox}>
                                            <img
                                                src="https://cafengon.monamedia.net/wp-content/uploads/2024/12/h28-step2.png"
                                                alt="Xử lý hạt cà phê"
                                                className="img-fluid rounded-start w-100"
                                                style={{ height: '220px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-7">
                                        <div className="card-body p-2 p-md-3">
                                            <h5 className="card-title mt-1">
                                                <Link to="#" className="text-decoration-none text-dark">
                                                    <span className="fs-6 fs-md-5 fw-bold">Xử Lý Hạt Cà Phê</span>
                                                </Link>
                                            </h5>
                                            <p className="card-text text-muted small mt-2 d-none d-md-block">
                                                Sau khi thu hoạch, hạt cà phê được tách chất bã và vỏ thông qua các quá trình xử lý tiên tiến.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bước 3 */}
                        <div className="col-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="row g-0 align-items-center">
                                    <div className="col-md-5">
                                        <div className={styles.imgBox}>
                                            <img
                                                src="https://cafengon.monamedia.net/wp-content/uploads/2024/12/h28-step3.png"
                                                alt="Rang hạt cà phê"
                                                className="img-fluid rounded-start w-100"
                                                style={{ height: '220px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-7">
                                        <div className="card-body p-2 p-md-3">
                                            <h5 className="card-title mt-1">
                                                <Link to="#" className="text-decoration-none text-dark">
                                                    <span className="fs-6 fs-md-5 fw-bold">Rang Hạt Cà Phê</span>
                                                </Link>
                                            </h5>
                                            <p className="card-text text-muted small mt-2 d-none d-md-block">
                                                Hạt cà phê sau khi được xử lý sẽ được mang đi rang để tạo ra hương vị đặc trưng tuyệt hảo.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bước 4 */}
                        <div className="col-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="row g-0 align-items-center">
                                    <div className="col-md-5">
                                        <div className={styles.imgBox}>
                                            <img
                                                src="https://cafengon.monamedia.net/wp-content/uploads/2024/12/h28-step4.png"
                                                alt="Pha chế và thưởng thức"
                                                className="img-fluid rounded-start w-100"
                                                style={{ height: '220px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-7">
                                        <div className="card-body p-2 p-md-3">
                                            <h5 className="card-title mt-1">
                                                <Link to="#" className="text-decoration-none text-dark">
                                                    <span className="fs-6 fs-md-5 fw-bold">Pha Chế & Thưởng Thức</span>
                                                </Link>
                                            </h5>
                                            <p className="card-text text-muted small mt-2 d-none d-md-block">
                                                Cuối cùng, hạt cà phê được xay nhuyễn và sẵn sàng phục vụ những ly cà phê thơm ngon nhất.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage;