import { useEffect, useState } from "react"
import Header from "../components/header"
import Footer from "../components/footer"
import ClientBluePanel from "../components/clientBluePanel"
import { computeVariables, computeRatios } from "../utils/calculations"
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

function FractionDisplay({ topLabel, bottomLabel }) {
  const format = (v) => (v === 0 ? "-" : v)
  return (
    <div className="flex flex-col items-center text-tfpa_blue">
      <span>{format(topLabel)}</span>
      <div className="border-b border-tfpa_blue w-64"></div>
      <span>{format(bottomLabel)}</span>
    </div>
  )
}

export default function CFPFinancialHealthCheck() {
  const [cfpId] = useState(Number(localStorage.getItem("cfpId")) || "")
  const [clientId] = useState(Number(localStorage.getItem("clientId")) || "")

  const [ratios, setRatios] = useState({
    liquidity: 0,
    basicLiquidity: 0,
    liquidityToNetWorth: 0,
    debtToAsset: 0,
    repayAllDebts: 0,
    repayDebtFromIncome: 0,
    repayNonMortgageDebtFromIncome: 0,
    savingRatio: 0,
    investRatio: 0,
    netWorthRatio: 0,
    survivalRatio: 0,
    wealthRatio: 0,
  })

  const [calculations, setCalculations] = useState({
    totalLiquidAssets: 0,
    monthlyExpense: 0,
    totalShortTermDebt: 0,
    netWorth: 0,
    totalAsset: 0,
    totalDebt: 0,
    totalIncome: 0,
    totalExpense: 0,
    savings: 0,
    totalInvestAsset: 0,
    totalDebtExpense: 0,
    totalNonMortgageDebtExpense: 0,
    totalAssetIncome: 0,
  })

  useEffect(() => {
    fetchDataFromLocalStorage()
  }, [clientId])

  const fetchDataFromLocalStorage = () => {
    // Fetch data from local storage
    const incomes = JSON.parse(localStorage.getItem("clientIncomes")) || []
    const expenses = JSON.parse(localStorage.getItem("clientExpenses")) || []
    const assets = JSON.parse(localStorage.getItem("clientAssets")) || []
    const debts = JSON.parse(localStorage.getItem("clientDebts")) || []

    // Compute variables and ratios
    const vars = computeVariables(incomes, expenses, assets, debts)
    setCalculations(vars)
    const r = computeRatios(vars)
    setRatios(r)
  }

  const getResultColor = (value, standardCheck) => {
    if (value === 0) return "bg-gray-300 text-tfpa_blue"
    const pass = standardCheck(value)
    return pass ? "bg-green-300 text-tfpa_blue" : "bg-red-300 text-tfpa_blue"
  }

  // Standard checks
  const liquidityCheck = (v) => v > 1
  const basicLiquidityCheck = (v) => v >= 3 && v <= 6
  const liquidityToNetWorthCheck = (v) => v / 100 >= 0.15
  const debtToAssetCheck = (v) => v / 100 < 0.5
  const repayAllDebtsCheck = (v) => v / 100 > 0.5
  const repayDebtFromIncomeCheck = (v) => v / 100 < 0.45
  const repayNonMortgageDebtFromIncomeCheck = (v) => v / 100 < 0.2
  const savingRatioCheck = (v) => v / 100 > 0.1
  const investRatioCheck = (v) => v / 100 > 0.5
  const netWorthRatioCheck = (v) => v / 100 > 0.5
  const survivalRatioCheck = (v) => v > 1
  const wealthRatioCheck = (v) => v > 1

  // Rows definition: now we store top/bottom labels for calc and value columns
  const rows = [
    {
      name: "สภาพคล่อง",
      calcTop: "สินทรัพย์สภาพคล่อง",
      calcBottom: "หนี้สินระยะสั้น",
      valTop: calculations.totalLiquidAssets,
      valBottom: calculations.totalShortTermDebt,
      result: ratios.liquidity,
      standard: "> 1 เท่า",
      check: liquidityCheck,
      unit: "เท่า",
    },
    {
      name: "สภาพคล่องพื้นฐาน",
      calcTop: "สินทรัพย์สภาพคล่อง",
      calcBottom: "รายจ่ายต่อเดือน",
      valTop: calculations.totalLiquidAssets,
      valBottom: calculations.monthlyExpense,
      result: ratios.basicLiquidity,
      standard: "= 3 - 6 เดือน",
      check: basicLiquidityCheck,
      unit: "เดือน",
    },
    {
      name: "สภาพคล่องต่อความมั่งคั่งสุทธิ",
      calcTop: "สินทรัพย์สภาพคล่อง",
      calcBottom: "ความมั่งคั่งสุทธิ",
      valTop: calculations.totalLiquidAssets,
      valBottom: calculations.netWorth,
      result: ratios.liquidityToNetWorth * 100,
      standard: "= 15%",
      check: liquidityToNetWorthCheck,
      unit: "%",
    },
    {
      name: "หนี้สินต่อสินทรัพย์",
      calcTop: "หนี้สินรวม",
      calcBottom: "สินทรัพย์รวม",
      valTop: calculations.totalDebt,
      valBottom: calculations.totalAsset,
      result: ratios.debtToAsset * 100,
      standard: "< 50%",
      check: debtToAssetCheck,
      unit: "%",
    },
    {
      name: "การชำระคืนหนี้ทั้งหมด",
      calcTop: "ความมั่งคั่งสุทธิ",
      calcBottom: "สินทรัพย์รวม",
      valTop: calculations.netWorth,
      valBottom: calculations.totalAsset,
      result: ratios.repayAllDebts * 100,
      standard: "> 50%",
      check: repayAllDebtsCheck,
      unit: "%",
    },
    {
      name: "การชำระคืนหนี้จากรายได้",
      calcTop: "เงินชำระคืนหนี้สิน",
      calcBottom: "รายรับรวม",
      valTop: calculations.totalDebtExpense,
      valBottom: calculations.totalIncome,
      result: ratios.repayDebtFromIncome * 100,
      standard: "< 35 - 45%",
      check: repayDebtFromIncomeCheck,
      unit: "%",
    },
    {
      name: "การชำระคืนหนี้ที่ไม่รวมภาระจดจำนองจากรายได้",
      calcTop: "เงินชำระคืนหนี้ไม่รวมจดจำนอง",
      calcBottom: "รายรับรวม",
      valTop: calculations.totalNonMortgageDebtExpense,
      valBottom: calculations.totalIncome,
      result: ratios.repayNonMortgageDebtFromIncome * 100,
      standard: "< 15 - 20%",
      check: repayNonMortgageDebtFromIncomeCheck,
      unit: "%",
    },
    {
      name: "การออม",
      calcTop: "เงินออม",
      calcBottom: "รายรับรวม",
      valTop: calculations.savings,
      valBottom: calculations.totalIncome,
      result: ratios.savingRatio * 100,
      standard: "> 10%",
      check: savingRatioCheck,
      unit: "%",
    },
    {
      name: "การลงทุน",
      calcTop: "สินทรัพย์ลงทุน",
      calcBottom: "ความมั่งคั่งสุทธิ",
      valTop: calculations.totalInvestAsset,
      valBottom: calculations.netWorth,
      result: ratios.investRatio * 100,
      standard: "> 50%",
      check: investRatioCheck,
      unit: "%",
    },
    {
      name: "ความมั่งคั่ง",
      calcTop: "ความมั่งคั่งสุทธิ",
      calcBottom: "สินทรัพย์รวม",
      valTop: calculations.netWorth,
      valBottom: calculations.totalAsset,
      result: ratios.netWorthRatio * 100,
      standard: "> 50%",
      check: netWorthRatioCheck,
      unit: "%",
    },
    {
      name: "อัตราส่วนความอยู่รอด(Survival Ratio)",
      calcTop: "รายได้จากทำงาน+รายได้จากสินทรัพย์",
      calcBottom: "รายจ่าย",
      valTop: calculations.totalIncome,
      valBottom: calculations.totalExpense,
      result: ratios.survivalRatio,
      standard: "> 1",
      check: survivalRatioCheck,
      unit: "",
    },
    {
      name: "อัตราส่วนความมั่งคั่ง(Wealth Ratio)",
      calcTop: "รายได้จากสินทรัพย",
      calcBottom: "รายจ่าย",
      valTop: calculations.totalAssetIncome,
      valBottom: calculations.totalExpense,
      result: ratios.wealthRatio,
      standard: "> 1",
      check: wealthRatioCheck,
      unit: "",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen font-ibm">
      <Header />
      <div className="flex flex-1">
        <ClientBluePanel />
        <div className="flex-1 p-8 space-y-8">
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <table
              className="min-w-full border-collapse font-bold"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr className="text-tfpa_blue font-bold text-2xl">
                  <th className="border-dotted border-b border-gray-300 p-2">
                    อัตราส่วน
                  </th>
                  <th className="border-dotted border-b border-gray-300 p-2">
                    วิธีการคำนวณ
                  </th>
                  <th className="border-dotted border-b border-gray-300 p-2">
                    การคำนวณ
                  </th>
                  <th className="border-dotted border-b border-gray-300 p-2">
                    ผลลัพธ์
                  </th>
                  <th className="border-dotted border-b border-gray-300 p-2 text-tfpa_gold">
                    มาตรฐาน
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const colorClass = getResultColor(r.result, r.check)
                  return (
                    <tr key={i} className="text-tfpa_blue">
                      <td className="border-dotted border-b border-gray-300 p-2">
                        {r.name}
                      </td>
                      <td className="border-dotted border-b border-gray-300 p-2">
                        <FractionDisplay
                          topLabel={r.calcTop}
                          bottomLabel={r.calcBottom}
                        />
                      </td>
                      <td className="border-dotted border-b border-gray-300 p-2">
                        <FractionDisplay
                          topLabel={
                            r.valTop === 0 ? 0 : r.valTop.toLocaleString()
                          }
                          bottomLabel={
                            r.valBottom === 0 ? 0 : r.valBottom.toLocaleString()
                          }
                        />
                      </td>
                      <td
                        className={`border-dotted border-b border-gray-300 p-2 ${colorClass}`}
                      >
                        {r.result.toFixed(2)} {r.unit}
                      </td>
                      <td className="border-dotted border-b border-gray-300 p-2 text-tfpa_gold">
                        {r.standard}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
