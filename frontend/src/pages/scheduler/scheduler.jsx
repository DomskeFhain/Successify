import React, { useState, useEffect } from 'react';
import Scheduler from "react-mui-scheduler";
import { useAuth } from "../../components/AuthContex/AuthContex";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, InputLabel
} from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import { useApiErrorHandler } from "../../components/HandleApiError/HandleApiError";


function SchedulerComponent() {
  const { token, logout } = useAuth();
  const handleError = useApiErrorHandler();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [newEventData, setNewEventData] = useState({
    label: '',
    startHour: '',
    endHour: '',
    date: '',
    groupLabel: '',
    color: '#2196f3'
  });
  const [updateScheduler, setUpdate] = useState(0);


  const getCurrentMonthAndYear = () => {
    const now = new Date();
    return {
      month: String(now.getMonth() + 1).padStart(2, '0'),
      year: now.getFullYear()
    };
  };

  const [currentDate, setCurrentDate] = useState(getCurrentMonthAndYear());
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [schedulerMode, setSchedulerMode] = useState('month');

  useEffect(() => {
    setUpdate(prev => prev + 1);
  }, [events]);

  useEffect(() => {
    fetchEvents();
  }, []);


  const fetchEvents = async (month = currentDate.month, year = currentDate.year) => {
    try {
      const response = await axios.get(
        `http://localhost:9000/scheduler?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data)
      const serverEvents = response.data.map(event => ({
        id: String(event.id),
        label: event.label,
        groupLabel: event.groupLabel,
        color: event.color,
        startHour: convertTo12HourFormat(event.startHour),
        endHour: convertTo12HourFormat(event.endHour),
        date: event.date,
        createdAt: new Date(event.createdAt),
        createdBy: event.createdBy,
      }));
      setEvents(serverEvents);
      console.log("Events: DEBUGG AFTER FOMRATTER", serverEvents);
    } catch (error) {
      handleError(error);
    }
  };

  const convertTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(':');
    let suffix = 'AM';
    let hour = parseInt(hours, 10);
    if (hour >= 12) {
      suffix = 'PM';
      if (hour > 12) hour -= 12;
    }
    if (hour === 0) hour = 12;

    return `${String(hour).padStart(2, '0')}:${minutes} ${suffix}`;
  };

  // // ALT 
  // const convertTo12HourFormat = (time) => {
  //   const [hours, minutes] = time.split(':');
  //   let suffix = 'AM';
  //   let hour = parseInt(hours, 10);
  //   if (hour >= 12) {
  //     suffix = 'PM';
  //     if (hour > 12) hour -= 12;
  //   }
  //   return ${hour}:${minutes} ${suffix};
  // };


  const convertTo24HourFormat = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = String(parseInt(hours) + 12);
    if (modifier === 'AM' && hours === '12') hours = '00';
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const handleCellClick = (event, row, day) => {
    setNewEventData({
      label: '',
      startHour: '',
      endHour: '',
      date: day.dateString,
      groupLabel: '',
      color: '#2196f3'
    });
    setEditingEvent(false);
    setCurrentEventId(null);
    setOpenDialog(true);
  };

  const handleEventClick = (event, item) => {
    setNewEventData({
      label: item.label,
      groupLabel: item.groupLabel,
      startHour: convertTo24HourFormat(item.startHour),
      endHour: convertTo24HourFormat(item.endHour),
      date: item.date,
      color: item.color
    });
    setEditingEvent(true);
    setCurrentEventId(item.id);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingEvent(false);
    setCurrentEventId(null);
  };

  const handleDialogSubmit = () => {
    const { label, groupLabel, date, startHour, endHour, color } = newEventData;

    if (!label || !groupLabel || !date || !startHour || !endHour || !color) {
      setAlertMessage("Bitte fülle alle Felder aus.");
      setAlertSeverity("warning");
      setAlertOpen(true);
      return;
    }

    const payload = {
      ...newEventData,
      startHour: newEventData.startHour,
      endHour: newEventData.endHour,
    };
    const headers = { Authorization: `Bearer ${token}` };

    if (editingEvent && currentEventId) {
      axios.put(`http://localhost:9000/scheduler/${currentEventId}`, payload, { headers })
        .then(() => {
          setAlertMessage("Termin erfolgreich aktualisiert.");
          setAlertSeverity("success");
          setAlertOpen(true);
          fetchEvents();
          handleDialogClose();
        })
        .catch(error => {
          setAlertMessage("Fehler beim Aktualisieren.");
          setAlertSeverity("error");
          setAlertOpen(true);
          handleError(error);
          console.error("Fehler beim Aktualisieren:", error);
        });
    } else {
      axios.post(`http://localhost:9000/scheduler`, payload, { headers })
        .then(() => {
          setAlertMessage("Neuer Termin erfolgreich erstellt.");
          setAlertSeverity("success");
          setAlertOpen(true);
          fetchEvents();
          handleDialogClose();
        })
        .catch(error => {
          setAlertMessage("Fehler beim Erstellen.");
          setAlertSeverity("error");
          setAlertOpen(true);
          handleError(error);
          console.error("Fehler beim Erstellen:", error);
        });
    }
  };

  const handleInputChange = (field, value) => {
    setNewEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleDialogDelete = () => {
    if (currentEventId) {
      axios.delete(`http://localhost:9000/scheduler/${currentEventId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          fetchEvents();
          handleDialogClose();
        })
        .catch(error => {
          handleError(error);
          console.error("Fehler beim Löschen:", error);
        });
    }
  };

  return (
    <>
      <Scheduler
        locale="en"
        events={events}
        key={updateScheduler}
        legacyStyle={false}
        options={{
          transitionMode: "fade",
          startWeekOn: "mon",
          defaultMode: "month",
          mode: schedulerMode,
          minWidth: 540,
          maxWidth: 540,
          minHeight: 540,
          maxHeight: 540
        }}
        alertProps={{
          open: true,
          color: "success",
          severity: "success",
          message: "🚀 Let's start with the Successify Scheduler ✅✅✅",
          showActionButton: false,
          showNotification: false,
          delay: 1500
        }}
        toolbarProps={{
          showSearchBar: false,
          showSwitchModeButtons: true,
          showDatePicker: true
        }}
        onEventsChange={() => { }}
        onDateChange={(newDate) => {
          const newMonth = String(newDate.getMonth() + 1).padStart(2, '0');
          const newYear = newDate.getFullYear();
          setCurrentDate({ month: newMonth, year: newYear });
          fetchEvents(newMonth, newYear);
        }}
        onModechange={(mode) => {
          console.log("Mode ändert sich zu:", mode)
          setSchedulerMode(mode)
        }}
        onCellClick={handleCellClick}
        onTaskClick={handleEventClick}
        onAlertCloseButtonClicked={() => { }}
      />

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{editingEvent ? "Recreate the Date" : "Create a new Date"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            fullWidth
            value={newEventData.label}
            onChange={(e) => handleInputChange('label', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Event Type"
            fullWidth
            value={newEventData.groupLabel}
            onChange={(e) => handleInputChange('groupLabel', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newEventData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Start Time (z.B. 08:00)"
            fullWidth
            value={newEventData.startHour}
            onChange={(e) => handleInputChange('startHour', e.target.value)}
          />
          <TextField
            margin="dense"
            label="End Time (z.B. 09:30)"
            fullWidth
            value={newEventData.endHour}
            onChange={(e) => handleInputChange('endHour', e.target.value)}
          />
          <InputLabel>Farbe</InputLabel>
          <input
            type="color"
            value={newEventData.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            style={{ width: '100%', height: '40px', marginTop: '5px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogSubmit} variant="contained">
            {editingEvent ? "Save" : "Create"}
          </Button>
          {editingEvent && (
            <Button onClick={handleDialogDelete} variant="contained" color="error">
              Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Snackbar
        open={alertOpen}
        autoHideDuration={1000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default SchedulerComponent;
