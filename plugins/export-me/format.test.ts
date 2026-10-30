import { expect, test } from "bun:test"
import { body, markdown, safeTitle, stamp } from "./format"

const info = {
  id: "ses_test",
  title: "Dec 3rd 14:05",
  model: { providerID: "deepseek", id: "deepseek-flash" },
  location: { directory: "/Users/re4388" },
  time: { created: new Date(2026, 11, 3, 14, 5, 12).getTime() },
}

test("stamp is MMDDHHmmss", () => {
  expect(stamp(info.time.created)).toBe("1203140512")
})

test("safeTitle strips unsafe chars and falls back", () => {
  expect(safeTitle("a/b  c")).toBe("ab_c")
  expect(safeTitle("   ")).toBe("untitled")
})

test("body keeps user and assistant text only", () => {
  const messages = [
    {
      type: "user",
      text: "hello",
      files: [{ mime: "image/png" }],
    },
    {
      type: "assistant",
      content: [
        { type: "reasoning", text: "SECRET_THINKING" },
        { type: "tool", text: "SECRET_TOOL" },
        { type: "text", text: "hi there" },
      ],
    },
  ]
  const text = body(messages as never)
  expect(text).toContain("## User\n\nhello\n\n[image]")
  expect(text).toContain("## Assistant\n\nhi there")
  expect(text).not.toContain("SECRET")
})

test("markdown has metadata header", () => {
  const text = markdown(info, [{ type: "user", text: "hello" }] as never)
  expect(text).toContain("# Dec 3rd 14:05")
  expect(text).toContain("- session: ses_test")
  expect(text).toContain("- model: deepseek/deepseek-flash")
  expect(text).toContain("- created: 2026-12-03 14:05")
})
