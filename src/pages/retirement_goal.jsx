import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/footer.jsx"
import Header from "../components/header.jsx"
import ClientBluePanel from "../components/clientBluePanel.jsx"
import { calculatePortfolioSummary } from "../utils/calculations.js"
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

const LOCALSTORAGE_KEY_PORTFOLIO = "portfolioAssets"
const LOCALSTORAGE_KEY_RETIREMENT_GOAL = "retirementGoal"

/** Sample retirementGoal data */
const SAMPLE_RETIREMENT_GOAL = {
  clientId: 1,
  clientCurrentAge: 45,
  clientRetirementAge: 60,
  clientLifeExpectancy: 85,
  clientCurrentYearlyExpense: 500000,
  clientExpectedRetiredPortReturn: 0.05,
  inflationRate: 0.03,
}

export default function RetirementGoalPage() {
  const [cfpId] = useState(Number(localStorage.getItem("cfpId")) || "")
  const [clientId] = useState(Number(localStorage.getItem("clientId")) || "")
  const navigate = useNavigate()

  const [assets, setAssets] = useState([])
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [portfolioReturn, setPortfolioReturn] = useState(0)

  // Fields from RetirementGoal
  const [clientCurrentAge, setClientCurrentAge] = useState("")
  const [clientRetirementAge, setClientRetirementAge] = useState("")
  const [clientLifeExpectancy, setClientLifeExpectancy] = useState("")
  const [clientCurrentYearlyExpense, setClientCurrentYearlyExpense] =
    useState("")
  const [clientExpectedRetiredPortReturn, setClientExpectedRetiredPortReturn] =
    useState("")
  const [inflationRate, setInflationRate] = useState("")

  const [retirementGoalExists, setRetirementGoalExists] = useState(false)

  const debounceTimer = useRef(null)

  /** Initialize localStorage with SAMPLE_RETIREMENT_GOAL if not present */
  useEffect(() => {
    const storedGoal = localStorage.getItem(LOCALSTORAGE_KEY_RETIREMENT_GOAL)
    if (!storedGoal) {
      localStorage.setItem(
        LOCALSTORAGE_KEY_RETIREMENT_GOAL,
        JSON.stringify(SAMPLE_RETIREMENT_GOAL)
      )
      setRetirementGoalExists(true)
      setClientCurrentAge(SAMPLE_RETIREMENT_GOAL.clientCurrentAge.toString())
      setClientRetirementAge(
        SAMPLE_RETIREMENT_GOAL.clientRetirementAge.toString()
      )
      setClientLifeExpectancy(
        SAMPLE_RETIREMENT_GOAL.clientLifeExpectancy.toString()
      )
      setClientCurrentYearlyExpense(
        SAMPLE_RETIREMENT_GOAL.clientCurrentYearlyExpense.toString()
      )
      setClientExpectedRetiredPortReturn(
        (
          SAMPLE_RETIREMENT_GOAL.clientExpectedRetiredPortReturn * 100
        ).toString()
      )
      setInflationRate((SAMPLE_RETIREMENT_GOAL.inflationRate * 100).toString())
      console.log("Sample retirementGoal data has been initialized.")
    }
  }, [])

  useEffect(() => {
    loadDataFromLocalStorage()
  }, [])

  const loadDataFromLocalStorage = () => {
    try {
      // Load portfolio assets
      const storedAssetsStr = localStorage.getItem(LOCALSTORAGE_KEY_PORTFOLIO)
      const parsedAssets = storedAssetsStr ? JSON.parse(storedAssetsStr) : []
      setAssets(parsedAssets)

      const { totalInvestAmount, portReturn } =
        calculatePortfolioSummary(parsedAssets)
      setTotalInvestment(totalInvestAmount)
      setPortfolioReturn(portReturn)

      // Load retirement goal
      const storedGoalStr = localStorage.getItem(
        LOCALSTORAGE_KEY_RETIREMENT_GOAL
      )
      if (storedGoalStr) {
        const retirementGoal = JSON.parse(storedGoalStr)
        setRetirementGoalExists(true)
        setClientCurrentAge(retirementGoal.clientCurrentAge || "")
        setClientRetirementAge(retirementGoal.clientRetirementAge || "")
        setClientLifeExpectancy(retirementGoal.clientLifeExpectancy || "")
        setClientCurrentYearlyExpense(
          retirementGoal.clientCurrentYearlyExpense || ""
        )
        setClientExpectedRetiredPortReturn(
          (retirementGoal.clientExpectedRetiredPortReturn || 0) * 100
        )
        setInflationRate((retirementGoal.inflationRate || 0) * 100)
      } else {
        setRetirementGoalExists(false)
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      setRetirementGoalExists(false)
    }
  }

  useEffect(() => {
    const isValid = () => {
      return (
        clientCurrentAge !== "" &&
        clientRetirementAge !== "" &&
        clientLifeExpectancy !== "" &&
        clientCurrentYearlyExpense !== "" &&
        clientExpectedRetiredPortReturn !== "" &&
        inflationRate !== ""
      )
    }

    if (!isValid()) return

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      handleSaveGoal()
    }, 500)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [
    clientCurrentAge,
    clientRetirementAge,
    clientLifeExpectancy,
    clientCurrentYearlyExpense,
    clientExpectedRetiredPortReturn,
    inflationRate,
  ])

  const handleSaveGoal = () => {
    const goal = {
      clientId,
      clientCurrentAge: parseInt(clientCurrentAge),
      clientRetirementAge: parseInt(clientRetirementAge),
      clientLifeExpectancy: parseInt(clientLifeExpectancy),
      clientCurrentYearlyExpense: parseFloat(clientCurrentYearlyExpense),
      clientExpectedRetiredPortReturn:
        parseFloat(clientExpectedRetiredPortReturn) / 100,
      inflationRate: parseFloat(inflationRate) / 100,
    }

    localStorage.setItem(LOCALSTORAGE_KEY_RETIREMENT_GOAL, JSON.stringify(goal))
    setRetirementGoalExists(true)
    console.log("Retirement goal saved to localStorage:", goal)
  }

  const handleCalculate = () => {
    navigate(`/retirement-goal-calculated/`)
  }

  const handleNavigateGeneralGoal = () => {
    navigate(`/goal-base/`)
  }

  return (
    <div className="flex flex-col min-h-screen font-ibm">
      <Header />
      <div className="flex flex-1">
        <ClientBluePanel />
        <div className="flex-1 p-4 space-y-8">
          {/* Top buttons */}
          <div className="flex space-x-4 justify-center">
            <button
              className="bg-gray-200 px-4 py-2 rounded font-bold text-tfpa_blue"
              onClick={handleNavigateGeneralGoal}
            >
              เป้าหมายทั่วไป
            </button>
            <button className="bg-tfpa_gold px-4 py-2 rounded font-bold text-white">
              เป้าหมายเกษียณ
            </button>
          </div>

          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {/* Input fields */}
            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-center space-x-4 w-full justify-center">
                <label className="w-48 text-left text-tfpa_blue font-semibold">
                  อายุปัจจุบัน
                </label>
                <input
                  type="number"
                  value={clientCurrentAge}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setClientCurrentAge(e.target.value)}
                  className="w-96 border border-gray-300 rounded px-3 py-2"
                />
                <span className="text-tfpa_blue font-semibold">ปี</span>
              </div>
              <div className="flex items-center space-x-4 w-full justify-center">
                <label className="w-48 text-left text-tfpa_blue font-semibold">
                  อายุเกษียณ
                </label>
                <input
                  type="number"
                  value={clientRetirementAge}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setClientRetirementAge(e.target.value)}
                  className="w-96 border border-gray-300 rounded px-3 py-2"
                />
                <span className="text-tfpa_blue font-semibold">ปี</span>
              </div>
              <div className="flex items-center space-x-4 w-full justify-center">
                <label className="w-48 text-left text-tfpa_blue font-semibold">
                  อายุยืน
                </label>
                <input
                  type="number"
                  value={clientLifeExpectancy}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setClientLifeExpectancy(e.target.value)}
                  className="w-96 border border-gray-300 rounded px-3 py-2"
                />
                <span className="text-tfpa_blue font-semibold">ปี</span>
              </div>
              <div className="flex items-center space-x-4 w-full justify-center">
                <label className="w-48 text-left text-tfpa_blue font-semibold">
                  รายจ่ายต่อปีปัจจุบัน
                </label>
                <input
                  type="number"
                  value={clientCurrentYearlyExpense}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) =>
                    setClientCurrentYearlyExpense(e.target.value)
                  }
                  className="w-96 border border-gray-300 rounded px-3 py-2"
                />
                <span className="text-tfpa_blue font-semibold">บาท</span>
              </div>
              <div className="flex items-center space-x-4 w-full justify-center">
                <label className="w-48 text-left text-tfpa_blue font-semibold">
                  ผลตอบแทนต่อปีที่คาดหวัง หลังเกษียณ
                </label>
                <input
                  type="number"
                  value={clientExpectedRetiredPortReturn}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) =>
                    setClientExpectedRetiredPortReturn(e.target.value)
                  }
                  className="w-96 border border-gray-300 rounded px-3 py-2"
                />
                <span className="text-tfpa_blue font-semibold">%</span>
              </div>
              <div className="flex items-center space-x-4 w-full justify-center">
                <label className="w-48 text-left text-tfpa_blue font-semibold">
                  อัตราเงินเฟ้อ
                </label>
                <input
                  type="number"
                  value={inflationRate}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setInflationRate(e.target.value)}
                  className="w-96 border border-gray-300 rounded px-3 py-2"
                />
                <span className="text-tfpa_blue font-semibold">%</span>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex justify-center mt-4 mb-4">
              <button
                onClick={handleCalculate}
                className="bg-tfpa_blue text-white px-6 py-3 rounded font-bold hover:bg-tfpa_blue_hover transition duration-300"
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
