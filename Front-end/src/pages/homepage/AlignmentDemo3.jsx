import React from 'react';
import { Link } from "react-router-dom";
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import styles from './Homepage.module.css'


export default function AlignmentDemo3() {
    const features = [
        { id: '01', title: 'Hạt cà phê chất lượng cao' },
        { id: '02', title: 'Rang xay tại chỗ' },
        { id: '03', title: 'Đa dạng sản phẩm' },
    ];
    return (
        <>


            <div className="container" style={{
                overflow: 'hidden',
                border: '1px solid #c4c4c4',
                borderRadius: '10px',
                width: '94%',
                height: '724px'

            }}>
                <div className="row">
                    <div className="  max-w-30rem mx-auto my-5 overflow-hidden font-sans col-6">
                        <div className="p-5 text-center">
                            <h2 className="text-3xl font-extrabold uppercase mt-2 mb-3" style={{ color: '#3d180a' }}>
                                SỰ VƯỢT TRỘI HÀNG ĐẦU
                            </h2>

                            <p className="text-color-secondary text-sm line-height-3 mb-5 px-2">
                                Khám phá yếu tố chất lượng hàng đầu của sản phẩm cà phê tại cửa hàng của chúng tôi, nơi mang đến cho bạn trải nghiệm thưởng thức cà phê nguyên chất tuyệt vời nhất.
                            </p>
                            <div className="row justify-content-center mb-5">
                                <div className="col-auto d-flex flex-column align-items-start">
                                    {features.map((item) => (
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
                                style={{ backgroundColor: '#6f3f22', color: '#ffffff', width: '200px', borderRadius: "8px", textDecoration: "none", }}
                            >

                                Khám Phá Ngay
                            </Link>
                        </div>

                    </div>


                    <div className="col-6">
                        <Image className={styles.imgBox} src="https://chapelyard.co.uk/wp-content/uploads/2025/02/cafe-dereham.png" alt="Image" width="596" />
                    </div>
                </div>
            </div>
        </>

    );
}

