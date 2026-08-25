import { useNavigate } from "react-router-dom";
import MenuButton from "./MenuButton";

function LateralBar() {
  const navigate = useNavigate()

  return (
    <aside className="fixed flex-col left-0 top-0 h-screen w-64 bg-slate-800 text-white">
      <h1 className="p-4 pb-30 text-3xl font-bold font-sora tracking-[-0.055em]">Menu</h1>

      <div className="pb-5">
        <h2 className="p-4 pb-1 text-1xl font-extrabold font-satoshi tracking-[0.255em]">ACTIONS</h2>
        <MenuButton name={"Instance"} onClick={() => navigate('/Instance')}/>
        <MenuButton name={"Message"} onClick={() => navigate('/Message')}/>
        <MenuButton name={"Chat"} onClick={() => navigate('/Chat')}/>
      </div>

      <div className="pb-5">
        <h2 className="p-4 pb-1 text-1xl font-extrabold font-satoshi tracking-[0.255em] ">CONNECTIONS</h2>
        <MenuButton name={"API Keys"} onClick={() => navigate('/Connect')}/>
      </div>

    </aside>
  );
}

export default LateralBar;