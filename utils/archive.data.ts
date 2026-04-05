import { spawnSync } from "child_process";
import { existsSync, statSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { createContentLoader } from "vitepress";

const AUTO_SUMMARY_LENGTH = 120;
const PROJECT_ROOT = resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "..",
);

function toTimestamp(value: unknown): number {
  if (typeof value !== "string" || value.trim() === "") {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatDate(timestamp: number): string {
  if (!timestamp) {
    return "Unknown";
  }

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^---[\s\S]*?---\s*/m, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getWordCount(text: string): number {
  if (!text) {
    return 0;
  }

  const cjkCount = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  const nonCjkText = text.replace(/[\u3400-\u9fff]/g, " ");
  const latinWordCount = (
    nonCjkText.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g) ?? []
  ).length;

  return cjkCount + latinWordCount;
}

function normalizeTags(frontmatter: Record<string, unknown>): string[] {
  const rawTags = frontmatter.tags;
  let tags: string[] = [];

  if (Array.isArray(rawTags)) {
    tags = rawTags.map((tag) => String(tag).trim()).filter(Boolean);
  } else if (typeof rawTags === "string") {
    tags = rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  if (tags.length === 0 && typeof frontmatter.category === "string") {
    const category = frontmatter.category.trim();
    if (category) {
      tags = [category];
    }
  }

  return tags;
}

function normalizePin(frontmatter: Record<string, unknown>): {
  isPinned: boolean;
  pinOrder: number;
} {
  const rawPin = frontmatter.pin ?? frontmatter.pinned;

  if (typeof rawPin === "number" && rawPin > 0) {
    return { isPinned: true, pinOrder: rawPin };
  }

  if (rawPin === true) {
    return { isPinned: true, pinOrder: 1 };
  }

  return { isPinned: false, pinOrder: 0 };
}

function postFilePathFromUrl(url: string): string {
  const decodedUrl = decodeURIComponent(url);
  const slug = decodedUrl.replace(/^\/posts\//, "").replace(/\.html$/, "");
  return resolve(PROJECT_ROOT, "posts", `${slug}.md`);
}

function getGitFirstAndLastCommitTime(filePath: string): {
  first: number;
  last: number;
} {
  const result = spawnSync(
    "git",
    ["log", "--follow", "--format=%aI", "--", filePath],
    {
      cwd: PROJECT_ROOT,
      encoding: "utf-8",
    },
  );

  if (result.status !== 0 || !result.stdout) {
    return { first: 0, last: 0 };
  }

  const lines = result.stdout
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { first: 0, last: 0 };
  }

  const last = Date.parse(lines[0]);
  const first = Date.parse(lines[lines.length - 1]);

  return {
    first: Number.isNaN(first) ? 0 : first,
    last: Number.isNaN(last) ? 0 : last,
  };
}

function getFileSystemTimes(filePath: string): {
  created: number;
  updated: number;
} {
  if (!existsSync(filePath)) {
    return { created: 0, updated: 0 };
  }

  const stats = statSync(filePath);
  const created = Number.isNaN(stats.birthtimeMs)
    ? 0
    : Math.floor(stats.birthtimeMs);
  const updated = Number.isNaN(stats.mtimeMs) ? 0 : Math.floor(stats.mtimeMs);

  return {
    created,
    updated,
  };
}

export default createContentLoader("posts/*.md", {
  includeSrc: true,
  excerpt: true,
  transform(rawData) {
    return rawData
      .map((page) => {
        const frontmatter = page.frontmatter as Record<string, unknown>;
        const sourceText = stripMarkdown(page.src ?? "");
        const postFilePath = postFilePathFromUrl(page.url);

        const gitTimes = getGitFirstAndLastCommitTime(postFilePath);
        const fsTimes = getFileSystemTimes(postFilePath);

        const publishedTimestamp =
          toTimestamp(frontmatter.publishedAt ?? frontmatter.date) ||
          gitTimes.first ||
          fsTimes.created ||
          fsTimes.updated;

        const updatedTimestamp =
          toTimestamp(frontmatter.updatedAt ?? frontmatter.lastModified) ||
          fsTimes.updated ||
          gitTimes.last ||
          publishedTimestamp;

        const manualSummary =
          typeof frontmatter.summary === "string"
            ? frontmatter.summary.trim()
            : "";

        const autoSummary = sourceText.slice(0, AUTO_SUMMARY_LENGTH);
        const summary =
          manualSummary ||
          (autoSummary.length < sourceText.length
            ? `${autoSummary}...`
            : autoSummary);

        const { isPinned, pinOrder } = normalizePin(frontmatter);

        return {
          title:
            typeof frontmatter.title === "string" && frontmatter.title.trim()
              ? frontmatter.title.trim()
              : (page.url.split("/").pop()?.replace(".html", "") ?? "Untitled"),
          url: page.url,
          publishedAt: formatDate(publishedTimestamp),
          publishedTimestamp,
          updatedAt: formatDate(updatedTimestamp),
          updatedTimestamp,
          tags: normalizeTags(frontmatter),
          summary,
          wordCount: getWordCount(sourceText),
          isPinned,
          pinOrder,
        };
      })
      .sort((a, b) => {
        if (a.pinOrder !== b.pinOrder) {
          return b.pinOrder - a.pinOrder;
        }
        return b.publishedTimestamp - a.publishedTimestamp;
      });
  },
});
