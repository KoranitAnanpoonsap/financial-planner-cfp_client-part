import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/footer.jsx"
import Header from "../components/header.jsx"
import ClientBluePanel from "../components/clientBluePanel.jsx"
import { motion } from "framer-motion"
import {
  calculatePortfolioSummary,
  calculateYearlyIncome,
  calculateYearlyExpense,
  calculateGoalPayments,
} from "../utils/calculations.js"

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

// LocalStorage keys
const LOCALSTORAGE_KEY_ASSETS = "portfolioAssets"
const LOCALSTORAGE_KEY_INCOMES = "clientIncomes"
const LOCALSTORAGE_KEY_EXPENSES = "clientExpenses"
const LOCALSTORAGE_KEY_GOALS = "cashflowGoals"

export default function CFPCashflowBaseCalculated() {
  const [cfpId] = useState(Number(localStorage.getItem("cfpId")) || "")
  const [clientId] = useState(Number(localStorage.getItem("clientId")) || "")
  const navigate = useNavigate()

  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])
  const [goals, setGoals] = useState([])
  const [portfolioReturn, setPortfolioReturn] = useState(0)

  const years = [1, 2, 3, 4, 5]

  useEffect(() => {
    loadDataFromLocalStorage()
  }, [clientId])

  const loadDataFromLocalStorage = () => {
    // Load incomes
    const storedIncomes =
      JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY_INCOMES)) || []
    setIncomes(storedIncomes)

    // Load expenses
    const storedExpenses =
      JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY_EXPENSES)) || []
    setExpenses(storedExpenses)

    // Load goals
    const storedGoals =
      JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY_GOALS)) || []
    setGoals(storedGoals)

    // Load assets and calculate portfolio return
    const storedAssets =
      JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY_ASSETS)) || []
    const { portReturn } = calculatePortfolioSummary(storedAssets)
    setPortfolioReturn(portReturn)
  }

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

  const handleDashboard = () => {
    navigate(`/cashflow-base-dashboard`)
  }

  return (
    <div className="flex flex-col min-h-screen">
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
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full bg-white border border-gray-300 text-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                      (บาท)
                    </th>
                    {calculationResults.map((r) => (
                      <th
                        key={r.year}
                        className="py-2 px-4 border font-ibm font-bold text-tfpa_blue"
                      >
                        ปี {r.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Incomes */}
                  <tr>
                    <td
                      className="py-2 px-4 border text-lg font-ibm font-extrabold text-tfpa_blue"
                      colSpan={1}
                    >
                      รายได้
                    </td>
                    {calculationResults.map((r, i) => (
                      <td key={i} className="border"></td>
                    ))}
                  </tr>
                  {incomes.map((inc) => (
                    <tr key={inc.id.clientIncomeName}>
                      <td className="py-2 px-4 border font-ibm font-semibold text-tfpa_blue_panel_select">
                        {inc.id.clientIncomeName}
                      </td>
                      {calculationResults.map((r, i) => {
                        const detail = r.incomeDetails.find(
                          (d) => Object.keys(d)[0] === inc.id.clientIncomeName
                        )
                        const val = detail
                          ? detail[inc.id.clientIncomeName]
                          : "0.00"
                        return (
                          <td
                            key={i}
                            className="py-2 px-4 border text-center font-ibm font-semibold text-tfpa_blue_panel_select"
                          >
                            {parseFloat(val).toLocaleString()}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  {/* Total Income */}
                  <tr className="border-t-2">
                    <td className="py-2 px-4 border font-ibm font-semibold text-tfpa_gold">
                      รวมรายได้
                    </td>
                    {calculationResults.map((r, i) => (
                      <td
                        key={i}
                        className="py-2 px-4 border text-center font-ibm font-semibold text-tfpa_gold"
                        style={{ color: "#d4a017" }}
                      >
                        {r.totalIncome.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  {/* Expenses */}
                  <tr>
                    <td
                      className="py-2 px-4 border text-lg font-ibm font-bold text-tfpa_blue"
                      colSpan={1}
                    >
                      รายจ่าย
                    </td>
                    {calculationResults.map((r, i) => (
                      <td key={i} className="border"></td>
                    ))}
                  </tr>
                  {expenses.map((exp) => (
                    <tr key={exp.id.clientExpenseName}>
                      <td className="py-2 px-4 border font-ibm font-semibold text-tfpa_blue_panel_select">
                        {exp.id.clientExpenseName}
                      </td>
                      {calculationResults.map((r, i) => {
                        const detail = r.expenseDetails.find(
                          (d) => Object.keys(d)[0] === exp.id.clientExpenseName
                        )
                        const val = detail
                          ? detail[exp.id.clientExpenseName]
                          : "0.00"
                        return (
                          <td
                            key={i}
                            className="py-2 px-4 border text-center font-ibm font-semibold text-tfpa_blue_panel_select"
                          >
                            {parseFloat(val).toLocaleString()}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  {/* Total Expense */}
                  <tr className="border-t-2">
                    <td className="py-2 px-4 border font-ibm font-semibold text-tfpa_gold">
                      รวมรายจ่าย
                    </td>
                    {calculationResults.map((r, i) => (
                      <td
                        key={i}
                        className="py-2 px-4 border text-center font-ibm font-semibold text-tfpa_gold"
                        style={{ color: "#d4a017" }}
                      >
                        {r.totalExpense.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  {/* Net Income */}
                  <tr className="border-t-2">
                    <td className="py-2 px-4 border text-lg font-ibm font-semibold text-tfpa_blue">
                      กระแสเงินสดสุทธิ
                    </td>
                    {calculationResults.map((r, i) => (
                      <td
                        key={i}
                        className="py-2 px-4 border text-center font-ibm font-semibold text-tfpa_blue"
                      >
                        {r.netIncome.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  {/* Goals */}
                  {goals.map((goal) => (
                    <tr key={goal.id.clientGoalName}>
                      <td className="py-2 px-4 border text-lg text-red-600 font-ibm font-semibold">
                        การออมเพื่อเป้าหมาย {goal.id.clientGoalName}
                      </td>
                      {calculationResults.map((r, i) => {
                        const pay = r.goalPayments.find(
                          (g) => Object.keys(g)[0] === goal.id.clientGoalName
                        )
                        const val = pay ? pay[goal.id.clientGoalName] : "0.00"
                        return (
                          <td
                            key={i}
                            className="py-2 px-4 border text-center text-red-600 font-ibm font-semibold"
                          >
                            {parseFloat(val).toLocaleString()}
                          </td>
                        )
                      })}
                    </tr>
                  ))}

                  {/* Net Income After Goals */}
                  <tr className="border-t-2">
                    <td className="py-2 px-4 border text-lg font-ibm font-semibold text-tfpa_blue">
                      กระแสเงินสดสุทธิหลังเป้าหมาย
                    </td>
                    {calculationResults.map((r, i) => {
                      const style = {}
                      if (r.netIncomeAfterGoals < 0) {
                        style.backgroundColor = "#f28b82" // Light red
                      }
                      return (
                        <td
                          key={i}
                          className="py-2 px-4 border text-center font-ibm font-semibold text-tfpa_blue"
                          style={style}
                        >
                          {r.netIncomeAfterGoals.toLocaleString()}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={handleDashboard}
                className="bg-tfpa_blue hover:bg-tfpa_blue_hover text-white px-4 py-2 rounded"
              >
                Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
