import React, { useEffect, useState } from "react";
import "./Finances.css";
import axios from "axios";
import { useAuth } from "../../components/AuthContex/AuthContex";
import { useApiErrorHandler } from "../../components/HandleApiError/HandleApiError";
import FinancesTable from "../../components/FinancesTable/FinancesTable";
import FinancesPieChart from "../../components/FinancesPieChart/FinancesPieChart";
import FinancesPieChartIncome from "../../components/FinancesPieChart/FinancesPieChartIncome";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";
import FinancesTableIncome from "../../components/FinancesTable/FinancesTableIncome";
import AddExpenseDialog from "../../components/financesDialog/AddExpanseDialog";
import AddIncomeDialog from "../../components/financesDialog/AddIncomeDialog";
import { useNavigate, useLocation } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

function Finances() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleError = useApiErrorHandler();

  const [finances, setFinances] = useState(null);
  const [income, setIncome] = useState(null);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [openExpense, setOpenExpense] = useState(false);
  const [openIncome, setOpenIncome] = useState(false);
  const [hasAutoSelectedMonth, setHasAutoSelectedMonth] = useState(false);
  const [profit, setProfit] = useState(0);
  const [availableExpanseCategorys, setAvailableExpanseCategorys] = useState(
    []
  );
  const [filterCategory, setFilterCategory] = useState("");
  const [filtering, setFiltering] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingExpanses, setLoadingExpanses] = useState(true);
  const [loadingIncome, setLoadingIncome] = useState(true);

  const successifyBase = "#8B0000";
  const successifyMain = alpha(successifyBase, 0.7);
  const successifyDark = alpha(successifyBase, 0.9);
  const contrastText = "#fff";

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

  const incomeCategories = [
    "Salary",
    "Freelance",
    "Business Income",
    "Investments",
    "Rental Income",
    "Dividends",
    "Interest",
    "Pension",
    "Social Security",
    "Unemployment Benefits",
    "Child Support",
    "Alimony",
    "Scholarships & Grants",
    "Government Assistance",
    "Bonuses",
    "Commission",
    "Royalties",
    "Gifts Received",
    "Tax Refunds",
    "Sale of Assets",
    "Side Hustle",
  ];

  // Load Data
  // Monthly Finaces
  async function loadFinances() {
    try {
      if (year === "All") {
        if (month === 0) {
          let query = `http://localhost:9000/allFinances?`;

          if (filterCategory) {
            query += `category=${filterCategory}`;
          }
          const response = await axios.get(query, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setLoadingExpanses(false);
          setInitialLoading(false);
          return setFinances(response.data);
        } else {
          const paddedMonth = month.toString().padStart(2, "0");
          let query = `http://localhost:9000/allFinances?month=${paddedMonth}`;

          if (filterCategory) {
            query += `&category=${filterCategory}`;
          }
          const response = await axios.get(query, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setLoadingExpanses(false);
          setInitialLoading(false);
          return setFinances(response.data);
        }
      }
      if (month === 0) {
        let query = `http://localhost:9000/yearlyFinances?year=${year}`;

        if (filterCategory) {
          query += `&category=${filterCategory}`;
        }
        const response = await axios.get(query, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLoadingExpanses(false);
        setInitialLoading(false);
        return setFinances(response.data);
      }
      const paddedMonth = month.toString().padStart(2, "0");
      const lastDayOfMonth = new Date(year, month, 0).getDate();

      let query = `http://localhost:9000/monthlyFinances?startDate=${year}-${paddedMonth}-01&endDate=${year}-${paddedMonth}-${lastDayOfMonth}`;

      if (filterCategory) {
        query += `&category=${filterCategory}`;
      }

      const response = await axios.get(query, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoadingExpanses(false);
      setInitialLoading(false);
      return setFinances(response.data);
    } catch (error) {
      if (error.response.status === 404) {
        setFinances(null);
        setInitialLoading(false);
        setLoadingExpanses(false);
        loadAvailableMonths();
        loadAvailableYears();
      }
      handleError(error);
    }
  }

  // Monthly Income

  async function loadIncome() {
    try {
      if (year === "All") {
        if (month === 0) {
          let query = `http://localhost:9000/allIncome`;

          const response = await axios.get(query, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setLoadingIncome(false);
          return setIncome(response.data);
        } else {
          const paddedMonth = month.toString().padStart(2, "0");
          let query = `http://localhost:9000/allIncome?month=${paddedMonth}`;

          const response = await axios.get(query, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setLoadingIncome(false);
          return setIncome(response.data);
        }
      }
      if (month === 0) {
        const response = await axios.get(
          `http://localhost:9000/yearlyFinancesIncome?year=${year}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLoadingIncome(false);
        return setIncome(response.data);
      }
      const paddedMonth = month.toString().padStart(2, "0");
      const lastDayOfMonth = new Date(year, month, 0).getDate();

      const response = await axios.get(
        `http://localhost:9000/monthlyFinancesIncome?startDate=${year}-${paddedMonth}-01&endDate=${year}-${paddedMonth}-${lastDayOfMonth}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoadingIncome(false);
      return setIncome(response.data);
    } catch (error) {
      if (error.response.status === 404) {
        setIncome(null);
        setLoadingIncome(false);
        loadAvailableMonths();
        loadAvailableYears();
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
      const todayYear = new Date().getFullYear();

      if (response.data.length === 0) {
        return setAvailableYears([todayYear]);
      }
      const availableYearsArray = response.data.map((year) => year.years);

      if (!availableYearsArray.includes(todayYear.toString())) {
        availableYearsArray.push(todayYear.toString());
        availableYearsArray.sort((a, b) => b - a);
      }
      return setAvailableYears(availableYearsArray);
    } catch (error) {
      handleError(error);
    }
  }

  // Load Available Months

  async function loadAvailableMonths() {
    try {
      if (filtering) {
        loadAvailableFilteredMonths();
        return;
      }
      if (year === "All") {
        const response = await axios.get(
          `http://localhost:9000/allFinancesMonths`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.length === 0) {
          return setAvailableMonths([]);
        }
        const availableMonthsArray = response.data.map((month) =>
          Number(month.months)
        );
        return setAvailableMonths(availableMonthsArray);
      }
      const response = await axios.get(
        `http://localhost:9000/financesMonths?year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.length === 0) {
        return setAvailableMonths([]);
      }
      const availableMonthsArray = response.data.map((month) =>
        Number(month.months)
      );
      return setAvailableMonths(availableMonthsArray);
    } catch (error) {
      handleError(error);
    }
  }

  // load available Filtered Months

  async function loadAvailableFilteredMonths() {
    try {
      let query = `http://localhost:9000/financesFilteredMonths`;

      if (year !== "All") {
        query += `?year=${year}`;
      }
      const response = await axios.get(query, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.length === 0) {
        return setAvailableMonths([]);
      }
      const availableMonthsArray = response.data.map((month) =>
        Number(month.months)
      );
      return setAvailableMonths(availableMonthsArray);
    } catch (error) {
      handleError(error);
    }
  }

  // load available ExpanseCategorys

  async function loadAvailableExpansesCategorys() {
    try {
      let query;
      if (year === "All") {
        query = "http://localhost:9000/financesCategorys";

        if (month !== 0) {
          const paddedMonth = month.toString().padStart(2, "0");
          query += `?month=${paddedMonth}`;
        }

        const response = await axios.get(query, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.length === 0) {
          return setAvailableExpanseCategorys([]);
        }
        const availableExpanseCategorysArray = response.data.map(
          (category) => category.category
        );

        if (
          filterCategory !== "" &&
          !availableExpanseCategorysArray.includes(filterCategory)
        ) {
          availableExpanseCategorysArray.push(filterCategory);
        }
        return setAvailableExpanseCategorys(availableExpanseCategorysArray);
      }

      if (month === 0) {
        query = `http://localhost:9000/financesCategorys?year=${year}`;
      } else {
        const paddedMonth = month.toString().padStart(2, "0");
        const lastDayOfMonth = new Date(year, month, 0).getDate();

        query = `http://localhost:9000/financesCategorys?startDate=${year}-${paddedMonth}-01&endDate=${year}-${paddedMonth}-${lastDayOfMonth}`;
      }

      const response = await axios.get(query, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.length === 0) {
        return setAvailableExpanseCategorys([]);
      }
      const availableExpanseCategorysArray = response.data.map(
        (category) => category.category
      );

      if (
        filterCategory !== "" &&
        !availableExpanseCategorysArray.includes(filterCategory)
      ) {
        availableExpanseCategorysArray.push(filterCategory);
      }
      return setAvailableExpanseCategorys(availableExpanseCategorysArray);
    } catch (error) {
      handleError(error);
    }
  }

  const handleMonthChange = (event) => {
    setMonth(Number(event.target.value));
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
    setMonth(0);
  };

  const handleFilterCategoryChange = (event) => {
    setFilterCategory(event.target.value);
    if (event.target.value === "") {
      setFiltering(false);
    } else {
      setFiltering(true);
    }
  };

  // Filter Expanses

  useEffect(() => {
    if (!filtering) {
      loadIncome();
      loadAvailableMonths();
    }
  }, [filtering]);

  // Get available Years
  useEffect(() => {
    loadAvailableYears();
  }, []);

  // Get Available Months
  useEffect(() => {
    loadAvailableMonths();
  }, [year, filtering, month, filterCategory]);

  // Get Available Categorys

  useEffect(() => {
    loadAvailableExpansesCategorys();
  }, [month, year, filterCategory]);

  // Auto Select current Month if available

  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;
    if (
      !hasAutoSelectedMonth &&
      month === 0 &&
      availableMonths.includes(currentMonth)
    ) {
      setMonth(currentMonth);
      setHasAutoSelectedMonth(true);
    }
  }, [availableMonths, month, hasAutoSelectedMonth]);

  // Load Finaces Overvies
  useEffect(() => {
    loadFinances();
    loadIncome();
  }, [month, year]);

  useEffect(() => {
    loadFinances();
  }, [filterCategory]);

  useEffect(() => {
    setLoadingExpanses(true);
    setLoadingIncome(true);
  }, [year, month, filterCategory]);

  useEffect(() => {
    const totalIncome = income
      ? income.reduce((sum, income) => sum + income.income, 0)
      : 0;
    const totalExpanses = finances
      ? finances.reduce((sum, expanse) => sum + expanse.costs, 0)
      : 0;

    setProfit(parseFloat(totalIncome - totalExpanses).toFixed(2));
  }, [finances, income]);

  if (!token) {
    const currentLocation = location.pathname;

    navigate("/login", { state: { from: currentLocation } });
    return;
  }

  if (initialLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifySelf: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress sx={{ color: successifyBase }} />
      </Box>
    );
  }

  return (
    <>
      <div id="header" className="fade-up">
        <div id="center">
          <h1>Finances Overview for</h1>
          {availableYears.length > 0 && (
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select label="Year" value={year} onChange={handleYearChange}>
                <MenuItem key={`yearOption-all`} value="All">
                  All
                </MenuItem>
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
                <MenuItem key="all" value={0}>
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
          {availableExpanseCategorys.length > 0 && (
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Filter Expenses</InputLabel>
              <Select
                label="Filter Expanses"
                value={filterCategory}
                onChange={handleFilterCategoryChange}
              >
                <MenuItem key={`filterOption-all`} value="">
                  All
                </MenuItem>
                {availableExpanseCategorys.map((filterOption, index) => (
                  <MenuItem key={`filterOption-${index}`} value={filterOption}>
                    {filterOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
        <div className="addButtons">
          <Button
            variant="contained"
            onClick={() => {
              setOpenExpense(true);
            }}
            sx={{
              backgroundColor: successifyMain,
              color: contrastText,
              "&:hover": {
                backgroundColor: successifyDark,
              },
            }}
          >
            Add Expense
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setOpenIncome(true);
            }}
            sx={{
              backgroundColor: successifyMain,
              color: contrastText,
              "&:hover": {
                backgroundColor: successifyDark,
              },
            }}
          >
            Add Income
          </Button>
        </div>
      </div>
      <div id="content">
        {finances || income ? (
          <>
            <h1 className="topic fade-up">Expenses</h1>
            <div className="left fade-left">
              {loadingExpanses ? (
                <Box
                  sx={{
                    display: "flex",
                    justifySelf: "center",
                    alignItems: "center",
                    height: "4rem",
                  }}
                >
                  <CircularProgress sx={{ color: successifyBase }} />
                </Box>
              ) : (
                <>
                  {finances ? (
                    <FinancesPieChart finances={finances} months={month} />
                  ) : (
                    <p className="data">no data</p>
                  )}
                </>
              )}
            </div>
            <div className="right fade-left">
              {loadingExpanses ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <CircularProgress sx={{ color: successifyBase }} />
                </Box>
              ) : (
                <>
                  {finances ? (
                    <FinancesTable
                      rows={finances}
                      onUpdate={loadFinances}
                      categorys={financeCategories}
                      year={year}
                      month={month}
                      availableMonths={availableMonths}
                      availableYears={availableYears}
                      loadAvailableMonths={loadAvailableMonths}
                      loadAvailableYears={loadAvailableYears}
                      availableCategorys={availableExpanseCategorys}
                      updateCategorys={loadAvailableExpansesCategorys}
                    />
                  ) : (
                    <p className="data">no data</p>
                  )}
                </>
              )}
            </div>
            {!filtering && (
              <>
                <h1 className="topic fade-up">Income</h1>
                <div className="left fade-left">
                  {loadingIncome ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifySelf: "center",
                        alignItems: "center",
                        height: "4rem",
                      }}
                    >
                      <CircularProgress sx={{ color: successifyBase }} />
                    </Box>
                  ) : (
                    <>
                      {income ? (
                        <FinancesPieChartIncome
                          finances={income}
                          months={month}
                        />
                      ) : (
                        <p className="data">no data</p>
                      )}
                    </>
                  )}
                </div>
                <div className="right fade-left">
                  {loadingIncome ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifySelf: "center",
                        alignItems: "center",
                        height: "4rem",
                      }}
                    >
                      <CircularProgress sx={{ color: successifyBase }} />
                    </Box>
                  ) : (
                    <>
                      {income ? (
                        <FinancesTableIncome
                          rows={income}
                          onUpdate={loadIncome}
                          categorys={incomeCategories}
                          year={year}
                          month={month}
                          availableMonths={availableMonths}
                          availableYears={availableYears}
                          loadAvailableMonths={loadAvailableMonths}
                          loadAvailableYears={loadAvailableYears}
                        />
                      ) : (
                        <p className="data">no data</p>
                      )}
                    </>
                  )}
                </div>
                {profit >= 0 ? (
                  <h1 className="topic fade-up" style={{ color: "green" }}>
                    Profit: {profit}€
                  </h1>
                ) : (
                  <h1 className="topic fade-up" style={{ color: "red" }}>
                    Loss: {Math.abs(profit)}€
                  </h1>
                )}
              </>
            )}
          </>
        ) : (
          <div id="noData" className="fade-up">
            <p className="data">no data</p>
          </div>
        )}
      </div>

      <AddExpenseDialog
        open={openExpense}
        onClose={() => setOpenExpense(false)}
        categories={financeCategories}
        token={token}
        updateFinances={loadFinances}
        year={year}
        updateYears={loadAvailableYears}
        month={month}
        updateMonths={loadAvailableMonths}
        availableYears={availableYears}
        availableMonths={availableMonths}
        availableCategorys={availableExpanseCategorys}
        updateCategorys={loadAvailableExpansesCategorys}
      />

      <AddIncomeDialog
        open={openIncome}
        onClose={() => setOpenIncome(false)}
        categories={incomeCategories}
        token={token}
        updateIncome={loadIncome}
        year={year}
        updateYears={loadAvailableYears}
        month={month}
        updateMonths={loadAvailableMonths}
        availableYears={availableYears}
        availableMonths={availableMonths}
      />
    </>
  );
}

export default Finances;
