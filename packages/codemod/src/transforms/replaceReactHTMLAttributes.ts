import getParentExpr from "../utils/getParentExpr.js";
import uncapitalize from "../utils/uncapitalize.js";
import { Identifier, ts } from "ts-morph";

const { factory } = ts;

// JSX.IntrinsicElements

const tags: Record<string, string> = {
  a: "HTMLAnchorElement",
  abbr: "HTMLElement",
  address: "HTMLElement",
  area: "HTMLAreaElement",
  article: "HTMLElement",
  aside: "HTMLElement",
  audio: "HTMLAudioElement",
  b: "HTMLElement",
  base: "HTMLBaseElement",
  bdi: "HTMLElement",
  bdo: "HTMLElement",
  big: "HTMLElement",
  blockquote: "HTMLElement",
  body: "HTMLBodyElement",
  br: "HTMLBRElement",
  button: "HTMLButtonElement",
  canvas: "HTMLCanvasElement",
  caption: "HTMLElement",
  cite: "HTMLElement",
  code: "HTMLElement",
  col: "HTMLTableColElement",
  colgroup: "HTMLTableColElement",
  data: "HTMLElement",
  datalist: "HTMLDataListElement",
  dd: "HTMLElement",
  del: "HTMLElement",
  details: "HTMLDetailsElement",
  dfn: "HTMLElement",
  dialog: "HTMLElement",
  div: "HTMLDivElement",
  dl: "HTMLDListElement",
  dt: "HTMLElement",
  em: "HTMLElement",
  embed: "HTMLEmbedElement",
  fieldset: "HTMLFieldSetElement",
  figcaption: "HTMLElement",
  figure: "HTMLElement",
  footer: "HTMLElement",
  form: "HTMLFormElement",
  h1: "HTMLHeadingElement",
  h2: "HTMLHeadingElement",
  h3: "HTMLHeadingElement",
  h4: "HTMLHeadingElement",
  h5: "HTMLHeadingElement",
  h6: "HTMLHeadingElement",
  head: "HTMLHeadElement",
  header: "HTMLElement",
  hgroup: "HTMLElement",
  hr: "HTMLHRElement",
  html: "HTMLHtmlElement",
  i: "HTMLElement",
  iframe: "HTMLIFrameElement",
  img: "HTMLImageElement",
  input: "HTMLInputElement",
  ins: "HTMLModElement",
  kbd: "HTMLElement",
  keygen: "HTMLElement",
  label: "HTMLLabelElement",
  legend: "HTMLLegendElement",
  li: "HTMLLIElement",
  link: "HTMLLinkElement",
  main: "HTMLElement",
  map: "HTMLMapElement",
  mark: "HTMLElement",
  menu: "HTMLElement",
  menuitem: "HTMLElement",
  meta: "HTMLMetaElement",
  meter: "HTMLElement",
  nav: "HTMLElement",
  noindex: "HTMLElement",
  noscript: "HTMLElement",
  object: "HTMLObjectElement",
  ol: "HTMLOListElement",
  optgroup: "HTMLOptGroupElement",
  option: "HTMLOptionElement",
  output: "HTMLElement",
  p: "HTMLParagraphElement",
  param: "HTMLParamElement",
  picture: "HTMLElement",
  pre: "HTMLPreElement",
  progress: "HTMLProgressElement",
  q: "HTMLQuoteElement",
  rp: "HTMLElement",
  rt: "HTMLElement",
  ruby: "HTMLElement",
  s: "HTMLElement",
  samp: "HTMLElement",
  script: "HTMLElement",
  section: "HTMLElement",
  select: "HTMLSelectElement",
  small: "HTMLElement",
  source: "HTMLSourceElement",
  span: "HTMLSpanElement",
  strong: "HTMLElement",
  style: "HTMLStyleElement",
  sub: "HTMLElement",
  summary: "HTMLElement",
  sup: "HTMLElement",
  table: "HTMLTableElement",
  tbody: "HTMLTableSectionElement",
  td: "HTMLTableDataCellElement",
  textarea: "HTMLTextAreaElement",
  tfoot: "HTMLTableSectionElement",
  th: "HTMLTableHeaderCellElement",
  thead: "HTMLTableSectionElement",
  time: "HTMLElement",
  title: "HTMLTitleElement",
  tr: "HTMLTableRowElement",
  track: "HTMLTrackElement",
  u: "HTMLElement",
  ul: "HTMLUListElement",
  var: "HTMLElement",
  video: "HTMLVideoElement",
  wbr: "HTMLElement",
  svg: "SVGSVGElement",
  animate: "SVGAnimateElement",
  animateMotion: "SVGAnimateMotionElement",
  animateTransform: "SVGAnimateTransformElement",
  circle: "SVGCircleElement",
  clipPath: "SVGClipPathElement",
  defs: "SVGDefsElement",
  desc: "SVGDescElement",
  ellipse: "SVGEllipseElement",
  feBlend: "SVGFEBlendElement",
  feColorMatrix: "SVGFEColorMatrixElement",
  feComponentTransfer: "SVGFEComponentTransferElement",
  feComposite: "SVGFECompositeElement",
  feConvolveMatrix: "SVGFEConvolveMatrixElement",
  feDiffuseLighting: "SVGFEDiffuseLightingElement",
  feDisplacementMap: "SVGFEDisplacementMapElement",
  feDistantLight: "SVGFEDistantLightElement",
  feFlood: "SVGFEFloodElement",
  feFuncA: "SVGFEFuncAElement",
  feFuncB: "SVGFEFuncBElement",
  feFuncG: "SVGFEFuncGElement",
  feFuncR: "SVGFEFuncRElement",
  feGaussianBlur: "SVGFEGaussianBlurElement",
  feImage: "SVGFEImageElement",
  feMerge: "SVGFEMergeElement",
  feMergeNode: "SVGFEMergeNodeElement",
  feMorphology: "SVGFEMorphologyElement",
  feOffset: "SVGFEOffsetElement",
  fePointLight: "SVGFEPointLightElement",
  feSpecularLighting: "SVGFESpecularLightingElement",
  feSpotLight: "SVGFESpotLightElement",
  feTile: "SVGFETileElement",
  feTurbulence: "SVGFETurbulenceElement",
  filter: "SVGFilterElement",
  foreignObject: "SVGForeignObjectElement",
  g: "SVGGElement",
  image: "SVGImageElement",
  line: "SVGLineElement",
  linearGradient: "SVGLinearGradientElement",
  marker: "SVGMarkerElement",
  mask: "SVGMaskElement",
  metadata: "SVGMetadataElement",
  path: "SVGPathElement",
  pattern: "SVGPatternElement",
  polygon: "SVGPolygonElement",
  polyline: "SVGPolylineElement",
  radialGradient: "SVGRadialGradientElement",
  rect: "SVGRectElement",
  stop: "SVGStopElement",
  switch: "SVGSwitchElement",
  symbol: "SVGSymbolElement",
  text: "SVGTextElement",
  textPath: "SVGTextPathElement",
  tspan: "SVGTSpanElement",
  use: "SVGUseElement",
  view: "SVGViewElement",
};

function findTag(objectName: string) {
  for (const tag in tags) {
    if (tags[tag] === objectName) return tag;
  }
}

export default function replaceReactHTMLAttributes(node: Identifier) {
  const parentExpr = getParentExpr(node);
  const typeRef = parentExpr?.getParentIfKind(ts.SyntaxKind.TypeReference);
  const genericType = typeRef?.getLastChildByKind(ts.SyntaxKind.TypeReference);

  if (genericType) {
    const genericTypeText = genericType
      .getLastChildByKind(ts.SyntaxKind.Identifier)
      ?.getText();
    const tag = genericTypeText ? findTag(genericTypeText) : null;

    if (tag) {
      genericType.transform(() =>
        factory.createLiteralTypeNode(factory.createStringLiteral(tag))
      );
    } else {
      // React.*HTMLAttributes<NonElement> -> ST.PropsOf<*>
      const tag = uncapitalize(node.getText().replace(/HTMLAttributes$/, ""));
      if (tag.length)
        genericType.transform(() =>
          factory.createLiteralTypeNode(factory.createStringLiteral(tag))
        );
    }

    parentExpr?.replaceWithText("ST.PropsOf");
    node.getSourceFile().addImportDeclaration({
      namespaceImport: "ST",
      moduleSpecifier: "@suid/types",
    });
  }
}
