import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const nextDir = path.join(projectRoot, ".next");

const recovered = new Map();

function decodeSourcePath(source) {
  if (!source) return null;
  const match = source.match(/nexora-ai[\\/](.+)$/i) || source.match(/\[project\][\\/](.+)$/i);
  let rel = match ? match[1] : null;
  if (!rel) return null;
  rel = decodeURIComponent(rel).replace(/\\/g, "/");
  if (rel.includes("__nextjs-internal-proxy")) return null;
  if (rel.includes("favicon.ico.mjs")) return null;
  if (!rel.startsWith("src/") && !rel.startsWith("bot/") && !rel.startsWith("server/") && !rel.startsWith("prisma/") && !rel.startsWith("scripts/")) {
    return null;
  }
  return rel;
}

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".map")) processMap(full);
  }
}

function processMap(file) {
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return;
  }

  const maps = [];
  if (json.sections) {
    for (const section of json.sections) {
      if (section.map) maps.push(section.map);
    }
  } else {
    maps.push(json);
  }

  for (const map of maps) {
    if (!map?.sources || !map?.sourcesContent) continue;
    map.sources.forEach((source, i) => {
      const rel = decodeSourcePath(source);
      const content = map.sourcesContent[i];
      if (!rel || !content || content.length < 20) return;
      const existing = recovered.get(rel);
      if (!existing || content.length > existing.length) {
        recovered.set(rel, content);
      }
    });
  }
}

walk(nextDir);

let count = 0;
for (const [rel, content] of recovered.entries()) {
  const out = path.join(projectRoot, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content.endsWith("\n") ? content : content + "\n");
  count++;
  console.log("✓", rel);
}

console.log(`\nRecuperados ${count} arquivos de src/`);
