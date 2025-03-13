import React, { useContext } from 'react'
import './NavbarAdmin.css'
import { assetsAdmin } from '../../assets/assetsAdmin'
import { StoreContext } from '../../context/storeContext'
import { NavLink } from 'react-router-dom'

const NavbarAdmin = () => {

  const { logout } = useContext(StoreContext);

  return (
    <div className='navbarAdmin'>
      <NavLink to="/"><img src={assetsAdmin.logo} alt="" className="logo" /></NavLink>
      {/* <img src={assetsAdmin.profile_image} className='profile' alt="" /> */}
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

export default NavbarAdmin
