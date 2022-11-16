import findAttributes from "../navigations/findAttributes";
import findObjectBindingPatterns from "../navigations/findObjectBindingPatterns";
import findObjectLiteralExpressions from "../navigations/findObjectLiteralExpressions";
import findReactObjects from "../navigations/findReactObjects";
import groupImports from "./groupImports";
import removePropTypes from "./removePropTypes";
import removeReactImports from "./removeReactImports";
import removeReactKeyAttr from "./removeReactKeyAttr";
import removeUnusedImports from "./removeUnusedImports";
import renameMuiImports from "./renameMuiImports";
import replaceObjectBinding from "./replaceObjectBinding";
import replaceReactClassNameAttr from "./replaceReactClassNameAttr";
import replaceReactComponentPropsWithoutRefType from "./replaceReactComponentPropsWithoutRefType";
import replaceReactContext from "./replaceReactContext";
import replaceReactCreateContext from "./replaceReactCreateContext";
import replaceReactCSSPropertiesType from "./replaceReactCSSPropertiesType";
import replaceReactElementType from "./replaceReactElementType";
import replaceReactEventHandlers from "./replaceReactEventHandlers";
import replaceReactEvents from "./replaceReactEvents";
import replaceReactForwardRef from "./replaceReactForwardRef";
import replaceReactFragment from "./replaceReactFragment";
import replaceReactHTMLAttributes from "./replaceReactHTMLAttributes";
import replaceReactJSXElementConstructor from "./replaceReactJSXElementConstructor";
import replaceReactMemo from "./replaceReactMemo";
import replaceReactNode from "./replaceReactNode";
import replaceReactReactElement from "./replaceReactReactElement";
import replaceReactRef from "./replaceReactRef";
import replaceReactUseCallback from "./replaceReactUseCallback";
import replaceReactUseContext from "./replaceReactUseContext";
import replaceReactUseEffect from "./replaceReactUseEffect";
import replaceReactUseLayoutEffect from "./replaceReactUseLayoutEffect";
import replaceReactUseMemo from "./replaceReactUseMemo";
import replaceReactUseRef from "./replaceReactUseRef";
import replaceReactUseState from "./replaceReactUseState";
import replaceSpreadAsignment from "./replaceSpreadAsignment";
import { Identifier, JsxAttribute, SourceFile } from "ts-morph";

const reactObjectTransformers: Record<string, (node: Identifier) => void> = {
  Fragment: replaceReactFragment,
  Context: replaceReactContext,
  createContext: replaceReactCreateContext,
  ReactElement: replaceReactReactElement,

  // replace types
  ElementType: replaceReactElementType,
  ComponentPropsWithoutRef: replaceReactComponentPropsWithoutRefType,
  CSSProperties: replaceReactCSSPropertiesType,

  memo: replaceReactMemo,
  ReactNode: replaceReactNode,
  Ref: replaceReactRef,
  useCallback: replaceReactUseCallback,
  useContext: replaceReactUseContext,
  useState: replaceReactUseState,
  JSXElementConstructor: replaceReactJSXElementConstructor,
  useMemo: replaceReactUseMemo,
  useRef: replaceReactUseRef,
  forwardRef: replaceReactForwardRef,
  useEffect: replaceReactUseEffect,
  useLayoutEffect: replaceReactUseLayoutEffect,
};

const attrTransforms: Record<string, (node: JsxAttribute) => void> = {
  className: replaceReactClassNameAttr,
  key: removeReactKeyAttr,
};

export default function transformReactSource(source: SourceFile) {
  const reactObjects = findReactObjects(source);
  for (const reactObject of reactObjects) {
    if (reactObject.node.wasForgotten()) continue;
    let transformer = reactObjectTransformers[reactObject.name];
    if (!transformer) {
      if (reactObject.name.endsWith("EventHandler")) {
        transformer = replaceReactEventHandlers;
      } else if (reactObject.name.endsWith("Event")) {
        transformer = replaceReactEvents;
      } else if (reactObject.name.endsWith("HTMLAttributes")) {
        transformer = replaceReactHTMLAttributes;
      }
    }
    transformer?.(reactObject.node);
  }
  renameMuiImports(source);
  removeReactImports(source);
  removePropTypes(source);
  findObjectBindingPatterns(source).forEach((node) =>
    replaceObjectBinding(node)
  );
  findObjectLiteralExpressions(source).forEach((node) =>
    replaceSpreadAsignment(node)
  );
  findAttributes(source).forEach((node) => {
    const name = node.getName();
    attrTransforms[name]?.(node);
  });
  groupImports(source);
  removeUnusedImports(source);
}
