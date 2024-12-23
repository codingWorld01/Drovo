import React, { useContext } from 'react'
import './NavbarAdmin.css'
import { assetsAdmin } from '../../assets/assetsAdmin'
import { StoreContext } from '../../context/storeContext'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const NavbarAdmin = () => {

  const { setToken, setUserType } = useContext(StoreContext);
  let navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.setItem('userType', 'user');
    setUserType('user');
    setToken("");
    navigate("/");
    toast.success("Logout")
  }

  return (
    <div className='navbarAdmin'>
      <NavLink to="/"><img src={assetsAdmin.logo} alt="" className="logo" /></NavLink>
      {/* <img src={assetsAdmin.profile_image} className='profile' alt="" /> */}
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

export default NavbarAdmin
