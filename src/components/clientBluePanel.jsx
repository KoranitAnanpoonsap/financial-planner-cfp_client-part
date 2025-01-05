import { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"

import personIcon from "../assets/person.png"
import personListIcon from "../assets/personlist.png"
import newIcon from "../assets/new.png"
import loadingIcon from "../assets/loading.png"
import checkIcon from "../assets/check.png"

/**
 * A single-user version that does NOT fetch from a backend.
 * Instead, we store a sample cfpId/clientId in local storage
 * and read them. Then we also store the client's name & format ID in local storage.
 */
export default function ClientBluePanel() {
  // Instead of pulling from a real backend, define sample data:
  const SAMPLE_CFP_ID = 1
  const SAMPLE_CLIENT_ID = 1
  const SAMPLE_CLIENT_NAME = "กันตพงศ์ ตันจาตุรนต"
  const SAMPLE_CLIENT_FORMAT_ID = "C0001"

  // Make sure we have them in localStorage if not set:
  useEffect(() => {
    // If not in local storage yet, set them:
    if (localStorage.getItem("cfpId") != SAMPLE_CFP_ID.toString()) {
      localStorage.setItem("cfpId", SAMPLE_CFP_ID.toString())
    }
    if (localStorage.getItem("clientId") != SAMPLE_CLIENT_ID.toString()) {
      localStorage.setItem("clientId", SAMPLE_CLIENT_ID.toString())
    }
    if (localStorage.getItem("clientFullName") != SAMPLE_CLIENT_NAME) {
      localStorage.setItem("clientFullName", SAMPLE_CLIENT_NAME)
    }
    if (localStorage.getItem("clientFormatId") != SAMPLE_CLIENT_FORMAT_ID) {
      localStorage.setItem("clientFormatId", SAMPLE_CLIENT_FORMAT_ID)
    }
  }, [])

  // Now read them back from localStorage
  const [cfpId] = useState(
    Number(localStorage.getItem("cfpId") || SAMPLE_CFP_ID)
  )
  const [clientId] = useState(
    Number(localStorage.getItem("clientId") || SAMPLE_CLIENT_ID)
  )
  const [clientFullName, setClientFullName] = useState(
    localStorage.getItem("clientFullName") || SAMPLE_CLIENT_NAME
  )
  const [clientFormatId, setClientFormatId] = useState(
    localStorage.getItem("clientFormatId") || SAMPLE_CLIENT_FORMAT_ID
  )

  // Use React Router as usual
  const navigate = useNavigate()
  const location = useLocation()

  // This array is unchanged: the items in the left panel
  const menuItems = [
    {
      label: "ข้อมูลลูกค้า",
      icon: personListIcon,
      routes: [
        `/client-info/`,
        `/client-income/`,
        `/client-expense/`,
        `/client-asset/`,
        `/client-debt/`,
      ],
    },
    {
      label: "พอร์ตการลงทุน",
      icon: newIcon,
      routes: [`/portfolio-selection/`, `/portfolio-chart/`],
    },
    {
      label: "การวางแผนเป้าหมายเดียว",
      icon: loadingIcon,
      routes: [
        `/goal-base/`,
        `/goal-base-calculated/`,
        `/retirement-goal/`,
        `/retirement-goal-calculated/`,
      ],
    },
    {
      label: "การวางแผนหลายเป้าหมาย",
      icon: checkIcon,
      routes: [`/cashflow-base/`, `/cashflow-base-calculated/`],
    },
    {
      label: "ตรวจสุขภาพทางการเงิน",
      icon: checkIcon,
      routes: [`/financial-healthcheck/`],
      disabled: true,
    },
    {
      label: "การคำนวณภาษี",
      icon: checkIcon,
      routes: [`/tax-income/`, `/tax-deduction/`, `/tax-calculation/`],
      disabled: true,
    },
  ]

  // Figure out which route is active
  const currentPath = location.pathname

  return (
    <div className="bg-tfpa_blue w-60 p-1 flex flex-col text-white">
      {/* Show the client info at the top */}
      <div className="mb-3 mt-3 bg-tfpa_gold rounded-3xl p-2 flex items-center space-x-2">
        <img src={personIcon} alt="Person Icon" className="w-12 h-12" />
        <div className="flex flex-col">
          <div className="text-white text-sm mb-1 font-ibm font-bold">
            {clientFullName}
          </div>
          <div className="text-tfpa_blue text-sm font-ibm font-bold">
            {clientFormatId}
          </div>
        </div>
      </div>

      {/* The list of left-menu items */}
      <div className="flex flex-col space-y-2">
        {menuItems.map((item) => {
          // isActive = does the current path start with any item.routes?
          const isActive = item.routes.some((route) =>
            currentPath.startsWith(route)
          )
          return (
            <button
              key={item.label}
              onClick={() => !item.disabled && navigate(item.routes[0])}
              className={`flex items-center space-x-2 px-2 py-2 rounded-2xl ${
                isActive
                  ? "bg-tfpa_blue_panel_select"
                  : "bg-tfpa_blue hover:bg-tfpa_blue_panel_select"
              } transition-colors duration-200 text-left`}
            >
              <img src={item.icon} alt={item.label} className="w-5 h-5" />
              <span className="text-sm font-medium font-ibm">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
