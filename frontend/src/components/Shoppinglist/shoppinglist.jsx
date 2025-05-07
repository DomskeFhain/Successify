import React, { useState } from 'react';
import './shoppinglist.css';

const ShoppingList = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState('');

    const handleAddItem = (event) => {
        event.preventDefault();
        if (newItem.trim() !== '') {
            setItems([...items, {
                id: Date.now(),
                name: newItem,
                completed: false,
                quantity: quantity,
                price: parseFloat(price) || 0
            }]);
            setNewItem('');
            setQuantity(1);
            setPrice('');
        }
    };

    const handleDeleteItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const toggleComplete = (id) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity > 0) {
            setItems(items.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            ));
        }
    };

    const updatePrice = (id, newPrice) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, price: parseFloat(newPrice) || 0 } : item
        ));
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <div className="shopping-list-container">
            <h2>Shopping List</h2>
            <form onSubmit={handleAddItem} className="shopping-list-form">
                <div className="form-row">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Add new item..."
                        className="shopping-list-input"
                    />
                    <input
                        type="number"
                        value={quantity}
                        onChange={(event) => setQuantity(parseInt(event.target.value) || 1)}
                        min="1"
                        className="quantity-input"
                    />
                    <div className="price-input-container">
                        <input
                            type="number"
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                            placeholder="Price"
                            step="0.01"
                            min="0"
                            className="price-input"
                        />
                        <span className="euro-symbol">€</span>
                    </div>
                    <button type="submit" className="add-button">Add Item</button>
                </div>
            </form>
            <ul className="shopping-items">
                {items.map(item => (
                    <li key={item.id} className={`shopping-item ${item.completed ? 'completed' : ''}`}>
                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleComplete(item.id)}
                        />
                        <span className="item-name">{item.name}</span>
                        <div className="item-details">
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                min="1"
                                className="quantity-input"
                            />
                            <div className="price-input-container">
                                <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => updatePrice(item.id, e.target.value)}
                                    step="0.01"
                                    min="0"
                                    className="price-input"
                                />
                                <span className="euro-symbol">€</span>
                            </div>
                            <span className="item-total">{(item.price * item.quantity).toFixed(2)}€</span>
                            <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="delete-button"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            {items.length > 0 && (
                <div className="shopping-list-total">
                    <h3>Total: {calculateTotal().toFixed(2)}€</h3>
                </div>
            )}
        </div>
    );
};

export default ShoppingList; 
