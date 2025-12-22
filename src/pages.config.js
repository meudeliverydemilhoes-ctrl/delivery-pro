import Dashboard from './pages/Dashboard';
import Mentorados from './pages/Mentorados';
import MentoradoDetalhe from './pages/MentoradoDetalhe';
import Cursos from './pages/Cursos';
import Biblioteca from './pages/Biblioteca';
import Agenda from './pages/Agenda';
import Notas from './pages/Notas';
import Execucao from './pages/Execucao';
import ExecucaoInteligente from './pages/ExecucaoInteligente';
import FluxogramasOperacionais from './pages/FluxogramasOperacionais';
import AulasMentoria from './pages/AulasMentoria';
import GestaoFinanceira from './pages/GestaoFinanceira';
import Automacoes from './pages/Automacoes';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Mentorados": Mentorados,
    "MentoradoDetalhe": MentoradoDetalhe,
    "Cursos": Cursos,
    "Biblioteca": Biblioteca,
    "Agenda": Agenda,
    "Notas": Notas,
    "Execucao": Execucao,
    "ExecucaoInteligente": ExecucaoInteligente,
    "FluxogramasOperacionais": FluxogramasOperacionais,
    "AulasMentoria": AulasMentoria,
    "GestaoFinanceira": GestaoFinanceira,
    "Automacoes": Automacoes,
}

export const pagesConfig = {
    mainPage: "Mentorados",
    Pages: PAGES,
    Layout: __Layout,
};