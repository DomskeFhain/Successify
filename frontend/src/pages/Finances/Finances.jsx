import React, { useEffect, useState } from "react";
import "./Finances.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/AuthContex/AuthContex";
import FinancesTable from "../../components/FinancesTable/FinancesTable";
import FinancesPieChart from "../../components/FinancesPieChart/FinancesPieChart";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

function Finances() {
  const { token, logout } = useAuth();
  const [finances, setFinances] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const navigate = useNavigate();

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
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        logout();
        navigate("/login");
      } else if (error.response.status === 404) {
        setFinances(null);
      } else {
        console.error("Error:", error);
      }
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
            <FinancesTable rows={finances} onUpdate={loadFinances} />
          ) : (
            <p>No Data available</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Finances;
