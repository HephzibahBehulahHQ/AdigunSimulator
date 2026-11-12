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

test("Adigun BOT answers exact manufacturer-part questions from ledger evidence in every locale", () => {
  const questions = [
    ["What is SN74HC00N? Show its pin mapping.", "en", /Checked-in manufacturer record for SN74HC00N/],
    ["Erklär mir SN74HC00N.", "de", /Herstellerdatensatz im enthaltenen Belegregister für SN74HC00N/],
    ["Ṣàlàyé SN74HC00N fún mi.", "yo", /Àkọsílẹ̀ olupese tó wà nínú app fún SN74HC00N/],
    ["Tell me about SN74HC00N.", "pcm", /Manufacturer record wey dey inside app for SN74HC00N/]
  ];
  for (const [question, locale, heading] of questions) {
    const result = answerBotProductQuestion(question, locale);
    assert.equal(result.action, "answer");
    assert.match(result.answer, heading);
    assert.match(result.answer, /Texas Instruments/);
    assert.match(result.answer, /candidate/i);
    assert.match(result.answer, /not a verified part|nicht verifiziert|kò tíì fìdí apá yìí múlẹ̀|never verify this part/i);
    assert.match(result.answer, /does not establish integration|belegt weder die Integration|kò fi hàn pé a ti so apá|no prove say simulator don integrate/i);
    assert.match(result.answer, /https:\/\/www\.ti\.com\/product\/SN74HC00\/part-details\/SN74HC00N/);
    assert.match(result.answer, /https:\/\/www\.ti\.com\/lit\/ds\/symlink\/sn74hc00\.pdf/);
    if (/pin/i.test(question)) assert.match(result.answer, /1 → 1A/);
  }
});

test("Adigun BOT does not invent a manufacturer record for an unmatched part number", () => {
  assert.equal(answerBotProductQuestion("What is UNKNOWN-12345?"), null);
});

test("Adigun BOT resolves an exact manufacturer ledger ID to its recorded part", () => {
  const result = answerBotProductQuestion("Explain the manufacturer record ti.lm555p");
  assert.equal(result.action, "answer");
  assert.match(result.answer, /Checked-in manufacturer record for LM555P/);
  assert.match(result.answer, /Texas Instruments/);
  assert.match(result.answer, /candidate/i);
});

test("project goals are remembered only from explicit goal statements", () => {
  assert.equal(isBotProjectGoalStatement("I want to build a 12 V motor controller"), true);
  assert.equal(isBotProjectGoalStatement("My project goal is a sensor alarm"), true);
  assert.equal(isBotProjectGoalStatement("How do I build a circuit?"), false);
  assert.equal(isBotProjectGoalStatement("What should I make?"), false);
  assert.equal(answerBotProductQuestion("what does this do?"), null);
  for (const locale of ["en", "de", "yo", "pcm"]) assert.ok(getBotQuestionClarification(locale).length > 20);
});

