/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AulasMentoria from './pages/AulasMentoria';
import Automacoes from './pages/Automacoes';
import Biblioteca from './pages/Biblioteca';
import Cursos from './pages/Cursos';
import Dashboard from './pages/Dashboard';
import Execucao from './pages/Execucao';
import ExecucaoInteligente from './pages/ExecucaoInteligente';
import FluxogramasOperacionais from './pages/FluxogramasOperacionais';
import Fornecedores from './pages/Fornecedores';
import GestaoFinanceira from './pages/GestaoFinanceira';
import Home from './pages/Home';
import MentoradoDetalhe from './pages/MentoradoDetalhe';
import Mentorados from './pages/Mentorados';
import Notas from './pages/Notas';
import PerfilMentorado from './pages/PerfilMentorado';
import Agenda from './pages/Agenda';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AulasMentoria": AulasMentoria,
    "Automacoes": Automacoes,
    "Biblioteca": Biblioteca,
    "Cursos": Cursos,
    "Dashboard": Dashboard,
    "Execucao": Execucao,
    "ExecucaoInteligente": ExecucaoInteligente,
    "FluxogramasOperacionais": FluxogramasOperacionais,
    "Fornecedores": Fornecedores,
    "GestaoFinanceira": GestaoFinanceira,
    "Home": Home,
    "MentoradoDetalhe": MentoradoDetalhe,
    "Mentorados": Mentorados,
    "Notas": Notas,
    "PerfilMentorado": PerfilMentorado,
    "Agenda": Agenda,
}

export const pagesConfig = {
    mainPage: "Mentorados",
    Pages: PAGES,
    Layout: __Layout,
};