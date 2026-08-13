import MenuButton from "./MenuButton";

function LateralBar() {
  return (
    <aside className="fixed flex-col left-0 top-0 h-screen w-64 bg-slate-800 text-white">
      <h1 className="p-4 pb-30 text-3xl font-bold font-sora">Menu</h1>

      <MenuButton name={"Instance"}/>
    </aside>
  );
}

export default LateralBar;