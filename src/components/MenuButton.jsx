function MenuButton(props){
    return(
        <button
            className="flex h-12 w-full items-center pl-5 bg-slate-900 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-slate-800">
                {props.name}
        </button>
    )
}

export default MenuButton