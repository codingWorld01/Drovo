import React from 'react'
import './Sidebar.css'
import { assetsAdmin } from '../../assets/assetsAdmin'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/dashboard/add' className="sidebar-option">
            <img src={assetsAdmin.add_icon} alt="" />
            <p>Add Items</p>
        </NavLink>
        <NavLink to='/dashboard/list' className="sidebar-option">
            <img src={assetsAdmin.list_icon} alt="" />
            <p>List Items</p>
        </NavLink>
        <NavLink to='/dashboard/orders' className="sidebar-option">
            <img src={assetsAdmin.order_icon} alt="" />
            <p>Orders</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
