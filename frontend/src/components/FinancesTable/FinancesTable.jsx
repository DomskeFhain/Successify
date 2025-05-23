import * as React from "react";
import axios from "axios";
import { useAuth } from "../../components/AuthContex/AuthContex";
import { DataGrid } from "@mui/x-data-grid";
import { useApiErrorHandler } from "../HandleApiError/HandleApiError";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { alpha } from "@mui/material/styles";

export default function FinancesTable({
  rows,
  onUpdate,
  categorys,
  year,
  month,
  availableMonths,
  availableYears,
  loadAvailableMonths,
  loadAvailableYears,
  availableCategorys,
  updateCategorys,
}) {
  const { token } = useAuth();
  const [editData, setEditData] = useState(null);
  const [open, setOpen] = useState(false);
  const handleError = useApiErrorHandler();
  const [pageSize, setPageSize] = useState(rows.length >= 10 ? 10 : 5);

  const successifyBase = "#8B0000";
  const successifyMain = alpha(successifyBase, 0.7);
  const successifyDark = alpha(successifyBase, 0.9);
  const contrastText = "#fff";

  const handleEdit = (row) => {
    setEditData(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const newData = {
      financeId: editData.id,
      newCategory: editData.category,
      newNote: editData?.note || "",
      newCosts: editData.costs,
      newDate: editData.date,
    };

    try {
      await axios.put(`http://localhost:9000/finances`, newData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedDate = new Date(editData.date);
      const updatedYear = updatedDate.getFullYear();
      const updatedMonth = updatedDate.getMonth() + 1;

      if (!availableYears.includes(updatedYear)) {
        await loadAvailableYears();
      }

      if (year === updatedYear && !availableMonths.includes(updatedMonth)) {
        await loadAvailableMonths();
      }

      const isSameYear = updatedYear === year;
      const isSameMonth = updatedMonth === month;
      const isAllSelected = month === 0;

      if (isAllSelected || (isSameYear && isSameMonth)) {
        await onUpdate();
        if (!availableCategorys.includes(editData.category)) {
          await updateCategorys();
        }
      }

      if (onUpdate) onUpdate();
      handleClose();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:9000/finances/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (onUpdate) onUpdate();

      updateCategorys();
    } catch (error) {
      handleError(error);
    }
  };

  const columns = [
    { field: "category", headerName: "Category", width: 160 },
    { field: "note", headerName: "Note", width: 160 },
    { field: "costs", headerName: "Expenses (€)", type: "number", width: 160 },
    { field: "date", headerName: "Date", width: 160 },
    {
      field: "edit",
      headerName: "",
      width: 50,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) =>
        params.row.isPlaceholder ? null : (
          <IconButton
            onClick={() => handleEdit(params.row)}
            sx={{ color: "white" }}
          >
            <EditIcon />
          </IconButton>
        ),
    },
    {
      field: "delete",
      headerName: "",
      width: 50,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) =>
        params.row.isPlaceholder ? null : (
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            sx={{ color: "red" }}
          >
            <DeleteIcon />
          </IconButton>
        ),
    },
  ];

  return (
    <>
      <Paper>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize } },
          }}
          onPaginationModelChange={(model) => setPageSize(model.pageSize)}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
          sx={{
            border: 1,
            borderColor: "#8B0000",
            backgroundColor: "rgb(114, 114, 114)",
            color: "white",

            "& .MuiDataGrid-columnHeader": {
              alignItems: "center",
              justifyContent: "center",
            },

            "& .MuiDataGrid-columnHeaderTitleContainer": {
              justifyContent: "center",
            },

            "& .MuiDataGrid-columnHeaderTitle": {
              color: "#8B0000",
              fontWeight: "bold",
              textAlign: "center",
              width: "100%",
            },

            "& .MuiDataGrid-cell": {
              backgroundColor: "#444",
              color: "white",
              textAlign: "center",
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
            },

            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#555",
            },

            "& .MuiCheckbox-root svg": {
              fill: "white",
            },
            "& .MuiTablePagination-root": {
              color: "white",
              justifyContent: "center",
              alignContent: "center",
              height: 61,
            },
            "& .MuiTablePagination-toolbar": {
              color: "white",
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                color: "white",
              },
            "& .MuiTablePagination-select": {
              color: "white",
            },
            width: 750,
          }}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit entry</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <FormControl sx={{ minWidth: 200, marginTop: "0.5rem" }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              label="Category"
              value={editData?.category || ""}
              onChange={handleChange}
            >
              {categorys.map((category, index) => (
                <MenuItem key={index} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="costs"
            label="Expanses (€)"
            type="number"
            value={editData?.costs || ""}
            onChange={handleChange}
          />
          <TextField
            name="note"
            label="Note - Optional"
            value={editData?.note ?? ""}
            onChange={handleChange}
          />
          <TextField
            name="date"
            label="Date"
            type="date"
            value={editData?.date || ""}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="primary"
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
            onClick={handleSave}
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: successifyMain,
              color: contrastText,
              "&:hover": {
                backgroundColor: successifyDark,
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
