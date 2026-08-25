function MenuButton(props){
    return(
        <button
            onClick={props.onClick}
            className="flex h-10 w-full items-center pl-5 bg-slate-900 text-white shadow-lg tracking-[0.005em] transition-all duration-200 hover:scale-105 hover:font-medium hover:tracking-[0.25em]  hover:bg-slate-800 font-outfit font-bold
            hover:cursor-pointer">
                {props.name}
        </button>
    )
}

export default MenuButton