import { ImportDeclaration, SourceFile } from "ts-morph";

function add(array: string[], value: string) {
  if (!array.includes(value)) array.push(value);
}

export default function groupImports(source: SourceFile) {
  const allImports = source.getImportDeclarations();
  const grouped: Record<
    string,
    {
      nodes: ImportDeclaration[];
      withoutFrom: boolean;
      named: string[];
      defaults: string[];
      namespaces: string[];
    }
  > = {};
  for (const node of allImports) {
    const name = node.getModuleSpecifier().getLiteralText();

    if (!grouped[name]) {
      grouped[name] = {
        nodes: [],
        withoutFrom: true,
        named: [],
        defaults: [],
        namespaces: [],
      };
    }

    grouped[name].nodes.push(node);

    for (const named of node.getNamedImports()) {
      grouped[name].withoutFrom = false;
      if (node.isTypeOnly()) {
        // import type { x } from "y"
        add(grouped[name].named, "type " + named.getText());
      }
      else {
        // import { x } from "y"
        // import { type x } from "y"
        add(grouped[name].named, named.getText());
      }
    }

    const defaultImport = node.getDefaultImport();
    if (defaultImport) {
      grouped[name].withoutFrom = false;
      if (node.isTypeOnly()) {
        // import type x from "y"
        add(grouped[name].defaults, "type " + defaultImport.getText());
      }
      else {
        // import x from "y"
        add(grouped[name].defaults, defaultImport.getText());
      }
    }

    const namespaceImport = node.getNamespaceImport();
    if (namespaceImport) {
      grouped[name].withoutFrom = false;
      add(grouped[name].namespaces, namespaceImport.getText());
    }
  }

  for (const moduleSpecifier in grouped) {
    const config = grouped[moduleSpecifier];

    if (config.withoutFrom)
      source.addImportDeclaration({
        moduleSpecifier,
      });

    if (config.named.length)
      source.addImportDeclaration({
        moduleSpecifier,
        namedImports: config.named,
      });

    for (const defaultImport of config.defaults)
      source.addImportDeclaration({
        moduleSpecifier,
        defaultImport,
      });

    for (const namespaceImport of config.namespaces)
      source.addImportDeclaration({
        moduleSpecifier,
        namespaceImport,
      });

    for (const node of config.nodes) node.remove();
  }
}
