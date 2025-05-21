import React, { useState, useEffect } from "react";
import axios from "axios";
import "./shoppinglist.css";
import { useAuth } from "../../components/AuthContex/AuthContex";
import { useApiErrorHandler } from "../../components/HandleApiError/HandleApiError";
import { useNavigate, useLocation } from "react-router-dom";

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterDate, setFilterDate] = useState("");
  const [error, setError] = useState("");
  const { token } = useAuth();
  const handleError = useApiErrorHandler();
  const navigate = useNavigate();
  const location = useLocation();
  const fetchShoppingList = async () => {
    try {
      const response = await axios.get("http://localhost:9000/shoppinglist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setItems(response.data);
      setError("");
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchShoppingList();
  }, [token]);

  const handleAddItem = async (event) => {
    event.preventDefault();
    if (newItem.trim() !== "") {
      try {
        await axios.post(
          "http://localhost:9000/shoppinglist",
          {
            item: newItem,
            quantity: quantity,
            price: parseFloat(price) || 0,
            date: date || new Date().toISOString().split("T")[0],
            completed: false,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        fetchShoppingList();
        setNewItem("");
        setQuantity(1);
        setPrice("");
        setDate(new Date().toISOString().split("T")[0]);
        setError("");
      } catch (error) {
        handleError(error);
      }
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:9000/shoppinglist/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchShoppingList();
      setError("");
    } catch (error) {
      handleError(error);
    }
  };

  const toggleComplete = async (id) => {
    const currentItem = items.find((item) => item.id === id);
    if (currentItem) {
      try {
        await axios.put(
          `http://localhost:9000/shoppinglist/${id}`,
          {
            item: currentItem.item,
            quantity: currentItem.quantity,
            price: currentItem.price,
            date: currentItem.date,
            completed: !currentItem.completed,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        fetchShoppingList();
      } catch (error) {
        handleError(error);
      }
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    const currentItem = items.find((item) => item.id === id);
    if (newQuantity > 0) {
      try {
        await axios.put(
          `http://localhost:9000/shoppinglist/${id}`,
          {
            item: currentItem.item,
            quantity: newQuantity,
            price: currentItem.price,
            date: currentItem.date,
            completed: currentItem.completed,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        fetchShoppingList();
        setError("");
      } catch (error) {
        handleError(error);
      }
    }
  };

  const updatePrice = async (id, newPrice) => {
    const currentItem = items.find((item) => item.id === id);
    try {
      await axios.put(
        `http://localhost:9000/shoppinglist/${id}`,
        {
          item: currentItem.item,
          quantity: currentItem.quantity,
          price: parseFloat(newPrice) || 0,
          date: currentItem.date,
          completed: currentItem.completed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchShoppingList();
      setError("");
    } catch (error) {
      handleError(error);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const filteredItems = filterDate
    ? items.filter((item) => item.date === filterDate)
    : items;

  if (!token) {
    const currentLocation = location.pathname;

    navigate("/login", { state: { from: currentLocation } });
    return;
  }

  return (
    <div className="shopping-list-container">
      <h2>Shopping List</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="filter-container">
        <input
          type="date"
          value={filterDate}
          onChange={(event) => setFilterDate(event.target.value)}
          className="date-filter-input"
        />
        {filterDate && (
          <button
            onClick={() => setFilterDate("")}
            className="clear-filter-button"
          >
            Clear Filter
          </button>
        )}
      </div>
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
            placeholder="Quantity"
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
          <button type="submit" className="add-button">
            Add Item
          </button>
        </div>
      </form>
      <ul className="shopping-items">
        {filteredItems.map((item) => (
          <li
            key={item.id}
            className={`shopping-item ${item.completed ? "completed" : ""}`}
          >
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
                onChange={(event) =>
                  updateQuantity(item.id, parseInt(event.target.value))
                }
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
              <span className="item-total">
                {(item.price * item.quantity).toFixed(2)}€
              </span>
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
      {filteredItems.length > 0 && (
        <div className="shopping-list-total">
          <h3>Total: {calculateTotal().toFixed(2)}€</h3>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
