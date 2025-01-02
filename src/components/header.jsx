import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../assets/TFPA_logo.png"

/**
 * A single-user version that does NOT fetch from a backend,
 * but uses predefined sample data & localStorage.
 */
export default function Header() {
  // Sample data for this single-user scenario
  const SAMPLE_CFP_FIRSTNAME = "เคน" // e.g. "Sam"

  const navigate = useNavigate()

  // Ensure localStorage has cfpId & cfpFirstName
  useEffect(() => {
    if (localStorage.getItem("cfpFirstName") != SAMPLE_CFP_FIRSTNAME) {
      localStorage.setItem("cfpFirstName", SAMPLE_CFP_FIRSTNAME)
    }
  }, [])

  // Read them from localStorage
  const [cfpFirstName, setCfpFirstName] = useState(
    localStorage.getItem("cfpFirstName") || SAMPLE_CFP_FIRSTNAME
  )

  // This dropdownOpen controls the small dropdown next to the CFP button
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev)
  }

  const handleHomePage = () => {}

  const handleLogout = () => {}

  return (
    <header className="flex items-center justify-between p-4 bg-white drop-shadow-md z-10">
      {/* Left side: TFPA Logo */}
      <div
        className="w-[306.67px] h-[65px] bg-no-repeat bg-contain"
        style={{ backgroundImage: `url(${logo})` }}
      />

      {/* Right side: CFP button & dropdown */}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="bg-tfpa_blue hover:bg-tfpa_blue_hover text-white px-6 py-2 rounded font-ibm"
        >
          {cfpFirstName ? `CFP ${cfpFirstName}` : "CFP"}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 bg-white shadow-md mt-2 rounded">
            <button
              onClick={handleHomePage}
              className="block text-sm px-4 py-2 text-left w-full hover:bg-gray-200 font-ibm"
            >
              หน้าแรก
            </button>
            <button
              onClick={handleLogout}
              className="block text-sm px-4 py-2 text-left w-full hover:bg-gray-200 font-ibm"
            >
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
