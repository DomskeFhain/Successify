import React, { useEffect, useState } from "react";
import Scheduler from "react-mui-scheduler";
import axios from "axios";
import { useAuth } from "../../components/AuthContex/AuthContex";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

function Sceduler() {
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
      .get(`http://localhost:9000/sceduler?month=${currentMonth}&year=${currentYear}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        if (isMounted) {
          const mapped = res.data.map((entry) => ({
            id: entry.sced_id.toString(),
            label: entry.sced_title,
            groupLabel: entry.sced_event || "Termin",
            user: "You",
            color: "#3f51b5",
            startHour: entry.sced_start_time,
            endHour: entry.sced_end_time,
            date: entry.sced_date,
            createdAt: new Date(),
            createdBy: "You",
            description: entry.sced_description
          }));
          setEvents(mapped);
          setAlertProps((prev) => ({
            ...prev,
            open: true,
            severity: "info",
            message: "✅ Dein Terminplan ist aktuell.",
          }));
        }
      })
      .catch((err) => {
        console.error("Error while loading scheduler events:", err);
        setAlertProps((prev) => ({
          ...prev,
          open: true,
          severity: "error",
          message: "❌ Fehler beim Laden der Termine",
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
        onCellClick={() => {}}
        onTaskClick={() => {}}
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

export default Sceduler;
