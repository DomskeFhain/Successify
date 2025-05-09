import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";

const FinancesPieChart = ({ finances }) => {
  const summedCategory = finances
    .reduce((sc, element) => {
      const existing = sc.find((item) => item.label === element.category);
      if (existing) {
        existing.value += element.costs;
      } else {
        sc.push({ label: element.category, value: element.costs });
      }
      return sc;
    }, [])
    .map((item, index) => ({
      id: index,
      label: item.label,
      value: parseFloat(item.value.toFixed(2)),
    }));

  return (
    <PieChart series={[{ data: summedCategory }]} height={300} width={400} />
  );
};

export default FinancesPieChart;
