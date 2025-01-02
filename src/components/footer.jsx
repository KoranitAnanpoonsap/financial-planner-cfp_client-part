import React from "react"
import logo from "../assets/TFPA_logo.png"
import facebook from "../assets/facebook.png"
import line from "../assets/line.png"
import youtube from "../assets/youtube.png"

export default function Footer() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Black line at the top of the footer */}
      <div className="h-[0.5px] bg-gray-400"></div>

      <footer className="bg-white p-4 flex justify-between items-center">
        {/* Left Section with Logo and Address */}
        <div className="flex flex-col items-start">
          <img src={logo} alt="TFPA Logo" className="h-14 mb-1" />
          <div className="text-left">
            <p className="text-tfpa_blue text-sm font-ibm">
              สมาคมนักวางแผนการเงินไทยชั้น 6 อาคารตลาดหลักทรัพย์แห่งประเทศไทย
              <br />
              93 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดงกรุงเทพมหานคร 10400
            </p>
          </div>
        </div>

        {/* Right Section with Contact Info */}
        <div className="text-right flex flex-col items-end">
          <p className="text-tfpa_blue text-sm font-ibm">
            โทรศัพท์: 0 2009 9393
            <br />
            Website:{" "}
            <a href="https://www.tfpa.or.th" className="text-tfpa_blue">
              www.tfpa.or.th
            </a>
            <br />
            ติดตามข่าวสารของสมาคม
          </p>
          {/* Social Media Icons */}
          <div className="flex justify-end mt-1">
            <a
              href="https://www.facebook.com/ThaiFinancialPlanners/?locale=th_TH"
              className="mx-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={facebook} alt="Facebook" className="h-5" />
            </a>
            <a
              href="https://page.line.me/jqw3863u"
              className="mx-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={line} alt="Line" className="h-5" />
            </a>
            <a
              href="https://www.youtube.com/channel/UC6rMod3YUUYv-yGnkIg5GEw"
              className="mx-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={youtube} alt="YouTube" className="h-5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Light gray line between footer content and copyright */}
      <div className="h-[0.2px] bg-gray-300 w-full"></div>

      <div className="w-full text-center mt-2">
        <p className="text-gray-400 text-xs font-ibm">
          Copyright © 2024 Thai Financial Planners Association
        </p>
      </div>
    </div>
  )
}
