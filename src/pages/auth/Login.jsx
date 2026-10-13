import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext"

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const { login } = useContext(AuthContext);
 
    const handleSubmit = async (e) =>{
        e.preventDefault();
        setError(null);
        setLoading(true);

        try{
            const response = await api.post("/login", {
                email,
                password,
                device_name: 'react_app'
            })
            const { token, user } = response.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user))
            login(user)
            navigate("/create");
        }catch (err) {
            console.error("Erro no login: ", err);
            if(err.response?.status === 422){
                const errors = err.response.data?.errors;
                if (errors?.email) {
                    setError(errors.email[0]);
                }else {
                    setError("Verifique os dados informados.");
                }
            }else if(err.response?.status === 429){
                setError("Muitas tentativas de Login.")
            }else{
                setError("Ocorreu um erro inesperado ao logar.")
            }
        }finally{
            setLoading(false);
        }
    }

    return(
    <>

        <form onSubmit={handleSubmit} method="post">
            <input type="email" placeholder="E-mail" onChange={(e) => setEmail(e.target.value)}/>
            <input type="password" placeholder="Senha" onChange={(e) => setPassword(e.target.value)}/>
            <button type="submit">
                {loading ? "Entrando..." : "Entrar"}
            </button>
        </form>
    </>
    )
}

export default Login;