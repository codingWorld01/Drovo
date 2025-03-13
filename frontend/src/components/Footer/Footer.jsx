import React from 'react'
import './Footer.css'
import { assetsUser } from '../../assets/assetsUser'

const Footer = () => {
    return (
        <div id="footer" className='footer'>
            <div className="footer-content">
                <div className="footer-content-left">
                    <img width='80px' src={assetsUser.logo} alt="" />
                    <p>We specialize in delivering fresh dairy products and groceries like milk, dahi, bread, and more through a convenient subscription model. With Drovo, you can enjoy fast, reliable delivery within just 10 minutes. Our platform is free to use, letting you customize orders and pay via cash on delivery.
                        <br />
                        At Drovo, we are committed to quality, innovation, and exceptional service. Join us and experience a smarter way to shop for your daily essentials!</p>
                    <div className="footer-social-icons">

                        <a href="https://www.facebook.com/share/1JgWp4x16W/" target='_blank'>
                            <img src={assetsUser.facebook_icon} alt="" />
                        </a>
                        <a href="https://x.com/aradhya_dike?t=51A2naDuyS_cgS2zcxK8qg&s=08 " target='_blank'>
                            <img src={assetsUser.twitter_icon} alt="" />
                        </a>
                        <a href="https://www.linkedin.com/in/aradhyadike/?originalSubdomain=in" target='_blank'>
                            <img src={assetsUser.linkedin_icon} alt="" />
                        </a>

                    </div>
                </div>

                <div className="footer-content-right">
                    <h2>GET IN TOUCH</h2>
                    <ul>
                        <a href={`tel:9284984499`}><li>+919284984499</li></a>
                        <a href={`tel:7666814758`}><li>+917666814758</li></a>
                        <a href={`mailto:drovo499@gmail.com`}><li>drovo499@gmail.com</li></a>
                    </ul>
                </div>
            </div>
            <hr />
            <p className='footer-copyright'>Copyright &copy; 2025 Drovo Online - All Rights Reserved.</p>

        </div>
    )
}

export default Footer
