import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/footer.jsx"
import Header from "../components/header.jsx"
import ClientBluePanel from "../components/clientBluePanel.jsx"
import PortfolioPieChart from "../components/portfolioPieChart.jsx"
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

/** localStorage keys we’ll use */
const LOCALSTORAGE_KEY_PORTFOLIO = "portfolioAssets"
const LOCALSTORAGE_KEY_GENERAL_GOAL = "generalGoal"

const SAMPLE_GENERAL_GOAL = {
  clientId: 1,
  clientGeneralGoalName: "ซื้อรถยนต์",
  clientGeneralGoalValue: 1000000,
  clientGeneralGoalPeriod: 5,
  clientNetIncome: 300000,
  clientNetIncomeGrowth: 0.05,
}

export default function CFPGoalBase() {
  const [cfpId] = useState(Number(localStorage.getItem("cfpId")) || 1)
  const [clientId] = useState(Number(localStorage.getItem("clientId")) || 1)
  const navigate = useNavigate()

  // Portfolio data
  const [assets, setAssets] = useState([])
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [portfolioReturn, setPortfolioReturn] = useState(0)

  // Fields for GeneralGoal
  const [clientNetIncome, setClientNetIncome] = useState("")
  const [clientNetIncomeGrowth, setClientNetIncomeGrowth] = useState("")
  const [clientGeneralGoalName, setClientGeneralGoalName] = useState("")
  const [clientGeneralGoalValue, setClientGeneralGoalValue] = useState("")
  const [clientGeneralGoalPeriod, setClientGeneralGoalPeriod] = useState("")

  const [generalGoalExists, setGeneralGoalExists] = useState(false)

  // For debouncing the auto-save of general goal
  const debounceTimer = useRef(null)

  /** Initialize localStorage with SAMPLE_GENERAL_GOAL if not present */
  useEffect(() => {
    const storedGoal = localStorage.getItem(LOCALSTORAGE_KEY_GENERAL_GOAL)
    if (!storedGoal) {
      localStorage.setItem(
        LOCALSTORAGE_KEY_GENERAL_GOAL,
        JSON.stringify(SAMPLE_GENERAL_GOAL)
      )
      setGeneralGoalExists(true)
      setClientNetIncome(SAMPLE_GENERAL_GOAL.clientNetIncome.toString())
      setClientNetIncomeGrowth(
        (SAMPLE_GENERAL_GOAL.clientNetIncomeGrowth * 100).toString()
      )
      setClientGeneralGoalName(SAMPLE_GENERAL_GOAL.clientGeneralGoalName)
      setClientGeneralGoalValue(
        SAMPLE_GENERAL_GOAL.clientGeneralGoalValue.toString()
      )
      setClientGeneralGoalPeriod(
        SAMPLE_GENERAL_GOAL.clientGeneralGoalPeriod.toString()
      )
      console.log("Sample generalGoal data has been initialized.")
    }
  }, [])

  // Load portfolio + general goal from localStorage
  useEffect(() => {
    // 1) Load portfolio (assets)
    const storedPortfolio = localStorage.getItem(LOCALSTORAGE_KEY_PORTFOLIO)
    if (storedPortfolio) {
      try {
        const parsedAssets = JSON.parse(storedPortfolio)
        setAssets(parsedAssets)

        const { totalInvestAmount, portReturn } =
          calculatePortfolioSummary(parsedAssets)
        setTotalInvestment(totalInvestAmount)
        setPortfolioReturn(portReturn)
      } catch (error) {
        console.error("Error parsing localStorage portfolio data:", error)
        setAssets([])
      }
    } else {
      // If nothing stored, just keep empty array
      setAssets([])
    }

    // 2) Load general goal data
    const storedGoal = localStorage.getItem(LOCALSTORAGE_KEY_GENERAL_GOAL)
    if (storedGoal) {
      try {
        const gg = JSON.parse(storedGoal)
        setGeneralGoalExists(true)
        setClientNetIncome(gg.clientNetIncome?.toString() || "")
        setClientNetIncomeGrowth(
          gg.clientNetIncomeGrowth !== undefined
            ? (gg.clientNetIncomeGrowth * 100).toString() // convert decimal => string %
            : ""
        )
        setClientGeneralGoalName(gg.clientGeneralGoalName || "")
        setClientGeneralGoalValue(gg.clientGeneralGoalValue?.toString() || "")
        setClientGeneralGoalPeriod(gg.clientGeneralGoalPeriod?.toString() || "")
      } catch (error) {
        console.error("Error parsing localStorage general goal:", error)
        setGeneralGoalExists(false)
      }
    } else {
      setGeneralGoalExists(false)
    }
  }, [])

  // Auto-save (debounced) whenever certain fields change
  useEffect(() => {
    // If any field is empty, we skip saving
    const canSave =
      clientNetIncome !== "" &&
      clientNetIncomeGrowth !== "" &&
      clientGeneralGoalName.trim() !== "" &&
      clientGeneralGoalValue !== "" &&
      clientGeneralGoalPeriod !== ""

    if (!canSave) {
      return
    }

    // Clear previous timer if any
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // New timer
    debounceTimer.current = setTimeout(() => {
      handleSaveGoal()
    }, 500)

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [
    clientNetIncome,
    clientNetIncomeGrowth,
    clientGeneralGoalName,
    clientGeneralGoalValue,
    clientGeneralGoalPeriod,
  ])

  const handleSaveGoal = () => {
    // Build object
    const goalObj = {
      clientId,
      clientGeneralGoalName,
      clientGeneralGoalValue: parseFloat(clientGeneralGoalValue) || 0,
      clientGeneralGoalPeriod: parseInt(clientGeneralGoalPeriod) || 0,
      clientNetIncome: parseFloat(clientNetIncome) || 0,
      clientNetIncomeGrowth: (parseFloat(clientNetIncomeGrowth) || 0) / 100,
    }

    // 1) Store in localStorage
    localStorage.setItem(LOCALSTORAGE_KEY_GENERAL_GOAL, JSON.stringify(goalObj))

    // 2) Set existence flag
    setGeneralGoalExists(true)
  }

  const handleCalculate = () => {
    // Navigate to calculation result page
    navigate(`/goal-base-calculated/`)
  }

  const handleNavigateRetirement = () => {
    navigate(`/retirement-goal/`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <ClientBluePanel />
        <div className="flex-1 p-4 space-y-8">
          {/* Top buttons */}
          <div className="flex space-x-4 justify-center">
            <button className="bg-tfpa_gold px-4 py-2 rounded font-ibm font-bold text-white">
              เป้าหมายทั่วไป
            </button>
            <button
              className="bg-gray-200 px-4 py-2 rounded font-ibm font-bold text-tfpa_blue"
              onClick={handleNavigateRetirement}
            >
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
            {/* Pie Chart and summary */}
            <div className="flex space-x-8 items-center justify-center">
              <PortfolioPieChart assets={assets} width={300} height={300} />
              <div className="flex flex-col space-y-2">
                <p className="text-lg font-ibm font-bold text-tfpa_blue">
                  เงินรวมปัจจุบันในการลงทุน: {totalInvestment.toLocaleString()}{" "}
                  บาท
                </p>
                <p className="text-lg font-ibm font-bold text-tfpa_blue">
                  ผลตอบแทนต่อปีของพอร์ตที่ลงทุนปัจจุบัน:{" "}
                  {(portfolioReturn * 100).toFixed(2)} %
                </p>
              </div>
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-2 gap-8 mt-4">
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="font-ibm font-bold text-tfpa_blue">
                    กระแสเงินสดสุทธิต่อปี (บาท)
                  </label>
                  <input
                    type="number"
                    value={clientNetIncome}
                    onWheel={(e) => e.target.blur()}
                    onChange={(e) => setClientNetIncome(e.target.value)}
                    className="border rounded p-2 w-full font-ibm mt-1 focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                  />
                </div>
                <div>
                  <label className="font-ibm font-bold text-tfpa_blue">
                    อัตราการเติบโตของกระแสเงินสดสุทธิต่อปี (%)
                  </label>
                  <input
                    type="number"
                    value={clientNetIncomeGrowth}
                    onWheel={(e) => e.target.blur()}
                    onChange={(e) => setClientNetIncomeGrowth(e.target.value)}
                    className="border rounded p-2 w-full font-ibm mt-1 focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <div>
                  <label className="font-ibm font-bold text-tfpa_blue">
                    ชื่อเป้าหมาย
                  </label>
                  <input
                    type="text"
                    value={clientGeneralGoalName}
                    onChange={(e) => setClientGeneralGoalName(e.target.value)}
                    className="border rounded p-2 w-full font-ibm mt-1 focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                  />
                </div>
                <div>
                  <label className="font-ibm font-bold text-tfpa_blue">
                    จำนวนเงินเพื่อเป้าหมาย (บาท)
                  </label>
                  <input
                    type="number"
                    value={clientGeneralGoalValue}
                    onWheel={(e) => e.target.blur()}
                    onChange={(e) => setClientGeneralGoalValue(e.target.value)}
                    className="border rounded p-2 w-full font-ibm mt-1 focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                  />
                </div>
                <div>
                  <label className="font-ibm font-bold text-tfpa_blue">
                    ระยะเวลาเป้าหมาย (ปี)
                  </label>
                  <input
                    type="number"
                    value={clientGeneralGoalPeriod}
                    onWheel={(e) => e.target.blur()}
                    onChange={(e) => setClientGeneralGoalPeriod(e.target.value)}
                    className="border rounded p-2 w-full font-ibm mt-1 focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                  />
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex justify-end space-x-4 mt-4 mb-4">
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
