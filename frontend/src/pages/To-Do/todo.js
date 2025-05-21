import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContex/AuthContex';
import axios from 'axios';
import './todo.css';
import { useApiErrorHandler } from "../../components/HandleApiError/HandleApiError";
import Button from '@mui/material/Button';

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
    if (newListName === "") {
      alert("Listname darf nicht leer sein"); 
      return;}
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
    if (newTaskName === "") {
      alert("Taskname darf nicht leer sein");
      return;
    }
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
  <div className="new-list">
    <input
      type="text"
      placeholder="Neue Liste eingeben"
      value={newListName}
      onChange={(e) => setNewListName(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && postList()}
    />
    <Button 
    variant='outlined'
    color="red"
    size="small"
    onClick={postList}>Hinzufügen</Button>
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
          <div className="list-edit-buttons">
            <Button 
            variant='outlined'
              color="red"
              size="small"
              onClick={() => setEditMode(true)}>Bearbeiten</Button>
            <Button 
            variant='outlined'
            color='red'
            size='small'
            onClick={() => deleteList(editListId)}>Löschen</Button>
          </div>
        

          {editMode && (
            <div className="edit-controls">
              <input
                type="text"
                value={editListName}
                onChange={(e) => setEditListName(e.target.value)}
              />
              <Button
              variant='outlined'
                color="red"
                size="small"
                onClick={() => {
                  updateList();
                  setEditMode(false);
                }}
              >
                Speichern
              </Button>
              <Button 
              variant='outlined'
              color='red'
              size='small'
              onClick={() => setEditMode(false)}>Abbrechen</Button>
            </div>
          )}
      <div className="task-input-group">
          <input
          type="text"
          placeholder="Neuer Eintrag eingeben"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && postTask(editListId) && getTask(editListId)}
          />
          <Button 
          variant='outlined'
            color='red'
            size='small'
            onClick={() => {postTask(editListId); getTask(editListId)}}
          >
          Hinzufügen
          </Button>
      </div>
      
      <ul>
        {tasks.map((task) => (
          <p className='task' key={task.taskID} style={task.done ? {textDecoration: "line-through"} : {textDecoration: "none"}}>
            {task.taskName}
            <input className='task-checkbox' type="checkbox" onChange={() => toggleEditDoneTask(task.taskID, task.done)} checked={task.done}/>
            <div className="task-edit-buttons">
            <Button 
            variant='outlined'
            color="red"
            size="small"
            onClick={() => {
            setEditTaskId(task.taskID);
            setEditTaskName(task.taskName);}}>Bearbeiten</Button>
            <Button
            variant='outlined' 
            color="red"
            size="small"
            onClick={() => handleDeleteTask(task.taskID)}>Löschen</Button>
            </div>

            {editTaskId === task.taskID && (
              <div className="edit-controls">
                <input
                  type="text"
                  value={editTaskName}
                  onChange={(e) => setEditTaskName(e.target.value)}
                />
                <Button 
                variant='outlined'
                color="red"
                size="small"
                onClick={() =>{ 
                updateTask(editTaskId);
                setEditTaskName("");
                getTask(editListId);
                setEditTaskId(null);}}>Speichern</Button>
                <Button 
                variant='outlined'
                color="red"
                size="small"
                onClick={() => setEditTaskId(null)}>Abbrechen</Button>
              </div>
            )}
          </p>
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
