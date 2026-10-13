import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
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
            await login({ email, password });
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
            <input
                type="email"
                placeholder="E-mail"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Senha"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            {error && <p role="alert">{error}</p>}
            <button type="submit" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
            </button>
        </form>
    </>
    )
}

export default Login;