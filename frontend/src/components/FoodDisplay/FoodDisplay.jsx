import React from 'react';
import './FoodDisplay.css';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category, foodItems, shopId }) => {
    // Filter the food items based on the selected category
    const filteredItems = foodItems.filter(
        (item) => category === 'ALL' || category === item.category
    );

    return (
        <div className='food-display' id='food-display'>
            <div className="food-display-list">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <FoodItem
                            key={item._id}
                            id={item._id}
                            name={item.name}
                            description={item.description}
                            price={item.price}
                            image={item.image}
                            quantity={item.quantity}
                            unit={item.unit}
                            shopId={shopId}
                        />
                    ))
                ) : (
                    <p className="no-items-message">
                        No food items available in the "{category}" category.
                    </p>
                )}
            </div>
        </div>
    );
};

export default FoodDisplay;
