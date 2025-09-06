

import Lottie from 'lottie-react';
import './Loader.css';
import loadingAnimation from './loading-animation.json'; // Update path to your JSON file

const Loader = () => {
    return (
        <div className="loader-container">
            <div className="lottie-wrapper">
                <Lottie
                    animationData={loadingAnimation}
                    loop={true}
                    autoplay={true}
                    style={{ width: 250, height: 250 }} // Adjust size as needed
                />
            </div>
        </div>
    );
};

export default Loader;