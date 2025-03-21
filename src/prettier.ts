import { execSync } from "node:child_process";

function isPrettierInstalled(): boolean {
    try {
        execSync("npx --no-install prettier --version", { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

export function formatWithPrettier(filePaths: string[]) {
    if (!isPrettierInstalled()) {
        console.warn("⚠️ Prettier is not installed. Skipping formatting.");
        return;
    }

    for (const filePath of filePaths) {
        try {
            execSync(`npx prettier --write "${filePath}"`, {
                stdio: "inherit",
            });
        } catch (error) {
            console.error("❌ Prettier formatting failed:", error);
        }
    }
}
