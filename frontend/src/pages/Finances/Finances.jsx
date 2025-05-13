import React, { useEffect, useState } from "react";
import "./Finances.css";
import axios from "axios";
import { useAuth } from "../../components/AuthContex/AuthContex";
import { useApiErrorHandler } from "../../components/HandleApiError/HandleApiError";
import FinancesTable from "../../components/FinancesTable/FinancesTable";
import FinancesPieChart from "../../components/FinancesPieChart/FinancesPieChart";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";

function Finances() {
  const { token } = useAuth();
  const handleError = useApiErrorHandler();

  const [finances, setFinances] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);

  const [open, setOpen] = useState(false);
  const [addData, setAddData] = useState(null);
  const [addErrorCategory, setAddErrorCategory] = useState(null);
  const [addErrorCosts, setAddErrorCosts] = useState(null);

  const MonthNames = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  const financeCategories = [
    "Rent",
    "Groceries",
    "Insurance",
    "Transportation",
    "Leisure",
    "Health",
    "Clothing",
    "Household",
    "Communication",
    "Education",
    "Travel",
    "Miscellaneous",
    "Utilities",
    "Subscriptions",
    "Dining Out",
    "Childcare",
    "Debt Repayment",
    "Pets",
    "Gifts & Donations",
    "Entertainment",
    "Maintenance & Repairs",
  ];

  // Add Entry

  const handleAdd = () => {
    setAddData({ date: new Date().toISOString().split("T")[0], note: "" });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setAddData(null);
    setAddErrorCosts(null);
    setAddErrorCategory(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!addData?.category) {
      return setAddErrorCategory("Please select a category!");
    }

    if (!addData?.costs || isNaN(addData.costs)) {
      return setAddErrorCosts("Please enter a valid expense");
    }

    try {
      await axios.post(`http://localhost:9000/finances`, addData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      handleClose();
      loadFinances();
    } catch (error) {
      handleError(error);
    }
  };

  // Load Data
  // Monthly Finaces
  async function loadFinances() {
    try {
      if (month === "all") {
        const response = await axios.get(
          `http://localhost:9000/yearlyFinances?year=${year}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return setFinances(response.data);
      }
      const paddedMonth = month.toString().padStart(2, "0");
      const lastDayOfMonth = new Date(year, month, 0).getDate();

      const response = await axios.get(
        `http://localhost:9000/monthlyFinances?startDate=${year}-${paddedMonth}-01&endDate=${year}-${paddedMonth}-${lastDayOfMonth}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return setFinances(response.data);
    } catch (error) {
      if (error.response.status === 404) {
        setFinances(null);
      }
      handleError(error);
    }
  }

  // Load Available Years

  async function loadAvailableYears() {
    try {
      const response = await axios.get(`http://localhost:9000/financesYears`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.length === 0) {
        return setAvailableYears([year]);
      }
      const availableYearsArray = response.data.map((year) => year.years);
      return setAvailableYears(availableYearsArray);
    } catch (error) {
      handleError(error);
    }
  }

  // Load Available Months

  async function loadAvailableMonths(year) {
    try {
      const response = await axios.get(
        `http://localhost:9000/financesMonths?year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.length === 0) {
        return setAvailableMonths([month]);
      }
      const availableMonthsArray = response.data.map((month) => month.months);
      return setAvailableMonths(availableMonthsArray);
    } catch (error) {
      handleError(error);
    }
  }

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  // Get available Years
  useEffect(() => {
    loadAvailableYears();
  }, []);

  // Get Available Months
  useEffect(() => {
    loadAvailableMonths(year);
  }, [year]);

  // Load Finaces Overvies
  useEffect(() => {
    loadFinances();
  }, [month, year]);

  return (
    <>
      <div id="header">
        <div id="center">
          <h1>Finances Overview for</h1>
          {availableYears.length > 0 && (
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select label="Year" value={year} onChange={handleYearChange}>
                {availableYears.map((yearOption, index) => (
                  <MenuItem key={`yearOption-${index}`} value={yearOption}>
                    {yearOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {availableMonths.length > 0 && (
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Month</InputLabel>
              <Select label="Month" value={month} onChange={handleMonthChange}>
                <MenuItem key="all" value="all">
                  All
                </MenuItem>
                {availableMonths.map((month, index) => (
                  <MenuItem key={`month-${index}`} value={month}>
                    {MonthNames[month]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
        <div>
          <Button variant="contained" color="primary" onClick={handleAdd}>
            Add Expense
          </Button>
        </div>
      </div>
      <div id="content">
        <div className="left">
          {finances ? (
            <FinancesPieChart finances={finances} />
          ) : (
            <p>No Data available</p>
          )}
        </div>
        <div className="right">
          {finances ? (
            <FinancesTable
              rows={finances}
              onUpdate={loadFinances}
              categorys={financeCategories}
            />
          ) : (
            <p>No Data available</p>
          )}
        </div>
      </div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <FormControl sx={{ minWidth: 200, marginTop: "0.5rem" }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              label="Category"
              value={addData?.category || ""}
              onChange={(e) => {
                handleChange(e);
                if (e.target.value) setAddErrorCategory(null);
              }}
            >
              {financeCategories.map((category, index) => (
                <MenuItem key={index} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {addErrorCategory && (
            <p style={{ color: "red", margin: 0 }}>{addErrorCategory}</p>
          )}
          <TextField
            name="costs"
            label="Expenses (€)"
            type="number"
            onChange={(e) => {
              handleChange(e);
              if (e.target.value) setAddErrorCosts(null);
            }}
          />
          {addErrorCosts && (
            <p style={{ color: "red", margin: 0 }}>{addErrorCosts}</p>
          )}
          <TextField
            name="note"
            label="Note - Optional"
            value={addData?.note ?? ""}
            onChange={handleChange}
          />
          <TextField
            name="date"
            label="Date"
            type="date"
            value={addData?.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Finances;
