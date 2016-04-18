import { Template, RenderResult } from "glimmer-runtime";
import { BasicComponent, TestEnvironment, TestDynamicScope, equalTokens } from "glimmer-test-helpers";
import { UpdatableReference } from "glimmer-object-reference";
import { Opaque, opaque } from 'glimmer-util';

let env: TestEnvironment, root: Element, result: RenderResult, self: UpdatableReference<Opaque>;

function rootElement() {
  return env.getDOM().createElement('div', document.body);
}

function compile(template: string) {
  return env.compile(template);
}

function commonSetup() {
  env = new TestEnvironment(); // TODO: Support SimpleDOM
  root = rootElement();
}

function render(template: Template, context={}) {
  self = new UpdatableReference(opaque(context));
  result = template.render(self, env, { appendTo: root, dynamicScope: new TestDynamicScope(null) });
  assertInvariants(result);
  return result;
}

function rerender(context: Object={}) {
  self.update(opaque(context));
  result.rerender();
}

function assertInvariants(result) {
  strictEqual(result.firstNode(), root.firstChild, "The firstNode of the result is the same as the root's firstChild");
  strictEqual(result.lastNode(), root.lastChild, "The lastNode of the result is the same as the root's lastChild");
}

QUnit.module("Partials", {
  setup: commonSetup
});

QUnit.test('static partial with static content', assert => {
  let template = compile(`Before {{partial 'test'}} After`);

  env.registerPartial('test', `<div>Testing</div>`);
  render(template);

  equalTokens(root, `Before <div>Testing</div> After`);
  rerender();
  equalTokens(root, `Before <div>Testing</div> After`);
});

QUnit.test('static partial with self reference', assert => {
  let template = compile(`{{partial 'trump'}}`);

  env.registerPartial('trump', `I know {{item}}. I have the best {{item}}s.`);
  render(template, { item: 'partial' });

  equalTokens(root, `I know partial. I have the best partials.`);
  rerender();
  equalTokens(root, `I know partial. I have the best partials.`);
});

QUnit.test('static partial with local reference', assert => {
  let template = compile(`{{#each qualities as |quality|}}{{partial 'test'}}. {{/each}}`);

  env.registerPartial('test', `You {{quality}}`);
  render(template, { qualities: ['smaht', 'loyal'] });

  equalTokens(root, `You smaht. You loyal.`);
  rerender();
  equalTokens(root, `You smaht. You loyal.`);
});
