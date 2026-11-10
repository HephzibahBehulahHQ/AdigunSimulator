import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateProject} from '../js/core.mjs';
import {runProjectAnalysis} from '../js/analysis-dispatch.mjs';
import {renderPcbPreviewSvg} from '../js/pcb-preview.mjs';
import {classifyExample,pcbCoverage,EXPECTED_DIAGNOSTICS} from '../js/example-bank.mjs';
const base=new URL('../',import.meta.url),entries=[],failures=[];
for(const file of (await readdir(new URL('examples/',base))).filter(f=>f.endsWith('.adigun.json')).sort()){
 const raw=await readFile(new URL('examples/'+file,base),'utf8'),project=JSON.parse(raw),validation=validateProject(project),analysis=runProjectAnalysis(project),pcb=pcbCoverage(project),expectedDiagnostic=EXPECTED_DIAGNOSTICS.has(file);
 const rendered=renderPcbPreviewSvg(project);
 if((!validation.valid&&file!=='154-short-circuit-diagnosis.adigun.json')||(analysis.state!=='complete'&&!expectedDiagnostic)||(pcb.parts>0&&!rendered.includes('data-pcb-footprint=')))failures.push(file);
 entries.push({file,title:project.metadata.name,...classifyExample(file),sha256:createHash('sha256').update(raw.replaceAll('\r\n','\n')).digest('hex'),components:project.components.length,analysis:expectedDiagnostic?'expected-diagnostic':analysis.state,engine:analysis.engine,pcbStatus:pcb.status,pcbParts:pcb.parts,pcbPads:pcb.pads,pcbRoutes:pcb.routes,unmapped:pcb.missing});
}
const summary={projects:entries.length,completedAnalyses:entries.filter(e=>e.analysis==='complete').length,expectedDiagnostics:entries.filter(e=>e.analysis==='expected-diagnostic').length,withStoredPcb:entries.filter(e=>e.pcbStatus==='stored').length,withoutStoredPcb:entries.filter(e=>e.pcbStatus!=='stored').length,unexpectedFailures:failures};
await writeFile(new URL('examples/index.json',base),JSON.stringify({schemaVersion:1,summary,entries},null,2)+'\n');
console.log(JSON.stringify(summary));if(failures.length)process.exitCode=1;
