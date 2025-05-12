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
  const [editMode, setEditMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editDoneTask, setEditDoneTask] = useState(0);
  

  const axiosAuth = axios.create({
    baseURL: "http://localhost:9000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

//functions

// handle error

  const handleError = (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      logout();
      navigate("/login");
    } else {
      console.error("Error:", error);
    }
  };

// list routes x functions

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

// Task Routes x Functions

  const getTask = async (listID) => {
    try {
      const res = await axiosAuth.get(`/tasks/${listID}`);
      return setTasks(res.data);
    } catch (error) {
      handleError(error);
    }
  };

  const postTask = async (listID) => {
    try {
      await axiosAuth.post(`/tasks/${listID}`, { taskName: newTaskName });
      getList();
    } catch (error) {
      handleError(error);
    }
  };

  const deleteTask = async (taskID) => {
    try {
      await axiosAuth.delete(`/tasks/${taskID}`);
      getList();
    } catch (error) {
      handleError(error);
    }
  };

  const updateTask = async (taskID) => {
    try {
      await axiosAuth.put(`/tasks/${taskID}`, { taskName: editTaskName });
      getList();
    } catch (error) {
      handleError(error);
    }
  };

  const toggleEditDoneTask = async (taskID, doneStatus) => {
    try {
      await axiosAuth.put(`/tasks/${taskID}`, { taskDone: doneStatus === 0 ? 1 : 0 });
      getList();
    } catch (error) {
      handleError(error);
    }
  };



// render

  useEffect(() => {
    getList();
  }, []);

  return (
<div className="todo">
  <h1>Successify | ToDo-Listen</h1>

  <div className="new-list">
    <input
      type="text"
      placeholder="Neue Liste eingeben"
      value={newListName}
      onChange={(e) => setNewListName(e.target.value)}
    />
    <button onClick={postList}>Hinzufügen</button>
  </div>

  {lists.length > 0 && (
    <div className="dropdown-container">
      <select
        onChange={(e) => {
          const selectedId = parseInt(e.target.value);
          const selectedList = lists.find((list) => list.listID === selectedId);
          setEditListId(selectedList.listID);
          setEditListName(selectedList.listName);
          getTask(selectedId);
        }}
        value={editListId || ""}
      >
        <option value="" disabled>Liste auswählen</option>
        {lists.map((list) => (
          <option onChange={(e) => getTask(list.listID)} setkey={list.listID} value={list.listID}>
            {list.listName}
          </option>
        ))}
      </select>

      {editListId && (
        <>
          <div className="edit-buttons">
            <button onClick={() => setEditMode(true)}>Bearbeiten</button>
            <button onClick={() => deleteList(editListId)}>Löschen</button>
          </div>

          {editMode && (
            <div className="edit-controls">
              <input
                type="text"
                value={editListName}
                onChange={(e) => setEditListName(e.target.value)}
              />
              <button
                onClick={() => {
                  updateList();
                  setEditMode(false);
                }}
              >
                Speichern
              </button>
              <button onClick={() => setEditMode(false)}>Abbrechen</button>
            </div>
          )}

      <input
        type="text"
        placeholder="Neuer Eintrag eingeben"
        value={newTaskName}
        onChange={(e) => setNewTaskName(e.target.value)}
      />
      <button onClick={() => {postTask(editListId); getTask(editListId)}}>Hinzufügen</button>

      <ul>
        {tasks.map((task) => (
          <li key={task.taskID}>
            {task.taskName}
            <input type="checkbox" onChange={() => toggleEditDoneTask(task.taskID, task.done)}/>
            <button onClick={() => {deleteTask(task.taskID); getTask(editListId)}}>Löschen</button>
            <button onClick={() => setEditTaskId(task.taskID)}>Bearbeiten</button>

            {editTaskId === task.taskID && (
              <div className="edit-controls">
                <input
                  type="text"
                  value={editTaskName}
                  onChange={(e) => setEditTaskName(e.target.value)}
                />
                <button onClick={() => updateTask(task.taskID)}>Speichern</button>
                <button onClick={() => setEditTaskId(null)}>Abbrechen</button>
              </div>
            )}
          </li>
        ))}
      </ul>


        </>
      )}
    </div>
  )}
</div>
  );
}

export default Todo;
