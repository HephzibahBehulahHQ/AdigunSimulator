import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { addComponent, createEmptyProject, validateProject } from "../js/core.mjs";

test("unwired new components and missing DC reference warnings state the correction",()=>{
 const project=addComponent(createEmptyProject(),"passive.resistor"),report=validateProject(project);
 for(const pin of ["1","2"]){const issue=report.warnings.find(item=>item.rule==="UNCONNECTED_PIN"&&item.message.includes(`pin ${pin} `));assert.ok(issue);assert.match(issue.fix,/Connect R1 pin/);assert.match(issue.fix,/validate and run again/);}
 assert.match(report.warnings.find(item=>item.rule==="NO_REFERENCE").fix,/signal-ground symbol/);
});

test("Warnings and Errors panels render corrective guidance",async()=>{
 const app=await readFile(new URL("../app.js",import.meta.url),"utf8");
 assert.match(app,/issue\.fix \? `\\n  Fix: \$\{issue\.fix\}`/);
});

