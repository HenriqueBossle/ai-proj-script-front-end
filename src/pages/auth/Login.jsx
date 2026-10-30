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
            if(err.response?.status === 422){
                const errors = err.response.data?.errors;
                if (errors?.email) {
                    setError(errors.email[0]);
                }else {
                    setError("Verifique os dados informados.");
                }
            }else if(err.response?.status === 419){
                setError("A proteção CSRF recusou o login. Confira a configuração do Sanctum e do domínio do frontend na API.");
            }else if(err.response?.status === 429){
                setError("Muitas tentativas de Login.")
            }else if(err.response?.status >= 500){
                setError("A API encontrou um erro ao preparar o login. Confira a configuração do Sanctum, CORS e arquivo .env no backend.");
            }else{
                setError("Ocorreu um erro inesperado ao logar.")
            }
        }finally{
            setLoading(false);
        }
    }

    return(
    <>

        <form onSubmit={handleSubmit} method="post" className="panel auth-panel">
            <span className="eyebrow">Bem-vindo de volta</span>
            <h1>Entrar na sua conta</h1>
            <label htmlFor="login-email">E-mail</label>
            <input
                id="login-email"
                type="email"
                placeholder="E-mail"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <label htmlFor="login-password">Senha</label>
            <input
                id="login-password"
                type="password"
                placeholder="Senha"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" disabled={loading} className="primary-button">
                {loading ? "Entrando..." : "Entrar"}
            </button>
        </form>
    </>
    )
}

export default Login;
