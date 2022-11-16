import { readOptions } from "./prettier.js";
import { readFile, writeFile } from "fs/promises";
import { format } from "prettier";

export type Package = {
  name: string;
  version: string;
  private?: boolean;
  files?: string[];
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  publishConfig?: Record<string, string>;
  keywords?: string[];
  repository?: {
    type?: string;
    url?: string;
    directory?: string;
  };
  pnpm?: {
    overrides?: Record<string, string>;
  };
};

export async function parsePackageFile(path: string) {
  const contents = await readFile(path);
  return JSON.parse(contents.toString()) as Package;
}

export async function writePackageFile(path: string, config: Package) {
  await writeFile(
    path,
    format(JSON.stringify(config), {
      ...(await readOptions()),
      filepath: "package.json",
      parser: "json-stringify",
    })
  );
}
