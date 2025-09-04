import React from 'react'
import './Sidebar.css'
import { NavLink } from 'react-router-dom'
import { Home, Plus, List, ShoppingCart } from 'lucide-react'

const Sidebar = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className='sidebar'>
        <div className="sidebar-options">
          <NavLink to='/' className="sidebar-option">
            <Home className="sidebar-icon" size={20} />
            <p>Dashboard</p>
          </NavLink>
          <NavLink to='/dashboard/add' className="sidebar-option">
            <Plus className="sidebar-icon" size={20} />
            <p>Add Items</p>
          </NavLink>
          <NavLink to='/dashboard/list' className="sidebar-option">
            <List className="sidebar-icon" size={20} />
            <p>List Items</p>
          </NavLink>
          <NavLink to='/dashboard/orders' className="sidebar-option">
            <ShoppingCart className="sidebar-icon" size={20} />
            <p>Orders</p>
          </NavLink>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className='mobile-bottom-nav'>
        <NavLink to='/' className="nav-item">
          <Home className="nav-icon" size={20} />
          <span className="nav-label">Home</span>
        </NavLink>
        <NavLink to='/dashboard/orders' className="nav-item">
          <ShoppingCart className="nav-icon" size={20} />
          <span className="nav-label">Orders</span>
        </NavLink>
        <NavLink to='/dashboard/add' className="nav-item add-item">
          <Plus className="nav-icon" size={24} />
          <span className="nav-label">Add</span>
        </NavLink>
        <NavLink to='/dashboard/list' className="nav-item">
          <List className="nav-icon" size={20} />
          <span className="nav-label">List</span>
        </NavLink>
      </div>
    </>
  )
}

export default Sidebar