import React, { useEffect, useState } from "react";
import Scheduler from "react-mui-scheduler";
import axios from "axios";
import { useAuth } from "../../components/AuthContex/AuthContex";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";



function Calendar() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [alertProps, setAlertProps] = useState({
    open: false,
    color: "info",
    severity: "info",
    message: "",
    showActionButton: false,
    showNotification: true,
    delay: 1500
  });

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const currentYear = currentDate.getFullYear();

  const schedulerOptions = {
    transitionMode: "zoom",
    startWeekOn: "mon",
    defaultMode: "month",
    minWidth: 540,
    maxWidth: 540,
    minHeight: 540,
    maxHeight: 540
  };

  const toolbarOptions = {
    showSearchBar: true,
    showSwitchModeButtons: true,
    showDatePicker: true
  };

  useEffect(() => {
    let isMounted = true;

    axios
      .get(`http://localhost:9000/calendar?month=${currentMonth}&year=${currentYear}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        if (isMounted) {
          const mapped = res.data.map((entry) => ({
            id: entry.cal_id.toString(),
            label: entry.cal_title,
            groupLabel: "Event",
            user: "User",
            color: "#ff0000",
            startHour: entry.cal_time,
            endHour: entry.cal_time,
            date: entry.cal_date,
            createdAt: new Date(),
            createdBy: "You",
            description: entry.cal_description
          }));
          setEvents(mapped);
          setAlertProps((prev) => ({
            ...prev,
            open: true,
            color: "info",
            severity: "info",
            message: "✅ Your Calnendar is up to date",
            showActionButton: false,
          }));
        }
      })
      .catch((err) => {
        console.error("Error while loading events:", err);
        setAlertProps((prev) => ({
          ...prev,
          open: true,
          color: "error",
          severity: "error",
          message: "❌ Error while loading events",
        }));

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          logout();
          navigate("/login");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, logout]);

  const handleEventsChange = (newEventList) => {
    setEvents(newEventList);
  };

  return (
    <>
      <Scheduler
        key={events.length}
        locale="de"
        events={events}
        legacyStyle={false}
        options={schedulerOptions}
        toolbarProps={toolbarOptions}
        onEventsChange={handleEventsChange}
        onCellClick={() => { }}
        onTaskClick={() => { }}
        onAlertCloseButtonClicked={() =>
          setAlertProps((prev) => ({ ...prev, open: false }))
        }
      />
      <Snackbar
        open={alertProps.open}
        autoHideDuration={alertProps.delay}
        onClose={() => setAlertProps((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setAlertProps((prev) => ({ ...prev, open: false }))}
          severity={alertProps.severity}
          sx={{ width: "100%" }}
        >
          {alertProps.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Calendar;
