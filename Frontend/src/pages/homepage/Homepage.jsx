import { Link } from "react-router-dom";
import styles from "../homepage/Homepage.module.css";
import AlignmentDemo from "./AlignmentDemo";
import AlignmentDemo1 from "./AlignmentDemo1";
import AlignmentDemo2 from "./AlignmentDemo2";
import AlignmentDemo3 from "./AlignmentDemo3";
import AlignmentDemo4 from "./AlignmentDemo4";
import AlignmentDemo5 from "./AlignmentDemo5";
import { Image } from "primereact/image";
import insta1 from "../../assets/Instagram/insta1.jpg";
import insta2 from "../../assets/Instagram/insta2.jpg";
import insta3 from "../../assets/Instagram/insta3.jpg";
import insta4 from "../../assets/Instagram/insta4.jpg";
import insta5 from "../../assets/Instagram/insta5.jpg";



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

                <div className="container my-5">
                    < AlignmentDemo4 />
                </div>

                <div className="container my-5">
                    < AlignmentDemo5 />
                </div>
                <div className="container my-5">
                    <div>
                        <div className="mb-5 text-center">
                            <h1>Theo dõi trên Instagram</h1>
                            <h6 className="text-muted mt-2">
                                Khám phá thế giới đa dạng của cà phê thông qua những hình ảnh tuyệt đẹp. Đắm chìm trong hương vị đậm đà và thơm ngon của cà phê, cùng tận hưởng sự sáng tạo và cảm nhận sâu lắng từ mỗi giọt cà phê. Hãy để chúng tôi dẫn bạn vào cuộc hành trình khám phá vị ngon và thú vị của cà phê!
                            </h6>
                        </div>


                        <div className="row g-3 justify-content-center align-items-center">
                            {[insta1, insta2, insta3, insta4, insta5].map((imgSrc, index) => (
                                <div className="col-6 col-sm-4 col-md-2" key={index}>
                                    <div className={styles.imgBox}>
                                        <Image
                                            src={imgSrc}
                                            alt={`Instagram ${index + 1}`}
                                            width="100%"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>


                    </div>
                </div>
            </div>
        </>
    );
};

export default Homepage;