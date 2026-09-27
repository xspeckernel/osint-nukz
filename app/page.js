"use client";

import { useState } from "react";

function StatusBadge({ ok, label, unknown }) {
  const color = unknown
    ? "bg-gray-600 text-gray-100"
    : ok
    ? "bg-nukz-accent/20 text-nukz-accent border border-nukz-accent/40"
    : "bg-red-500/10 text-red-400 border border-red-500/30";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${color}`}>
      {label}
    </span>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-nukz-panel border border-white/5 rounded-xl p-5">
      <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3 font-mono">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function Page() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedBreach, setSelectedBreach] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSelectedBreach(null);
    if (!email || !email.includes("@")) {
      setError("Digite um e-mail válido.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/lookup?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na consulta.");
      setResult(data);
    } catch (err) {
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="scanline min-h-screen px-4 py-10 md:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-mono font-bold text-nukz-accent tracking-tight">
            OSINT_NUKZ
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Consulta de e-mail em fontes públicas — validade, vazamentos
            conhecidos e presença pública.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-3 mb-8"
        >
          <input
            type="email"
            placeholder="alguem@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-nukz-panel border border-white/10 rounded-lg px-4 py-3 font-mono text-sm outline-none focus:border-nukz-accent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-nukz-accent text-black font-mono font-semibold px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Consultando..." : "Consultar"}
          </button>
        </form>

        {error && (
          <div className="mb-8 text-red-400 font-mono text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {result && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Validade">
              <div className="flex flex-wrap gap-2">
                <StatusBadge ok={result.validity.formatValid} label="Formato" />
                <StatusBadge ok={result.validity.hasMx} label="Domínio ativo (MX)" />
                <StatusBadge
                  ok={!result.validity.disposable}
                  label={result.validity.disposable ? "Descartável" : "Não descartável"}
                />
              </div>
            </Card>

            <Card title="Gravatar">
              {result.gravatar.found ? (
                <div className="flex items-center gap-3">
                  <img
                    src={result.gravatar.avatarUrl}
                    alt="avatar"
                    className="w-12 h-12 rounded-full border border-white/10"
                  />
                  <span className="text-sm text-gray-300">
                    Perfil público encontrado
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum perfil encontrado.</p>
              )}
            </Card>

            <Card title="Vazamentos de dados">
              {result.breaches.unavailable ? (
                <p className="text-sm text-yellow-400">
                  Não foi possível consultar agora (serviço indisponível). Tente
                  de novo em instantes.
                </p>
              ) : result.breaches.count > 0 ? (
                <div>
                  <p className="text-sm text-gray-300 mb-2">
                    Encontrado em{" "}
                    <span className="text-red-400 font-semibold">
                      {result.breaches.count}
                    </span>{" "}
                    vazamento(s) conhecido(s). Clique para ver detalhes:
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {result.breaches.breaches.map((b) => (
                      <li key={b.name}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedBreach(
                              selectedBreach?.name === b.name ? null : b
                            )
                          }
                          className={`text-xs font-mono rounded-full px-3 py-1 border transition ${
                            selectedBreach?.name === b.name
                              ? "bg-red-500/30 text-red-200 border-red-400"
                              : "bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500/20"
                          }`}
                        >
                          {b.name}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {selectedBreach && (
                    <div className="mt-4 bg-black/30 border border-red-500/20 rounded-lg p-4 text-sm">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-400 text-xs mb-2 font-mono">
                        {selectedBreach.xposedDate && (
                          <span>Ano: {selectedBreach.xposedDate}</span>
                        )}
                        {selectedBreach.domain && (
                          <span>Domínio: {selectedBreach.domain}</span>
                        )}
                        {typeof selectedBreach.xposedRecords === "number" && (
                          <span>
                            Registros: {selectedBreach.xposedRecords.toLocaleString("pt-BR")}
                          </span>
                        )}
                        {selectedBreach.passwordRisk && (
                          <span>Risco de senha: {selectedBreach.passwordRisk}</span>
                        )}
                      </div>
                      {selectedBreach.xposedData && (
                        <p className="text-gray-400 text-xs mb-2">
                          Dados expostos: {selectedBreach.xposedData}
                        </p>
                      )}
                      {selectedBreach.description && (
                        <p className="text-gray-300">{selectedBreach.description}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-nukz-accent">
                  Nenhum vazamento conhecido encontrado.
                </p>
              )}
              <p className="text-[11px] text-gray-600 mt-3">
                Fonte: XposedOrNot (base pública de vazamentos conhecidos).
              </p>
            </Card>

            <Card title="Presença pública (GitHub)">
              {result.github.found ? (
                
                  href={result.github.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-nukz-accent2 underline text-sm"
                >
                  {result.github.login}
                </a>
              ) : (
                <p className="text-sm text-gray-500">
                  Nenhuma conta pública do GitHub associada a este e-mail.
                </p>
              )}
            </Card>
          </div>
        )}

        <footer className="mt-14 text-center text-[11px] text-gray-600 leading-relaxed">
          Ferramenta educacional de OSINT. Consulta apenas fontes públicas.
          Não armazenamos os e-mails consultados. Use com responsabilidade e
          dentro da lei (LGPD) — não utilize para assediar, vigiar ou expor
          terceiros sem consentimento.
        </footer>
      </div>
    </main>
  );
}
