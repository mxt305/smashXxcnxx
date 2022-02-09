#!/usr/bin/env ts-node
import rawSettings from "./buildSetting.json";
import * as fs from "fs";
import { parse } from "csv-parse/sync";

const settings: BuildSettings = rawSettings;
const headers = {
    ...settings.header,
    "Last modified": new Date().toUTCString(),
};
const fileHeader = Object.keys(headers)
    .map<string>((key) => `! ${key}: ${headers[key]}`)
    .join("\n");

const csvHeaders = ["domain", "option", "remark"];
let adbRules: string[] = [];
let ublRules: string[] = [];

const parseSource = async (source: string) =>
    new Promise((resolve, reject) => {
        const csvFilePath = `./source/${source}.csv`;
        const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });
        const records: URLSource[] = parse(fileContent, {
            delimiter: ",",
            columns: csvHeaders,
            skip_empty_lines: true,
        });
        const recordAdbRules = records.map(
            (row) =>
                `||${row.domain}^${row.option !== "" ? `$${row.option}` : ""}`
        );
        const recordUblRules1 = records.map((row) => `*://${row.domain}/*`);
        const recordUblRules2 = records.map((row) => `*://*.${row.domain}/*`);
        adbRules = [...adbRules, ...recordAdbRules];
        ublRules = [...ublRules, ...recordUblRules1, ...recordUblRules2];
    });

settings.source.forEach(async (source) => {
    parseSource(source);
});

const fileBody = adbRules.join("\n");

const content = `!\n${fileHeader}\n!\n!\n${fileBody}`;

fs.writeFile("./filters/xxcnxx-filter.txt", content, (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Build adblock filter successfully");
});

const ublContent = ublRules.join("\n");
fs.writeFile("./filters/xxcnxx-uBlacklist.txt", ublContent, (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Build uBlacklist list successfully");
});
