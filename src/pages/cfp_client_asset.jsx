import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/header"
import Footer from "../components/footer"
import ClientBluePanel from "../components/clientBluePanel"
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

/** Key for localStorage to store asset records */
const LOCALSTORAGE_KEY_ASSETS = "clientAssets"

/** Example fallback assets if local storage is empty. */
const SAMPLE_ASSETS = [
  {
    id: { clientId: 1, clientAssetName: "เงินฝากออมทรัพย์" },
    clientAssetType: "สินทรัพย์สภาพคล่อง",
    clientAssetAmount: 50000,
    clientAssetBuyDate: null,
    clientAssetInvestType: null,
    clientAssetInvestRisk: null,
  },
  {
    id: { clientId: 1, clientAssetName: "คอนโดมิเนียมส่วนตัว" },
    clientAssetType: "สินทรัพย์ส่วนตัว",
    clientAssetAmount: 2000000,
    clientAssetBuyDate: "2021-05-12",
    clientAssetInvestType: null,
    clientAssetInvestRisk: null,
  },
  {
    id: { clientId: 1, clientAssetName: "กองทุนหุ้นไทย" },
    clientAssetType: "สินทรัพย์ลงทุนปัจจุบัน",
    clientAssetAmount: 300000,
    clientAssetBuyDate: null,
    clientAssetInvestType: "หุ้นไทย",
    clientAssetInvestRisk: "เสี่ยงปานกลาง",
  },
]

export default function CFPClientAssetPage() {
  // For single user mode, cfpId=1, clientId=1 or from local storage
  const [cfpId] = useState(1)
  const [clientId] = useState(1)
  const navigate = useNavigate()

  // Assets in local state
  const [assets, setAssets] = useState([])

  // Form states
  const [editMode, setEditMode] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)

  const [assetType, setAssetType] = useState("เลือก")
  const [assetName, setAssetName] = useState("")
  const [assetAmount, setAssetAmount] = useState("")
  const [buyDate, setBuyDate] = useState("")
  const [investType, setInvestType] = useState("หุ้นไทย")
  const [investRisk, setInvestRisk] = useState("เสี่ยงปานกลาง")

  // Possible choices
  const assetTypes = [
    "สินทรัพย์สภาพคล่อง",
    "สินทรัพย์ส่วนตัว",
    "สินทรัพย์ลงทุนปัจจุบัน",
    "สินทรัพย์อื่นๆ",
  ]
  const investTypes = [
    "หุ้นไทย",
    "หุ้นต่างประเทศ",
    "หุ้นกู้",
    "ตราสารหนี้",
    "ทองคำ",
    "เงินฝาก",
    "การลงทุนอื่นๆ",
  ]
  const investRisks = ["เสี่ยงสูง", "เสี่ยงต่ำ", "เสี่ยงปานกลาง"]

  // 1) On mount, load from localStorage or fallback to SAMPLE_ASSETS
  useEffect(() => {
    const stored = localStorage.getItem(LOCALSTORAGE_KEY_ASSETS)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setAssets(parsed)
      } catch (err) {
        console.error("Error parsing localStorage assets:", err)
        // fallback
        setAssets(SAMPLE_ASSETS)
        localStorage.setItem(
          LOCALSTORAGE_KEY_ASSETS,
          JSON.stringify(SAMPLE_ASSETS)
        )
      }
    } else {
      // No data => use sample, store them
      setAssets(SAMPLE_ASSETS)
      localStorage.setItem(
        LOCALSTORAGE_KEY_ASSETS,
        JSON.stringify(SAMPLE_ASSETS)
      )
    }
  }, [])

  // 2) Helper: updates both state & localStorage
  const saveAssetsToLocalStorage = (newAssets) => {
    setAssets(newAssets)
    localStorage.setItem(LOCALSTORAGE_KEY_ASSETS, JSON.stringify(newAssets))
  }

  // 3) Create or update an asset
  const handleCreateOrUpdateAsset = () => {
    // Build the new or updated record
    const newAsset = {
      id: {
        clientId,
        clientAssetName: assetName,
      },
      clientAssetType: assetType,
      clientAssetAmount: parseFloat(assetAmount) || 0,
      clientAssetBuyDate: assetType === "สินทรัพย์ส่วนตัว" ? buyDate : null,
      clientAssetInvestType:
        assetType === "สินทรัพย์ลงทุนปัจจุบัน" ? investType : null,
      clientAssetInvestRisk:
        assetType === "สินทรัพย์ลงทุนปัจจุบัน" ? investRisk : null,
    }

    let updatedAssets
    if (editMode && editingAsset) {
      // Edit existing
      updatedAssets = assets.map((ast) =>
        ast.id.clientAssetName === editingAsset.id.clientAssetName
          ? newAsset
          : ast
      )
    } else {
      // New record
      updatedAssets = [...assets, newAsset]
    }

    saveAssetsToLocalStorage(updatedAssets)
    resetFields()
  }

  // 4) Delete
  const handleDeleteAsset = (ast) => {
    const filtered = assets.filter(
      (item) => item.id.clientAssetName !== ast.id.clientAssetName
    )
    saveAssetsToLocalStorage(filtered)
  }

  // 5) Edit
  const handleEdit = (ast) => {
    setEditMode(true)
    setEditingAsset(ast)

    setAssetType(ast.clientAssetType)
    setAssetName(ast.id.clientAssetName)
    setAssetAmount(ast.clientAssetAmount.toString() || "")
    setBuyDate(ast.clientAssetBuyDate || "")
    if (ast.clientAssetType === "สินทรัพย์ลงทุนปัจจุบัน") {
      setInvestType(ast.clientAssetInvestType || "หุ้นไทย")
      setInvestRisk(ast.clientAssetInvestRisk || "เสี่ยงปานกลาง")
    } else {
      setInvestType("หุ้นไทย")
      setInvestRisk("เสี่ยงปานกลาง")
    }
  }

  // Cancel edit
  const handleCancelEdit = () => {
    resetFields()
  }

  // Reset fields
  const resetFields = () => {
    setEditMode(false)
    setEditingAsset(null)
    setAssetType("เลือก")
    setAssetName("")
    setAssetAmount("")
    setBuyDate("")
    setInvestType("หุ้นไทย")
    setInvestRisk("เสี่ยงปานกลาง")
  }

  // 6) Navigation
  const handleBack = () => {
    // Single-user scenario => go to client-expense
    navigate(`/client-expense/`)
  }
  const handleNext = () => {
    navigate(`/client-debt/`)
  }

  return (
    <div className="flex flex-col min-h-screen font-ibm">
      <Header />
      <div className="flex flex-1">
        <ClientBluePanel />
        <div className="flex-1 p-8 space-y-8">
          {/* Steps at the top */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <button
              onClick={() => navigate(`/client-info/`)}
              className="flex flex-col items-center focus:outline-none text-gray-400"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="font-bold">ข้อมูลส่วนตัว</span>
            </button>
            <div className="h-px bg-gray-300 w-24"></div>
            <button
              onClick={() => navigate(`/client-income/`)}
              className="flex flex-col items-center focus:outline-none text-gray-400"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="font-bold">รายได้</span>
            </button>
            <div className="h-px bg-gray-300 w-24"></div>
            <button
              onClick={() => navigate(`/client-expense/`)}
              className="flex flex-col items-center focus:outline-none text-gray-400"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="font-bold">รายจ่าย</span>
            </button>
            <div className="h-px bg-gray-300 w-24"></div>
            <button
              onClick={() => navigate(`/client-asset/`)}
              className="flex flex-col items-center focus:outline-none"
            >
              <div className="w-10 h-10 bg-tfpa_gold text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <span className="font-bold text-tfpa_blue">สินทรัพย์</span>
            </button>
            <div className="h-px bg-gray-300 w-24"></div>
            <button
              onClick={() => navigate(`/client-debt/`)}
              className="flex flex-col items-center focus:outline-none text-gray-400"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <span className="font-bold">หนี้สิน</span>
            </button>
          </div>

          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <h3 className="text-tfpa_blue font-bold text-lg mb-4">
              4. สินทรัพย์
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  ประเภทสินทรัพย์
                </label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                >
                  <option value="เลือก">เลือก</option>
                  {assetTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  ชื่อสินทรัพย์
                </label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                />
              </div>

              {/* Show amount field only if chosen type is not "เลือก" */}
              {assetType !== "เลือก" && (
                <div>
                  <label className="block text-tfpa_blue font-bold mb-2">
                    มูลค่าปัจจุบัน (บาท)
                  </label>
                  <input
                    type="number"
                    value={assetAmount}
                    onChange={(e) => setAssetAmount(e.target.value)}
                    className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                  />
                </div>
              )}

              {/* If personal asset => buy date */}
              {assetType === "สินทรัพย์ส่วนตัว" && (
                <div>
                  <label className="block text-tfpa_blue font-bold mb-2">
                    วันที่ซื้อสินทรัพย์ (YYYY-MM-DD)
                  </label>
                  <input
                    type="text"
                    value={buyDate}
                    onChange={(e) => setBuyDate(e.target.value)}
                    className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                  />
                </div>
              )}

              {/* If investment => invest type & risk */}
              {assetType === "สินทรัพย์ลงทุนปัจจุบัน" && (
                <>
                  <div>
                    <label className="block text-tfpa_blue font-bold mb-2">
                      ประเภทการลงทุน
                    </label>
                    <select
                      value={investType}
                      onChange={(e) => setInvestType(e.target.value)}
                      className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                    >
                      {investTypes.map((it) => (
                        <option key={it} value={it}>
                          {it}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-tfpa_blue font-bold mb-2">
                      ความเสี่ยงในการลงทุน
                    </label>
                    <select
                      value={investRisk}
                      onChange={(e) => setInvestRisk(e.target.value)}
                      className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                    >
                      {investRisks.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Create/Edit Buttons */}
              <div className="flex space-x-4 mt-4">
                {editMode ? (
                  <>
                    <button
                      onClick={handleCreateOrUpdateAsset}
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
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-ibm font-bold"
                  >
                    เพิ่ม
                  </button>
                )}
              </div>
            </div>

            {/* Table of assets */}
            <h3 className="text-tfpa_blue font-bold text-lg mt-4">
              สินทรัพย์ที่มีอยู่
            </h3>
            <table className="min-w-full bg-white border border-gray-300 mt-4 mb-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    ประเภทสินทรัพย์
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    ชื่อสินทรัพย์
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    มูลค่าปัจจุบัน (บาท)
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {assets.map((ast) => (
                  <tr key={`${ast.id.clientId}-${ast.id.clientAssetName}`}>
                    <td className="py-2 px-4 border">{ast.clientAssetType}</td>
                    <td className="py-2 px-4 border">
                      {ast.id.clientAssetName}
                    </td>
                    <td className="py-2 px-4 border text-right">
                      {ast.clientAssetAmount.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEdit(ast)}
                          className="bg-tfpa_blue hover:bg-tfpa_blue_hover text-white px-4 py-1 rounded font-ibm"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteAsset(ast)
                          }}
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

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="bg-gray-300 hover:bg-gray-400 text-tfpa_blue px-4 py-2 rounded font-ibm font-bold"
              >
                กลับ
              </button>
              <button
                onClick={handleNext}
                className="bg-tfpa_blue hover:bg-tfpa_blue_hover text-white px-4 py-2 rounded font-ibm font-bold"
              >
                ถัดไป
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
