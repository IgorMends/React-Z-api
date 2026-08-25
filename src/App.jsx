import { Outlet } from "react-router-dom";

import LateralBar from "./components/LateralBar";

function App(){
  return(
    <div>
      <LateralBar/>

      <main className="ml-64 min-h-screen flex justify-center p-8">
        <Outlet/>
      </main>
    </div>
  )
}

export default App;