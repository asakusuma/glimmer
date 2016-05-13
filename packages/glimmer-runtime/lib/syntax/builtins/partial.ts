import {
  CompileInto,
  SymbolLookup,
  Statement as StatementSyntax
} from '../../syntax';

import Scanner from '../../scanner';

import {
  LabelOpcode,
  EnterOpcode,
  PutArgsOpcode,
  TestOpcode,
  JumpUnlessOpcode,
  JumpOpcode,
  EvaluatePartialOpcode,
  ExitOpcode
} from '../../compiled/opcodes/vm';

import * as Syntax from '../core';
import Environment from '../../environment';

export default class PartialSyntax extends StatementSyntax {
  type = "partial-statement";

  public args: Syntax.Args;
  public isStatic = false;

  constructor({ args }: { args: Syntax.Args }) {
    super();
    this.args = args;
  }

  prettyPrint() {
    return `partial ${this.args.prettyPrint()}`;
  }

  compile(compiler: CompileInto & SymbolLookup, env: Environment) {

    /*
    //        Enter(BEGIN, END)
    // BEGIN: Noop
    //        PutArgs
    //        Test
    //        JumpUnless(ELSE)
    //        Evaluate(default)
    //        Jump(END)
    // ELSE:  Noop
    //        Evaluate(inverse)
    // END:   Noop
    //        Exit
    let { serializedTemplate } = env.lookupPartial(['test']);

    debugger;
    if (!serializedTemplate) return;

    let scanner = new Scanner(serializedTemplate, env);
    let block = scanner.scanInlineBlock(compiler.symbolTable);


    compiler.append(new PutArgsOpcode({ args: this.args.compile(compiler, env) }));
    compiler.append(new EvaluateOpcode({ debug: "default", block }));
    */

    let compiledPartialNameExpression = this.args.positional.values[0].compile(compiler, env);

    let BEGIN = new LabelOpcode({ label: "BEGIN" });
    let ELSE = new LabelOpcode({ label: "ELSE" });
    let END = new LabelOpcode({ label: "END" });

    compiler.append(new EnterOpcode({ begin: BEGIN, end: END }));
    compiler.append(BEGIN);
    compiler.append(new PutArgsOpcode({ args: this.args.compile(compiler, env) }));
    compiler.append(new TestOpcode());

    compiler.append(new JumpUnlessOpcode({ target: END }));
    compiler.append(new EvaluatePartialOpcode({
      name: compiledPartialNameExpression,
      compiler: compiler
    }));

    compiler.append(END);
    compiler.append(new ExitOpcode());
  }
}
