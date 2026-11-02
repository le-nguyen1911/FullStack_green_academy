import React from 'react';
import { Link } from "react-router-dom";
import styles from './Homepage.module.css'

export default function AdvancedDemo() {
    return (

        <div className='container my-5' style={{
            width: '67%'
        }}>
            <div className="mb-4 text-center">
                <h1>Hành trình sản xuất cà phê</h1>
                <h6 className="text-muted">
                    Khám phá quy trình chất lượng hàng đầu của sản phẩm cà phê tại cửa hàng của chúng tôi.
                </h6>
            </div>
            <div className='row '>

                <div className="card border-0 mx-auto col-6" >
                    <div className="row g-0 align-items-center">
                        <div className="col-md-5">
                            <div className={styles.imgBox}>
                                <img
                                    src="https://cafengon.monamedia.net/wp-content/uploads/2024/12/h28-step1.png"
                                    alt="Hành trình cà phê"
                                    className="img-fluid rounded-start w-100"
                                    style={{ height: '270px', objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                        <div className="col-md-7">
                            <div className="card-body p-4">
                                <h5 className="card-title mt-2">
                                    <Link to="gioi-thieu" className="text-decoration-none text-dark hover:underline">
                                        <h3> Trồng Và Thu Hoạch </h3>
                                    </Link>
                                </h5>
                                <p className="card-text text-muted mt-2 small">
                                    Quy trình bắt đầu với việc chọn lựa những quả cà phê chín màu đỏ đậm, sau đó tiến hành thu hoạch. Quá trình thu hoạch cần sự kỹ lưỡng để đảm bảo chất lượng cao.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card border-0 mx-auto col-6" >
                    <div className="row g-0 align-items-center">
                        <div className="col-md-5">
                            <div className={styles.imgBox}>
                                <img
                                    src="https://cafengon.monamedia.net/wp-content/uploads/2024/12/h28-step2.png"
                                    alt="Hành trình cà phê"
                                    className="img-fluid rounded-start w-100"
                                    style={{ height: '270px', objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                        <div className="col-md-7">
                            <div className="card-body p-4">
                                <h5 className="card-title mt-2">
                                    <Link to="#" className="text-decoration-none text-dark hover:underline">
                                        <h3>Xử lý hạt cà phê</h3>
                                    </Link>
                                </h5>
                                <p className="card-text text-muted mt-2 small">
                                    Sau khi thu hoạch, hạt cà phê được tách chất bã và vỏ thông qua quá trình xử lý.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card border-0 mx-auto col-6" >

                    <div className="row g-0 align-items-center">
                        <div className="col-md-5">
                            <div className={styles.imgBox}>

                                <img
                                    src="https://cafengon.monamedia.net/wp-content/uploads/2024/12/h28-step3.png"
                                    alt="Hành trình cà phê"
                                    className="img-fluid rounded-start w-100"
                                    style={{ height: '270px', objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                        <div className="col-md-7">
                            <div className="card-body p-4">
                                <h5 className="card-title mt-2">
                                    <Link to="#" className="text-decoration-none text-dark hover:underline">
                                        <h3>Rang hạt cà phê</h3>
                                    </Link>
                                </h5>
                                <p className="card-text text-muted mt-2 small">
                                    Hạt cà phê sau khi được xử lý sẽ được rang để tạo ra hương vị đặc trưng
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card border-0 mx-auto col-6" >
                    <div className="row g-0 align-items-center">
                        <div className="col-md-5">
                            <div className={styles.imgBox}>
                                <img
                                    src="https://cafengon.monamedia.net/wp-content/uploads/2024/12/h28-step4.png"
                                    alt="Hành trình cà phê"
                                    className="img-fluid rounded-start w-100"
                                    style={{ height: '270px', objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                        <div className="col-md-7">
                            <div className="card-body p-4">
                                <h5 className="card-title mt-2">
                                    <Link to="#" className="text-decoration-none text-dark hover:underline">
                                        <h3>Pha chế và thưởng thức</h3>
                                    </Link>
                                </h5>
                                <p className="card-text text-muted mt-2 small">
                                    Cuối cùng, sau khi hạt cà phê đã được rang, chúng được xay nhuyễn và sử dụng để pha chế cà phê.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}