/// <reference types="npm:@types/chrome" />

import { focusSearchBox } from "./features/focusSearchBox.ts";

chrome.commands.onCommand.addListener(async (command: string) => {
  if (command === "focus_search") {
    await focusSearchBox();
  }
});
