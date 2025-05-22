import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";

const FinancesPieChartIncome = ({ finances, months }) => {
  const colors = {
    Salary: "#4CAF50",
    Freelance: "#2196F3",
    "Business Income": "#FF9800",
    Investments: "#9C27B0",
    "Rental Income": "#3F51B5",
    Dividends: "#00BCD4",
    Interest: "#8BC34A",
    Pension: "#FFC107",
    "Social Security": "#E91E63",
    "Unemployment Benefits": "#795548",
    "Child Support": "#CDDC39",
    Alimony: "#FF5722",
    "Scholarships & Grants": "#673AB7",
    "Government Assistance": "#03A9F4",
    Bonuses: "#F44336",
    Commission: "#009688",
    Royalties: "#FFEB3B",
    "Gifts Received": "#607D8B",
    "Tax Refunds": "#AED581",
    "Sale of Assets": "#BA68C8",
    "Side Hustle": "#F06292",
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
                : percent > 0 && percent >= 5 && `${percent.toFixed(1)}%`;
            },
            highlightScope: { fade: "global", highlight: "item" },
            faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
          },
        ]}
        height={380}
        width={450}
      />
    </>
  );
};

export default FinancesPieChartIncome;
