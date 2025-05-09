import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './shoppinglist.css';
import { useAuth } from '../../components/AuthContex/AuthContex';
import { useNavigate } from 'react-router-dom';

const ShoppingList = () => {
    const [items, setItems] = useState([]);
    const navigate = useNavigate();
    const [newItem, setNewItem] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const { token, logout } = useAuth();

    const fetchShoppingList = async () => {
        try {
            const response = await axios.get('http://localhost:9000/shoppinglist', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setItems(response.data);
            setError('');
        } catch (error) {
            if (
                error.response &&
                (error.response.status === 401 || error.response.status === 403)
            ) {
                logout();
                navigate("/login");
            } else {
                console.error("error during saving attempt:", error);
            }
        }
    };

    useEffect(() => {
        fetchShoppingList();
    }, [token]);

    const handleAddItem = async (event) => {
        event.preventDefault();
        if (newItem.trim() !== '') {
            try {
                await axios.post('http://localhost:9000/shoppinglist', {
                    item: newItem,
                    quantity: quantity,
                    price: parseFloat(price) || 0,
                    date: date
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                fetchShoppingList();
                setNewItem('');
                setQuantity(1);
                setPrice('');
                setDate(new Date().toISOString().split('T')[0]);
                setError('');
            } catch (err) {
                setError('Fehler beim Hinzufügen des Items.');
                console.error('Fehler beim Hinzufügen des Items:', err);
            }
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`http://localhost:9000/shoppinglist/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchShoppingList();
            setError('');
        } catch (err) {
            setError('Fehler beim Löschen des Items.');
            console.error('Fehler beim Löschen des Items:', err);
        }
    };

    const toggleComplete = (id) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const updateQuantity = async (id, newQuantity) => {
        if (newQuantity > 0) {
            try {
                await axios.put(`http://localhost:9000/shoppinglist/${id}`, {
                    quantity: newQuantity
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                fetchShoppingList();
                setError('');
            } catch (err) {
                setError('Fehler beim Aktualisieren der Menge.');
                console.error('Fehler beim Aktualisieren der Menge:', err);
            }
        }
    };

    const updatePrice = async (id, newPrice) => {
        try {
            await axios.put(`http://localhost:9000/shoppinglist/${id}`, {
                price: parseFloat(newPrice) || 0
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchShoppingList();
            setError('');
        } catch (err) {
            setError('Fehler beim Aktualisieren des Preises.');
            console.error('Fehler beim Aktualisieren des Preises:', err);
        }
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <div className="shopping-list-container">
            <h2>Shopping List</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleAddItem} className="shopping-list-form">
                <div className="form-row">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(event) => setNewItem(event.target.value)}
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
                    <input
                        type="date"
                        className="date-input"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                    />
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
                        <span className="item-name">{item.item}</span>
                        <div className="item-details">
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(event) => updateQuantity(item.id, parseInt(event.target.value))}
                                min="1"
                                className="quantity-input"
                            />
                            <div className="price-input-container">
                                <input
                                    type="number"
                                    value={item.price}
                                    onChange={(event) => updatePrice(item.id, event.target.value)}
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