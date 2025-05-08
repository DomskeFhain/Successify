import * as React from "react";
import axios from "axios";
import { useAuth } from "../../components/AuthContex/AuthContex";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
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
import { useState } from "react";

export default function FinancesTable({ rows, onUpdate }) {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [editData, setEditData] = useState(null);
  const [open, setOpen] = useState(false);

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

      if (onUpdate) onUpdate();

      handleClose();
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        logout();
        navigate("/login");
      } else {
        console.error("Error during Saving Attempt:", error);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:9000/finances/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        logout();
        navigate("/login");
      } else {
        console.error("Error during Deletion:", error);
      }
    }
  };

  const columns = [
    { field: "category", headerName: "Category", width: 150 },
    { field: "costs", headerName: "Costs (€)", type: "number", width: 150 },
    { field: "date", headerName: "Date", width: 150 },
    {
      field: "edit",
      headerName: "",
      width: 80,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
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
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
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
            pagination: { paginationModel: { page: 0, pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            backgroundColor: "rgb(114, 114, 114)",
            color: "white",

            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "green",
            },

            "& .MuiDataGrid-columnHeader": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },

            "& .MuiDataGrid-columnHeaderTitleContainer": {
              justifyContent: "center",
            },

            "& .MuiDataGrid-columnHeaderTitle": {
              color: "blue",
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
          }}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit entry</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            name="category"
            label="Category"
            value={editData?.category || ""}
            onChange={handleChange}
            sx={{ marginTop: "0.5rem" }}
          />
          <TextField
            name="costs"
            label="Costs (€)"
            type="number"
            value={editData?.costs || ""}
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
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
