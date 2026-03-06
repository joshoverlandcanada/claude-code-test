"use client";
import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function getFileName(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? path;
}

function getFriendlyMessage(toolName: string, args: Record<string, unknown>): string {
  const path = args?.path as string | undefined;
  const filename = path ? getFileName(path) : "";

  if (toolName === "str_replace_editor") {
    switch (args?.command) {
      case "create":      return `Creating ${filename}`;
      case "str_replace": return `Editing ${filename}`;
      case "insert":      return `Editing ${filename}`;
      case "undo_edit":   return `Undoing edit in ${filename}`;
      case "view":        return `Viewing ${filename}`;
      default:            return filename ? `Working on ${filename}` : toolName;
    }
  }

  if (toolName === "file_manager") {
    switch (args?.command) {
      case "rename": {
        const newFilename = args.new_path ? getFileName(args.new_path as string) : "";
        return `Renaming ${filename} to ${newFilename}`;
      }
      case "delete": return `Deleting ${filename}`;
      default:       return filename ? `Managing ${filename}` : toolName;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const isComplete = toolInvocation.state === "result" && toolInvocation.result;
  const message = getFriendlyMessage(toolInvocation.toolName, toolInvocation.args ?? {});

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{message}</span>
    </div>
  );
}
