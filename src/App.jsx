import { Outlet } from "react-router-dom";

import LateralBar from "./components/LateralBar";

function App(){
  return(
    <div>
      <LateralBar/>

      <main>
        <Outlet/>
      </main>
    </div>
  )
}

export default App;