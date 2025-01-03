import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/header"
import Footer from "../components/footer"
import ClientBluePanel from "../components/clientBluePanel"
import { motion } from "framer-motion"

// Some basic framer-motion settings
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

/** Key for localStorage for storing expense data */
const LOCALSTORAGE_KEY_EXPENSE = "clientExpenses"

/** If there's nothing in localStorage, we fallback to these sample expense items */
const SAMPLE_EXPENSES = [
  {
    id: {
      clientId: 1,
      clientExpenseName: "ผ่อนหนี้รถยนต์",
    },
    clientExpenseType: "รายจ่ายคงที่",
    clientExpenseFrequency: "ทุกปี",
    clientExpenseAmount: 96000,
    clientExpenseAnnualGrowthRate: 0,
    clientDebtExpense: true,
    clientNonMortgageDebtExpense: false,
    clientSavingExpense: false,
  },
  {
    id: {
      clientId: 1,
      clientExpenseName: "ผ่อนหนี้บ้าน",
    },
    clientExpenseType: "รายจ่ายคงที่",
    clientExpenseFrequency: "ทุกปี",
    clientExpenseAmount: 192000,
    clientExpenseAnnualGrowthRate: 0,
    clientDebtExpense: true,
    clientNonMortgageDebtExpense: false,
    clientSavingExpense: false,
  },
  {
    id: {
      clientId: 1,
      clientExpenseName: "ประกันสังคม",
    },
    clientExpenseType: "รายจ่ายคงที่",
    clientExpenseFrequency: "ทุกปี",
    clientExpenseAmount: 9000,
    clientExpenseAnnualGrowthRate: 0,
    clientDebtExpense: false,
    clientNonMortgageDebtExpense: false,
    clientSavingExpense: false,
  },
  {
    id: {
      clientId: 1,
      clientExpenseName: "รายจ่ายผันแปร",
    },
    clientExpenseType: "รายจ่ายผันแปร",
    clientExpenseFrequency: "ทุกปี",
    clientExpenseAmount: 324000,
    clientExpenseAnnualGrowthRate: 0.03,
    clientDebtExpense: false,
    clientNonMortgageDebtExpense: false,
    clientSavingExpense: false,
  },
  {
    id: {
      clientId: 1,
      clientExpenseName: "รายจ่ายเพื่อการออม",
    },
    clientExpenseType: "รายจ่ายเพื่อการออม",
    clientExpenseFrequency: "ทุกปี",
    clientExpenseAmount: 120000,
    clientExpenseAnnualGrowthRate: 0.05,
    clientDebtExpense: false,
    clientNonMortgageDebtExpense: false,
    clientSavingExpense: true,
  },
]

export default function CFPClientExpensePage() {
  // Single-user mode: cfpId=1, clientId=1 or from localStorage if you like
  const [cfpId] = useState(1)
  const [clientId] = useState(1)
  const navigate = useNavigate()

  // All expenses (loaded from localStorage or fallback)
  const [expenses, setExpenses] = useState([])

  // Form states
  const [editMode, setEditMode] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  const [type, setType] = useState("เลือก")
  const [expenseName, setExpenseName] = useState("")
  const [frequency, setFrequency] = useState("ทุกเดือน") // default
  const [amount, setAmount] = useState("")
  const [growthRate, setGrowthRate] = useState("")
  const [debtExpense, setDebtExpense] = useState(false)
  const [nonMortgageDebtExpense, setNonMortgageDebtExpense] = useState(false)
  const [savingExpense, setSavingExpense] = useState(false)

  // The possible expense types and frequencies
  const expenseTypes = [
    "รายจ่ายคงที่",
    "รายจ่ายผันแปร",
    "รายจ่ายเพื่อการออม",
    "รายจ่ายอื่นๆ",
  ]
  const frequencies = [
    { label: "ทุกเดือน", value: "ทุกเดือน" },
    { label: "ทุกปี", value: "ทุกปี" },
    { label: "จ่ายเป็นก้อน", value: "จ่ายเป็นก้อน" },
  ]

  // 1) On first load, read from localStorage. If none, fallback to sample data.
  useEffect(() => {
    const storedExpenses = localStorage.getItem(LOCALSTORAGE_KEY_EXPENSE)
    if (storedExpenses) {
      try {
        const parsed = JSON.parse(storedExpenses)
        setExpenses(parsed)
      } catch (err) {
        console.error("Error parsing localStorage expenses:", err)
        setExpenses(SAMPLE_EXPENSES)
        localStorage.setItem(
          LOCALSTORAGE_KEY_EXPENSE,
          JSON.stringify(SAMPLE_EXPENSES)
        )
      }
    } else {
      // No data in localStorage, use sample
      setExpenses(SAMPLE_EXPENSES)
      localStorage.setItem(
        LOCALSTORAGE_KEY_EXPENSE,
        JSON.stringify(SAMPLE_EXPENSES)
      )
    }
  }, [])

  // 2) Helper function to persist changes to localStorage
  const saveToLocalStorage = (newExpenses) => {
    setExpenses(newExpenses)
    localStorage.setItem(LOCALSTORAGE_KEY_EXPENSE, JSON.stringify(newExpenses))
  }

  // 3) Create or Update an expense
  const handleCreateOrUpdateExpense = () => {
    const newExpense = {
      id: {
        clientId,
        clientExpenseName: expenseName,
      },
      clientExpenseType: type,
      clientExpenseFrequency: frequency,
      clientExpenseAmount: parseFloat(amount) || 0,
      clientExpenseAnnualGrowthRate: (parseFloat(growthRate) || 0) / 100,
      clientDebtExpense: debtExpense,
      clientNonMortgageDebtExpense: nonMortgageDebtExpense,
      clientSavingExpense: savingExpense,
    }

    let newExpenses
    if (editMode && editingExpense) {
      // Edit existing
      newExpenses = expenses.map((exp) =>
        exp.id.clientExpenseName === editingExpense.id.clientExpenseName
          ? newExpense
          : exp
      )
    } else {
      // Add new
      newExpenses = [...expenses, newExpense]
    }

    // Save & reset form
    saveToLocalStorage(newExpenses)
    resetFields()
  }

  // 4) Delete an expense
  const handleDeleteExpense = (exp) => {
    const newExpenses = expenses.filter(
      (item) => item.id.clientExpenseName !== exp.id.clientExpenseName
    )
    saveToLocalStorage(newExpenses)
  }

  // 5) Handle editing
  const handleEdit = (exp) => {
    setEditMode(true)
    setEditingExpense(exp)
    setType(exp.clientExpenseType)
    setExpenseName(exp.id.clientExpenseName)
    setFrequency(exp.clientExpenseFrequency)
    setAmount(exp.clientExpenseAmount.toString())
    setGrowthRate((exp.clientExpenseAnnualGrowthRate * 100).toString() || "")
    setDebtExpense(exp.clientDebtExpense)
    setNonMortgageDebtExpense(exp.clientNonMortgageDebtExpense)
    setSavingExpense(exp.clientSavingExpense)
  }

  // Reset the form
  const handleCancelEdit = () => {
    resetFields()
  }
  const resetFields = () => {
    setEditMode(false)
    setEditingExpense(null)
    setType("เลือก")
    setExpenseName("")
    setFrequency("ทุกเดือน")
    setAmount("")
    setGrowthRate("")
    setDebtExpense(false)
    setNonMortgageDebtExpense(false)
    setSavingExpense(false)
  }

  // Helper: If user chooses a different expense type, auto-set some booleans
  const handleTypeChange = (newType) => {
    setType(newType)
    if (newType === "รายจ่ายคงที่") {
      setDebtExpense(false)
      setNonMortgageDebtExpense(false)
      setSavingExpense(false)
    } else if (newType === "รายจ่ายผันแปร") {
      setDebtExpense(false)
      setNonMortgageDebtExpense(false)
      setSavingExpense(false)
    } else if (newType === "รายจ่ายเพื่อการออม") {
      setDebtExpense(false)
      setNonMortgageDebtExpense(false)
      setSavingExpense(true)
    } else if (newType === "รายจ่ายอื่นๆ") {
      setDebtExpense(false)
      setNonMortgageDebtExpense(false)
      setSavingExpense(false)
    }
  }

  // Navigation
  const handleBack = () => {
    navigate(`/client-income/`)
  }
  const handleNext = () => {
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
              className="flex flex-col items-center focus:outline-none"
            >
              <div className="w-10 h-10 bg-tfpa_gold text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="font-bold text-tfpa_blue">รายจ่าย</span>
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
              3. รายจ่าย
            </h3>

            {/* Form for create/update */}
            <div className="space-y-4">
              {/* Expense Type */}
              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  ประเภทรายจ่าย
                </label>
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                >
                  <option value="เลือก">เลือก</option>
                  {expenseTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expense Name */}
              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  ชื่อรายจ่าย
                </label>
                <input
                  type="text"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                />
              </div>

              {/* Frequency selection (radio-like) */}
              <div className="mb-2 text-tfpa_blue font-bold">ความถี่</div>
              <div className="flex space-x-4">
                {frequencies.map((f) => (
                  <div key={f.value} className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        frequency === f.value
                          ? "bg-tfpa_blue"
                          : "border border-tfpa_blue"
                      } cursor-pointer`}
                      onClick={() => setFrequency(f.value)}
                    ></div>
                    <span>{f.label}</span>
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

              {/* Growth Rate */}
              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  อัตราการเติบโต (%)
                </label>
                <input
                  type="number"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                />
              </div>

              {/* DebtExpense boolean */}
              <div className="mt-4">
                <label className="block text-tfpa_blue font-bold mb-2">
                  เป็นเงินชำระคืนหนี้สิน?
                </label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        debtExpense ? "bg-tfpa_blue" : "border border-tfpa_blue"
                      } cursor-pointer`}
                      onClick={() => setDebtExpense(true)}
                    ></div>
                    <span>ใช่</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        !debtExpense
                          ? "bg-tfpa_blue"
                          : "border border-tfpa_blue"
                      } cursor-pointer`}
                      onClick={() => setDebtExpense(false)}
                    ></div>
                    <span>ไม่ใช่</span>
                  </div>
                </div>
              </div>

              {/* Non Mortgage DebtExpense boolean */}
              <div className="mt-4">
                <label className="block text-tfpa_blue font-bold mb-2">
                  เป็นเงินชำระคืนหนี้ไม่รวมจดจำนอง?
                </label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        nonMortgageDebtExpense
                          ? "bg-tfpa_blue"
                          : "border border-tfpa_blue"
                      } cursor-pointer`}
                      onClick={() => setNonMortgageDebtExpense(true)}
                    ></div>
                    <span>ใช่</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        !nonMortgageDebtExpense
                          ? "bg-tfpa_blue"
                          : "border border-tfpa_blue"
                      } cursor-pointer`}
                      onClick={() => setNonMortgageDebtExpense(false)}
                    ></div>
                    <span>ไม่ใช่</span>
                  </div>
                </div>
              </div>

              {/* SavingExpense boolean */}
              <div className="mt-4">
                <label className="block text-tfpa_blue font-bold mb-2">
                  เป็นรายจ่ายเพื่อการออม?
                </label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        savingExpense
                          ? "bg-tfpa_blue"
                          : "border border-tfpa_blue"
                      } cursor-pointer`}
                      onClick={() => setSavingExpense(true)}
                    ></div>
                    <span>ใช่</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        !savingExpense
                          ? "bg-tfpa_blue"
                          : "border border-tfpa_blue"
                      } cursor-pointer`}
                      onClick={() => setSavingExpense(false)}
                    ></div>
                    <span>ไม่ใช่</span>
                  </div>
                </div>
              </div>

              {/* Buttons for Add/Edit */}
              <div className="flex space-x-4 mt-4 mb-4">
                {editMode ? (
                  <>
                    <button
                      onClick={handleCreateOrUpdateExpense}
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
                    onClick={handleCreateOrUpdateExpense}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-ibm font-bold"
                  >
                    เพิ่ม
                  </button>
                )}
              </div>
            </div>

            {/* Table of existing expenses */}
            <h3 className="text-tfpa_blue font-bold text-lg mt-4">
              รายจ่ายที่มีอยู่
            </h3>
            <table className="min-w-full bg-white border border-gray-300 mt-4 mb-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    ประเภทค่าใช้จ่าย
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    ชื่อค่าใช้จ่าย
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    ความถี่
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    จำนวน (บาท)
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    อัตราการเติบโต (%)
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={`${exp.id.clientId}-${exp.id.clientExpenseName}`}>
                    <td className="py-2 px-4 border">
                      {exp.clientExpenseType}
                    </td>
                    <td className="py-2 px-4 border">
                      {exp.id.clientExpenseName}
                    </td>
                    <td className="py-2 px-4 border">
                      {exp.clientExpenseFrequency}
                    </td>
                    <td className="py-2 px-4 border text-right">
                      {exp.clientExpenseAmount.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border text-right">
                      {(exp.clientExpenseAnnualGrowthRate * 100).toFixed(2)}%
                    </td>
                    <td className="py-2 px-4 border">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEdit(exp)}
                          className="bg-tfpa_blue hover:bg-tfpa_blue_hover text-white px-4 py-1 rounded font-ibm"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp)}
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
