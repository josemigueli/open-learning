import { BrowserRouter, Link, Route, Routes, useParams, useSearchParams } from "react-router-dom";

const BOT_USERNAME = "@openlearning_cubepath_bot";

const COURSES = [
  {
    id: "english-for-devs",
    title: "Inglés para Desarrolladores de Software",
    description:
      "Curso de inglés técnico orientado a programadores para mejorar vocabulario y comprensión lectora.",
    level: "Principiante",
    tags: ["Inglés", "Programación", "Soft Skills"],
    modules: 3,
    lessons: 10,
    icon: "🇬🇧",
  },
  {
    id: "docker-basics",
    title: "Fundamentos de Docker",
    description:
      "Aprende los conceptos básicos de contenedores y cómo usar Docker para empaquetar tus aplicaciones.",
    level: "Principiante",
    tags: ["Docker", "DevOps", "Contenedores"],
    modules: 1,
    lessons: 1,
    icon: "🐳",
  },
];

function CatalogPage() {
  return (
    <div className="min-h-screen bg-[#0d0f14] text-slate-50 selection:bg-purple-500/30 font-sans">
      <header className="absolute top-0 z-10 w-full border-b border-white/10 bg-transparent">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-8 w-8 text-white"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h1 className="text-xl font-bold text-white tracking-tight">OpenLearning</h1>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
            <a href="#cursos" className="hover:text-white transition-colors">
              Cursos
            </a>
            <a
              href="https://github.com/midudev/hackaton-cubepath-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Hackathon
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/josemigueli/open-learning"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-32">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-96 bg-purple-700/40 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
            {/* Badge */}
            <div className="mx-auto mb-8 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md">
              <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs font-semibold text-white">
                Versión 1.0
              </span>
              <span className="text-sm font-medium text-slate-300">
                ¡Disponible ahora! <span aria-hidden="true">&rarr;</span>
              </span>
            </div>

            <h2 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-[5rem] leading-[1.1]">
              Aprende con Inteligencia Artificial Directamente en
              <br className="hidden md:block" />
              <span className="text-purple-400">Telegram</span>
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 md:text-xl leading-relaxed">
              Una plataforma educativa de código abierto donde puedes tomar cursos interactivos
              impulsados por IA, sin salir de tu app de mensajería favorita.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#cursos"
                className="rounded-full bg-white px-8 py-3.5 text-base font-semibold text-purple-900 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-105 hover:bg-slate-100 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
              >
                Empezar a aprender
              </a>
              <a
                href={`https://t.me/${BOT_USERNAME.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 rounded-full border border-white/20 bg-[#171923] px-6 py-3.5 text-base font-mono text-slate-300 transition-all hover:bg-white/10"
              >
                <span className="text-purple-400 font-bold">&gt;</span>
                iniciar {BOT_USERNAME}
                <svg
                  className="h-4 w-4 ml-2 opacity-50 transition-opacity group-hover:opacity-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none"></div>
          <div className="relative mx-auto max-w-5xl px-4 text-center">
            <p className="mb-8 text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Tecnologías y herramientas clave
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 transition-all hover:grayscale-0 grayscale">
              <span className="text-2xl font-bold tracking-tighter">TypeScript</span>
              <span className="text-2xl font-bold">Node.js</span>
              <span className="text-2xl font-bold tracking-tight">Docker</span>
              <span className="text-2xl font-black italic">React</span>
              <span className="text-2xl font-bold">Drizzle ORM</span>
            </div>
          </div>
        </section>

        <section id="cursos" className="relative py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-16 text-center">
              <h3 className="mb-4 text-4xl font-bold text-white">Catálogo de Cursos</h3>
              <p className="mx-auto max-w-2xl text-lg text-slate-400">
                Aprende haciendo. Cursos interactivos diseñados para mejorar tus habilidades
                técnicas con la ayuda de tutores virtuales de IA.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {COURSES.map((course) => (
                <div
                  key={course.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-purple-500/30 hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(168,85,247,0.1)]"
                >
                  <div className="flex h-48 items-center justify-center border-b border-white/10 bg-linear-to-br from-purple-900/20 to-blue-900/20 text-7xl transition-transform group-hover:scale-105">
                    {course.icon}
                  </div>
                  <div className="flex flex-1 flex-col p-8">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                        {course.level}
                      </span>
                      <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                        {course.modules} Módulos
                      </span>
                      <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                        {course.lessons} {course.lessons === 1 ? "Lección" : "Lecciones"}
                      </span>
                    </div>
                    <h4 className="mb-3 text-2xl font-bold text-white">{course.title}</h4>
                    <p className="mb-8 flex-1 text-slate-400 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="mb-8 flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <a
                      href={`https://t.me/${BOT_USERNAME.replace("@", "")}?start=${course.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-xl bg-purple-600 px-4 py-3 text-center font-medium text-white transition-all hover:bg-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    >
                      Empezar curso gratis
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#0a0c10] py-12 text-center text-slate-400">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-6 flex items-center justify-center gap-2 text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="font-bold tracking-tight">OpenLearning</span>
          </div>
          <p className="mb-6 text-sm">
            Proyecto creado con ♥️ para la <strong>Hackatón CubePath 2026</strong> de midudev.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <a
              href="https://github.com/josemigueli/open-learning"
              className="transition-colors hover:text-white"
            >
              Código Fuente
            </a>
            <span>•</span>
            <a href="https://cubepath.com/" className="transition-colors hover:text-white">
              Alojado en CubePath
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CertificatePage() {
  const { certId } = useParams();
  const [searchParams] = useSearchParams();

  const studentName = searchParams.get("name") ?? "Estudiante";
  const courseName = searchParams.get("course") ?? "Curso en OpenLearning";
  const issuedAtRaw = searchParams.get("issuedAt");

  const issuedDate = issuedAtRaw
    ? new Date(issuedAtRaw).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  return (
    <div className="min-h-screen bg-[#0d0f14] px-4 py-10 flex items-center justify-center font-sans selection:bg-purple-500/30">
      <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_8px_30px_rgba(168,85,247,0.1)] backdrop-blur-sm md:p-12">
        {/* Glow effect */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 mb-8 text-center">
          <p className="mb-4 text-sm font-semibold tracking-[0.3em] text-purple-400 uppercase">
            OpenLearning Certificate
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
            Certificado de Finalización
          </h1>
          <p className="mt-4 text-slate-400">Este documento certifica que</p>
        </div>

        <div className="relative z-10 mb-8 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">{studentName}</h2>
          <p className="mt-3 text-lg text-slate-400">ha completado satisfactoriamente el curso</p>
          <h3 className="mt-2 text-2xl font-semibold text-purple-300 md:text-3xl">{courseName}</h3>
        </div>

        <div className="relative z-10 mt-10 grid gap-4 rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400 md:grid-cols-3">
          <div>
            <p className="font-semibold text-slate-200">ID de certificado</p>
            <p className="font-mono mt-1 text-slate-300">{certId ?? "N/A"}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-200">Fecha de emisión</p>
            <p className="mt-1 text-slate-300">{issuedDate}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-200">Verificado por</p>
            <p className="mt-1 text-slate-300">{BOT_USERNAME}</p>
          </div>
        </div>

        <div className="relative z-10 mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="rounded-full border border-white/20 bg-transparent px-6 py-2.5 font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            Ver catálogo
          </Link>
          <a
            href={`https://t.me/${BOT_USERNAME.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-purple-600 px-6 py-2.5 font-medium text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-colors hover:bg-purple-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
          >
            Ir al bot
          </a>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/cert/:certId" element={<CertificatePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
