import React, { useState, useEffect } from 'react';
import './Testimonials.css';

const Testimonials = () => {
    const testimonials = [
        { quote: "Drovo has transformed how I get my daily essentials, whether it's dairy, groceries, or bakery items. Always fresh and on time!", name: "Neha Sharma" },
        { quote: "The delivery is quick, and the quality of the products is top-notch, whether it's dairy, grocery, or bakery. Highly recommend Drovo!", name: "Ramesh Verma" },
        { quote: "I love the convenience Drovo offers for all my daily needs—dairy, grocery, and bakery. A lifesaver for my busy schedule.", name: "Anjali Gupta" },
        { quote: "The best products with unmatched customer service, whether it's dairy, groceries, or bakery items. Always a delight!", name: "Rahul Deshmukh" },
        { quote: "Drovo makes ordering easy for all my needs—dairy, grocery, and bakery. I trust them completely.", name: "Simran Kaur" },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Initial check for mobile view
    const totalTestimonials = testimonials.length;

    // Function to handle screen resizing
    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    // Function to go to the next testimonial
    const nextTestimonial = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalTestimonials);
    };

    // Function to go to the previous testimonial
    const prevTestimonial = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + totalTestimonials) % totalTestimonials);
    };

    // Set interval to automatically change the testimonial
    useEffect(() => {
        const interval = setInterval(nextTestimonial, 3000); // Change every 3 seconds
        return () => clearInterval(interval);
    }, []);

    // Add event listener for window resizing
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="testimonials-section">
            <h2>What Our Customers Say</h2>
            <div className="testimonials-slider">
                {/* Sliding Testimonials */}
                <div
                    className="testimonial-container"
                    style={{
                        transform: isMobile
                            ? `translateX(-${currentIndex * 106}%)` // For mobile
                            : `translateX(-${currentIndex * ((totalTestimonials * 2) + 1)}%)`, // For desktop
                    }}
                >
                    {testimonials.map((testimonial, index) => (
                        <div className="testimonial" key={index}>
                            <p>"{testimonial.quote}"</p>
                            <span>- {testimonial.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className="slider-nav-test">
                <button className="prev" onClick={prevTestimonial}>
                    &#10094;
                </button>
                <button className="next" onClick={nextTestimonial}>
                    &#10095;
                </button>
            </div>
        </div>
    );
};

export default Testimonials;
