import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/footer.jsx"
import Header from "../components/header.jsx"
import ClientBluePanel from "../components/clientBluePanel.jsx"
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

/** Key in localStorage for storing portfolio items. */
const LOCALSTORAGE_KEY_PORTFOLIO = "portfolioAssets"

/** Example fallback if no data in localStorage. */
const SAMPLE_PORTFOLIO = [
  {
    id: { clientId: 1, investName: "หุ้นไทย A" },
    investType: "หุ้นไทย",
    investAmount: 100000,
    yearlyReturn: 0.075,
  },
  {
    id: { clientId: 1, investName: "หุ้นกู้ B" },
    investType: "หุ้นกู้",
    investAmount: 200000,
    yearlyReturn: 0.03,
  },
]

export default function PortfolioSelectionCFP() {
  // Single user scenario: we can read or assume clientId=1
  // but let's read from localStorage if it exists
  const [cfpId] = useState(Number(localStorage.getItem("cfpId")) || 1)
  const [clientId] = useState(Number(localStorage.getItem("clientId")) || 1)

  const [portfolio, setPortfolio] = useState([])

  // Form states
  const [investType, setInvestType] = useState("เลือก")
  const [investName, setInvestName] = useState("")
  const [investAmount, setInvestAmount] = useState("")
  const [yearlyReturn, setYearlyReturn] = useState(0)
  const [customReturn, setCustomReturn] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)

  const navigate = useNavigate()

  // Investment types
  const investmentTypes = [
    "หุ้นไทย",
    "หุ้นต่างประเทศ",
    "หุ้นกู้",
    "ตราสารหนี้",
    "ทองคำ",
    "เงินฝาก",
    "การลงทุนอื่นๆ",
  ]

  // Returns the appropriate year return based on investment type
  const calculateYearlyReturn = (type) => {
    switch (type) {
      case "หุ้นไทย":
        return 0.075
      case "หุ้นต่างประเทศ":
        return 0.145 // example
      case "เงินฝาก":
        return 0.004
      case "ทองคำ":
        return 0.0778
      case "ตราสารหนี้":
        return 0.035
      case "หุ้นกู้":
        return 0.03
      case "การลงทุนอื่นๆ":
        return parseFloat(customReturn) / 100 || 0
      default:
        return 0
    }
  }

  // On mount: load from localStorage or fallback
  useEffect(() => {
    const stored = localStorage.getItem(LOCALSTORAGE_KEY_PORTFOLIO)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setPortfolio(parsed)
      } catch (err) {
        console.error("Error parsing portfolio data:", err)
        // fallback to sample
        setPortfolio(SAMPLE_PORTFOLIO)
        localStorage.setItem(
          LOCALSTORAGE_KEY_PORTFOLIO,
          JSON.stringify(SAMPLE_PORTFOLIO)
        )
      }
    } else {
      // If nothing in local storage => use sample
      setPortfolio(SAMPLE_PORTFOLIO)
      localStorage.setItem(
        LOCALSTORAGE_KEY_PORTFOLIO,
        JSON.stringify(SAMPLE_PORTFOLIO)
      )
    }
  }, [])

  // Helper: update localStorage & state
  const saveToLocalStorage = (newPortfolio) => {
    setPortfolio(newPortfolio)
    localStorage.setItem(
      LOCALSTORAGE_KEY_PORTFOLIO,
      JSON.stringify(newPortfolio)
    )
  }

  // Create or update
  const handleCreateOrUpdateAsset = () => {
    const assetObj = {
      id: {
        clientId: clientId,
        investName: investName,
      },
      investType,
      investAmount: parseFloat(investAmount) || 0,
      yearlyReturn: calculateYearlyReturn(investType),
    }

    let updated
    if (editMode && editingAsset) {
      // Edit mode => replace item
      updated = portfolio.map((item) =>
        item.id.investName === editingAsset.id.investName ? assetObj : item
      )
    } else {
      // New
      updated = [...portfolio, assetObj]
    }

    saveToLocalStorage(updated)
    resetFields()
  }

  // Delete
  const handleDeleteAsset = (asset) => {
    const filtered = portfolio.filter(
      (item) => item.id.investName !== asset.id.investName
    )
    saveToLocalStorage(filtered)
  }

  // Edit
  const handleEdit = (asset) => {
    setEditMode(true)
    setEditingAsset(asset)

    setInvestType(asset.investType)
    setInvestName(asset.id.investName)
    setInvestAmount(asset.investAmount.toString())
    if (asset.investType === "การลงทุนอื่นๆ") {
      setCustomReturn((asset.yearlyReturn * 100).toString())
    } else {
      setCustomReturn("")
    }
    setYearlyReturn(asset.yearlyReturn)
  }

  const handleCancelEdit = () => {
    resetFields()
  }

  const resetFields = () => {
    setEditMode(false)
    setEditingAsset(null)
    setInvestType("เลือก")
    setInvestName("")
    setInvestAmount("")
    setCustomReturn("")
    setYearlyReturn(0)
  }

  // Navigate to chart
  const handleNavigateToChart = () => {
    navigate(`/portfolio-chart/`)
  }

  // Validation function
  const isFormValid = () => {
    // General validations
    if (!investType || investType === "เลือก") return false
    if (!investName) return false
    if (!investAmount || parseFloat(investAmount) <= 0) return false

    // Custom return validation for "การลงทุนอื่นๆ"
    if (
      investType === "การลงทุนอื่นๆ" &&
      (!customReturn || parseFloat(customReturn) <= 0)
    ) {
      return false
    }

    return true
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
            {/* Form Section */}
            <div className="mb-4">
              <h3 className="text-lg mb-2 font-ibm font-bold text-tfpa_blue">
                สร้างสินทรัพย์
              </h3>
              <label className="text-tfpa_blue font-ibm font-bold mb-2">
                เลือกสินทรัพย์
              </label>
              <select
                value={investType}
                onChange={(e) => {
                  const selectedType = e.target.value
                  setInvestType(selectedType)
                  setYearlyReturn(calculateYearlyReturn(selectedType))
                }}
                className="border rounded p-2 mb-2 w-full font-ibm font-bold text-gray-500"
              >
                <option value="เลือก">เลือก</option>
                {investmentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {/* If "การลงทุนอื่นๆ", we allow customReturn input */}
              {investType === "การลงทุนอื่นๆ" && (
                <>
                  <label className="text-tfpa_blue font-ibm font-bold mb-2">
                    ผลตอบแทนต่อปี (%)
                  </label>
                  <input
                    type="text"
                    placeholder="ผลตอบแทนต่อปี (%)"
                    value={customReturn}
                    onChange={(e) => {
                      setCustomReturn(e.target.value)
                      const val = parseFloat(e.target.value) / 100 || 0
                      setYearlyReturn(val)
                    }}
                    className="border rounded p-2 mb-2 w-full font-ibm"
                  />
                </>
              )}

              <label className="text-tfpa_blue font-ibm font-bold mb-2">
                ชื่อการลงทุน
              </label>
              <input
                type="text"
                placeholder="ชื่อการลงทุน"
                value={investName}
                onChange={(e) => setInvestName(e.target.value)}
                className="border rounded p-2 mb-2 w-full font-ibm"
              />

              <label className="text-tfpa_blue font-ibm font-bold mb-2">
                มูลค่าที่ลงทุนปัจจุบัน
              </label>
              <input
                type="number"
                placeholder="มูลค่าที่ลงทุนปัจจุบัน"
                value={investAmount}
                onWheel={(e) => e.target.blur()}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="border rounded p-2 mb-2 w-full font-ibm"
              />

              <p className="mb-2 font-ibm font-bold text-tfpa_blue">
                ผลตอบแทนต่อปี: {((yearlyReturn || 0) * 100).toFixed(2)}%
              </p>

              <div className="flex space-x-4">
                {editMode ? (
                  <>
                    <button
                      onClick={handleCreateOrUpdateAsset}
                      disabled={!isFormValid()}
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
                    onClick={handleCreateOrUpdateAsset}
                    disabled={!isFormValid()}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-ibm font-bold"
                  >
                    เพิ่ม
                  </button>
                )}
              </div>
            </div>

            {/* Table Section */}
            <h3 className="text-lg mb-2 font-ibm font-bold text-tfpa_blue">
              สินทรัพย์ปัจจุบัน
            </h3>
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-200 font-ibm font-bold text-tfpa_blue">
                  <th className="py-2 px-4 border">ประเภทการลงทุน</th>
                  <th className="py-2 px-4 border">ชื่อการลงทุน</th>
                  <th className="py-2 px-4 border">มูลค่าที่ลงทุน</th>
                  <th className="py-2 px-4 border">ผลตอบแทนต่อปี</th>
                  <th className="py-2 px-4 border">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((asset) => (
                  <tr key={`${asset.id.clientId}-${asset.id.investName}`}>
                    <td className="py-2 px-4 border">{asset.investType}</td>
                    <td className="py-2 px-4 border">{asset.id.investName}</td>
                    <td className="py-2 px-4 border">
                      {asset.investAmount.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border">
                      {((asset.yearlyReturn || 0) * 100).toFixed(2)}%
                    </td>
                    <td className="py-2 px-4 border">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEdit(asset)}
                          className="bg-tfpa_blue hover:bg-tfpa_blue_hover text-white px-4 py-1 rounded font-ibm"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset)}
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

            <div className="flex justify-end">
              <button
                onClick={handleNavigateToChart}
                className="mt-4 bg-tfpa_blue hover:bg-tfpa_blue_hover text-white px-4 py-2 rounded font-ibm font-bold"
              >
                สร้างพอร์ต
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
