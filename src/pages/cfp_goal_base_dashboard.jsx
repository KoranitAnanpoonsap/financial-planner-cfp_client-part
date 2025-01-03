import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/footer.jsx"
import Header from "../components/header.jsx"
import ClientBluePanel from "../components/clientBluePanel.jsx"
import {
  calculatePortfolioSummary,
  calculateGeneralGoal,
} from "../utils/calculations.js"
import { motion } from "framer-motion"
import PortfolioPieChart from "../components/portfolioPieChart.jsx"

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

export default function CFPGoalBaseDashboard() {
  const navigate = useNavigate()

  // Retrieve clientId from localStorage
  const [clientId] = useState(Number(localStorage.getItem("clientId")) || "")

  // State variables
  const [assets, setAssets] = useState([])
  const [generalGoal, setGeneralGoal] = useState(null)
  const [fvOfCurrentInvestment, setFvOfCurrentInvestment] = useState(0)
  const [generalGoalAnnualSaving, setGeneralGoalAnnualSaving] = useState(0)

  // 1. Load Data from localStorage on Component Mount
  useEffect(() => {
    try {
      // Retrieve and parse generalGoal
      const generalGoalData = localStorage.getItem("generalGoal")
      if (generalGoalData) {
        const parsedGeneralGoal = JSON.parse(generalGoalData)
        setGeneralGoal(parsedGeneralGoal)
      } else {
        console.warn("No generalGoal data found in localStorage.")
      }

      // Retrieve and parse portfolioAssets
      const assetsData = localStorage.getItem("portfolioAssets")
      if (assetsData) {
        const parsedAssets = JSON.parse(assetsData)
        setAssets(parsedAssets)
      } else {
        console.warn("No portfolioAssets data found in localStorage.")
      }
    } catch (error) {
      console.error("Error parsing data from localStorage:", error)
      // Optionally, set default values or handle error state here
    }
  }, []) // Empty dependency array ensures this runs once on mount

  // 2. Perform Calculations when assets and generalGoal are loaded
  useEffect(() => {
    if (assets.length > 0 && generalGoal) {
      try {
        // Calculate portfolio summary
        const { totalInvestAmount, portReturn } =
          calculatePortfolioSummary(assets)

        // Calculate general goal related values
        const { fvOfCurrentInvestment: fv, generalGoalAnnualSaving: saving } =
          calculateGeneralGoal(generalGoal, totalInvestAmount, portReturn)

        setFvOfCurrentInvestment(fv)
        setGeneralGoalAnnualSaving(saving)
      } catch (error) {
        console.error("Error performing calculations:", error)
        // Optionally, handle calculation errors here
      }
    }
  }, [assets, generalGoal]) // Runs when either assets or generalGoal change

  const handleNavigateRetirement = () => {
    navigate(`/retirement-goal/`)
  }

  const handleNavigateGeneralGoal = () => {
    navigate(`/goal-base/`)
  }

  // Component Definitions (Unchanged)
  const InvestmentProportion = () => {
    return (
      <div className="w-[300px] h-[300px] bg-gray-50 flex flex-col items-center py-1 gap-1">
        <div className="w-full h-8 bg-tfpa_light_blue flex flex-col items-center justify-center">
          สัดส่วนการลงทุนปัจจุบัน
        </div>
        <div className="">
          <PortfolioPieChart
            assets={assets}
            width={200}
            height={200}
            percent={true}
          />
        </div>
      </div>
    )
  }

  const AnnualNetCashflow = () => {
    return (
      <div className="w-[300px] h-[300px] bg-gray-50 flex flex-col items-center py-1 gap-1">
        <div className="w-full h-8 bg-tfpa_light_blue flex flex-col items-center justify-center"></div>
        <div className="flex flex-col items-center justify-center h-full gap-5">
          กระแสเงินสดสุทธิปัจจุบันต่อปี
          <span className="text-[48px] font-bold font-sans">
            {generalGoal
              ? Number(generalGoal.clientNetIncome).toLocaleString()
              : "—"}{" "}
          </span>
        </div>
      </div>
    )
  }

  const CashFlowSufficient = () => {
    return (
      <div className="w-[300px] h-[300px] bg-gray-50 flex flex-col items-center py-1 gap-1">
        <div className="w-full h-8 bg-tfpa_light_blue flex flex-col items-center justify-center"></div>
        <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
          กระแสเงินสดเพียงพอ
          <br />
          ต่อการออมหรือไม่
          <span className="text-[48px] font-bold font-sans">
            {generalGoalAnnualSaving <= Number(generalGoal.clientNetIncome)
              ? "เพียงพอ"
              : "ไม่เพียงพอ"}
          </span>
        </div>
      </div>
    )
  }

  const InstallmentsCount = () => {
    return (
      <div className="w-[300px] h-[300px] bg-gray-50 flex flex-col items-center py-1 gap-1">
        <div className="w-full h-8 bg-tfpa_light_blue flex flex-col items-center justify-center"></div>
        <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
          จำนวนครั้งที่ต้องเก็บออม
          <span className="text-[48px] font-bold font-sans">
            {generalGoal ? generalGoal.clientGeneralGoalPeriod : "—"}
          </span>
        </div>
      </div>
    )
  }

  const ApproachGoalBase = () => {
    // Ensure generalGoal and related calculations are available
    if (!generalGoal) return null

    const investmentPercentage = (
      (fvOfCurrentInvestment / generalGoal.clientGeneralGoalValue) *
      100
    ).toFixed(2)
    const cashflowPercentage = (
      (Number(generalGoal.clientNetIncome) /
        Math.abs(generalGoalAnnualSaving)) *
      100
    ).toFixed(2)

    return (
      <div className="w-[600px] h-[300px] bg-gray-50 flex flex-col py-1 gap-1">
        <div className="w-full h-8 bg-tfpa_light_blue flex flex-col items-center justify-center"></div>
        <div className="flex flex-col justify-center h-full">
          <div className="p-5 text-right relative">
            <div className="absolute text-2xl font-bold">
              {investmentPercentage}%
            </div>
            สัดส่วนการลงทุนในปัจจุบันคิดเป็นค่าเงินในอนาคต
            <br />
            เทียบกับจำนวนเงินเป้าหมาย
            <div className="flex h-3 bg-[#D9D9D9] rounded-xl mt-4">
              <div
                className="flex h-3 bg-tfpa_light_blue mb-2 rounded-xl"
                style={{
                  width:
                    investmentPercentage < 100
                      ? `${investmentPercentage}%`
                      : "100%",
                }}
              ></div>
            </div>
          </div>
          <div className="p-5 text-right relative">
            <div className="absolute text-2xl font-bold">
              {cashflowPercentage}%
            </div>
            สัดส่วนกระเเสเงินสดต่อปี
            <br />
            เทียบกับจำนวนเงินที่ต้องเก็บออมต่อปี
            <div className="flex h-3 bg-[#D9D9D9] rounded-xl mt-4">
              <div
                className="flex h-3 bg-tfpa_light_blue mb-2 rounded-xl"
                style={{
                  width:
                    cashflowPercentage < 100
                      ? `${cashflowPercentage}%`
                      : "100%",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    )
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
              className="bg-tfpa_gold px-4 py-2 rounded font-bold text-white"
              onClick={handleNavigateGeneralGoal}
            >
              เป้าหมายทั่วไป
            </button>
            <button
              className="bg-gray-200 px-4 py-2 rounded font-bold text-tfpa_blue"
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
            {/* Blue Box with Goal Info */}
            {generalGoal && (
              <>
                {/* Goal Name */}
                <h1 className="text-center text-4xl text-tfpa_blue font-bold">
                  เป้าหมาย: {generalGoal.clientGeneralGoalName}
                </h1>
                <div className="flex flex-wrap gap-2 w-full justify-between my-3 px-8 text-tfpa_blue font-bold">
                  <InvestmentProportion />
                  <AnnualNetCashflow />
                  <CashFlowSufficient />
                  <InstallmentsCount />
                  <ApproachGoalBase />
                </div>
                <div className="flex flex-wrap gap-2 w-full justify-between my-3 px-8 text-tfpa_blue font-bold">
                  {/* Additional Components or Information Can Be Placed Here */}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
