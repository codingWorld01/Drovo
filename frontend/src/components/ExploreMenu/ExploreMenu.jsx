import React, { useRef, useState, useEffect } from 'react';
import './ExploreMenu.css';
import { menu_list } from '../../assets/assetsUser';

const ExploreMenu = ({ category, setCategory }) => {
    const menuRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Check scroll visibility
    const updateScrollVisibility = () => {
        const menu = menuRef.current;
        if (menu) {
            setCanScrollLeft(menu.scrollLeft > 0);
            setCanScrollRight(menu.scrollLeft + menu.offsetWidth < menu.scrollWidth);
        }
    };

    useEffect(() => {
        updateScrollVisibility();
    }, []);

    const scrollMenu = (direction) => {
        const menu = menuRef.current;
        if (menu) {
            menu.scrollBy({
                left: direction === 'left' ? -200 : 200,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className='explore-menu' id='explore-menu'>
            <h1>Explore Our Menu</h1>
            <p className='explore-menu-text'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius totam aspernatur laudantium saepe perspiciatis similique porro illum minus enim nihil.</p>
            <div className="explore-menu-wrapper">
                {canScrollLeft && (
                    <button
                        className="scroll-arrow left-arrow"
                        onClick={() => scrollMenu('left')}
                    >
                        &#8592;
                    </button>
                )}
                <div
                    className='explore-menu-list'
                    ref={menuRef}
                    onScroll={updateScrollVisibility}
                >
                    {menu_list.map((item, index) => {
                        return (
                            <div
                                onClick={() => setCategory(prev => prev === item.menu_name ? "ALL" : item.menu_name)}
                                key={index}
                                className="explore-menu-list-item"
                            >
                                <img
                                    className={category === item.menu_name ? "active" : ""}
                                    src={item.menu_image}
                                    alt=""
                                />
                                <p>{item.menu_name}</p>
                            </div>
                        );
                    })}
                </div>
                {canScrollRight && (
                    <button
                        className="scroll-arrow right-arrow"
                        onClick={() => scrollMenu('right')}
                    >
                        &#8594;
                    </button>
                )}
            </div>
            <hr />
        </div>
    );
};


export default ExploreMenu;
