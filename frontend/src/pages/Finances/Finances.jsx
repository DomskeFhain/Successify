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

  const [open, setOpen] = useState(false);
  const [addData, setAddData] = useState(null);
  const [addErrorCategory, setAddErrorCategory] = useState(null);
  const [addErrorCosts, setAddErrorCosts] = useState(null);

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

  const handleAdd = () => {
    setAddData({ date: new Date().toISOString().split("T")[0] });
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

  const years = Array.from(
    { length: 5 },
    (_, index) => new Date().getFullYear() - index
  );

  async function loadFinances() {
    const paddedMonth = month.toString().padStart(2, "0");
    const lastDayOfMonth = new Date(year, month, 0).getDate();

    try {
      const response = await axios.get(
        `http://localhost:9000/monthlyFinances?startDate=${year}-${paddedMonth}-01&endDate=${year}-${paddedMonth}-${lastDayOfMonth}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFinances(response.data);
    } catch (error) {
      if (error.response.status === 404) {
        setFinances(null);
      }
      handleError(error);
    }
  }

  useEffect(() => {
    loadFinances();
  }, [month, year]);

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  return (
    <>
      <div id="header">
        <div id="center">
          <h1>Finances Overview for</h1>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Month</InputLabel>
            <Select label="Month" value={month} onChange={handleMonthChange}>
              <MenuItem value={1}>January</MenuItem>
              <MenuItem value={2}>February</MenuItem>
              <MenuItem value={3}>March</MenuItem>
              <MenuItem value={4}>April</MenuItem>
              <MenuItem value={5}>May</MenuItem>
              <MenuItem value={6}>June</MenuItem>
              <MenuItem value={7}>July</MenuItem>
              <MenuItem value={8}>August</MenuItem>
              <MenuItem value={9}>September</MenuItem>
              <MenuItem value={10}>October</MenuItem>
              <MenuItem value={11}>November</MenuItem>
              <MenuItem value={12}>December</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select label="Year" value={year} onChange={handleYearChange}>
              {years.map((yearOption) => (
                <MenuItem key={yearOption} value={yearOption}>
                  {yearOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
