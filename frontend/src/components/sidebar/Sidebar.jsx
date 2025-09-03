import React from 'react'
import './Sidebar.css'
import { assetsAdmin } from '../../assets/assetsAdmin'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className='sidebar'>
        <div className="sidebar-options">
          <NavLink to='/' className="sidebar-option">
            <span className="sidebar-icon">🏠</span>
            <p>Dashboard</p>
          </NavLink>
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

      {/* Mobile Bottom Navigation */}
      <div className='mobile-bottom-nav'>
        <NavLink to='/' className="nav-item">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </NavLink>
        <NavLink to='/dashboard/orders' className="nav-item">
          <span className="nav-icon">📋</span>
          <span className="nav-label">Orders</span>
        </NavLink>
        <NavLink to='/dashboard/add' className="nav-item add-item">
          <span className="nav-icon">+</span>
          <span className="nav-label">Add</span>
        </NavLink>
        <NavLink to='/dashboard/list' className="nav-item">
          <span className="nav-icon">📝</span>
          <span className="nav-label">List</span>
        </NavLink>
      </div>
    </>
  )
}

export default Sidebar
