import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/footer"
import Header from "../components/header"
import ClientBluePanel from "../components/clientBluePanel"
import {
  fetchAndCalculateTaxForClient,
  calculateTaxForClient,
} from "../utils/taxCalculations"
import {
  fetchAndCalculateTaxPlanForClient,
  calculateTaxPlanForClient,
} from "../utils/taxPlanCalculations"
import { motion } from "framer-motion"

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
}

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
}

export default function TaxCalculationPage() {
  const navigate = useNavigate()

  // Retrieve IDs from localStorage
  const [cfpId] = useState(Number(localStorage.getItem("cfpId")) || "")
  const [clientId] = useState(Number(localStorage.getItem("clientId")) || "")

  // Tax Calculation States
  const [oldTaxToPay, setOldTaxToPay] = useState(0)
  const [newTaxToPay, setNewTaxToPay] = useState(0)
  const [taxSaved, setTaxSaved] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)
  const [incomeAfterDeductions, setIncomeAfterDeductions] = useState(0)

  // Deductions States
  const [maxDeductions, setMaxDeductions] = useState({
    rmf: 0,
    ssf: 0,
    govPensionFund: 0,
    pvd: 0,
    nationSavingsFund: 0,
    pensionInsurance: 0,
    total: 500000,
  })

  const [alreadyUsedDeductions, setAlreadyUsedDeductions] = useState({
    rmf: 0,
    ssf: 0,
    govPensionFund: 0,
    pvd: 0,
    nationSavingsFund: 0,
    pensionInsurance: 0,
    total: 0,
  })

  const [remainingDeductions, setRemainingDeductions] = useState({
    rmf: 0,
    ssf: 0,
    govPensionFund: 0,
    pvd: 0,
    nationSavingsFund: 0,
    pensionInsurance: 0,
    total: 0,
  })

  // Investments State
  const [investments, setInvestments] = useState({
    rmf: 0,
    ssf: 0,
    govPensionFund: 0,
    pvd: 0,
    nationSavingsFund: 0,
    pensionInsurance: 0,
    total: 0,
  })

  // Initialize debounceTimer with useRef
  const debounceTimer = useRef(null)

  // Fetch initial data on component mount
  useEffect(() => {
    if (clientId) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  // Fetch tax calculation and deduction data from localStorage using utility functions
  const fetchData = useCallback(async () => {
    try {
      // Fetch and calculate initial tax data
      const taxResult = await fetchAndCalculateTaxForClient(clientId)
      setOldTaxToPay(taxResult.taxToPay || 0)
      setTotalIncome(taxResult.totalIncome || 0)
      setIncomeAfterDeductions(taxResult.incomeAfterDeductions || 0)

      // Calculate maximum deductions based on totalIncome and insuranceSum
      const insuranceSum =
        (taxResult.taxDeduction?.lifeInsurance || 0) +
        (taxResult.taxDeduction?.healthInsurance || 0)
      const calculatedMaxDeductions = calculateMaxDeductions(
        taxResult.totalIncome,
        insuranceSum
      )
      setMaxDeductions(calculatedMaxDeductions)

      // Calculate already used deductions
      const calculatedAlreadyUsed = calculateAlreadyUsedDeductions(
        taxResult.taxDeduction
      )
      setAlreadyUsedDeductions(calculatedAlreadyUsed)

      // Calculate remaining deductions
      const calculatedRemaining = calculateRemainingDeductions(
        calculatedMaxDeductions,
        calculatedAlreadyUsed
      )
      setRemainingDeductions(calculatedRemaining)

      // Fetch existing tax plan from localStorage
      const taxPlanString = localStorage.getItem("taxPlan")
      if (taxPlanString) {
        try {
          const taxPlanData = JSON.parse(taxPlanString)
          setInvestments({
            rmf: taxPlanData.investRmf || 0,
            ssf: taxPlanData.investSsf || 0,
            govPensionFund: taxPlanData.investGovPensionFund || 0,
            pvd: taxPlanData.investPvd || 0,
            nationSavingsFund: taxPlanData.investNationSavingsFund || 0,
            pensionInsurance: taxPlanData.investPensionInsurance || 0,
            total:
              (taxPlanData.investRmf || 0) +
              (taxPlanData.investSsf || 0) +
              (taxPlanData.investGovPensionFund || 0) +
              (taxPlanData.investPvd || 0) +
              (taxPlanData.investNationSavingsFund || 0) +
              (taxPlanData.investPensionInsurance || 0),
          })
        } catch (error) {
          console.error("Failed to parse 'taxPlan' from localStorage.")
        }
      } else {
        setInvestments({
          rmf: 0,
          ssf: 0,
          govPensionFund: 0,
          pvd: 0,
          nationSavingsFund: 0,
          pensionInsurance: 0,
          total: 0,
        })
      }

      // Recalculate new tax based on investments
      const totalUsedDeductions = Math.min(
        calculatedAlreadyUsed.total + investments.total,
        500000
      )
      const newTaxResult = await fetchAndCalculateTaxPlanForClient(
        clientId,
        totalUsedDeductions
      )
      setNewTaxToPay(newTaxResult.taxToPay)
      setTaxSaved(taxResult.taxToPay - newTaxResult.taxToPay)
    } catch (error) {
      console.error("Error in fetchData:", error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investments.total])

  // Function to calculate maximum allowable deductions
  const calculateMaxDeductions = (totalIncome, insuranceSum) => {
    const rmfMax = Math.min(0.3 * totalIncome, 500000)
    const ssfMax = Math.min(0.3 * totalIncome, 200000)
    const govPensionMax = Math.min(0.3 * totalIncome, 500000)
    const pvdMax = Math.min(0.15 * totalIncome, 500000)
    const nationSavingsMax = 30000
    const pensionInsuranceMax = Math.min(0.15 * totalIncome, 200000)

    // The overall total is capped at 500,000 as per specifications
    const individualTotal =
      rmfMax +
      ssfMax +
      govPensionMax +
      pvdMax +
      nationSavingsMax +
      pensionInsuranceMax

    const overallTotal = Math.min(individualTotal, 500000)

    return {
      rmf: rmfMax,
      ssf: ssfMax,
      govPensionFund: govPensionMax,
      pvd: pvdMax,
      nationSavingsFund: nationSavingsMax,
      pensionInsurance: pensionInsuranceMax,
      total: overallTotal,
    }
  }

  // Function to calculate already used deductions based on fetched data
  const calculateAlreadyUsedDeductions = (taxDeductionData) => {
    if (!taxDeductionData) {
      return {
        rmf: 0,
        ssf: 0,
        govPensionFund: 0,
        pvd: 0,
        nationSavingsFund: 0,
        pensionInsurance: 0,
        total: 0,
      }
    }

    let portion_pensionIns = 0
    if (
      (taxDeductionData.lifeInsurance || 0) +
        (taxDeductionData.healthInsurance || 0) <
      100000
    ) {
      const remaining =
        100000 -
        ((taxDeductionData.lifeInsurance || 0) +
          (taxDeductionData.healthInsurance || 0))
      portion_pensionIns = Math.min(
        remaining,
        taxDeductionData.pensionInsurance || 0
      )
    }

    const used = {
      rmf: taxDeductionData.rmf || 0,
      ssf: taxDeductionData.ssf || 0,
      govPensionFund: taxDeductionData.govPensionFund || 0,
      pvd: taxDeductionData.pvd || 0,
      nationSavingsFund: taxDeductionData.nationSavingsFund || 0,
      pensionInsurance: Math.max(
        (taxDeductionData.pensionInsurance || 0) - portion_pensionIns,
        0
      ),
      total:
        (taxDeductionData.rmf || 0) +
        (taxDeductionData.ssf || 0) +
        (taxDeductionData.govPensionFund || 0) +
        (taxDeductionData.pvd || 0) +
        (taxDeductionData.nationSavingsFund || 0) +
        Math.max(
          (taxDeductionData.pensionInsurance || 0) - portion_pensionIns,
          0
        ),
    }

    return used
  }

  // Function to calculate remaining deductions
  const calculateRemainingDeductions = (max, used) => {
    const remaining = {
      rmf: Math.max(max.rmf - used.rmf, 0),
      ssf: Math.max(max.ssf - used.ssf, 0),
      govPensionFund: Math.max(max.govPensionFund - used.govPensionFund, 0),
      pvd: Math.max(max.pvd - used.pvd, 0),
      nationSavingsFund: Math.max(
        max.nationSavingsFund - used.nationSavingsFund,
        0
      ),
      pensionInsurance: Math.max(
        max.pensionInsurance - used.pensionInsurance,
        0
      ),
      total: Math.min(500000, Math.max(max.total - used.total, 0)),
    }
    return remaining
  }

  // Handle investment input changes with debounce
  const handleInvestmentChange = (e) => {
    const { name, value } = e.target
    const numericValue = Number(value) || 0

    // Ensure the input does not exceed the remaining deductions
    const cappedValue = Math.min(numericValue, remainingDeductions[name])

    setInvestments((prev) => {
      const updated = { ...prev, [name]: cappedValue }
      updated.total =
        (updated.rmf || 0) +
        (updated.ssf || 0) +
        (updated.govPensionFund || 0) +
        (updated.pvd || 0) +
        (updated.nationSavingsFund || 0) +
        (updated.pensionInsurance || 0)
      return updated
    })

    // Debounce the save to avoid excessive localStorage writes
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      saveInvestments(name, cappedValue)
    }, 500) // 500ms delay
  }

  // Clear the debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  // Save investments to localStorage
  const saveInvestments = (fieldName, value) => {
    try {
      // Retrieve existing taxPlan from localStorage
      const taxPlanString = localStorage.getItem("taxPlan")
      let taxPlanData = {}
      if (taxPlanString) {
        try {
          taxPlanData = JSON.parse(taxPlanString)
        } catch (error) {
          console.error("Failed to parse 'taxPlan' from localStorage.")
        }
      }

      // Update the relevant field
      taxPlanData[`invest${capitalizeFirstLetter(fieldName)}`] = value

      // Calculate the total investments
      taxPlanData.total =
        (taxPlanData.investRmf || 0) +
        (taxPlanData.investSsf || 0) +
        (taxPlanData.investGovPensionFund || 0) +
        (taxPlanData.investPvd || 0) +
        (taxPlanData.investNationSavingsFund || 0) +
        (taxPlanData.investPensionInsurance || 0)

      // Save back to localStorage
      localStorage.setItem("taxPlan", JSON.stringify(taxPlanData))

      // Recalculate tax plan based on updated investments
      fetchData()
    } catch (error) {
      console.error("Error in saveInvestments:", error)
    }
  }

  // Function to capitalize the first letter of a string
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  // Calculate new tax after planning when investments or already used deductions change
  useEffect(() => {
    const calculateNewTax = async () => {
      try {
        const totalUsedDeductions = Math.min(
          alreadyUsedDeductions.total + investments.total,
          500000
        )
        const newTaxResult = await fetchAndCalculateTaxPlanForClient(
          clientId,
          totalUsedDeductions
        )
        setNewTaxToPay(newTaxResult.taxToPay || 0)
        setTaxSaved((oldTaxToPay || 0) - (newTaxResult.taxToPay || 0))
      } catch (error) {
        console.error(error)
      }
    }

    calculateNewTax()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investments, alreadyUsedDeductions, totalIncome])

  // Handle navigation back to deductions page
  const handleBack = () => {
    navigate(`/tax-deduction/`)
  }

  // Function to auto-highlight input content on focus
  const handleInputFocus = (e) => {
    e.target.select()
  }

  return (
    <div className="flex flex-col min-h-screen font-ibm">
      <Header />
      <div className="flex flex-1">
        <ClientBluePanel />
        <div className="flex-1 p-8 space-y-8 font-bold">
          {/* Steps Indicator */}
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
              className="flex flex-col items-center focus:outline-none"
            >
              <div className="w-10 h-10 bg-tfpa_gold rounded-full flex items-center justify-center text-white font-bold cursor-pointer">
                3
              </div>
              <span className="font-bold text-tfpa_blue">ผลการคำนวณ</span>
            </button>
          </div>

          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {/* Tax Calculation Results */}
            <h2 className="text-xl font-bold text-tfpa_blue bg-tfpa_gold p-2 rounded">
              ผลการคำนวณภาษี
            </h2>
            <div className="flex flex-col mt-4 mb-4 md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-8">
              {/* Left Side - ภาษีที่ต้องจ่าย */}
              <div className="flex bg-tfpa_gold_pale text-3xl p-4 rounded-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-tfpa_blue font-bold">
                    ภาษีที่ต้องจ่าย:
                  </span>
                  <span className="text-red-500 font-bold">
                    {oldTaxToPay.toLocaleString()}
                  </span>
                  <span className="text-tfpa_blue font-bold">บาท</span>
                </div>
              </div>

              {/* Right Side - รายได้ทั้งปี and รายได้สุทธิ */}
              <div className="flex bg-white p-4 rounded shadow">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-tfpa_blue font-bold">
                      รายได้ทั้งปี:
                    </span>
                    <span className="text-tfpa_gold font-bold">
                      {totalIncome.toLocaleString()}
                    </span>
                    <span className="text-tfpa_blue font-bold">บาท</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-tfpa_blue font-bold">
                      รายได้สุทธิ:
                    </span>
                    <span className="text-tfpa_gold font-bold">
                      {incomeAfterDeductions.toLocaleString()}
                    </span>
                    <span className="text-tfpa_blue font-bold">บาท</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Planning Section */}
            <h2 className="text-xl font-bold mt-4 mb-4 text-tfpa_blue bg-tfpa_gold p-2 rounded">
              วางแผนลดหย่อนภาษีเพิ่มเติม
            </h2>
            <div className="overflow-x-auto mt-4 mb-4">
              <table className="min-w-full border mt-4 mb-4">
                <thead>
                  <tr className="bg-tfpa_blue text-white">
                    <th className="border px-4 py-2">ประเภท</th>
                    <th className="border px-4 py-2">RMF</th>
                    <th className="border px-4 py-2">SSF</th>
                    <th className="border px-4 py-2">กบข.</th>
                    <th className="border px-4 py-2">PVD</th>
                    <th className="border px-4 py-2">กอช</th>
                    <th className="border px-4 py-2">ประกันบำนาญ</th>
                    <th className="border px-4 py-2 bg-tfpa_gold text-white">
                      รวมทั้งสิ้นไม่เกิน
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* สูงสุดตามสิทธิ */}
                  <tr>
                    <td className="border px-4 py-2 text-tfpa_blue">
                      สูงสุดตามสิทธิ*
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {maxDeductions.rmf.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {maxDeductions.ssf.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {maxDeductions.govPensionFund.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {maxDeductions.pvd.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {maxDeductions.nationSavingsFund.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {maxDeductions.pensionInsurance.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 bg-tfpa_gold text-white text-center">
                      500,000
                    </td>
                  </tr>

                  {/* ใช้สิทธิไปแล้ว */}
                  <tr>
                    <td className="border px-4 py-2 text-tfpa_blue">
                      ใช้สิทธิไปแล้ว
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {alreadyUsedDeductions.rmf.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {alreadyUsedDeductions.ssf.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {alreadyUsedDeductions.govPensionFund.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {alreadyUsedDeductions.pvd.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {alreadyUsedDeductions.nationSavingsFund.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {alreadyUsedDeductions.pensionInsurance.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 bg-tfpa_gold text-white text-center">
                      {alreadyUsedDeductions.total.toLocaleString()}
                    </td>
                  </tr>

                  {/* ใช้สิทธิเพิ่มได้อีก */}
                  <tr>
                    <td className="border px-4 py-2 text-tfpa_blue">
                      ใช้สิทธิเพิ่มได้อีก
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {remainingDeductions.rmf.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {remainingDeductions.ssf.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {remainingDeductions.govPensionFund.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {remainingDeductions.pvd.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {remainingDeductions.nationSavingsFund.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {remainingDeductions.pensionInsurance.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 bg-tfpa_gold text-white text-center">
                      {remainingDeductions.total.toLocaleString()}
                    </td>
                  </tr>

                  {/* Separator */}
                  <tr>
                    <td colSpan="8" className="border-t border-dashed"></td>
                  </tr>

                  {/* รวมทั้งสิ้น label above the last column */}
                  <tr>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2 font-bold text-white bg-tfpa_gold text-center">
                      รวมทั้งสิ้น
                    </td>
                  </tr>

                  {/* จำนวนเงินที่จะลงทุน */}
                  <tr>
                    <td className="border px-4 py-2 text-tfpa_gold">
                      จำนวนเงินที่จะลงทุน
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <input
                        type="number"
                        name="rmf"
                        value={investments.rmf}
                        onChange={handleInvestmentChange}
                        max={remainingDeductions.rmf}
                        onFocus={handleInputFocus}
                        className="w-28 px-2 py-1 border rounded"
                        min="0"
                      />
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <input
                        type="number"
                        name="ssf"
                        value={investments.ssf}
                        onChange={handleInvestmentChange}
                        max={remainingDeductions.ssf}
                        onFocus={handleInputFocus}
                        className="w-28 px-2 py-1 border rounded"
                        min="0"
                      />
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <input
                        type="number"
                        name="govPensionFund"
                        value={investments.govPensionFund}
                        onChange={handleInvestmentChange}
                        max={remainingDeductions.govPensionFund}
                        onFocus={handleInputFocus}
                        className="w-28 px-2 py-1 border rounded"
                        min="0"
                      />
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <input
                        type="number"
                        name="pvd"
                        value={investments.pvd}
                        onChange={handleInvestmentChange}
                        max={remainingDeductions.pvd}
                        onFocus={handleInputFocus}
                        className="w-28 px-2 py-1 border rounded"
                        min="0"
                      />
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <input
                        type="number"
                        name="nationSavingsFund"
                        value={investments.nationSavingsFund}
                        onChange={handleInvestmentChange}
                        max={remainingDeductions.nationSavingsFund}
                        onFocus={handleInputFocus}
                        className="w-28 px-2 py-1 border rounded"
                        min="0"
                      />
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <input
                        type="number"
                        name="pensionInsurance"
                        value={investments.pensionInsurance}
                        onChange={handleInvestmentChange}
                        max={remainingDeductions.pensionInsurance}
                        onFocus={handleInputFocus}
                        className="w-28 px-2 py-1 border rounded"
                        min="0"
                      />
                    </td>
                    <td className="border px-4 py-2 bg-tfpa_gold text-white text-center">
                      {investments.total.toLocaleString()}
                    </td>
                  </tr>

                  {/* จำนวนเงินที่ใช้สิทธิทั้งหมด (หลังวางแผน) */}
                  <tr>
                    <td className="border px-4 py-2 text-tfpa_gold">
                      จำนวนเงินที่ใช้สิทธิทั้งหมด (หลังวางแผน)
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {(
                        alreadyUsedDeductions.rmf + investments.rmf
                      ).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {(
                        alreadyUsedDeductions.ssf + investments.ssf
                      ).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {(
                        alreadyUsedDeductions.govPensionFund +
                        investments.govPensionFund
                      ).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {(
                        alreadyUsedDeductions.pvd + investments.pvd
                      ).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {(
                        alreadyUsedDeductions.nationSavingsFund +
                        investments.nationSavingsFund
                      ).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-tfpa_gold text-center">
                      {(
                        alreadyUsedDeductions.pensionInsurance +
                        investments.pensionInsurance
                      ).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 bg-tfpa_gold text-white text-center">
                      {Math.min(
                        alreadyUsedDeductions.total + investments.total,
                        500000
                      ).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary of Tax Changes */}
            <div className="p-4 rounded space-y-2 text-tfpa_blue font-bold border-t border-dashed">
              <div className="flex items-center space-x-2 text-lg">
                <span>ก่อนวางแผนเสียภาษี:</span>
                <span className="text-tfpa_gold">
                  {oldTaxToPay.toLocaleString()} บาท
                </span>
              </div>
              <div className="flex items-center space-x-2 text-lg">
                <span>หลังวางแผนเสียภาษี:</span>
                <span className="text-tfpa_gold">
                  {newTaxToPay.toLocaleString()} บาท
                </span>
              </div>
              <div className="flex items-center space-x-2 text-lg">
                <span>ประหยัดภาษี:</span>
                <span className="text-tfpa_gold">
                  {taxSaved.toLocaleString()} บาท
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end">
              <button
                onClick={handleBack}
                className="bg-tfpa_gold text-white px-4 py-2 rounded font-bold"
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
