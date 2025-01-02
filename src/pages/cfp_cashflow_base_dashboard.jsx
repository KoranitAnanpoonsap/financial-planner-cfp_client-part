import { useEffect, useState } from "react"
import Footer from "../components/footer.jsx"
import Header from "../components/header.jsx"
import ClientBluePanel from "../components/clientBluePanel.jsx"
import { motion } from "framer-motion"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// Import the calculation functions
import {
  calculatePortfolioSummary,
  calculateYearlyIncome,
  calculateYearlyExpense,
  calculateGoalPayments,
} from "../utils/calculations.js"

// Animation configurations
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 1 },
}

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
}

export default function CFPCashflowBaseDashboard() {
  const [clientId] = useState(Number(localStorage.getItem("clientId")) || "")

  // State variables
  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])
  const [goals, setGoals] = useState([])
  const [portfolioReturn, setPortfolioReturn] = useState(0)

  const years = [1, 2, 3, 4, 5]

  const [selectedGoals, setSelectedGoals] = useState([])
  const [buttonStatus, setButtonStatus] = useState([])

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadDataFromLocalStorage = () => {
      try {
        // Retrieve and parse client incomes
        const incomesData = localStorage.getItem("clientIncomes")
        if (incomesData) {
          const parsedIncomes = JSON.parse(incomesData)
          setIncomes(parsedIncomes)
        } else {
          console.warn("No clientIncomes data found in localStorage.")
        }

        // Retrieve and parse client expenses
        const expensesData = localStorage.getItem("clientExpenses")
        if (expensesData) {
          const parsedExpenses = JSON.parse(expensesData)
          setExpenses(parsedExpenses)
        } else {
          console.warn("No clientExpenses data found in localStorage.")
        }

        // Retrieve and parse cashflow goals
        const goalsData = localStorage.getItem("cashflowGoals")
        if (goalsData) {
          const parsedGoals = JSON.parse(goalsData)
          setGoals(parsedGoals)

          // Initialize buttonStatus based on the number of goals
          const initialButtonStatus = parsedGoals.map(() => false)
          setButtonStatus(initialButtonStatus)
        } else {
          console.warn("No cashflowGoals data found in localStorage.")
        }

        // Retrieve and parse portfolio assets
        const assetsData = localStorage.getItem("portfolioAssets")
        if (assetsData) {
          const parsedAssets = JSON.parse(assetsData)

          // Calculate portfolio summary
          const { portReturn } = calculatePortfolioSummary(parsedAssets)
          setPortfolioReturn(portReturn)
        } else {
          console.warn("No portfolioAssets data found in localStorage.")
        }
      } catch (error) {
        console.error("Error parsing data from localStorage:", error)
        // Optionally, set default values or handle error state here
      }
    }

    loadDataFromLocalStorage()
  }, [clientId])

  // Perform calculations when incomes, expenses, goals, or portfolioReturn change
  const calculationResults = years.map((year) => {
    const incomeDetails = calculateYearlyIncome(incomes, year)
    const expenseDetails = calculateYearlyExpense(expenses, year)
    const totalIncome = incomeDetails.reduce(
      (sum, inc) => sum + parseFloat(Object.values(inc)[0]),
      0
    )
    const totalExpense = expenseDetails.reduce(
      (sum, exp) => sum + parseFloat(Object.values(exp)[0]),
      0
    )
    const netIncome = totalIncome - totalExpense

    // Pass 'expenses' as an additional argument to calculateGoalPayments
    const goalPayments = calculateGoalPayments(
      goals,
      portfolioReturn,
      expenses,
      year
    )
    const totalGoalPayments = goalPayments.reduce(
      (sum, g) => sum + parseFloat(Object.values(g)[0]),
      0
    )
    const netIncomeAfterGoals = netIncome - totalGoalPayments

    return {
      year,
      incomeDetails,
      expenseDetails,
      goalPayments,
      totalIncome,
      totalExpense,
      netIncome,
      netIncomeAfterGoals,
    }
  })

  // Determine if cash flow is sufficient for all goals
  const CashFlowSufficientAllGoals = () => {
    const sufficients = calculationResults.every(
      (r) => r.netIncomeAfterGoals >= 0
    )
    return (
      <div className="w-[300px] h-[300px] bg-gray-50 flex flex-col items-center py-1 gap-1">
        <div className="w-full h-8 bg-tfpa_light_blue flex items-center justify-center">
          กระแสเงินสดเพียงพอ
        </div>
        <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
          ต่อการออม
          <br />
          เพื่อทุกเป้าหมาย
          <span className="text-[48px] font-bold font-sans">
            {sufficients ? "เพียงพอ" : "ไม่เพียงพอ"}
          </span>
        </div>
      </div>
    )
  }

  // Chart for Income and Expenses
  const IncomeExpenseChart = () => {
    const xValues = years.map((year) => `ปีที่ ${year}`)
    const Incomes = calculationResults.map((result) => result.totalIncome)
    const Expenses = calculationResults.map((result) => result.totalExpense)

    const chartData = {
      labels: xValues,
      datasets: [
        {
          label: "รายได้",
          tension: 0,
          borderColor: "rgba(19, 83, 138, 0.5)",
          data: Incomes,
        },
        {
          label: "รายจ่าย",
          tension: 0,
          borderColor: "rgba(235, 67, 67, 0.5)",
          data: Expenses,
        },
      ],
    }

    return (
      <div className="flex w-[550px]">
        <Line data={chartData} />
      </div>
    )
  }

  // Determine if cash flow is sufficient for selected goals
  const CashFlowSufficientSelectedGoals = () => {
    const sufficients = selectedGoals.every((goal) => goal >= 0)
    let goalList = ""
    buttonStatus.forEach((status, index) => {
      if (status) {
        goalList += `${goals[index].id.clientGoalName}, `
      }
    })

    return (
      <div className="w-[300px] h-[300px] bg-gray-50 flex flex-col items-center py-1 gap-1">
        <div className="w-full h-8 bg-tfpa_light_blue flex items-center justify-center">
          กระแสเงินสดเพียงพอ
        </div>
        <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
          ต่อการออมของเป้าหมาย
          <br />
          <span className="text-[26px] font-bold text-[#219DFF]">
            {goalList.slice(0, -2)}
          </span>
          <span className="text-[48px] font-bold font-sans">
            {goalList.length === 0
              ? "-"
              : sufficients
              ? "เพียงพอ"
              : "ไม่เพียงพอ"}
          </span>
        </div>
      </div>
    )
  }

  // Chart for Cash Flow after Selected Goals
  const CashFlowDeductedSelectedGoals = () => {
    const xValues = years.map((year) => `ปีที่ ${year}`)

    const chartData = {
      labels: xValues,
      datasets: [
        {
          label: "กระแสเงินสดสุทธิตามเป้าหมายที่เลือก",
          tension: 0,
          borderColor: "rgba(19, 83, 138, 0.5)",
          data:
            selectedGoals.length > 0
              ? selectedGoals
              : calculationResults.map((r) => r.netIncome),
        },
      ],
    }

    return (
      <div className="flex w-[550px]">
        <Line data={chartData} />
      </div>
    )
  }

  // Analysis and Selection of Goals
  const CashFlowSelectedGoalsAnalysis = () => {
    const selectGoals = (e, goalIndex) => {
      e.preventDefault()
      const newButtonStatus = [...buttonStatus]
      newButtonStatus[goalIndex] = !newButtonStatus[goalIndex]

      // Update buttonStatus state
      setButtonStatus(newButtonStatus)

      // Calculate selected goals' impact on net income
      const updatedSelectedGoals = calculationResults.map((result) => {
        let totalGoalPaymentsForYear = 0
        newButtonStatus.forEach((status, index) => {
          if (status) {
            const goalPayment = parseFloat(
              result.goalPayments[index]?.[goals[index].id.clientGoalName] || 0
            )
            totalGoalPaymentsForYear += goalPayment
          }
        })
        return result.netIncome - totalGoalPaymentsForYear
      })

      setSelectedGoals(updatedSelectedGoals)
    }

    return (
      <>
        <div className="w-full h-[5px] flex bg-tfpa_blue rounded-3xl my-5"></div>
        <div className="w-full flex flex-row gap-2 items-center justify-center text-3xl">
          <div className="flex gap-10">
            {goals.map((goal, index) => (
              <div key={goal.id.clientGoalName} className="mx-1 flex gap-1">
                <input
                  type="checkbox"
                  className="w-[25px]"
                  onChange={(e) => selectGoals(e, index)}
                  checked={buttonStatus[index] || false}
                />
                <span>{goal.id.clientGoalName}</span>
              </div>
            ))}
          </div>
        </div>
        <CashFlowSufficientSelectedGoals />
        <CashFlowDeductedSelectedGoals />
      </>
    )
  }

  return (
    <div className="flex flex-col min-h-screen font-ibm font-bold text-tfpa_blue">
      <Header />
      <div className="flex flex-1">
        <ClientBluePanel />
        <div className="flex-1 p-4 space-y-8">
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <div className="flex flex-row py-1 px-10 gap-2 items-center justify-between flex-wrap">
              <CashFlowSufficientAllGoals />
              <IncomeExpenseChart />
              <CashFlowSelectedGoalsAnalysis />
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
