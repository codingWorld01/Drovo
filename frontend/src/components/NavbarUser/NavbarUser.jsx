import React, { useContext } from 'react';
import './NavbarUser.css';
import { assetsUser } from '../../assets/assetsUser';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/storeContext';
import { toast } from 'react-hot-toast';

const NavbarUser = ({ setShowLogin }) => {
    const { getNumberOfItems, setToken, setCartItems } = useContext(StoreContext);
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        setCartItems({});
        navigate("/");
        toast.success("Logout");
    }

    return (
        <div className='navbarUser'>
            <Link to="/"><img src={assetsUser.logo} className='logo' alt="" /></Link>
            <div className="navbarUser-right">
                <div className="navbarUser-search-icon">
                    <Link to="/cart">
                        <img src={assetsUser.basket_icon} alt="" />
                    </Link>
                    <div className={getNumberOfItems() > 0 ? `cart-items-count` : ""}>
                        {getNumberOfItems() > 0 && <span>{getNumberOfItems()}</span>}
                    </div>
                </div>

                {!localStorage.getItem('token') ?
                    <button onClick={() => setShowLogin(true)}>Sign in</button> :
                    <div className='navbarUser-profile'>
                        <img src={assetsUser.profile_icon} alt="" />
                        <span className="dropdown-arrow">▼</span> {/* Dropdown icon */}
                        <ul className='navbarUser-profile-dropdown'>
                            <li onClick={() => navigate('/myorders')}>
                                <img src={assetsUser.bag_icon} alt="" /><p>Orders</p>
                            </li>
                            <hr />
                            <li onClick={logout}>
                                <img src={assetsUser.logout_icon} alt="" /><p>Logout</p>
                            </li>
                        </ul>
                    </div>}
            </div>
        </div>
    );
}

export default NavbarUser;
