/* ============================================================================
   Tiny DOM helpers — a hyperscript so page code reads declaratively without a
   framework. `h("div.foo", {…}, children)` and `s(...)` for SVG.
   ========================================================================== */

type Child = Node | string | number | false | null | undefined | Child[];
type Props = Record<string, unknown>;

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_TAGS = new Set([
  "svg", "path", "g", "circle", "rect", "line", "polyline", "polygon",
  "defs", "linearGradient", "stop", "text", "tspan", "use", "clipPath",
  "ellipse", "filter", "feGaussianBlur", "pattern", "mask", "symbol",
]);

function apply(node: Element, props: Props): void {
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === "class" || key === "className") {
      node.setAttribute("class", String(value));
    } else if (key === "style" && typeof value === "object") {
      Object.assign((node as HTMLElement).style, value as object);
    } else if (key === "dataset" && typeof value === "object") {
      Object.assign((node as HTMLElement).dataset, value as object);
    } else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else if (key === "html") {
      node.innerHTML = String(value);
    } else if (key in node && !(node instanceof SVGElement)) {
      // Prefer DOM properties (value, checked, disabled…) for HTML elements.
      try {
        (node as unknown as Record<string, unknown>)[key] = value;
      } catch {
        node.setAttribute(key, String(value));
      }
    } else {
      node.setAttribute(key, value === true ? "" : String(value));
    }
  }
}

function append(node: Element, children: Child[]): void {
  for (const child of children) {
    if (child == null || child === false) continue;
    if (Array.isArray(child)) append(node, child);
    else if (child instanceof Node) node.appendChild(child);
    else node.appendChild(document.createTextNode(String(child)));
  }
}

/** Parse "tag.class1.class2#id" into parts. */
function parseTag(spec: string): { tag: string; cls: string[]; id?: string } {
  const idMatch = spec.match(/#([\w-]+)/);
  const id = idMatch?.[1];
  const clean = spec.replace(/#[\w-]+/, "");
  const [tag, ...cls] = clean.split(".");
  return { tag: tag || "div", cls, id };
}

export function h(spec: string, props: Props = {}, ...children: Child[]): HTMLElement {
  const { tag, cls, id } = parseTag(spec);
  const node = document.createElement(tag);
  if (cls.length) node.className = cls.join(" ");
  if (id) node.id = id;
  apply(node, props);
  append(node, children);
  return node;
}

export function s(spec: string, props: Props = {}, ...children: Child[]): SVGElement {
  const { tag, cls, id } = parseTag(spec);
  if (!SVG_TAGS.has(tag)) throw new Error(`Unknown SVG tag: ${tag}`);
  const node = document.createElementNS(SVG_NS, tag);
  if (cls.length) node.setAttribute("class", cls.join(" "));
  if (id) node.setAttribute("id", id);
  apply(node, props);
  append(node, children);
  return node;
}

export const frag = (...children: Child[]): DocumentFragment => {
  const f = document.createDocumentFragment();
  append(f as unknown as Element, children);
  return f;
};

export const clear = (node: Element): void => {
  node.replaceChildren();
};

export const qs = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(sel);
