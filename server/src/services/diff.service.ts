import { createTwoFilesPatch } from "diff";

export interface DiffResult {
    hasChanges: boolean;
    patch: string;
    addedLines: number;
    removedLines: number;
}

export function computeDiff(
    oldContent: string,
    newContent: string,
    url: string
): DiffResult {
    if (oldContent === newContent) {
        return { hasChanges: false, patch: "", addedLines: 0, removedLines: 0 };
    }

    const patch = createTwoFilesPatch(
        `${url} (previous)`,
        `${url} (current)`,
        oldContent,
        newContent,
        undefined,
        undefined,
        { context: 3 }
    );

    let addedLines = 0;
    let removedLines = 0;
    const lines = patch.split("\n");
    for (const line of lines) {
        if (line.startsWith("+") && !line.startsWith("+++")) {
            addedLines++;
        }
        if (line.startsWith("-") && !line.startsWith("---")) {
            removedLines++;
        }
    }

    return { hasChanges: true, patch, addedLines, removedLines };
}
