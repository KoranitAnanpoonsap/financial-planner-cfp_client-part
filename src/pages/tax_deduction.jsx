import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/footer"
import Header from "../components/header"
import ClientBluePanel from "../components/clientBluePanel"
import { motion } from "framer-motion"
import { fetchAndCalculateTaxForClient } from "../utils/taxCalculations" // Import tax calculation functions

const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 1,
  },
}

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
}

export default function TaxDeductionPage() {
  const navigate = useNavigate()
  const [baseForDonation, setBaseForDonation] = useState(0)

  const [deductionData, setDeductionData] = useState({
    maritalStatus: "",
    child: 0,
    child2561: 0,
    adoptedChild: 0,
    parentalCare: 0,
    disabledCare: 0,
    prenatalCare: 0,
    parentHealthInsurance: 0,
    lifeInsurance: 0,
    healthInsurance: 0,
    pensionInsurance: 0,
    spouseNoIncomeLifeInsurance: 0,
    rmf: 0,
    ssf: 0,
    govPensionFund: 0,
    pvd: 0,
    nationSavingsFund: 0,
    socialSecurityPremium: 0,
    socialEnterprise: 0,
    thaiEsg: 0,
    generalDonation: 0,
    eduDonation: 0,
    politicalPartyDonation: 0,
  })

  const [displayValues, setDisplayValues] = useState({
    maritalStatusDeduction: 0,
    childDeduction: 0,
    child2561Deduction: 0,
    adoptedChildDeduction: 0,
    parentalCareDeduction: 0,
    disabledCareDeduction: 0,
    prenatalCareDeduction: 0,
    parentHealthInsuranceDeduction: 0,
    lifeInsuranceDeduction: 0,
    healthInsuranceDeduction: 0,
    portionPensionInsuranceDeduction: 0,
    pensionInsuranceDeduction: 0,
    spouseNoIncomeLifeInsuranceDeduction: 0,
    rmfDeduction: 0,
    ssfDeduction: 0,
    govPensionFundDeduct: 0,
    pvdDeduct: 0,
    nationSavingsFundDeduct: 0,
    socialSecurityPremiumDeduct: 0,
    socialEnterpriseDeduct: 0,
    thaiEsgDeduct: 0,
    generalDonationDeduct: 0,
    eduDonationDeduct: 0,
    politicalPartyDonationDeduct: 0,
    beforeDonationDeduct: 0,
    totalDeduction: 0,
  })

  const [totalIncome, setTotalIncome] = useState(0)
  const [expenseDeductions, setExpenseDeductions] = useState(0)
  const [exists, setExists] = useState(false) // To track if taxDeduction exists

  // Fetch deduction data and income-related data from localStorage on mount
  useEffect(() => {
    fetchDeduction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recalculate deductions whenever relevant data changes
  useEffect(() => {
    if (deductionData && totalIncome > 0) {
      calculateDeductions(deductionData, totalIncome)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deductionData, totalIncome])

  // Function to fetch deduction data from localStorage and calculate tax
  const fetchDeduction = async () => {
    const taxDeductionString = localStorage.getItem("taxDeduction")
    if (taxDeductionString) {
      try {
        const data = JSON.parse(taxDeductionString)
        setDeductionData(data)
        setExists(true)
      } catch (error) {
        console.error("Failed to parse 'taxDeduction' from localStorage.")
        setExists(false)
      }
    } else {
      setExists(false)
    }

    try {
      // Fetch and calculate tax based on localStorage data
      const taxResult = await fetchAndCalculateTaxForClient()
      setTotalIncome(taxResult.totalIncome)
      setExpenseDeductions(taxResult.totalExpenseDeductions)
    } catch (error) {
      console.error("Tax calculation failed:", error)
      setTotalIncome(0)
      setExpenseDeductions(0)
    }
  }

  // Function to refresh calculations based on current data
  const refreshCalculations = async (newData = deductionData) => {
    try {
      const taxResult = await fetchAndCalculateTaxForClient()
      setTotalIncome(taxResult.totalIncome)
      setExpenseDeductions(taxResult.totalExpenseDeductions)

      calculateDeductions(newData, taxResult.totalIncome)
    } catch (error) {
      console.error("Tax calculation failed during refresh:", error)
    }
  }

  // Centralized handleUpdate function to manage state and localStorage
  const handleUpdate = (updates) => {
    const updated = { ...deductionData, ...updates }
    setDeductionData(updated)
    localStorage.setItem("taxDeduction", JSON.stringify(updated))
    refreshCalculations(updated)
  }

  // Function to handle blur events with conditional parsing
  const handleBlur = (field, val) => {
    let parsedVal
    if (field === "maritalStatus") {
      parsedVal = val // Keep as string
    } else {
      parsedVal = parseInt(val, 10) || 0 // Parse as integer for numeric fields
    }
    handleUpdate({ [field]: parsedVal })
  }

  // Function to handle input focus (selecting the input content)
  const handleInputFocus = (e) => {
    e.target.select()
  }

  // Function to calculate deductions based on current data and income
  function calculateDeductions(data, totalInc) {
    let msDeduct = 0
    if (
      data.maritalStatus === "โสด" ||
      data.maritalStatus === "คู่สมรสมีเงินได้แยกยื่นแบบ"
    ) {
      msDeduct = 60000
    } else if (
      data.maritalStatus === "คู่สมรสมีเงินได้ยื่นรวม" ||
      data.maritalStatus === "คู่สมรสไม่มีเงินได้"
    ) {
      msDeduct = 120000
    }

    const cDeduct =
      data.maritalStatus === "คู่สมรสมีเงินได้ยื่นรวม"
        ? data.child * 60000
        : data.child * 30000
    const c2561Deduct =
      data.maritalStatus === "คู่สมรสมีเงินได้ยื่นรวม"
        ? data.child > 0
          ? data.child2561 * 120000
          : 0
        : data.child > 0
        ? data.child2561 * 60000
        : 0
    const legalChildren = data.child + data.child2561
    const adoptedDeduct =
      data.maritalStatus === "คู่สมรสมีเงินได้ยื่นรวม"
        ? legalChildren < 3
          ? Math.min(data.adoptedChild, 3 - legalChildren) * 60000
          : 0
        : legalChildren < 3
        ? Math.min(data.adoptedChild, 3 - legalChildren) * 30000
        : 0

    const pCareDeduct = data.parentalCare * 30000
    const dCareDeduct = data.disabledCare * 60000
    const prenatalDeduct = Math.min(data.prenatalCare, 60000)
    const parentHealth = Math.min(data.parentHealthInsurance, 15000)

    let lifeIns = Math.min(data.lifeInsurance, 100000)
    let healthIns = Math.min(data.healthInsurance, 25000)
    if (lifeIns + healthIns > 100000) {
      healthIns -= lifeIns + healthIns - 100000
      healthIns = Math.max(0, healthIns) // Ensure non-negative
    }

    let portion_pensionIns = 0
    if (lifeIns + healthIns < 100000) {
      portion_pensionIns = Math.min(
        data.pensionInsurance,
        100000 - (lifeIns + healthIns)
      )
    }

    let pensionIns = Math.min(
      data.pensionInsurance - portion_pensionIns,
      0.15 * totalInc,
      200000
    )

    const spouseNoIncome = Math.min(data.spouseNoIncomeLifeInsurance, 10000)

    const rmf = Math.min(data.rmf, 0.3 * totalInc, 500000)
    const ssf = Math.min(data.ssf, 0.3 * totalInc, 200000)
    const govPension = Math.min(data.govPensionFund, 0.3 * totalInc, 500000)
    const pvd = Math.min(data.pvd, 0.15 * totalInc, 500000)
    const nsf = Math.min(data.nationSavingsFund, 30000)
    const pensionGroup = Math.min(
      rmf + ssf + govPension + pvd + nsf + pensionIns,
      500000
    )

    const ssp = Math.min(data.socialSecurityPremium, 9000)
    const se = Math.min(data.socialEnterprise, 100000)
    const esg = Math.min(data.thaiEsg, 0.3 * totalInc, 300000)

    const beforeDonationSum =
      msDeduct +
      cDeduct +
      c2561Deduct +
      adoptedDeduct +
      pCareDeduct +
      dCareDeduct +
      prenatalDeduct +
      parentHealth +
      lifeIns +
      portion_pensionIns +
      healthIns +
      pensionGroup +
      spouseNoIncome +
      ssp +
      se +
      esg

    const updatedBaseForDonation = Math.max(
      0,
      totalInc - expenseDeductions - beforeDonationSum
    )

    // Calculate donations using the updated baseForDonation
    const genDon = Math.min(data.generalDonation, updatedBaseForDonation * 0.1)
    const eduDon = Math.min(data.eduDonation * 2, updatedBaseForDonation * 0.1)
    const polDon = Math.min(data.politicalPartyDonation, 10000)

    const donationSum = genDon + eduDon + polDon
    const total = beforeDonationSum + donationSum

    setBaseForDonation(updatedBaseForDonation) // Update state for consistency

    setDisplayValues({
      maritalStatusDeduction: msDeduct,
      childDeduction: cDeduct,
      child2561Deduction: c2561Deduct,
      adoptedChildDeduction: adoptedDeduct,
      parentalCareDeduction: pCareDeduct,
      disabledCareDeduction: dCareDeduct,
      prenatalCareDeduction: prenatalDeduct,
      parentHealthInsuranceDeduction: parentHealth,
      lifeInsuranceDeduction: lifeIns,
      healthInsuranceDeduction: healthIns,
      portionPensionInsuranceDeduction: portion_pensionIns,
      pensionInsuranceDeduction: pensionIns,
      spouseNoIncomeLifeInsuranceDeduction: spouseNoIncome,
      rmfDeduction: rmf,
      ssfDeduction: ssf,
      govPensionFundDeduct: govPension,
      pvdDeduct: pvd,
      nationSavingsFundDeduct: nsf,
      socialSecurityPremiumDeduct: ssp,
      socialEnterpriseDeduct: se,
      thaiEsgDeduct: esg,
      generalDonationDeduct: genDon,
      eduDonationDeduct: eduDon,
      politicalPartyDonationDeduct: polDon,
      beforeDonationDeduct: beforeDonationSum,
      totalDeduction: total,
    })
  }

  // Function to handle navigation back to income page
  const handleBack = () => {
    navigate(`/tax-income/`)
  }

  // Function to handle navigation to tax calculation page
  const handleNext = () => {
    navigate(`/tax-calculation/`)
  }

  return (
    <div className="flex flex-col min-h-screen font-ibm">
      <Header />
      <div className="flex flex-1">
        <ClientBluePanel />
        <div className="flex-1 p-8 space-y-8">
          {/* Steps Navigation */}
          <div className="flex items-center justify-center space-x-8">
            {/* Step 1: รายได้ */}
            <button
              onClick={() => navigate(`/tax-income/`)}
              className="flex flex-col items-center focus:outline-none"
            >
              <div className="w-10 h-10 bg-tfpa_gold rounded-full flex items-center justify-center text-white font-bold cursor-pointer">
                1
              </div>
              <span className="font-bold text-tfpa_blue">รายได้</span>
            </button>

            <div className="h-px bg-gray-300 w-24"></div>

            {/* Step 2: ค่าลดหย่อน */}
            <button
              onClick={() => navigate(`/tax-deduction/`)}
              className="flex flex-col items-center focus:outline-none"
            >
              <div className="w-10 h-10 bg-tfpa_gold rounded-full flex items-center justify-center text-white font-bold cursor-pointer">
                2
              </div>
              <span className="font-bold text-tfpa_blue">ค่าลดหย่อน</span>
            </button>

            <div className="h-px bg-gray-300 w-24"></div>

            {/* Step 3: ผลการคำนวณ */}
            <button
              onClick={() => navigate(`/tax-calculation/`)}
              className="flex flex-col items-center focus:outline-none text-gray-400"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold cursor-pointer">
                3
              </div>
              <span className="font-bold">ผลการคำนวณ</span>
            </button>
          </div>

          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {/* First Section: Personal and Family Deductions */}
            <div className="bg-tfpa_gold p-4 mb-4 rounded space-y-4 text-tfpa_blue font-bold">
              <h3>ค่าลดหย่อนภาษีส่วนตัวและครอบครัว</h3>
            </div>

            {/* Personal and Family Deductions Form */}
            <div className="space-y-4">
              {/* Marital Status */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">สถานภาพสมรส</span>
                <div className="flex items-center space-x-4 w-1/2">
                  <select
                    value={deductionData.maritalStatus}
                    onChange={(e) => {
                      const value = e.target.value
                      handleUpdate({ maritalStatus: value })
                    }}
                    onBlur={(e) => handleBlur("maritalStatus", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-tfpa_blue"
                  >
                    <option value="">เลือก</option>
                    <option value="โสด">โสด</option>
                    <option value="คู่สมรสมีเงินได้แยกยื่นแบบ">
                      คู่สมรสมีเงินได้แยกยื่นแบบ
                    </option>
                    <option value="คู่สมรสมีเงินได้ยื่นรวม">
                      คู่สมรสมีเงินได้ยื่นรวม
                    </option>
                    <option value="คู่สมรสไม่มีเงินได้">
                      คู่สมรสไม่มีเงินได้
                    </option>
                  </select>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.maritalStatusDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Child */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">บุตร จำนวน</span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.child}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value))
                      handleUpdate({
                        child: value,
                        child2561: value > 0 ? deductionData.child2561 : 0,
                        adoptedChild:
                          value +
                            deductionData.child2561 +
                            deductionData.adoptedChild >
                          3
                            ? Math.max(0, 3 - value - deductionData.child2561)
                            : deductionData.adoptedChild,
                      })
                    }}
                    onBlur={(e) => handleBlur("child", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-16 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">คน</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.childDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Child2561 */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  บุตรตั้งแต่คนที่ 2 เป็นต้นไปที่เกิดในหรือหลังปี พ.ศ. 2561
                  จำนวน
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.child2561}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value))
                      handleUpdate({
                        child2561: deductionData.child > 0 ? value : 0,
                        adoptedChild:
                          deductionData.child +
                            value +
                            deductionData.adoptedChild >
                          3
                            ? Math.max(0, 3 - deductionData.child - value)
                            : deductionData.adoptedChild,
                      })
                    }}
                    onBlur={(e) => handleBlur("child2561", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-16 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">คน</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.child2561Deduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Adopted Child */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  บุตรบุญธรรม จำนวน
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.adoptedChild}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value))
                      handleUpdate({
                        adoptedChild:
                          deductionData.child +
                            deductionData.child2561 +
                            value >
                          3
                            ? Math.max(
                                0,
                                3 -
                                  deductionData.child -
                                  deductionData.child2561
                              )
                            : value,
                      })
                    }}
                    onBlur={(e) => handleBlur("adoptedChild", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-16 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">คน</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.adoptedChildDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Parental Care */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  ค่าอุปการะเลี้ยงดูบิดามารดา อายุเกิน60ปี รายได้ไม่เกิน30,000
                  จำนวน
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.parentalCare}
                    onChange={(e) =>
                      handleUpdate({
                        parentalCare: Math.max(0, Number(e.target.value)),
                      })
                    }
                    onBlur={(e) => handleBlur("parentalCare", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-16 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">คน</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.parentalCareDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Disabled Care */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  อุปการะเลี้ยงดูคนพิการหรือทุพพลภาพ จำนวน
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.disabledCare}
                    onChange={(e) =>
                      handleUpdate({
                        disabledCare: Math.max(0, Number(e.target.value)),
                      })
                    }
                    onBlur={(e) => handleBlur("disabledCare", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-16 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">คน</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.disabledCareDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Prenatal Care */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  ค่าฝากครรภ์และค่าคลอดบุตร
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.prenatalCare}
                    onChange={(e) =>
                      handleUpdate({
                        prenatalCare: Math.min(
                          60000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) => handleBlur("prenatalCare", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.prenatalCareDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Parent Health Insurance */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  ประกันสุขภาพบิดามารดา
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.parentHealthInsurance}
                    onChange={(e) =>
                      handleUpdate({
                        parentHealthInsurance: Math.min(
                          15000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) =>
                      handleBlur("parentHealthInsurance", e.target.value)
                    }
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.parentHealthInsuranceDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>
            </div>

            {/* Second Section: Insurance, Savings, and Investments Deductions */}
            <div className="bg-tfpa_gold p-4 mt-4 mb-4 rounded space-y-4 text-tfpa_blue font-bold">
              <h3>ค่าลดหย่อนภาษีกลุ่มประกัน เงินออม และการลงทุน</h3>
            </div>

            {/* Insurance, Savings, and Investments Deductions Form */}
            <div className="space-y-4">
              {/* Life Insurance */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  เบี้ยประกันชีวิต
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.lifeInsurance}
                    onChange={(e) =>
                      handleUpdate({
                        lifeInsurance: Math.min(
                          100000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) => handleBlur("lifeInsurance", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.lifeInsuranceDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Portion of Pension Insurance */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue">
                  -เพิ่มส่วน เบี้ยประกันชีวิตแบบบำนาญ
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <div className="w-28"></div>
                  <span className="w-3"></span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.portionPensionInsuranceDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Health Insurance */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  เบี้ยประกันสุขภาพ
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.healthInsurance}
                    onChange={(e) => {
                      const inputValue = Math.max(0, Number(e.target.value))
                      handleUpdate({
                        healthInsurance: Math.min(inputValue, 25000),
                      })
                    }}
                    onBlur={(e) =>
                      handleBlur("healthInsurance", e.target.value)
                    }
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.healthInsuranceDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Pension Insurance */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  เบี้ยประกันชีวิตแบบบำนาญ
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.pensionInsurance}
                    onChange={(e) =>
                      handleUpdate({
                        pensionInsurance: Math.min(
                          300000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) =>
                      handleBlur("pensionInsurance", e.target.value)
                    }
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.pensionInsuranceDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Spouse No Income Life Insurance */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  เบี้ยประกันชีวิต คู่สมรสไม่มีรายได้
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.spouseNoIncomeLifeInsurance}
                    onChange={(e) =>
                      handleUpdate({
                        spouseNoIncomeLifeInsurance: Math.min(
                          10000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) =>
                      handleBlur("spouseNoIncomeLifeInsurance", e.target.value)
                    }
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.spouseNoIncomeLifeInsuranceDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* RMF */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  กองทุนรวมเพื่อการเลี้ยงชีพ (RMF)
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.rmf}
                    onChange={(e) =>
                      handleUpdate({
                        rmf: Math.min(
                          0.3 * totalIncome,
                          500000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) => handleBlur("rmf", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.rmfDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* SSF */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  กองทุนรวมเพื่อการออม (SSF)
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.ssf}
                    onChange={(e) =>
                      handleUpdate({
                        ssf: Math.min(
                          0.3 * totalIncome,
                          200000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) => handleBlur("ssf", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.ssfDeduction.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Government Pension Fund */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  กองทุนบำเหน็จบำนาญราชการ (กบข.)
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.govPensionFund}
                    onChange={(e) =>
                      handleUpdate({
                        govPensionFund: Math.min(
                          0.3 * totalIncome,
                          500000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) => handleBlur("govPensionFund", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.govPensionFundDeduct.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* PVD */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  กองทุนสำรองเลี้ยงชีพ (PVD)
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.pvd}
                    onChange={(e) =>
                      handleUpdate({
                        pvd: Math.min(
                          0.15 * totalIncome,
                          500000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) => handleBlur("pvd", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.pvdDeduct.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Nation Savings Fund */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  กองทุนการออมแห่งชาติ (กอช.)
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.nationSavingsFund}
                    onChange={(e) =>
                      handleUpdate({
                        nationSavingsFund: Math.min(
                          30000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) =>
                      handleBlur("nationSavingsFund", e.target.value)
                    }
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.nationSavingsFundDeduct.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Social Security Premium */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  เบี้ยประกันสังคม
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.socialSecurityPremium}
                    onChange={(e) =>
                      handleUpdate({
                        socialSecurityPremium: Math.min(
                          9000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) =>
                      handleBlur("socialSecurityPremium", e.target.value)
                    }
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.socialSecurityPremiumDeduct.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Social Enterprise */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  เงินลงทุนธุรกิจ social enterprise
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.socialEnterprise}
                    onChange={(e) =>
                      handleUpdate({
                        socialEnterprise: Math.min(
                          100000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) =>
                      handleBlur("socialEnterprise", e.target.value)
                    }
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.socialEnterpriseDeduct.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Thai ESG */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  กองทุนรวมไทยเพื่อความยั่งยืน (Thai ESG)
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.thaiEsg}
                    onChange={(e) =>
                      handleUpdate({
                        thaiEsg: Math.min(
                          0.3 * totalIncome,
                          300000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) => handleBlur("thaiEsg", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.thaiEsgDeduct.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>
            </div>

            {/* Dotted Line Separator */}
            <hr className="border-dashed mt-4 mb-4 border-gray-300" />

            {/* Summary Before Donations */}
            <div className="flex justify-end font-bold text-tfpa_blue">
              <div className="flex space-x-2 items-center">
                <span className="text-tfpa_blue font-bold">
                  ค่าลดหย่อนภาษีก่อนกลุ่มเงินบริจาค
                </span>
                <span className="text-tfpa_gold font-bold">
                  {displayValues.beforeDonationDeduct.toLocaleString()}
                </span>
                <span className="text-tfpa_blue font-bold"> บาท</span>
              </div>
            </div>

            {/* Third Section: Donations Deductions */}
            <div className="bg-tfpa_gold p-4 mt-4 mb-4 rounded space-y-4 text-tfpa_blue font-bold">
              <h3>ค่าลดหย่อนภาษีกลุ่มเงินบริจาค</h3>
            </div>

            {/* Donations Deductions Form */}
            <div className="space-y-4">
              {/* General Donation */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  เงินบริจาคทั่วไป
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.generalDonation}
                    onChange={(e) => {
                      const val =
                        e.target.value === ""
                          ? 0
                          : parseInt(e.target.value, 10) || 0
                      handleUpdate({
                        generalDonation: Math.min(val, 0.1 * baseForDonation),
                      })
                    }}
                    onBlur={(e) =>
                      handleBlur("generalDonation", e.target.value)
                    }
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.generalDonationDeduct.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Educational Donation */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  เงินบริจาคเพื่อการศึกษา การกีฬา การพัฒนาสังคม
                  เพื่อประโยชน์สาธารณะ และรพ.รัฐ
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.eduDonation}
                    onChange={(e) => {
                      const val =
                        e.target.value === ""
                          ? 0
                          : parseInt(e.target.value, 10) || 0
                      handleUpdate({
                        eduDonation: Math.min(val, 0.05 * baseForDonation), // Since eduDonation * 2 <= 0.1 * base
                      })
                    }}
                    onBlur={(e) => handleBlur("eduDonation", e.target.value)}
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.eduDonationDeduct.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>

              {/* Political Party Donation */}
              <div className="flex items-center justify-between">
                <span className="text-tfpa_blue font-bold">
                  เงินบริจาคให้พรรคการเมือง
                </span>
                <div className="flex items-center space-x-4 w-1/2">
                  <input
                    type="number"
                    value={deductionData.politicalPartyDonation}
                    onChange={(e) =>
                      handleUpdate({
                        politicalPartyDonation: Math.min(
                          10000,
                          Math.max(0, Number(e.target.value))
                        ),
                      })
                    }
                    onBlur={(e) =>
                      handleBlur("politicalPartyDonation", e.target.value)
                    }
                    onFocus={handleInputFocus}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                  />
                  <span className="text-tfpa_blue font-bold">บาท</span>
                  <span className="text-tfpa_gold font-bold">
                    {displayValues.politicalPartyDonationDeduct.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold"> บาท</span>
                </div>
              </div>
            </div>

            {/* Dotted Line Separator */}
            <hr className="border-dashed mt-4 mb-4 border-gray-300" />

            {/* Total Deductions */}
            <div className="flex justify-end mb-4 font-bold text-tfpa_blue">
              <div className="flex space-x-2 items-center">
                <span className="text-tfpa_blue font-bold">ค่าลดหย่อนภาษี</span>
                <span className="text-tfpa_gold font-bold">
                  {displayValues.totalDeduction.toLocaleString()}
                </span>
                <span className="text-tfpa_blue font-bold"> บาท</span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="bg-tfpa_gold text-white px-4 py-2 rounded font-bold"
              >
                กลับ
              </button>
              <button
                onClick={handleNext}
                className="bg-tfpa_gold text-white px-4 py-2 rounded font-bold"
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
