import Agenda from './pages/Agenda';
import AulasMentoria from './pages/AulasMentoria';
import Automacoes from './pages/Automacoes';
import Biblioteca from './pages/Biblioteca';
import Cursos from './pages/Cursos';
import Dashboard from './pages/Dashboard';
import Execucao from './pages/Execucao';
import FluxogramasOperacionais from './pages/FluxogramasOperacionais';
import GestaoFinanceira from './pages/GestaoFinanceira';
import Home from './pages/Home';
import MentoradoDetalhe from './pages/MentoradoDetalhe';
import Mentorados from './pages/Mentorados';
import Notas from './pages/Notas';
import Fornecedores from './pages/Fornecedores';
import ExecucaoInteligente from './pages/ExecucaoInteligente';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Agenda": Agenda,
    "AulasMentoria": AulasMentoria,
    "Automacoes": Automacoes,
    "Biblioteca": Biblioteca,
    "Cursos": Cursos,
    "Dashboard": Dashboard,
    "Execucao": Execucao,
    "FluxogramasOperacionais": FluxogramasOperacionais,
    "GestaoFinanceira": GestaoFinanceira,
    "Home": Home,
    "MentoradoDetalhe": MentoradoDetalhe,
    "Mentorados": Mentorados,
    "Notas": Notas,
    "Fornecedores": Fornecedores,
    "ExecucaoInteligente": ExecucaoInteligente,
}

export const pagesConfig = {
    mainPage: "Mentorados",
    Pages: PAGES,
    Layout: __Layout,
};