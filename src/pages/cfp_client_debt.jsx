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

/** Key for localStorage to store debt records */
const LOCALSTORAGE_KEY_DEBT = "clientDebts"

/** Sample debts if local storage is empty */
const SAMPLE_DEBTS = [
  {
    id: {
      clientId: 1,
      clientDebtName: "หนี้บ้าน",
    },
    clientDebtType: "หนี้บ้าน",
    clientDebtTerm: "ระยะยาว",
    clientDebtAmount: 2500000,
    clientDebtAnnualInterest: 0.035, // 3.5%
    clientStartDateDebt: "2022-01-01",
    clientDebtDuration: 20, // 20 years
    clientDebtPrincipal: 2500000,
  },
  {
    id: {
      clientId: 1,
      clientDebtName: "บัตรเครดิตธนาคาร A",
    },
    clientDebtType: "หนี้บัตรเครดิต",
    clientDebtTerm: "ระยะสั้น",
    clientDebtAmount: 50000,
    clientDebtAnnualInterest: 0.18, // 18%
    clientStartDateDebt: "2023-06-01",
    clientDebtDuration: 1,
    clientDebtPrincipal: 50000,
  },
]

export default function CFPClientDebtPage() {
  // Single user scenario: cfpId=1, clientId=1 or from localStorage if you prefer
  const [cfpId] = useState(1)
  const [clientId] = useState(1)
  const navigate = useNavigate()

  // All debts from localStorage (or sample)
  const [debts, setDebts] = useState([])

  // UI states for form
  const [editMode, setEditMode] = useState(false)
  const [editingDebt, setEditingDebt] = useState(null)

  const [debtType, setDebtType] = useState("เลือก")
  const [debtName, setDebtName] = useState("")
  const [debtTerm, setDebtTerm] = useState("ระยะสั้น")
  const [amount, setAmount] = useState("")
  const [interest, setInterest] = useState("")
  const [startDate, setStartDate] = useState("")
  const [years, setYears] = useState("")
  const [principal, setPrincipal] = useState("")

  // Debt types
  const debtTypes = [
    "หนี้บ้าน",
    "หนี้รถยนต์",
    "หนี้รถจักรยานยนต์",
    "หนี้บัตรเครดิต",
    "หนี้บัตรกดเงินสด",
    "หนี้ผ่อนชำระสินค้า",
    "หนี้นอกระบบ",
    "หนี้อื่นๆ",
  ]

  // Debt term radio
  const debtTerms = [
    { label: "ระยะสั้น", value: "ระยะสั้น" },
    { label: "ระยะยาว", value: "ระยะยาว" },
  ]

  // 1) On mount, load debts from localStorage or fallback to SAMPLE_DEBTS
  useEffect(() => {
    const storedDebts = localStorage.getItem(LOCALSTORAGE_KEY_DEBT)
    if (storedDebts) {
      try {
        const parsed = JSON.parse(storedDebts)
        setDebts(parsed)
      } catch (err) {
        console.error("Error parsing localStorage debts:", err)
        setDebts(SAMPLE_DEBTS)
        localStorage.setItem(
          LOCALSTORAGE_KEY_DEBT,
          JSON.stringify(SAMPLE_DEBTS)
        )
      }
    } else {
      // No data in localStorage, so we store the sample
      setDebts(SAMPLE_DEBTS)
      localStorage.setItem(LOCALSTORAGE_KEY_DEBT, JSON.stringify(SAMPLE_DEBTS))
    }
  }, [])

  // 2) Helper to update localStorage & local state
  const saveDebtsToLocalStorage = (newDebts) => {
    setDebts(newDebts)
    localStorage.setItem(LOCALSTORAGE_KEY_DEBT, JSON.stringify(newDebts))
  }

  // 3) Create or update a debt
  const handleCreateOrUpdateDebt = () => {
    const newDebt = {
      id: {
        clientId, // We assume 1 here
        clientDebtName: debtName,
      },
      clientDebtType: debtType,
      clientDebtTerm: debtTerm,
      clientDebtAmount: parseInt(amount) || 0,
      clientDebtAnnualInterest: parseFloat(interest) / 100 || 0,
      clientStartDateDebt: startDate,
      clientDebtDuration: parseInt(years) || 0,
      clientDebtPrincipal: parseInt(principal) || 0,
    }

    let updatedDebts
    if (editMode && editingDebt) {
      // Editing existing
      updatedDebts = debts.map((dbt) =>
        dbt.id.clientDebtName === editingDebt.id.clientDebtName ? newDebt : dbt
      )
    } else {
      // Adding new
      updatedDebts = [...debts, newDebt]
    }

    saveDebtsToLocalStorage(updatedDebts)
    resetFields()
  }

  // 4) Delete a debt
  const handleDeleteDebt = (dbt) => {
    const newDebts = debts.filter(
      (item) => item.id.clientDebtName !== dbt.id.clientDebtName
    )
    saveDebtsToLocalStorage(newDebts)
  }

  // 5) Start editing
  const handleEdit = (dbt) => {
    setEditMode(true)
    setEditingDebt(dbt)

    setDebtType(dbt.clientDebtType)
    setDebtName(dbt.id.clientDebtName)
    setDebtTerm(dbt.clientDebtTerm)
    setAmount(dbt.clientDebtAmount.toString())
    setInterest((dbt.clientDebtAnnualInterest * 100).toString() || "")
    setStartDate(dbt.clientStartDateDebt)
    setYears(dbt.clientDebtDuration.toString() || "")
    setPrincipal(dbt.clientDebtPrincipal.toString() || "")
  }

  // Cancel edit
  const handleCancelEdit = () => {
    resetFields()
  }

  // Reset form
  const resetFields = () => {
    setEditMode(false)
    setEditingDebt(null)
    setDebtType("เลือก")
    setDebtName("")
    setDebtTerm("ระยะสั้น")
    setAmount("")
    setInterest("")
    setStartDate("")
    setYears("")
    setPrincipal("")
  }

  const handleBack = () => {
    // For single user flow, just navigate to the asset page
    navigate(`/client-asset/`)
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
              className="flex flex-col items-center focus:outline-none text-gray-400"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <span className="font-bold">สินทรัพย์</span>
            </button>
            <div className="h-px bg-gray-300 w-24"></div>
            <button
              onClick={() => navigate(`/client-debt/`)}
              className="flex flex-col items-center focus:outline-none"
            >
              <div className="w-10 h-10 bg-tfpa_gold text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <span className="font-bold text-tfpa_blue">หนี้สิน</span>
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
              5. หนี้สิน
            </h3>

            <div className="space-y-4">
              {/* Debt Type */}
              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  ประเภทหนี้สิน
                </label>
                <select
                  value={debtType}
                  onChange={(e) => setDebtType(e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                >
                  <option value="เลือก">เลือก</option>
                  {debtTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Debt Name */}
              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  ชื่อหนี้สิน
                </label>
                <input
                  type="text"
                  value={debtName}
                  onChange={(e) => setDebtName(e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                />
              </div>

              {/* Debt Term (radio-like) */}
              <div className="mb-2 text-tfpa_blue font-bold">ประเภทหนี้สิน</div>
              <div className="flex space-x-4">
                {debtTerms.map((dt) => (
                  <div key={dt.value} className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        debtTerm === dt.value
                          ? "bg-tfpa_blue"
                          : "border border-tfpa_blue"
                      } cursor-pointer`}
                      onClick={() => setDebtTerm(dt.value)}
                    ></div>
                    <span>{dt.label}</span>
                  </div>
                ))}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  จำนวน (บาท)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                />
              </div>

              {/* Interest */}
              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  ดอกเบี้ยต่อปี (%)
                </label>
                <input
                  type="number"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                />
              </div>

              {/* Start date */}
              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  วันที่เริ่มต้นของหนี้ (YYYY-MM-DD)
                </label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                />
              </div>

              {/* Debt duration in years */}
              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  จำนวนปีของหนี้ (ปี)
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                />
              </div>

              {/* Principal */}
              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  เงินต้น (บาท)
                </label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                />
              </div>

              {/* Buttons: add/edit/cancel */}
              <div className="flex space-x-4 mt-4">
                {editMode ? (
                  <>
                    <button
                      onClick={handleCreateOrUpdateDebt}
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
                    onClick={handleCreateOrUpdateDebt}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-ibm font-bold"
                  >
                    เพิ่ม
                  </button>
                )}
              </div>
            </div>

            {/* Table of debts */}
            <h3 className="text-tfpa_blue font-bold text-lg mt-4">
              หนี้สินที่มีอยู่
            </h3>
            <table className="min-w-full bg-white border border-gray-300 mt-4 mb-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    ประเภทหนี้สิน
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    ชื่อหนี้สิน
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    ประเภท (ระยะสั้น/ยาว)
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    จำนวน (บาท)
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    ดอกเบี้ยต่อปี (%)
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {debts.map((dbt) => (
                  <tr key={`${dbt.id.clientId}-${dbt.id.clientDebtName}`}>
                    <td className="py-2 px-4 border">{dbt.clientDebtType}</td>
                    <td className="py-2 px-4 border">
                      {dbt.id.clientDebtName}
                    </td>
                    <td className="py-2 px-4 border">{dbt.clientDebtTerm}</td>
                    <td className="py-2 px-4 border text-right">
                      {dbt.clientDebtAmount.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border text-right">
                      {(dbt.clientDebtAnnualInterest * 100).toFixed(2)}%
                    </td>
                    <td className="py-2 px-4 border">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEdit(dbt)}
                          className="bg-tfpa_blue hover:bg-tfpa_blue_hover text-white px-4 py-1 rounded font-ibm"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteDebt(dbt)}
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

            <div className="flex justify-start">
              <button
                onClick={handleBack}
                className="bg-gray-300 hover:bg-gray-400 text-tfpa_blue px-4 py-2 rounded font-ibm font-bold"
              >
                กลับ
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
