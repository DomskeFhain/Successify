import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContex/AuthContex';
import axios from 'axios';
import './todo.css';
import { useApiErrorHandler } from "../../components/HandleApiError/HandleApiError";

function Todo() {
  const handleError = useApiErrorHandler();
  const { token } = useAuth();
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [editListId, setEditListId] = useState(null);
  const [editListName, setEditListName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskName, setEditTaskName] = useState("");
  

  const axiosAuth = axios.create({
    baseURL: "http://localhost:9000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

//functions

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
    setLists(prevLists =>
      prevLists.map(list =>
        list.listID === editListId ? { ...list, listName: editListName } : list
      )
    );
    setEditListName("");
    setEditMode(false);
  } catch (error) {
    handleError(error);
  }
};

const deleteList = async (listID) => {
  try {
    await axiosAuth.delete(`/todolist/${listID}`);
    setEditListId(null);
    setEditListName("");
    setTasks([]);
    setEditMode(false);
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
      setNewTaskName("");
      getTask(listID);
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
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.taskID === taskID ? { ...task, taskName: editTaskName } : task
      )
    );

    setEditTaskName("");
    setEditTaskId(null);
  } catch (error) {
    handleError(error);
  }
};

const toggleEditDoneTask = async (taskID, doneStatus) => {
  try {
    const newStatus = doneStatus === 0 ? 1 : 0;
    await axiosAuth.put(`/tasks/${taskID}`, { taskDone: newStatus });

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.taskID === taskID ? { ...task, done: newStatus } : task
      )
    );
  } catch (error) {
    handleError(error);
  }
};

const handleDeleteTask = async (taskID) => {
  await deleteTask(taskID);
  getTask(editListId);
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
    <option key={list.listID} value={list.listID}>
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
    <div className='tasksContainer'>  
      <input
        type="text"
        placeholder="Neuer Eintrag eingeben"
        value={newTaskName}
        onChange={(e) => setNewTaskName(e.target.value)}
      />
      <button onClick={() => {postTask(editListId); getTask(editListId)}}>Hinzufügen</button>
      
      <ul>
        {tasks.map((task) => (
          <p key={task.taskID} style={task.done ? {textDecoration: "line-through"} : {textDecoration: "none"}}>
            {task.taskName}
            <input type="checkbox" onChange={() => toggleEditDoneTask(task.taskID, task.done)} checked={task.done}/>
            <button onClick={() => {
            setEditTaskId(task.taskID);
            setEditTaskName(task.taskName);}}>Bearbeiten</button>
            <button onClick={() => handleDeleteTask(task.taskID)}>Löschen</button>


            {editTaskId === task.taskID && (
              <div className="edit-controls">
                <input
                  type="text"
                  value={editTaskName}
                  onChange={(e) => setEditTaskName(e.target.value)}
                />
                <button onClick={() =>{ 
                updateTask(editTaskId);
                setEditTaskName("");
                getTask(editListId);
                setEditTaskId(null);}}>Speichern</button>
                <button onClick={() => setEditTaskId(null)}>Abbrechen</button>
              </div>
            )}
          </p>
        ))}
      </ul>
      </div>


        </>
      )}
    </div>
  )}
</div>
  );
}

export default Todo;
