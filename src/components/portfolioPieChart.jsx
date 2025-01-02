import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

const getColorForType = (type) => {
  switch (type) {
    case "หุ้นไทย":
      return "#FF6384"
    case "หุ้นต่างประเทศ":
      return "#36A2EB"
    case "เงินฝาก":
      return "#FFCE56"
    case "ทองคำ":
      return "#4BC0C0"
    case "ตราสารหนี้":
      return "#9966FF"
    case "หุ้นกู้":
      return "#FF9F40"
    case "การลงทุนอื่นๆ":
      return "#2B0B3F"
    default:
      return "#CCCCCC"
  }
}

export default function PortfolioPieChart({
  assets,
  width = 500,
  height = 500,
}) {
  // Prepare data for the pie chart
  const dataMap = {}
  assets.forEach((asset) => {
    const { investType, investAmount } = asset
    dataMap[investType] = (dataMap[investType] || 0) + investAmount
  })

  const chartData = {
    labels: Object.keys(dataMap),
    datasets: [
      {
        data: Object.values(dataMap),
        backgroundColor: Object.keys(dataMap).map(getColorForType),
      },
    ],
  }

  return (
    <div style={{ width: `${width}px`, height: `${height}px` }}>
      <Pie data={chartData} />
    </div>
  )
}
