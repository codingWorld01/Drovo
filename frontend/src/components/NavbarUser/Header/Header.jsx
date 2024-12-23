import React, { useState, useEffect } from 'react';
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

  // State to track the current image index and slideshow state (active or paused)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // Controls whether the slideshow is paused

  // Function to change the image
  const changeImage = (direction) => {
    setCurrentImageIndex((prevIndex) => {
      if (direction === 'next') {
        return (prevIndex + 1) % images.length;
      } else if (direction === 'prev') {
        return (prevIndex - 1 + images.length) % images.length;
      }
      return prevIndex;
    });
  };

  // Set up interval for automatic image change
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => changeImage('next'), 3000); // Change image every 3 seconds
      return () => clearInterval(interval); // Clear interval on component unmount or when paused
    }
  }, [isPaused]);

  return (
    <div className="header">
      <div className="slideshow-container">
        {/* Image Display */}
        <div className="slideshow-image" style={{ backgroundImage: `url(${images[currentImageIndex]})` }}></div>

        {/* Navigation Buttons */}
        <div className="slideshow-nav">
          <button className="prev" onClick={() => changeImage('prev')}>❮</button>
          <button className="next" onClick={() => changeImage('next')}>❯</button>
        </div>

        {/* Pause/Play Button */}
        <button className="pause-play" onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? 'Play' : 'Pause'}
        </button>
      </div>
    </div>
  );
};

export default Header;
