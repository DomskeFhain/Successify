import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContex/AuthContex';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './todo.css';

function Todo() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [editListId, setEditListId] = useState(null);
  const [editListName, setEditListName] = useState("");

  const axiosAuth = axios.create({
    baseURL: "http://localhost:9000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const handleError = (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      logout();
      navigate("/login");
    } else {
      console.error("Error:", error);
    }
  };

  const getList = async () => {
    try {
      const res = await axiosAuth.get("/todolist");
      setLists(res.data);
    } catch (error) {
      handleError(error);
    }
  };

  const postList = async () => {
    try {
      await axiosAuth.post("/todolist", { listName: newListName });
      setNewListName("");
      getList();
    } catch (error) {
      handleError(error);
    }
  };

  const updateList = async () => {
    try {
      await axiosAuth.put(`/todolist/${editListId}`, { listName: editListName });
      setEditListId(null);
      setEditListName("");
      getList();
    } catch (error) {
      handleError(error);
    }
  };

  const deleteList = async (listID) => {
    try {
      await axiosAuth.delete(`/todolist/${listID}`);
      getList();
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    getList();
  }, []);

  return (
    <div className="todo">
      <h1>Meine ToDo-Listen</h1>

      <div className="new-list">
        <input
          type="text"
          placeholder="Neue Liste eingeben"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
        />
        <button onClick={postList}>Hinzufügen</button>
      </div>

      <ul className="list-container">
        {lists.map((list) => (
          <li key={list.listID} className="list-item">
            {editListId === list.listID ? (
              <>
                <input
                  type="text"
                  value={editListName}
                  onChange={(e) => setEditListName(e.target.value)}
                />
                <button onClick={updateList}>Speichern</button>
                <button onClick={() => setEditListId(null)}>Abbrechen</button>
              </>
            ) : (
              <>
                <span>{list.listName}</span>
                <button onClick={() => {
                  setEditListId(list.listID);
                  setEditListName(list.listName);
                }}>
                  Bearbeiten
                </button>
                <button onClick={() => deleteList(list.listID)}>Löschen</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Todo;
