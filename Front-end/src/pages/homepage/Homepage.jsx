import { Link } from "react-router-dom";
import styles from "../homepage/Homepage.module.css";
import AlignmentDemo from "./AlignmentDemo";
import AlignmentDemo2 from "./AlignmentDemo2";
import AlignmentDemo3 from "./AlignmentDemo3";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import AlignmentDemo4 from "./AlignmentDemo4";


const Homepage = () => {


    return (
        <>
            <div>
                <section className={styles.heroVideo}>
                    <iframe
                        className={styles.heroVideoIframe}
                        src="https://www.youtube.com/embed/87eb45AYeBE?autoplay=1&mute=1&controls=0&rel=0&playsinline=1&start=336&end=405&enablejsapi=1"
                        title="Coffee Background"
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    />
                </section>

                <div className="container my-5">
                    <div className="row">
                        <div className="col-md-4">
                            <h2>CÀ PHÊ NGUYÊN CHẤT</h2>

                            <h6>
                                Cà phê nguyên chất được chế biến 100% nguyên chất,
                                không pha trộn với bất kỳ loại hạt cà phê nào khác.
                            </h6>

                            <Link
                                to="/san-pham"
                                className="nav-link text-dark d-flex align-items-center gap-2 mt-3"
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

                        <div className="col-md-8 ">
                            <AlignmentDemo />
                        </div>

                    </div>
                </div>

                <div className="container my-5">

                    <AlignmentDemo2 />

                </div>

                <div className="container my-5">
                    <AlignmentDemo3 />
                </div>

                <div>
                    <AlignmentDemo4 />
                </div>
            </div >
        </>
    );
};

export default Homepage;