import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import CFPCashflowBaseDashboard from "./pages/cfp_cashflow_base_dashboard.jsx"
import CFPGoalBase from "./pages/cfp_goal_base"
import CFPGoalBaseCalculated from "./pages/cfp_goal_base_calculated"
import CFPGoalBaseDashboard from "./pages/cfp_goal_base_dashboard.jsx"
import RetirementGoalPage from "./pages/retirement_goal"
import RetirementGoalCalculated from "./pages/retirement_goal_calculated"
import TaxIncomePage from "./pages/tax_income"
import TaxDeductionPage from "./pages/tax_deduction"
import TaxCalculationPage from "./pages/tax_calculation"
import CFPFinancialHealthCheck from "./pages/cfp_financial_healthcheck"
import CFPClientInfoPage from "./pages/cfp_client_info"
import CFPClientIncomePage from "./pages/cfp_client_income"
import CFPClientExpensePage from "./pages/cfp_client_expense"
import CFPClientAssetPage from "./pages/cfp_client_asset"
import CFPClientDebtPage from "./pages/cfp_client_debt"
import "@fontsource/ibm-plex-sans-thai"

export default function App() {
  return (
    <BrowserRouter basename={"/financial-planner-cfp_client-part/"}>
      <Routes>
        <Route path="/" element={<CFPClientInfoPage />} />
        <Route
          path="/portfolio-selection/"
          element={<PortfolioSelectionCFP />}
        />
        <Route path="/portfolio-chart/" element={<PortfolioCreationCFP />} />
        <Route path="/cashflow-base/" element={<CFPCashflowBase />} />
        <Route
          path="/cashflow-base-calculated/"
          element={<CFPCashflowBaseCalculated />}
        />
        <Route
          path="/cashflow-base-dashboard/"
          element={<CFPCashflowBaseDashboard />}
        />
        <Route path="/goal-base/" element={<CFPGoalBase />} />
        <Route
          path="/goal-base-calculated/"
          element={<CFPGoalBaseCalculated />}
        />
        <Route
          path="/goal-base-dashboard/"
          element={<CFPGoalBaseDashboard />}
        />
        <Route path="/retirement-goal/" element={<RetirementGoalPage />} />
        <Route
          path="/retirement-goal-calculated/"
          element={<RetirementGoalCalculated />}
        />
        <Route path="/tax-income/" element={<TaxIncomePage />} />
        <Route path="/tax-deduction/" element={<TaxDeductionPage />} />
        <Route path="/tax-calculation/" element={<TaxCalculationPage />} />
        <Route
          path="/financial-healthcheck/"
          element={<CFPFinancialHealthCheck />}
        />
        <Route path="/client-info/" element={<CFPClientInfoPage />} />
        <Route path="/client-income/" element={<CFPClientIncomePage />} />
        <Route path="/client-expense/" element={<CFPClientExpensePage />} />
        <Route path="/client-asset/" element={<CFPClientAssetPage />} />
        <Route path="/client-debt/" element={<CFPClientDebtPage />} />
      </Routes>
    </BrowserRouter>
  )
}
