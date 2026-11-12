import { Link } from "react-router-dom";
import styles from "../homepage/Homepage.module.css";
import AlignmentDemo from "./AlignmentDemo";
import AlignmentDemo1 from "./AlignmentDemo1";
import AlignmentDemo2 from "./AlignmentDemo2";
import AlignmentDemo3 from "./AlignmentDemo3";


const Homepage = () => {
    return (
        <>
            <div className={styles.homepageWrapper}>
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
                                <AlignmentDemo />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container my-5">
                    < AlignmentDemo1 />
                </div>

                <div className="container my-5">
                    < AlignmentDemo2 />
                </div>

                <div className="container my-5">
                    < AlignmentDemo3 />
                </div>

            </div>
        </>
    );
};

export default Homepage;