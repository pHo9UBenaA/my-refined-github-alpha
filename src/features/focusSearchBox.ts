/// <reference types="@types/chrome" />

// 値を参照してしまうと`not defined`になってしまうため取り急ぎ型情報のみ
import { type ElementIds } from "../constants/focusSearchBox.ts";

type SearchBoxIdPattern = {
  matcher: (url: URL) => boolean;
  id: (typeof ElementIds)[keyof typeof ElementIds];
};

const focus = (urlString: string): void => {
  // MEMO: スコープ外で定義すると`not defined`になってしまう
  const searchBoxIdPattern: SearchBoxIdPattern[] = [
    {
      // <author>/<repository>/issues
      matcher: (url) => url.pathname.endsWith("/issues"),
      id: "repository-input",
    },
    {
      // <author>/<repository>/pulls
      matcher: (url) => url.pathname.endsWith("/pulls"),
      id: "js-issues-search",
    },
    {
      // <author>/<repository>/projects
      matcher: (url) => url.pathname.endsWith("/projects"),
      id: "project-search-input",
    },
  ];

  // MEMO: スコープ外で定義すると`not defined`になってしまう
  const findSearchBoxId = (urlString: string): string | undefined => {
    const searchBoxId = searchBoxIdPattern
      .find((pattern) => pattern.matcher(new URL(urlString)))?.id;

    return searchBoxId;
  };

  const searchBoxId = findSearchBoxId(urlString);
  if (!searchBoxId) {
    return;
  }

  const searchBox = document.getElementById(searchBoxId);
  searchBox?.focus();
};

const focusSearchBox = async (): Promise<void> => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab?.id || !tab?.url) {
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: focus,
    args: [tab.url],
  });
};

export { focusSearchBox, focus as __test__focus };
