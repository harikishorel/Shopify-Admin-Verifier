import Navbar from "./Layouts/navbar";

export default function Layout({children}){
    return(
        <div className="bg-blue-900">
      <Navbar/>
      <div >{children}</div>
    </div>
    )
}