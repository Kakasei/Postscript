import { spawnSync } from "child_process";
import { existsSync, statSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { createContentLoader } from "vitepress";

const AUTO_SUMMARY_LENGTH = 120;
const POSTS_GLOB = "posts/**/*.md";
const PROJECT_ROOT = resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "..",
);

type Frontmatter = Record<string, unknown>;

type GitTimes = {
  first: number;
  last: number;
};

type FileSystemTimes = {
  created: number;
  updated: number;
};

export type ArchivePost = {
  title: string;
  url: string;
  publishedAt: string;
  publishedTimestamp: number;
  updatedAt: string;
  updatedTimestamp: number;
  tags: string[];
  summary: string;
  wordCount: number;
  isPinned: boolean;
  pinOrder: number;
};

// 为 `import { data } from "./archive.data.ts"` 提供类型信息（仅类型声明，不会产生运行时代码）。
declare const data: ArchivePost[];
export { data };

// 将 frontmatter 中可能出现的时间值统一转换为时间戳。
// 无效或缺失时返回 0，便于后续使用 || 进行回退。
function toTimestamp(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

// 统一归档页日期展示格式：YYYY-MM-DD
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

// 将 markdown 清洗为纯文本，用于自动摘要和字数统计。
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

// 将 HTML 摘录转换为纯文本。
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// 中英文混排的简易字数统计：
// - 中文按字计数
// - 英文按单词计数
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

// 兼容 tags 的两种写法：数组 / 逗号分隔字符串。
function normalizeTags(frontmatter: Frontmatter): string[] {
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
  
  return tags;
}

// 置顶字段支持：
// - pin: 数字（>0，数值越大优先级越高）
// - pin: true（默认优先级 1）
function normalizePin(frontmatter: Frontmatter): {
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

// 标题优先使用 frontmatter.title，不存在时退化为文件名。
function resolveTitle(frontmatter: Frontmatter, url: string): string {
  if (typeof frontmatter.title === "string" && frontmatter.title.trim()) {
    return frontmatter.title.trim();
  }

  return url.split("/").pop()?.replace(".html", "") ?? "Untitled";
}

// 摘要优先级：
// 1) frontmatter.summary（手写摘要）
// 2) page.excerpt（通过 createContentLoader 的 excerpt 提取）
// 3) 自动截取正文前 N 个字符
function resolveSummary(
  frontmatter: Frontmatter,
  sourceText: string,
  excerpt?: string,
): string {
  const manualSummary =
    typeof frontmatter.summary === "string" ? frontmatter.summary.trim() : "";

  if (manualSummary) {
    return manualSummary;
  }

  const excerptSummary = excerpt ? stripMarkdown(stripHtml(excerpt)) : "";

  if (excerptSummary) {
    return excerptSummary;
  }

  const autoSummary = sourceText.slice(0, AUTO_SUMMARY_LENGTH);
  if (!autoSummary) {
    return "";
  }

  return autoSummary.length < sourceText.length
    ? `${autoSummary}...`
    : autoSummary;
}

/** 
 * 
发布时间优先级：
frontmatter -> git 首次提交时间 -> 文件创建时间 -> 文件修改时间
*/
function resolvePublishedTimestamp(
  frontmatter: Frontmatter,
  gitTimes: GitTimes,
  fsTimes: FileSystemTimes,
): number {
  return (
    toTimestamp(frontmatter.publishedAt ?? frontmatter.date) ||
    gitTimes.first ||
    fsTimes.created ||
    fsTimes.updated
  );
}

// 更新时间优先级：
// frontmatter -> 文件修改时间 -> git 最后提交时间 -> 发布时间
function resolveUpdatedTimestamp(
  frontmatter: Frontmatter,
  gitTimes: GitTimes,
  fsTimes: FileSystemTimes,
  publishedTimestamp: number,
): number {
  return (
    toTimestamp(frontmatter.updatedAt ?? frontmatter.lastModified) ||
    fsTimes.updated ||
    gitTimes.last ||
    publishedTimestamp
  );
}

// 根据页面 URL 反推出 markdown 源文件路径。
function postFilePathFromUrl(url: string): string {
  const decodedUrl = decodeURIComponent(url);
  const slug = decodedUrl.replace(/^\/posts\//, "").replace(/\.html$/, "");
  return resolve(PROJECT_ROOT, "posts", `${slug}.md`);
}

// 读取单篇文章的 git 历史：
// - first: 最早一次提交时间
// - last: 最新一次提交时间
// 若 git 不可用或无历史，返回 0。
function getGitFirstAndLastCommitTime(filePath: string): GitTimes {
  const result = spawnSync(
    "git",
    ["log", "--follow", "--format=%aI", "--", filePath],
    {
      cwd: PROJECT_ROOT,
      encoding: "utf-8",
    },
  );

  if (result.error || result.status !== 0 || !result.stdout) {
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

// 读取文件系统时间，作为 git/frontmatter 缺失时的兜底。
function getFileSystemTimes(filePath: string): FileSystemTimes {
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

export default createContentLoader<ArchivePost[]>(POSTS_GLOB, {
  // 需要 src 用于自动摘要和字数统计。
  includeSrc: true,
  // 支持在文章正文中通过 `<!-- more -->` 手动截断摘要。
  excerpt: "<!-- more -->",
  transform(rawData) {
    return (
      rawData
        .map((page) => {
          const frontmatter = page.frontmatter as Frontmatter;
          const sourceText = stripMarkdown(page.src ?? "");
          const postFilePath = postFilePathFromUrl(page.url);

          const gitTimes = getGitFirstAndLastCommitTime(postFilePath);
          const fsTimes = getFileSystemTimes(postFilePath);

          const publishedTimestamp = resolvePublishedTimestamp(
            frontmatter,
            gitTimes,
            fsTimes,
          );

          const updatedTimestamp = resolveUpdatedTimestamp(
            frontmatter,
            gitTimes,
            fsTimes,
            publishedTimestamp,
          );

          const { isPinned, pinOrder } = normalizePin(frontmatter);

          return {
            title: resolveTitle(frontmatter, page.url),
            url: page.url,
            publishedAt: formatDate(publishedTimestamp),
            publishedTimestamp,
            updatedAt: formatDate(updatedTimestamp),
            updatedTimestamp,
            tags: normalizeTags(frontmatter),
            summary: resolveSummary(frontmatter, sourceText, page.excerpt),
            wordCount: getWordCount(sourceText),
            isPinned,
            pinOrder,
          };
        })
        // 先按置顶优先级排序，再按发布时间倒序。
        .sort((a, b) => {
          if (a.pinOrder !== b.pinOrder) {
            return b.pinOrder - a.pinOrder;
          }
          return b.publishedTimestamp - a.publishedTimestamp;
        })
    );
  },
});
