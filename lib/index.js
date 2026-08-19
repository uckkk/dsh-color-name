// dsh-color-name — 颜色名称（DeepSeek Harness）。hex ↔ 常见颜色名。纯 Node。
import { defineTool } from "@deepseek-ai/dsh-tools";

const name = "颜色名称";
const inject = ["tools"];

const NAMES = {
  black: "#000000", white: "#ffffff", red: "#ff0000", green: "#008000", blue: "#0000ff",
  yellow: "#ffff00", cyan: "#00ffff", magenta: "#ff00ff", gray: "#808080", grey: "#808080",
  silver: "#c0c0c0", maroon: "#800000", olive: "#808000", lime: "#00ff00", teal: "#008080",
  navy: "#000080", purple: "#800080", orange: "#ffa500", pink: "#ffc0cb", brown: "#a52a2a",
  gold: "#ffd700", coral: "#ff7f50", tomato: "#ff6347", skyblue: "#87ceeb", lightgray: "#d3d3d3",
  darkgray: "#a9a9a9", dodgerblue: "#1e90ff", royalblue: "#4169e1", seagreen: "#2e8b57", crimson: "#dc143c",
};

function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function closestName(hex) {
  const [r, g, b] = hexToRgb(hex);
  let best = null, bestDist = Infinity;
  for (const [name, hx] of Object.entries(NAMES)) {
    const [r2, g2, b2] = hexToRgb(hx);
    const dist = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (dist < bestDist) { bestDist = dist; best = { name, hex: hx, dist: Math.round(Math.sqrt(dist)) }; }
  }
  return best;
}

async function apply(ctx, _config) {
  ctx.tools.register(defineTool({
    name: "color_name",
    description: "查询颜色名称对应的 hex。`name` 传颜色名（如 red、skyblue）。",
    parameters: { name: { type: "string", required: true, description: "颜色名。" } },
    output: { schema: { type: "object", additionalProperties: false, properties: { hex: { type: "string", required: true }, found: { type: "boolean", required: true } } }, render: (_a, v) => [{ type: "text", text: v.found ? v.hex : "未知颜色名" }] },
    execute: async (args) => {
      const hex = NAMES[String(args.name).toLowerCase()];
      return { hex: hex || "", found: !!hex };
    },
  }));

  ctx.tools.register(defineTool({
    name: "hex_to_name",
    description: "查找与 hex 颜色最接近的常见颜色名（RGB 欧氏距离）。`hex` 传颜色（如 #ff0000）。",
    parameters: { hex: { type: "string", required: true, description: "hex 颜色。" } },
    output: { schema: { type: "object", additionalProperties: false, properties: { name: { type: "string", required: true }, hex: { type: "string", required: true }, distance: { type: "integer", required: true } } }, render: (_a, v) => [{ type: "text", text: `${v.name}（${v.hex}，距离 ${v.distance}）` }] },
    execute: async (args) => {
      if (!/^#?[0-9a-fA-F]{6}$/.test(String(args.hex).trim()) && !/^#?[0-9a-fA-F]{3}$/.test(String(args.hex).trim())) throw new Error("hex 格式无效");
      return closestName(String(args.hex));
    },
  }));
}

export { apply, inject, name };
