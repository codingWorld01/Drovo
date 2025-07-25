import { useNavigate } from 'react-router-dom';
import './NotFound.css'; 

const NotFound = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-message">Oops! The page you're looking for doesn't exist.</p>
        <button className="go-home-btn" onClick={goHome}>
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
