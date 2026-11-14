import assert from 'node:assert/strict';
import test from 'node:test';
import { createScopeLauncher, recordScopeAnalysis } from '../js/scope-launcher.mjs';

test('completed current analysis restores scope launcher after canvas redraw', () => {
  const document = {
    createElement() {
      return {
        hidden: false,
        parentElement: null,
        setAttribute() {},
        addEventListener() {},
        remove() { this.parentElement = null; }
      };
    }
  };
  const canvas = {
    children: [],
    append(node) {
      if (node.parentElement === this) return;
      node.parentElement = this;
      this.children.push(node);
    }
  };
  const launcher = createScopeLauncher({ document, canvas, onOpen() {} });
  const button = canvas.children[0];
  const state = { project: { id: 'buck' } };

  recordScopeAnalysis(state, { state: 'complete' }, () => launcher.update(state, 'Open oscilloscope'));
  assert.equal(button.hidden, false);

  // renderCanvas uses innerHTML, which removes children attached to the canvas.
  canvas.children = [];
  button.parentElement = null;
  launcher.update(state, 'Open oscilloscope');

  assert.deepEqual(canvas.children, [button]);
  assert.equal(button.hidden, false);
  launcher.remove();
});
