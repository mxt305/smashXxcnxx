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
let rules: string[] = [];

const parseSource = async (source: string) =>
    new Promise((resolve, reject) => {
        const csvFilePath = `./source/${source}.csv`;
        const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });
        const records: URLSource[] = parse(fileContent, {
            delimiter: ",",
            columns: csvHeaders,
            skip_empty_lines: true,
        });
        const recordRules = records.map(
            (row) =>
                `||${row.domain}^${row.option !== "" ? `$${row.option}` : ""}`
        );
        rules = [...rules, ...recordRules];
    });

settings.source.forEach(async (source) => {
    parseSource(source);
});

const fileBody = rules.join("\n");

const content = `!\n${fileHeader}\n!\n!\n${fileBody}`;

fs.writeFile("./filters/xxcnxx-filter.txt", content, (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Build successfully");
});
