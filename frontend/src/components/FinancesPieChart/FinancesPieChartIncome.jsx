import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";

const FinancesPieChartIncome = ({ finances, months }) => {
  console.log(finances);
  const colors = {
    Rent: "#FF6384",
    Groceries: "#36A2EB",
    Insurance: "#FFCE56",
    Transportation: "#4BC0C0",
    Leisure: "#9966FF",
    Health: "#FF9F40",
    Clothing: "#66FF66",
    Household: "#FF6666",
    Communication: "#66B2FF",
    Education: "#CC99FF",
    Travel: "#FFCC99",
    Miscellaneous: "#C0C0C0",
    Utilities: "#669999",
    Subscriptions: "#FF99CC",
    "Dining Out": "#99FFCC",
    Childcare: "#FFB347",
    "Debt Repayment": "#B19CD9",
    Pets: "#FF7F50",
    "Gifts & Donations": "#90EE90",
    Entertainment: "#FFD700",
    "Maintenance & Repairs": "#A52A2A",
  };

  const summedCategory = finances
    .reduce((sc, element) => {
      const existing = sc.find((item) => item.label === element.category);
      if (existing) {
        existing.value += element.income;
      } else {
        sc.push({ label: element.category, value: element.income });
      }
      return sc;
    }, [])
    .map((item, index) => ({
      id: index,
      label: `${item.label}: ${parseFloat(item.value.toFixed(2))}€`,
      value: parseFloat(item.value.toFixed(2)),
      color: colors[item.label],
    }));

  const totalCosts = parseFloat(
    summedCategory.reduce((total, item) => total + item.value, 0).toFixed(2)
  );

  summedCategory.sort((a, b) => b.value - a.value);

  summedCategory.push({
    id: summedCategory.length,
    label: `Total: ${totalCosts}€`,
    value: 0,
    color: "none",
  });

  return (
    <>
      <PieChart
        series={[
          {
            data: summedCategory,
            valueFormatter: (item) =>
              `${((item.value / totalCosts) * 100).toFixed(1)}%`,
            arcLabel: (item) => {
              const percent = (item.value / totalCosts) * 100;
              return months === 0
                ? percent >= 10
                  ? `${percent.toFixed(1)}%`
                  : ""
                : percent > 0 && `${percent.toFixed(1)}%`;
            },
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

export default FinancesPieChartIncome;
