import test from "node:test";
import assert from "node:assert/strict";
import { answerBotProductQuestion, getBotQuestionClarification, isBotProjectGoalStatement } from "../js/bot-product-help.mjs";

test("Adigun BOT answers grounded website workflow questions in all supported locales", () => {
  for (const locale of ["en", "de", "yo", "pcm"]) {
    for (const question of ["How do I start a project?", "How does simulation work?", "How do I save?", "Where are the parts?", "How do I change language?"]) {
      const result = answerBotProductQuestion(question, locale);
      assert.equal(result.action, "answer");
      assert.ok(result.answer.length > 30);
    }
  }
  assert.match(answerBotProductQuestion("How do I use SPICE?", "en").answer, /not a general SPICE replacement/);
  assert.match(answerBotProductQuestion("How do I sign in?", "en").answer, /unavailable/);
  assert.match(answerBotProductQuestion("How do I verify a manufacturer part?", "en").answer, /candidates are not verified/);
  assert.match(answerBotProductQuestion("What can you do for this project?", "en").answer, /local co-pilot/);
});

test("Adigun BOT performs read-only representation navigation when requested", () => {
  for (const [question, view] of [["show breadboard", "breadboard"], ["open the schematic", "schematic"], ["switch to PCB", "pcb"]]) {
    const result = answerBotProductQuestion(question);
    assert.deepEqual({ action: result.action, view: result.view }, { action: "switch-view", view });
    assert.ok(result.answer.length > 20);
  }
  assert.match(answerBotProductQuestion("tell me about the PCB output").answer, /not manufacturing approval/);
  assert.equal(answerBotProductQuestion("how do I view the PCB? ").view, "pcb");
});

test("project goals are remembered only from explicit goal statements", () => {
  assert.equal(isBotProjectGoalStatement("I want to build a 12 V motor controller"), true);
  assert.equal(isBotProjectGoalStatement("My project goal is a sensor alarm"), true);
  assert.equal(isBotProjectGoalStatement("How do I build a circuit?"), false);
  assert.equal(isBotProjectGoalStatement("What should I make?"), false);
  assert.equal(answerBotProductQuestion("what does this do?"), null);
  for (const locale of ["en", "de", "yo", "pcm"]) assert.ok(getBotQuestionClarification(locale).length > 20);
});

