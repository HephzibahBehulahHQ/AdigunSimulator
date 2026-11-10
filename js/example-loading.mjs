import {parseProject,validateProject} from './core.mjs';
import {EXPECTED_DIAGNOSTICS} from './example-bank.mjs';
export function parseExampleProject(raw,path){
 if(path!=='examples/154-short-circuit-diagnosis.adigun.json')return parseProject(raw);
 const project=JSON.parse(raw),validation=validateProject(project);
 // Only the shipped short-circuit lesson may open with this expected error.
 if(!validation.valid&&validation.errors.every(e=>e.rule==='SOURCE_SHORT'))return project;
 return parseProject(raw);
}
export function canLoadExampleAnalysis(path,analysis){
 if(analysis?.state==='complete')return true;
 return analysis?.state==='blocked'&&path.startsWith('examples/')&&EXPECTED_DIAGNOSTICS.has(path.slice('examples/'.length));
}
