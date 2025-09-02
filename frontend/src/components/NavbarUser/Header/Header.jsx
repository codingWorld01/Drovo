import { useState, useEffect } from 'react';
import './Header.css';
import { assetsUser } from '../../../assets/assetsUser';

const Header = () => {
  // Array of image URLs for the slideshow
  const images = [
    assetsUser.main1,
    assetsUser.main2,
    assetsUser.main3,
    assetsUser.main4,
  ];

  // State to track the current image index and transition direction
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState('');

  const [isPaused, setIsPaused] = useState(false); // Controls whether the slideshow is paused

  // Preload images for smoother transitions
  useEffect(() => {
    images.forEach((image) => {
      const img = new Image();
      img.src = image;
    });
  }, [images]);

  // Function to change the image
  const changeImage = (direction) => {
    // Set the direction of the transition
    setTransitionDirection(direction);

    // Update the image index after the animation starts
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => {
        if (direction === 'next') {
          return (prevIndex + 1) % images.length;
        } else if (direction === 'prev') {
          return (prevIndex - 1 + images.length) % images.length;
        }
        return prevIndex;
      });
    }, 300); // Matches the CSS animation duration

    // Reset the transition after the animation completes
    setTimeout(() => {
      setTransitionDirection('');
    }, 600); // Allow for smoother animations
  };

  // Set up interval for automatic image change
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => changeImage('next'), 5000); // Change image every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div
      className="header"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="slideshow-container">
        {/* Sliding Image Container */}
        <div
          className={`sliding-container ${transitionDirection}`}
          style={{
            transform: `translateX(${-currentImageIndex * 100}%)`,
          }}
        >
          {images.map((image, index) => (
            <img key={index} src={image} alt={`Slide ${index}`} />
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="slideshow-nav">
          <button className="prev" onClick={() => changeImage('prev')}>
            &#10094;
          </button>
          <button className="next" onClick={() => changeImage('next')}>
            &#10095;
          </button>
        </div>

        {/* Dots for Navigation */}
        <div className="slideshow-dots">
          {images.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Header;
