import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import App from "../App";
import Login from "../pages/auth/Login";
import ScriptCreate from "../pages/ScriptCreate";
import ShowAllScripts from "../pages/ShowAllScripts";
import ScriptShow from "../pages/ScriptShow";
import ScriptEdit from "../pages/ScriptEdit";
import Register from "../pages/auth/Register";
import Home from "../pages/Home";

function AppRoutes(){
    return(
        <Routes>
            {/* Rotas livres */}
            <Route path="/" element={<Home />} />
            <Route path='login' element={<Login/>}></Route>
            <Route path='register' element={<Register/>}></Route>

            {/* Rotas protegidas */}
            <Route path='create' element={
                <ProtectedRoute>
                    <ScriptCreate/>
                </ProtectedRoute>
            }></Route>
            <Route path='showAll' element={
                <ProtectedRoute>
                    <ShowAllScripts/>
                </ProtectedRoute>
            }></Route>
            <Route path='show/:scriptId' element={
                <ProtectedRoute>
                    <ScriptShow/>
                </ProtectedRoute>
            }></Route>
            <Route path='edit/:scriptId' element={
                <ProtectedRoute>
                    <ScriptEdit/>
                </ProtectedRoute>
            }></Route>
            
        </Routes>
    );
}

export default AppRoutes;