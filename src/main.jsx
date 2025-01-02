import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={"/financial-planner-cfp_client-part/"}>
      <App />
    </BrowserRouter>
  </StrictMode>
)
