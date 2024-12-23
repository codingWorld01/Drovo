import React from 'react'
import './Footer.css'
import { assetsUser } from '../../assets/assetsUser'

const Footer = () => {
    return (
        <div id="footer" className='footer'>
            <div className="footer-content">
                <div className="footer-content-left">
                    <img width='80px' src={assetsUser.logo} alt="" />
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit, commodi assumenda debitis non provident explicabo est, quas doloribus quis iste totam quidem dolorum nemo? Qui recusandae ipsa magnam saepe provident impedit quis ratione labore.</p>
                    <div className="footer-social-icons">
                        <img src={assetsUser.facebook_icon} alt="" /><img src={assetsUser.twitter_icon} alt="" /><img src={assetsUser.linkedin_icon} alt="" />
                    </div>
                </div>
                <div className="footer-content-center">
                    <h2>COMPANY</h2>
                    <ul>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Delivery</li>
                        <li>Privacy Policy</li>
                    </ul>

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
            <p className='footer-copyright'>Copyright 2024 &#169; Drovo.com +- All Right Reserved.</p>
        </div>
    )
}

export default Footer
