import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/footer.jsx"
import Header from "../components/header.jsx"
import ClientBluePanel from "../components/clientBluePanel.jsx"
import { calculatePortfolioSummary } from "../utils/calculations.js"
import PortfolioPieChart from "../components/portfolioPieChart.jsx"
import { motion } from "framer-motion"

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

// Sample data for cashflow goals
const SAMPLE_GOALS = [
  {
    id: { clientId: 1, clientGoalName: "ซื้อบ้าน" },
    clientGoalValue: 2000000,
    clientGoalPeriod: 10,
  },
  {
    id: { clientId: 1, clientGoalName: "เรียนต่อต่างประเทศ" },
    clientGoalValue: 1000000,
    clientGoalPeriod: 5,
  },
]

export default function CFPCashflowBase() {
  const [cfpId] = useState(Number(localStorage.getItem("cfpId")) || "")
  const [clientId] = useState(Number(localStorage.getItem("clientId")) || "")
  const navigate = useNavigate()

  const [assets, setAssets] = useState([])
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [portfolioReturn, setPortfolioReturn] = useState(0)

  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])
  const [clientSavingGrowthRate, setClientSavingGrowthRate] = useState(0)

  const [goals, setGoals] = useState([])
  const [clientGoalName, setClientGoalName] = useState("")
  const [clientGoalValue, setClientGoalValue] = useState("")
  const [clientGoalPeriod, setClientGoalPeriod] = useState("")

  const [editMode, setEditMode] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  useEffect(() => {
    // Initialize sample goals in localStorage if not already present
    const storedGoals = localStorage.getItem(LOCALSTORAGE_KEY_GOALS)
    if (!storedGoals) {
      localStorage.setItem(LOCALSTORAGE_KEY_GOALS, JSON.stringify(SAMPLE_GOALS))
      setGoals(SAMPLE_GOALS)
      console.log("Sample goals have been initialized.")
    } else {
      try {
        const parsedGoals = JSON.parse(storedGoals)
        setGoals(parsedGoals)
      } catch (error) {
        console.error("Error parsing stored goals:", error)
        localStorage.setItem(
          LOCALSTORAGE_KEY_GOALS,
          JSON.stringify(SAMPLE_GOALS)
        )
        setGoals(SAMPLE_GOALS)
      }
    }
  }, [])

  useEffect(() => {
    loadDataFromLocalStorage()
  }, [clientId])

  const loadDataFromLocalStorage = () => {
    // Load assets
    const storedAssets =
      JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY_ASSETS)) || []
    setAssets(storedAssets)
    const { totalInvestAmount, portReturn } =
      calculatePortfolioSummary(storedAssets)
    setTotalInvestment(totalInvestAmount)
    setPortfolioReturn(portReturn)

    // Load incomes
    const storedIncomes =
      JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY_INCOMES)) || []
    setIncomes(storedIncomes)

    // Load expenses
    const storedExpenses =
      JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY_EXPENSES)) || []
    setExpenses(storedExpenses)
    const savingExpense = storedExpenses.find(
      (exp) => exp.clientExpenseType === "รายจ่ายเพื่อการออม"
    )
    if (savingExpense) {
      setClientSavingGrowthRate(
        (savingExpense.clientExpenseAnnualGrowthRate * 100).toFixed(2)
      )
    } else {
      setClientSavingGrowthRate(0)
    }

    // Load goals
    const storedGoals =
      JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY_GOALS)) || SAMPLE_GOALS
    setGoals(storedGoals)
  }

  const saveGoalsToLocalStorage = (updatedGoals) => {
    setGoals(updatedGoals)
    localStorage.setItem(LOCALSTORAGE_KEY_GOALS, JSON.stringify(updatedGoals))
  }

  const handleCreateOrUpdateGoal = () => {
    const newGoal = {
      id: {
        clientId: parseInt(clientId),
        clientGoalName: clientGoalName,
      },
      clientGoalValue: parseFloat(clientGoalValue),
      clientGoalPeriod: parseInt(clientGoalPeriod),
    }

    let updatedGoals = [...goals]
    if (editMode && editingGoal) {
      updatedGoals = updatedGoals.map((goal) =>
        goal.id.clientGoalName === editingGoal.id.clientGoalName
          ? newGoal
          : goal
      )
    } else {
      updatedGoals.push(newGoal)
    }

    saveGoalsToLocalStorage(updatedGoals)

    // Reset form
    setClientGoalName("")
    setClientGoalValue("")
    setClientGoalPeriod("")
    setEditMode(false)
    setEditingGoal(null)
  }

  const handleDeleteGoal = (goal) => {
    const updatedGoals = goals.filter(
      (g) => g.id.clientGoalName !== goal.id.clientGoalName
    )
    saveGoalsToLocalStorage(updatedGoals)
  }

  const handleEdit = (goal) => {
    setEditMode(true)
    setEditingGoal(goal)
    setClientGoalName(goal.id.clientGoalName)
    setClientGoalValue(goal.clientGoalValue.toString())
    setClientGoalPeriod(goal.clientGoalPeriod.toString())
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setEditingGoal(null)
    setClientGoalName("")
    setClientGoalValue("")
    setClientGoalPeriod("")
  }

  const handleCalculate = () => {
    navigate(`/cashflow-base-calculated/`)
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
            {/* Top Part: Chart and Summary */}
            <div className="flex justify-center items-center space-x-8">
              <PortfolioPieChart assets={assets} width={300} height={300} />
              <div className="flex flex-col justify-center space-y-2">
                <p className="text-lg font-ibm font-bold text-tfpa_blue">
                  เงินรวมปัจจุบันในการลงทุน: {totalInvestment.toLocaleString()}{" "}
                  บาท
                </p>
                <p className="text-lg font-ibm font-bold text-tfpa_blue">
                  ผลตอบแทนต่อปีของพอร์ตที่ลงทุนปัจจุบัน:{" "}
                  {(portfolioReturn * 100).toFixed(2)} %
                </p>
              </div>
              {/* Client Income Growth Table */}
              <div className="bg-blue-200 p-4 rounded">
                <h3 className="text-center font-bold mb-2 font-ibm text-tfpa_blue">
                  อัตราการเติบโตต่อปีของรายได้
                </h3>
                <table className="min-w-full bg-blue-100 border-blue-200">
                  <thead>
                    <tr className="bg-blue-300">
                      <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                        ชื่อรายได้
                      </th>
                      <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                        อัตราเติบโต (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomes.map((income) => (
                      <tr key={income.id.clientIncomeName}>
                        <td className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                          {income.id.clientIncomeName}
                        </td>
                        <td className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                          {(income.clientIncomeAnnualGrowthRate * 100).toFixed(
                            2
                          )}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Goal Input Section */}
            <div className="mt-4 mb-4">
              <h3 className="text-xl mb-2 font-ibm font-bold text-tfpa_blue">
                สร้างเป้าหมาย
              </h3>
              {/* Display Client Saving Growth Rate */}
              <div className="mb-4">
                <label className="text-tfpa_blue font-ibm font-bold mb-2">
                  อัตราเติบโตของเงินออม (%)
                </label>
                <p className="border rounded p-2 w-full bg-gray-100 font-ibm">
                  {clientSavingGrowthRate}%
                </p>
              </div>

              <label className="text-tfpa_blue font-ibm font-bold mb-2">
                ชื่อเป้าหมาย
              </label>
              <input
                type="text"
                placeholder="ชื่อเป้าหมาย"
                value={clientGoalName}
                onChange={(e) => setClientGoalName(e.target.value)}
                className="border rounded p-2 mb-2 w-full font-ibm focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
              />
              <label className="text-tfpa_blue font-ibm font-bold mb-2">
                จำนวนเงินเพื่อเป้าหมาย
              </label>
              <input
                type="number"
                placeholder="จำนวนเงินเพื่อเป้าหมาย"
                value={clientGoalValue}
                onChange={(e) => setClientGoalValue(e.target.value)}
                className="border rounded p-2 mb-2 w-full font-ibm focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
              />
              <label className="text-tfpa_blue font-ibm font-bold mb-2">
                ระยะเวลาเป้าหมาย (ปี)
              </label>
              <input
                type="number"
                placeholder="ระยะเวลาเป้าหมาย (ปี)"
                value={clientGoalPeriod}
                onChange={(e) => setClientGoalPeriod(e.target.value)}
                className="border rounded p-2 mb-2 w-full font-ibm focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
              />
              <div className="flex space-x-4">
                {editMode ? (
                  <>
                    <button
                      onClick={handleCreateOrUpdateGoal}
                      className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded font-ibm font-bold"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-300 hover:bg-gray-400 text-tfpa_blue px-4 py-2 rounded font-ibm font-bold"
                    >
                      ยกเลิก
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCreateOrUpdateGoal}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-ibm font-bold"
                  >
                    เพิ่มเป้าหมาย
                  </button>
                )}
              </div>
            </div>

            {/* Goals Table */}
            <div>
              <h3 className="text-lg mb-2 font-ibm font-bold text-tfpa_blue">
                เป้าหมายที่มีอยู่
              </h3>
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                      ชื่อเป้าหมาย
                    </th>
                    <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                      จำนวนเงินเพื่อเป้าหมาย
                    </th>
                    <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                      ระยะเวลาเป้าหมาย (ปี)
                    </th>
                    <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map((goal) => (
                    <tr key={goal.id.clientGoalName}>
                      <td className="py-2 px-4 border">
                        {goal.id.clientGoalName}
                      </td>
                      <td className="py-2 px-4 border">
                        {goal.clientGoalValue.toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border">
                        {goal.clientGoalPeriod}
                      </td>
                      <td className="py-2 px-4 border">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleEdit(goal)}
                            className="bg-tfpa_blue hover:bg-tfpa_blue_hover text-white px-4 py-1 rounded font-ibm"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal)}
                            className="bg-red-500 hover:bg-red-700 text-white px-4 py-1 rounded font-ibm"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Navigation */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCalculate}
                className="bg-tfpa_blue hover:bg-tfpa_blue_hover text-white px-4 py-2 rounded font-ibm"
              >
                คำนวณ
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
