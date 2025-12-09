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
import Relatorios from './pages/Relatorios';
import MentoradoBriefing from './pages/MentoradoBriefing';
import MentoradoDiagnostico from './pages/MentoradoDiagnostico';
import MentoradoCardapio from './pages/MentoradoCardapio';
import MentoradoFluxogramas from './pages/MentoradoFluxogramas';
import MentoradoPainel from './pages/MentoradoPainel';
import MentoradoTarefas from './pages/MentoradoTarefas';
import MentoradoNotas from './pages/MentoradoNotas';
import MentoradoArquivos from './pages/MentoradoArquivos';
import MentoradoFichasTecnicas from './pages/MentoradoFichasTecnicas';
import MentoradoPilares from './pages/MentoradoPilares';
import MentoradoEvolucao from './pages/MentoradoEvolucao';
import AreaMentorado from './pages/AreaMentorado';
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
    "Relatorios": Relatorios,
    "MentoradoBriefing": MentoradoBriefing,
    "MentoradoDiagnostico": MentoradoDiagnostico,
    "MentoradoCardapio": MentoradoCardapio,
    "MentoradoFluxogramas": MentoradoFluxogramas,
    "MentoradoPainel": MentoradoPainel,
    "MentoradoTarefas": MentoradoTarefas,
    "MentoradoNotas": MentoradoNotas,
    "MentoradoArquivos": MentoradoArquivos,
    "MentoradoFichasTecnicas": MentoradoFichasTecnicas,
    "MentoradoPilares": MentoradoPilares,
    "MentoradoEvolucao": MentoradoEvolucao,
    "AreaMentorado": AreaMentorado,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};