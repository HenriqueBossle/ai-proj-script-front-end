import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { register } = useContext(AuthContext);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        if (password !== passwordConfirmation) {
            setError("As senhas não conferem.");
            return;
        }

        setLoading(true);

        try {
            await register({ name, email, password, password_confirmation: passwordConfirmation });
            navigate("/create");
        } catch (err) {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 422 && data?.errors) {
                setError(Object.values(data.errors).flat().join(" "));
            } else if (status === 401) {
                setError("A API recusou a autenticação. Confira os dados e tente novamente.");
            } else if (status === 419) {
                setError("A API retornou erro 419. Verifique a configuração do servidor.");
            } else if (status === 429) {
                setError("Muitas tentativas. Aguarde um momento e tente novamente.");
            } else if (status >= 500) {
                setError("A API encontrou um erro interno. Tente novamente mais tarde.");
            } else if (!err.response) {
                setError("Não foi possível conectar à API. Verifique a URL, a rede e a configuração de CORS.");
            } else {
                setError(data?.message || "Não foi possível criar sua conta. Verifique os dados e tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="panel auth-panel">
            <span className="eyebrow">Comece sua jornada</span>
            <h1>Criar conta</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Nome</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                />

                <label htmlFor="email">E-mail</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

                <label htmlFor="password">Senha</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Senha"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />

                <label htmlFor="password_confirmation">Confirme a senha</label>
                <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    placeholder="Confirme sua senha"
                    autoComplete="new-password"
                    value={passwordConfirmation}
                    onChange={(event) => setPasswordConfirmation(event.target.value)}
                    required
                />

                {error && <p className="form-error" role="alert">{error}</p>}

                <button type="submit" disabled={loading} className="primary-button">
                    {loading ? "Criando a conta..." : "Criar conta"}
                </button>
            </form>
        </main>
    );
}

export default Register;
