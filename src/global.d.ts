declare interface BuildSettings {
    header: { Title: string; Description: string; Homepage: string, License?: string; };
    source: string[];
}

declare interface URLSource {
    domain: string;
    option: string;
    remark: string;
}