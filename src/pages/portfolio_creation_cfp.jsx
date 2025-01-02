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

/** localStorage key for the portfolio data array. */
const LOCALSTORAGE_KEY_PORTFOLIO = "portfolioAssets"

export default function PortfolioCreationCFP() {
  // Single user scenario or read from localStorage if it exists
  const [cfpId] = useState(Number(localStorage.getItem("cfpId")) || 1)
  const [clientId] = useState(Number(localStorage.getItem("clientId")) || 1)

  const [totalInvestment, setTotalInvestment] = useState(0)
  const [portfolioReturn, setPortfolioReturn] = useState(0)
  const [assets, setAssets] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    // Load portfolio data from localStorage on mount
    const stored = localStorage.getItem(LOCALSTORAGE_KEY_PORTFOLIO)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setAssets(parsed)
        const { totalInvestAmount, portReturn } =
          calculatePortfolioSummary(parsed)
        setTotalInvestment(totalInvestAmount)
        setPortfolioReturn(portReturn)
      } catch (err) {
        console.error("Error parsing localStorage portfolio data:", err)
        // If parse fails or is invalid, fallback to empty array
        setAssets([])
      }
    } else {
      // If nothing stored, set assets to empty array
      setAssets([])
    }
  }, [])

  const handleEditPortfolio = () => {
    // Navigate back to the portfolio selection (which is now also localStorage-based)
    navigate(`/portfolio-selection/`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <ClientBluePanel />
        <div className="flex-1 p-4">
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <div className="flex justify-center mb-4">
              <PortfolioPieChart assets={assets} width={500} height={500} />
            </div>

            <div className="flex justify-center mb-4">
              <p className="text-lg font-ibm font-bold text-tfpa_blue">
                เงินรวมปัจจุบันในการลงทุน: {totalInvestment.toLocaleString()}{" "}
                บาท
              </p>
            </div>

            <div className="flex justify-center mb-4">
              <p className="text-lg font-ibm font-bold text-tfpa_blue">
                ผลตอบแทนต่อปีของพอร์ตที่ลงทุนปัจจุบัน:{" "}
                {(portfolioReturn * 100).toFixed(2)} %
              </p>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleEditPortfolio}
                className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded font-ibm"
              >
                แก้ไขพอร์ต
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
