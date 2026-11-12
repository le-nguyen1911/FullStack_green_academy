import React from 'react';
import { Link } from "react-router-dom";
import styles from './Homepage.module.css';

export default function AlignmentDemo3() {
    return (
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
                                            <h3 className="fs-6 fs-md-5 fw-bold">Trồng Và Thu Hoạch</h3>
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

                {/* Mục 2 */}
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
                                            <h3 className="fs-6 fs-md-5 fw-bold">Xử Lý Hạt Cà Phê</h3>
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

                {/* Mục 3 */}
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
                                            <h3 className="fs-6 fs-md-5 fw-bold">Rang Hạt Cà Phê</h3>
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

                {/* Mục 4 */}
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
                                            <h3 className="fs-6 fs-md-5 fw-bold">Pha Chế & Thưởng Thức</h3>
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
    );
}