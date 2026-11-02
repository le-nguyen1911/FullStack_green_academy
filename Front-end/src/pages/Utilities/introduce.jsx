import styles from "../Utilities/Introduce.module.css"
import { Image } from "primereact/image";



const Introduce = () => {

    return (
        <>
            <div className="container mt-5">
                <div className="row align-items-center">
                    <div className="col-md-4">
                        <h2>
                            SỰ VƯỢT TRỘI
                        </h2>

                        <p>
                            Chúng tôi là điểm đến lý tưởng cho những người yêu cà phê,
                            văn võ và nhiều sản phẩm khác. Với cam kết mang đến sự đa789

                            dạng và chất lượng, cửa hàng của chúng tôi không chỉ là nơi
                            để thưởng thức hương vị đặc biệt của cà phê mà còn là điểm
                            đến lý tưởng cho những người đam mê văn chương và sự sáng tạo.
                        </p>

                        <p>
                            Chúng tôi tự hào mang đến cho bạn những sản phẩm cà phê chất
                            lượng cao, được chăm sóc từ nguồn nguyên liệu tốt nhất trên
                            thế giới. Sự kết hợp hoàn hảo giữa truyền thống và sáng tạo
                            để tạo ra những trải nghiệm cà phê độc đáo và vượt trội.
                        </p>
                    </div>
                    <div className="col-8">
                        <Image
                            className={styles.imgBox}
                            src="https://cafengon.monamedia.net/wp-content/uploads/2025/01/about2.png"
                            alt="Image"
                            width="100%"
                            pt={{
                                image: {
                                    style: {
                                        borderRadius: "8px",
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                <div className="my-5">
                    <h2>DỊCH VỤ TÂN TÂM</h2>
                    <div className="row gx-3 mt-4">
                        <div className="col-md-3">
                            <div
                                style={{
                                    border: "1px solid #c4c4c4",
                                    borderRadius: "5px",
                                    padding: "10px",
                                }}
                            >
                                <div className="d-flex align-items-center m-2">
                                    <Image
                                        src="https://cafengon.monamedia.net/wp-content/uploads/2025/01/ship-about.png.webp"
                                        width={60}
                                        alt="Ship"
                                        className="me-3"
                                    />
                                    <div className="m-2">
                                        <h6>Miễn Phí Ship</h6>
                                        <span>Cho đơn hàng trên 3tr</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div
                                style={{
                                    border: "1px solid #c4c4c4",
                                    borderRadius: "5px",
                                    padding: "10px",
                                }}
                            >
                                <div className="d-flex align-items-center m-2">
                                    <Image
                                        src="https://cafengon.monamedia.net/wp-content/uploads/2023/05/icon3-product-detail.png.webp"
                                        width={60}
                                        alt="Ship"
                                        className="me-3"
                                    />

                                    <div className="m-2">
                                        <h6>Hoàn trả nhanh chóng</h6>
                                        <span>Trong vòng 3 ngày</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div
                                style={{
                                    border: "1px solid #c4c4c4",
                                    borderRadius: "5px",
                                    padding: "10px",
                                }}
                            >
                                <div className="d-flex align-items-center m-2">
                                    <Image
                                        src="https://cafengon.monamedia.net/wp-content/uploads/2023/05/icon1-product-detail.png.webp"
                                        width={60}
                                        alt="Ship"
                                        className="me-3"
                                    />

                                    <div className="m-2">
                                        <h6>Thanh toán an toàn</h6>
                                        <span>Nhanh chóng và tiện lợi</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div
                                style={{
                                    border: "1px solid #c4c4c4",
                                    borderRadius: "5px",
                                    padding: "10px",
                                }}
                            >
                                <div className="d-flex align-items-center m-2">
                                    <Image
                                        src="https://cafengon.monamedia.net/wp-content/uploads/2023/05/icon2-product-detail.png.webp"
                                        width={60}
                                        alt="Ship"
                                        className="me-3"
                                    />

                                    <div className="m-2">
                                        <h6>Ưu đãi lớn</h6>
                                        <span>Khuyến mãi hàng tuần</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div className=" row my-5">

                    <h2>LIÊN HỆ</h2>
                    <div className="col-4 mt-4">
                        <div>

                            <h5>ĐỊA CHỈ</h5>

                            <div style={{ display: "inline-block" }}>
                                <span>
                                    1073/23 CMT8, P.7, Q.Tân Bình, TP.HCM
                                </span>

                                <div className="mt-4 mb-5"
                                    style={{
                                        width: "280px",
                                        height: "1px",
                                        backgroundColor: "#b5b5b8",
                                        borderRadius: "99px",
                                        marginTop: "5px",
                                    }}
                                />
                            </div>
                        </div>
                        <div className="col-mb-4">

                            <h5>HOTLINE</h5>

                            <div style={{ display: "inline-block" }}>
                                <span>
                                    (+84) 0123-456-789
                                </span>

                                <div className="mt-4 mb-5"
                                    style={{
                                        width: "280px",
                                        height: "1px",
                                        backgroundColor: "#b5b5b8",
                                        borderRadius: "99px",
                                        marginTop: "5px",
                                    }}
                                />
                            </div>
                        </div>
                        <div className="col-mb-4">

                            <h5>EMAIL</h5>

                            <div style={{ display: "inline-block" }}>
                                <span>
                                    info@themona.global</span>

                                <div className="mt-4 mb-5"
                                    style={{
                                        width: "280px",
                                        height: "1px",
                                        backgroundColor: "#b5b5b8",
                                        borderRadius: "99px",
                                        marginTop: "5px",
                                    }}
                                />
                            </div>
                        </div>
                        <div className="col-mb-4">

                            <h5>GIỜ MỞ CỦA</h5>

                            <div style={{ display: "inline-block" }}>
                                <span>
                                    Thứ 2 - Thứ 7: 08:00 - 21:00
                                    <br />
                                </span>
                                <span>
                                    Chủ nhật: 08:00 - 19:00
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-8 ">
                        <Image
                            className={styles.imgBox}
                            src="https://cafengon.monamedia.net/wp-content/uploads/2025/01/blog2.jpg"
                            alt="Image"
                            width="100%" pt={{
                                image: {
                                    style: {
                                        borderRadius: "16px",
                                    },
                                },
                            }} />
                    </div>
                </div>
            </div>

        </>
    );
}



export default Introduce;