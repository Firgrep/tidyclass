import { execSync } from "node:child_process";

function isPrettierInstalled(): boolean {
    try {
        // Check if Prettier exists (cross-platform)
        const cmd =
            process.platform === "win32" ? "where prettier" : "which prettier";
        execSync(cmd, { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

export function formatWithPrettier(filePath: string) {
    if (!isPrettierInstalled()) {
        console.warn("⚠️ Prettier is not installed. Skipping formatting.");
        return;
    }

    try {
        console.log(`✨ Running Prettier on ${filePath}`);
        execSync(`npx prettier --write "${filePath}"`, { stdio: "inherit" });
        console.log(`✅ Prettier formatted: ${filePath}`);
    } catch (error) {
        console.error("❌ Prettier formatting failed:", error);
    }
}
