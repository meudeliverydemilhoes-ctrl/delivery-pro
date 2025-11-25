import Dashboard from './pages/Dashboard';
import Mentorados from './pages/Mentorados';
import MentoradoDetalhe from './pages/MentoradoDetalhe';
import Cursos from './pages/Cursos';
import Biblioteca from './pages/Biblioteca';
import Agenda from './pages/Agenda';
import Notas from './pages/Notas';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Mentorados": Mentorados,
    "MentoradoDetalhe": MentoradoDetalhe,
    "Cursos": Cursos,
    "Biblioteca": Biblioteca,
    "Agenda": Agenda,
    "Notas": Notas,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};