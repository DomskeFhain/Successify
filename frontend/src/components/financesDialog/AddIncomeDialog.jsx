import { useState, useEffect } from "react";
import axios from "axios";
import { useApiErrorHandler } from "../HandleApiError/HandleApiError";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

function AddIncomeDialog({
  open,
  onClose,
  categories,
  token,
  updateIncome,
  year,
  updateYears,
  month,
  updateMonths,
  availableYears,
  availableMonths,
}) {
  const handleError = useApiErrorHandler();
  const [addData, setAddData] = useState({
    category: "",
    note: "",
    income: "",
    date: "",
  });
  const [errors, setErrors] = useState({});

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const successifyBase = "#8B0000";
  const successifyMain = alpha(successifyBase, 0.7);
  const successifyDark = alpha(successifyBase, 0.9);
  const contrastText = "#fff";

  useEffect(() => {
    if (!open) return;
    const YearToday = new Date().getFullYear();
    let date;

    if (year === currentYear && month === currentMonth) {
      date = new Date();
    } else if (month === 0) {
      date = new Date(year === "All" ? YearToday : year, 1);
    } else {
      date = new Date(year === "All" ? YearToday : year, 1);
    }

    const formatted = date.toISOString().split("T")[0];
    setAddData((prev) => ({ ...prev, date: formatted }));
  }, [year, month, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!addData.category) newErrors.category = "Please select a category!";
    if (!addData.income || isNaN(addData.income))
      newErrors.income = "Please enter a valid income";
    if (!addData.date) newErrors.date = "Please enter a Date";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      await axios.post("http://localhost:9000/financesIncome", addData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const addedDate = new Date(addData.date);
      const addedYear = addedDate.getFullYear();
      const addedMonth = addedDate.getMonth() + 1;

      if (addedMonth === month || month === 0) {
        updateIncome();
      }
      if (!availableMonths.includes(addedMonth)) {
        updateMonths();
      }
      if (!availableYears.includes(addedYear)) {
        updateYears();
      }
      onClose();
      setAddData({ category: "", note: "", income: "", date: "" });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Income</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <FormControl sx={{ minWidth: 200, marginTop: "0.3rem" }}>
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            label="Category"
            value={addData?.category || ""}
            onChange={handleChange}
          >
            {categories.map((cat, i) => (
              <MenuItem key={i} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
          {errors.category && <p style={{ color: "red" }}>{errors.category}</p>}
        </FormControl>
        <TextField
          name="income"
          label="Income (€)"
          type="number"
          value={addData?.income || ""}
          onChange={handleChange}
        />
        {errors.income && <p style={{ color: "red" }}>{errors.income}</p>}
        <TextField
          name="note"
          label="Note - Optional"
          value={addData?.note || ""}
          onChange={handleChange}
        />
        <TextField
          name="date"
          label="Date"
          type="date"
          value={addData?.date || ""}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        {errors.date && <p style={{ color: "red" }}>{errors.date}</p>}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose();
            setAddData({ category: "", note: "", income: "", date: "" });
          }}
          sx={{
            color: successifyMain,
            "&:hover": {
              color: successifyDark,
              backgroundColor: alpha(successifyBase, 0.1),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{
            backgroundColor: successifyMain,
            color: contrastText,
            "&:hover": {
              backgroundColor: successifyDark,
            },
          }}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddIncomeDialog;
