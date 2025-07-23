/// <reference types="@types/chrome" />

// 値を参照してしまうと`not defined`になってしまうため取り急ぎ型情報のみ
import {
  type ClassNames,
  type ElementIds,
} from "../constants/focusSearchBox.ts";

type SearchBoxIdPattern = {
  matcher: (url: URL) => boolean;
  id: (typeof ElementIds)[keyof typeof ElementIds];
};

type SearchBoxClassPattern = {
  matcher: (url: URL) => boolean;
  className: (typeof ClassNames)[keyof typeof ClassNames];
};

const focus = (urlString: string): void => {
  // MEMO: スコープ外で定義すると`not defined`になってしまう
  const isOrgPath = (pathname: string) => pathname.includes("/orgs/");

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
    {
      // <author>?tab=repositories
      matcher: (url) => url.searchParams.get("tab") === "repositories",
      id: "your-repos-filter",
    },
    {
      // <author>?tab=projects
      matcher: (url) => url.searchParams.get("tab") === "projects",
      id: "project-search-input",
    },
    {
      // <author>?tab=stars
      matcher: (url) => url.searchParams.get("tab") === "stars",
      id: "q",
    },
    {
      // orgs/<org>/repositories
      matcher: (url) =>
        isOrgPath(url.pathname) && url.pathname.endsWith("/repositories"),
      id: "repos-list-filter-input",
    },
    {
      // orgs/<org>/security/overview
      matcher: (url) =>
        isOrgPath(url.pathname) && url.pathname.endsWith("/security/overview"),
      id: "security-overview-page-filter-input",
    },
  ];

  const searchBoxClassPattern: SearchBoxClassPattern[] = [
    {
      // orgs/<org>/teams
      matcher: (url) =>
        isOrgPath(url.pathname) && url.pathname.endsWith("/teams"),
      className: "subnav-search-input",
    },
    {
      // orgs/<org>/people
      matcher: (url) =>
        isOrgPath(url.pathname) && url.pathname.endsWith("/people"),
      className: "subnav-search-input",
    },
    {
      // orgs/<org>/insights/dependencies
      matcher: (url) =>
        isOrgPath(url.pathname) &&
        url.pathname.endsWith("/insights/dependencies"),
      className: "subnav-search-input",
    },
  ];

  // MEMO: スコープ外で定義すると`not defined`になってしまう
  const findSearchBoxId = (urlString: string): string | undefined => {
    const searchBoxId = searchBoxIdPattern
      .find((pattern) => pattern.matcher(new URL(urlString)))?.id;

    return searchBoxId;
  };

  const findSearchBoxClass = (urlString: string): string | undefined => {
    const searchBoxClass = searchBoxClassPattern
      .find((pattern) => pattern.matcher(new URL(urlString)))?.className;

    return searchBoxClass;
  };

  const searchBoxId = findSearchBoxId(urlString);
  if (searchBoxId) {
    const searchBox = document.getElementById(searchBoxId);
    searchBox?.focus();
    return;
  }

  const searchBoxClass = findSearchBoxClass(urlString);
  if (searchBoxClass) {
    const searchBox = document.querySelector<HTMLInputElement>(
      `.${searchBoxClass}`,
    );
    searchBox?.focus();
    return;
  }
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

export { focus as __test__focus, focusSearchBox };
