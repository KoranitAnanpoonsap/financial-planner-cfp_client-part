import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/footer"
import Header from "../components/header"
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

/** Key we'll use in localStorage. */
const LOCALSTORAGE_KEY = "clientIncomes"

/** If there's nothing in localStorage, we'll fall back to these sample incomes. */
const SAMPLE_INCOMES = [
  {
    id: {
      clientId: 1,
      clientIncomeName: "เงินเดือน",
    },
    clientIncomeType: "40(1) เงินเดือน",
    clientIncomeFrequency: "ทุกปี",
    clientIncomeAmount: 800000,
    clientIncomeAnnualGrowthRate: 0.05,
    clientIncome405Type: "",
    clientIncome406Type: "",
    clientIncome408Type: "",
  },
  {
    id: {
      clientId: 1,
      clientIncomeName: "ดอกเบี้ย",
    },
    clientIncomeType: "40(4) ดอกเบี้ย เงินปันผล",
    clientIncomeFrequency: "ทุกปี",
    clientIncomeAmount: 10000,
    clientIncomeAnnualGrowthRate: 0.02,
    clientIncome405Type: "",
    clientIncome406Type: "",
    clientIncome408Type: "",
  },
  {
    id: {
      clientId: 1,
      clientIncomeName: "รายได้อื่นๆ",
    },
    clientIncomeType: "40(8) รายได้อื่นๆ",
    clientIncomeFrequency: "ทุกปี",
    clientIncomeAmount: 200000,
    clientIncomeAnnualGrowthRate: 0.02,
    clientIncome405Type: "",
    clientIncome406Type: "",
    clientIncome408Type: "เงินได้ประเภทที่ไม่อยู่ใน (1) ถึง (43)",
  },
]

export default function CFPClientIncomePage() {
  // We pretend we have a single user with cfpId=1, clientId=1
  // or read from localStorage if you prefer. Here is a simplified approach:
  const [cfpId] = useState(1)
  const [clientId] = useState(1)
  const navigate = useNavigate()

  // The incomes array (read from localStorage or fallback to SAMPLE_INCOMES).
  const [incomes, setIncomes] = useState([])

  // States for form fields
  const [editMode, setEditMode] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)

  const [type, setType] = useState("เลือก")
  const [incomeName, setIncomeName] = useState("")
  const [frequency, setFrequency] = useState("ทุกเดือน")
  const [amount, setAmount] = useState("")
  const [growthRate, setGrowthRate] = useState("")
  const [income405Type, setIncome405Type] = useState("") // For 40(5)
  const [income406Type, setIncome406Type] = useState("") // For 40(6)
  const [income408Type, setIncome408Type] = useState("") // For 40(8)
  const [show408Details, setShow408Details] = useState(false) // For popup modal

  // Income types
  const incomeTypes = [
    "40(1) เงินเดือน",
    "40(2) รับจ้างทำงาน",
    "40(3) ค่าลิขสิทธิ์ สิทธิบัตร",
    "40(4) ดอกเบี้ย เงินปันผล",
    "40(5) ค่าเช่าทรัพย์สิน",
    "40(6) วิชาชีพอิสระ",
    "40(7) รับเหมาก่อสร้าง",
    "40(8) รายได้อื่นๆ",
  ]

  // Subtypes
  const income405SubTypes = [
    "บ้าน/โรงเรือน/สิ่งปลูกสร้าง/แพ/ยานพาหนะ",
    "ที่ดินที่ใช้ในการเกษตร",
    "ที่ดินที่มิได้ใช้ในการเกษตร",
    "ทรัพย์สินอื่นๆ",
  ]
  const income406SubTypes = [
    "การประกอบโรคศิลปะ",
    "กฎหมาย/วิศวกรรม/สถาปัตยกรรม/การบัญชี/ประณีตศิลปกรรม",
  ]
  const income408SubTypes = [
    "ประเภทที่ (1) (เงินได้ส่วนที่ไม่เกิน 300,000 บาท)",
    "ประเภทที่ (1) (เงินได้ส่วนที่เกิน 300,000 บาท)",
    "ประเภทที่ (2) ถึง (43)",
    "เงินได้ประเภทที่ไม่อยู่ใน (1) ถึง (43)",
  ]
  const frequencies = [
    { label: "ทุกเดือน", value: "ทุกเดือน" },
    { label: "ทุกปี", value: "ทุกปี" },
    { label: "ได้เป็นก้อน", value: "ได้เป็นก้อน" },
  ]

  // On first load, try to read from localStorage, else fallback to SAMPLE_INCOMES.
  useEffect(() => {
    const storedIncomes = localStorage.getItem(LOCALSTORAGE_KEY)
    if (storedIncomes) {
      try {
        const parsed = JSON.parse(storedIncomes)
        setIncomes(parsed)
      } catch (err) {
        console.error("Error parsing localStorage incomes:", err)
        setIncomes(SAMPLE_INCOMES)
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(SAMPLE_INCOMES))
      }
    } else {
      // If nothing in localStorage, use sample data
      setIncomes(SAMPLE_INCOMES)
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(SAMPLE_INCOMES))
    }
  }, [])

  // Helper to save incomes to localStorage whenever they change
  // (You can call this in create/update/delete methods instead, too)
  const saveToLocalStorage = (newIncomes) => {
    setIncomes(newIncomes)
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newIncomes))
  }

  const handleCreateOrUpdateIncome = () => {
    // Build a new or updated income record object
    const newIncome = {
      id: {
        clientId,
        clientIncomeName: incomeName,
      },
      clientIncomeType: type,
      clientIncomeFrequency: frequency,
      clientIncomeAmount: parseFloat(amount) || 0,
      clientIncomeAnnualGrowthRate: (parseFloat(growthRate) || 0) / 100,

      clientIncome405Type: "",
      clientIncome406Type: "",
      clientIncome408Type: "",
    }
    // If 40(5), set 405 subtype
    if (type.startsWith("40(5)")) {
      newIncome.clientIncome405Type = income405Type || ""
    }
    // If 40(6), set 406 subtype
    if (type.startsWith("40(6)")) {
      newIncome.clientIncome406Type = income406Type || ""
    }
    // If 40(8), set 408 subtype
    if (type.startsWith("40(8)")) {
      newIncome.clientIncome408Type = income408Type || ""
    }

    let newIncomes
    if (editMode && editingIncome) {
      // It's an edit. We'll update the existing item in state
      newIncomes = incomes.map((inc) =>
        inc.id.clientIncomeName === editingIncome.id.clientIncomeName
          ? newIncome
          : inc
      )
    } else {
      // It's a create. We'll add new item to the array
      newIncomes = [...incomes, newIncome]
    }

    // Save to local state & localStorage
    saveToLocalStorage(newIncomes)

    // Reset the form
    setEditMode(false)
    setEditingIncome(null)
    setType("เลือก")
    setIncomeName("")
    setFrequency("ทุกเดือน")
    setAmount("")
    setGrowthRate("")
    setIncome405Type("")
    setIncome406Type("")
    setIncome408Type("")
  }

  const handleDeleteIncome = (inc) => {
    // Remove from the array
    const newIncomes = incomes.filter(
      (item) => item.id.clientIncomeName !== inc.id.clientIncomeName
    )
    // Save result
    saveToLocalStorage(newIncomes)
  }

  const handleEdit = (inc) => {
    // Prepare the form fields with the selected record
    setEditMode(true)
    setEditingIncome(inc)
    setType(inc.clientIncomeType)
    setIncomeName(inc.id.clientIncomeName)
    setFrequency(inc.clientIncomeFrequency)
    setAmount(inc.clientIncomeAmount.toString())
    setGrowthRate((inc.clientIncomeAnnualGrowthRate * 100).toString() || "")

    setIncome405Type(inc.clientIncome405Type || "")
    setIncome406Type(inc.clientIncome406Type || "")
    setIncome408Type(inc.clientIncome408Type || "")
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setEditingIncome(null)
    setType("เลือก")
    setIncomeName("")
    setFrequency("ทุกเดือน")
    setAmount("")
    setGrowthRate("")
    setIncome405Type("")
    setIncome406Type("")
    setIncome408Type("")
  }

  const handleBack = () => {
    // In single-user mode, just do "back" or go to client-info
    navigate(`/client-info/`)
  }

  const handleNext = () => {
    // Go to the next page (client-expense, etc.)
    navigate(`/client-expense/`)
  }

  return (
    <div className="flex flex-col min-h-screen font-ibm">
      <Header />
      <div className="flex flex-1">
        <ClientBluePanel />
        <div className="flex-1 p-8 space-y-8">
          {/* Steps at the top */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            {/* Step 1: Client info (gray) */}
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

            {/* Step 2: Income (this page) */}
            <button
              onClick={() => navigate(`/client-income/`)}
              className="flex flex-col items-center focus:outline-none"
            >
              <div className="w-10 h-10 bg-tfpa_gold text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="font-bold text-tfpa_blue">รายได้</span>
            </button>
            <div className="h-px bg-gray-300 w-24"></div>

            {/* Step 3: Expense */}
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

            {/* Step 4: Asset */}
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

            {/* Step 5: Debt */}
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
            <h3 className="text-tfpa_blue font-bold text-lg mb-4">2. รายได้</h3>
            <div className="space-y-4">
              {/* Type of income */}
              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  ประเภทรายได้
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value)
                    if (!e.target.value.startsWith("40(5)")) {
                      setIncome405Type("")
                    }
                    if (!e.target.value.startsWith("40(6)")) {
                      setIncome406Type("")
                    }
                    if (!e.target.value.startsWith("40(8)")) {
                      setIncome408Type("")
                    }
                  }}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                >
                  <option value="เลือก">เลือก</option>
                  {incomeTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* 40(5) subtype dropdown */}
              {type.startsWith("40(5)") && (
                <div>
                  <label className="block text-tfpa_blue font-bold mb-2">
                    ประเภท 40(5)
                  </label>
                  <select
                    value={income405Type}
                    onChange={(e) => setIncome405Type(e.target.value)}
                    className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                  >
                    <option value="">เลือก</option>
                    {income405SubTypes.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 40(6) subtype dropdown */}
              {type.startsWith("40(6)") && (
                <div>
                  <label className="block text-tfpa_blue font-bold mb-2">
                    ประเภท 40(6)
                  </label>
                  <select
                    value={income406Type}
                    onChange={(e) => setIncome406Type(e.target.value)}
                    className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                  >
                    <option value="">เลือก</option>
                    {income406SubTypes.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 40(8) subtype dropdown + detail button */}
              {type.startsWith("40(8)") && (
                <div>
                  <label className="text-tfpa_blue font-bold mb-2 inline-flex items-center">
                    ประเภท 40(8)
                    <button
                      type="button"
                      onClick={() => setShow408Details(true)}
                      className="ml-2 bg-tfpa_blue hover:bg-tfpa_blue_hover text-white px-2 py-1 text-xs rounded-xl font-ibm"
                    >
                      รายละเอียด
                    </button>
                  </label>
                  <select
                    value={income408Type}
                    onChange={(e) => setIncome408Type(e.target.value)}
                    className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                  >
                    <option value="">เลือก</option>
                    <option value="ประเภทที่ (1) (เงินได้ส่วนที่ไม่เกิน 300,000 บาท)">
                      ประเภทที่ (1) ไม่เกิน 300,000
                    </option>
                    <option value="ประเภทที่ (1) (เงินได้ส่วนที่เกิน 300,000 บาท)">
                      ประเภทที่ (1) เกิน 300,000
                    </option>
                    <option value="ประเภทที่ (2) ถึง (43)">
                      ประเภทที่ (2) ถึง (43)
                    </option>
                    <option value="เงินได้ประเภทที่ไม่อยู่ใน (1) ถึง (43)">
                      เงินได้ประเภทที่ไม่อยู่ใน (1) ถึง (43)
                    </option>
                  </select>
                </div>
              )}

              {/* Income name */}
              <div>
                <label className="block text-tfpa_blue font-bold mb-2">
                  ชื่อรายได้
                </label>
                <input
                  type="text"
                  value={incomeName}
                  onChange={(e) => setIncomeName(e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                />
              </div>

              {/* Frequency */}
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

              {/* Growth rate */}
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

              {/* Create/Update Button(s) */}
              <div className="flex space-x-4">
                {editMode ? (
                  <>
                    <button
                      onClick={handleCreateOrUpdateIncome}
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
                    onClick={handleCreateOrUpdateIncome}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-ibm font-bold"
                  >
                    เพิ่ม
                  </button>
                )}
              </div>
            </div>

            {/* Existing incomes table */}
            <h3 className="text-tfpa_blue font-bold text-lg mt-4">
              รายได้ที่มีอยู่
            </h3>
            <table className="min-w-full bg-white border border-gray-300 mt-4 mb-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    ประเภทรายได้
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    ประเภทย่อย
                  </th>
                  <th className="py-2 px-4 border font-ibm font-bold text-tfpa_blue">
                    ชื่อรายได้
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
                {incomes.map((inc) => {
                  const {
                    clientIncomeType,
                    clientIncomeFrequency,
                    clientIncomeAmount,
                  } = inc
                  const growthPct = (
                    inc.clientIncomeAnnualGrowthRate * 100
                  ).toFixed(2)
                  // Determine which "subtype" to display
                  let subtype = "-"
                  if (clientIncomeType.startsWith("40(5)")) {
                    subtype = inc.clientIncome405Type
                  } else if (clientIncomeType.startsWith("40(6)")) {
                    subtype = inc.clientIncome406Type
                  } else if (clientIncomeType.startsWith("40(8)")) {
                    subtype = inc.clientIncome408Type
                  }

                  return (
                    <tr
                      key={`${inc.id.clientId}-${inc.id.clientIncomeName}`}
                      className="border-b last:border-0"
                    >
                      <td className="py-2 px-4 border">
                        {inc.clientIncomeType}
                      </td>
                      <td className="py-2 px-4 border">{subtype || "-"}</td>
                      <td className="py-2 px-4 border">
                        {inc.id.clientIncomeName}
                      </td>
                      <td className="py-2 px-4 border">
                        {clientIncomeFrequency}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {clientIncomeAmount.toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {growthPct}%
                      </td>
                      <td className="py-2 px-4 border">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleEdit(inc)}
                            className="bg-tfpa_blue hover:bg-tfpa_blue_hover text-white px-4 py-1 rounded font-ibm"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteIncome(inc)}
                            className="bg-red-500 hover:bg-red-700 text-white px-4 py-1 rounded font-ibm"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
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

      {/* 40(8) Details Modal */}
      {show408Details && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white w-11/12 md:w-3/4 lg:w-1/2 p-6 rounded shadow-lg overflow-auto max-h-[80vh]">
            <h2 className="text-xl font-bold text-tfpa_blue mb-4">
              รายละเอียดเงินได้พึงประเมิน 40(8) และ
              อัตราการหักค่าใช้จ่ายเป็นการเหมาสำหรับภาษี
            </h2>
            <p className="text-sm text-gray-700 mb-4 leading-6">
              <strong>ประเภทที่ (1)</strong> – การแสดงของนักแสดงละคร ภาพยนตร์
              วิทยุหรือโทรทัศน์ นักร้อง นักดนตรี นักกีฬาอาชีพ
              หรือนักแสดงเพื่อความบันเทิงใด ๆ
              <br />
              &emsp;– (ก) สำหรับเงินได้ส่วนที่ไม่เกิน 300,000 บาท หักค่าใช้จ่าย
              60%
              <br />
              &emsp;– (ข) สำหรับเงินได้ส่วนที่เกิน 300,000 บาท หักค่าใช้จ่าย 40%
              <br />
              &emsp;โดยการหักค่าใช้จ่ายตาม (ก) และ (ข) รวมกันต้องไม่เกิน 600,000
              บาท
              <br />
              <strong>ประเภทที่ (2)</strong> –
              การขายที่ดินเงินผ่อนหรือให้เช่าซื้อที่ดิน &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (3)</strong> – การเก็บค่าต๋ง
              หรือค่าเกมจากการพนัน การแข่งขันหรือการเล่นต่าง ๆ
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (4)</strong> – การถ่าย ล้าง อัด
              หรือขยายรูปภาพยนตร์ รวมทั้งการขายส่วนประกอบ &nbsp;หักค่าใช้จ่าย
              60%
              <br />
              <strong>ประเภทที่ (5)</strong> – การทำกิจการคานเรือ อู่เรือ
              หรือซ่อมเรือที่มิใช่ซ่อมเครื่องจักร เครื่องกล &nbsp;หักค่าใช้จ่าย
              60%
              <br />
              <strong>ประเภทที่ (6)</strong> – การทำรองเท้า
              และเครื่องหนังแท้หรือหนังเทียม รวมทั้งการขายส่วนประกอบ
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (7)</strong> – การตัด เย็บ ถัก ปักเสื้อผ้า
              หรือสิ่งอื่น ๆ รวมทั้งการขายส่วนประกอบ &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (8)</strong> – การทำ ตกแต่ง
              หรือซ่อมแซมเครื่องเรือน รวมทั้งการขายส่วนประกอบ
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (9)</strong> – การทำกิจการโรงแรม หรือภัตตาคาร
              หรือการปรุงอาหารหรือเครื่องดื่มจำหน่าย &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (10)</strong> – การดัด ตัด แต่งผม
              หรือตกแต่งร่างกาย &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (11)</strong> – การทำสบู่ แชมพู หรือเครื่องสำอาง
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (12)</strong> – การทำวรรณกรรม
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (13)</strong> – การค้าเครื่องเงิน ทอง นาก เพชร
              พลอย หรืออัญมณีอื่น ๆ รวมทั้งการขายส่วนประกอบ &nbsp;หักค่าใช้จ่าย
              60%
              <br />
              <strong>ประเภทที่ (14)</strong> – การทำกิจการสถานพยาบาล
              ตามกฎหมายว่าด้วยสถานพยาบาลเฉพาะ ที่มีเตียงรับผู้ป่วยค้างคืน
              รวมทั้งการรักษาพยาบาลและการจำหน่ายยา &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (15)</strong> – การโม่หรือย่อยหิน
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (16)</strong> – การทำป่าไม้ สวนยาง หรือไม้ยืนต้น
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (17)</strong> – การขนส่ง หรือรับจ้างด้วยยานพาหนะ
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (18)</strong> – การทำบล็อก และตรา
              การรับพิมพ์หนังสือเย็บเล่มจด เอกสาร รวมทั้งการขายส่วนประกอบ
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (19)</strong> – การทำเหมืองแร่
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (20)</strong> –
              การทำเครื่องดื่มตามกฎหมายว่าด้วยภาษีสรรพสามิต &nbsp;หักค่าใช้จ่าย
              60%
              <br />
              <strong>ประเภทที่ (21)</strong> – การทำเครื่องกระเบื้อง
              เครื่องเคลือบ เครื่องซีเมนต์ หรือดินเผา &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (22)</strong> – การทำหรือจำหน่ายกระแสไฟฟ้า
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (23)</strong> – การทำน้ำแข็ง &nbsp;หักค่าใช้จ่าย
              60%
              <br />
              <strong>ประเภทที่ (24)</strong> – การทำกาว แป้งเปียก
              หรือสิ่งที่มีลักษณะทำนองเดียวกัน &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (25)</strong> – การทำลูกโป่ง เครื่องแก้ว
              เครื่องพลาสติก หรือเครื่องยางสำเร็จรูป &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (26)</strong> – การซักรีด หรือย้อมสี
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (27)</strong> –
              การขายของนอกจากที่ระบุไว้ในข้ออื่น ซึ่งผู้ขายมิได้เป็นผู้ผลิต
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (28)</strong> –
              รางวัลที่เจ้าของม้าได้จากการส่งม้าเข้าแข่ง &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (29)</strong> – การรับสินไถ่ทรัพย์สินที่ขายฝาก
              หรือการได้กรรมสิทธิ์ในทรัพย์สินโดยเด็ดขาดจากการขายฝาก
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (30)</strong> – การรมยาง การทำยางแผ่น
              หรือยางอย่างอื่นที่มิใช่ยางสำเร็จรูป &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (31)</strong> – การฟอกหนัง &nbsp;หักค่าใช้จ่าย
              60%
              <br />
              <strong>ประเภทที่ (32)</strong> – การทำน้ำตาล
              หรือน้ำเหลืองของน้ำตาล &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (33)</strong> – การจับสัตว์น้ำ
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (34)</strong> – การทำกิจการโรงเลื่อย
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (35)</strong> – การกลั่น หรือหีบน้ำมัน
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (36)</strong> – การให้เช่าซื้อสังหาริมทรัพย์
              ที่ไม่เข้าลักษณะตามมาตรา 40 (5) แห่งประมวลรัษฎากร
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (37)</strong> – การทำกิจการโรงสีข้าว
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (38)</strong> –
              การทำเกษตรกรรมประเภทไม้ล้มลุกและธัญชาติ &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (39)</strong> – การอบหรือบ่มใบยาสูบ
              &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (40)</strong> – การเลี้ยงสัตว์ทุกชนิด
              รวมทั้งการขายวัตถุพลอยได้ &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (41)</strong> – การฆ่าสัตว์จำหน่าย
              รวมทั้งการขายวัตถุพลอยได้ &nbsp;หักค่าใช้จ่าย 60%
              <br />
              <strong>ประเภทที่ (42)</strong> – การทำนาเกลือ &nbsp;หักค่าใช้จ่าย
              60%
              <br />
              <strong>ประเภทที่ (43)</strong> –
              การขายเรือกำปั่นหรือเรือมีระวางตั้งแต่ 6 ตันขึ้นไป เรือกลไฟ
              หรือเรือยนต์มีระวางตั้งแต่ 5 ตันขึ้นไป หรือแพ &nbsp;หักค่าใช้จ่าย
              60%
              <br />
              <strong>
                – เงินได้ประเภทที่ไม่ได้ระบุ ให้หักค่าใช้จ่ายจริง
                ตามความจำเป็นและสมควร
              </strong>
            </p>

            <div className="flex justify-end">
              <button
                className="bg-tfpa_blue hover:bg-tfpa_blue_hover text-white px-4 py-2 rounded-xl"
                onClick={() => setShow408Details(false)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
