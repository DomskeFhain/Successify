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
      label: `${item.label}: ${item.value.toFixed(2)} €`,
      value: parseFloat(item.value.toFixed(2)),
    }));

  const totalCosts = parseFloat(
    summedCategory.reduce((total, item) => total + item.value, 0).toFixed(2)
  );

  summedCategory.push({
    id: summedCategory.length,
    label: `Total: ${totalCosts}€`,
    value: 0,
    color: "none",
    style: { Color: "red" },
  });

  return (
    <>
      <PieChart
        series={[
          {
            data: summedCategory,
            valueFormatter: () => "",
            arcLabel: (item) =>
              item.value > 0 &&
              `${((item.value / totalCosts) * 100).toFixed(1)}%`,
            highlightScope: { fade: "global", highlight: "item" },
            faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
          },
        ]}
        height={300}
        width={400}
      />
    </>
  );
};

export default FinancesPieChart;
