import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHOSEONG = [..."ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"];
const initials = word => [...word].map(char => {
  const code = char.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3 ? CHOSEONG[Math.floor((code - 0xac00) / 588)] : "";
}).join("");

const emotionSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const snackSource = fs.readFileSync(path.join(root, "snacks", "index.html"), "utf8");
const emotion = [];
for (const m of emotionSource.matchAll(/\{ answer: "([^"]+)", initials: "([^"]+)"/g)) emotion.push({ answer: m[1], stored: m[2] });
for (const m of emotionSource.matchAll(/emotion\("([^"]+)", "([^"]+)"/g)) emotion.push({ answer: m[1], stored: m[2] });
const snack = [...snackSource.matchAll(/\["([^"]+)","([ㄱ-ㅎ]+)"/g)].map(m => ({ answer: m[1], stored: m[2] }));

let failures = 0;
for (const [name, rows, expected] of [["emotion", emotion, 90], ["snack", snack, 60]]) {
  const mismatches = rows.filter(row => row.stored !== initials(row.answer));
  const duplicates = rows.filter((row, index) => rows.findIndex(other => other.answer === row.answer) !== index);
  const empty = rows.filter(row => !row.answer || !row.stored);
  console.log(`${name}: ${rows.length}/${expected} questions, ${mismatches.length} initial mismatches, ${duplicates.length} duplicates, ${empty.length} empty rows`);
  for (const row of mismatches) console.error(`  ${row.answer}: stored=${row.stored}, computed=${initials(row.answer)}`);
  if (rows.length !== expected || mismatches.length || duplicates.length || empty.length) failures += 1;
}
if (failures) process.exit(1);
console.log("PASS quiz data audit");
