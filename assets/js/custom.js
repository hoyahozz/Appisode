/*
  Theme-safe customization entrypoint for site-wide JS.
  Loaded via params.additionalScripts in hugo.toml.
*/
(() => {
  const LANGUAGE_LABELS = {
    c: "C",
    "c++": "C++",
    cc: "C++",
    cpp: "C++",
    cxx: "C++",
    csharp: "C#",
    cs: "C#",
    dart: "Dart",
    html: "HTML",
    js: "JavaScript",
    jsx: "JSX",
    kotlin: "Kotlin",
    md: "Markdown",
    objc: "Objective-C",
    objcpp: "Objective-C++",
    py: "Python",
    rb: "Ruby",
    rs: "Rust",
    sh: "Shell",
    swift: "Swift",
    ts: "TypeScript",
    tsx: "TSX",
    yml: "YAML",
  };

  const GLOBAL_TYPE_TOKENS = [
    "Any",
    "AnyObject",
    "Array",
    "Bool",
    "Boolean",
    "byte",
    "Byte",
    "bool",
    "char",
    "Char",
    "Character",
    "Date",
    "Decimal",
    "double",
    "Double",
    "dynamic",
    "float",
    "Float",
    "Future",
    "int",
    "Int",
    "Int8",
    "Int16",
    "Int32",
    "Int64",
    "List",
    "long",
    "Long",
    "Map",
    "Never",
    "Nothing",
    "num",
    "Number",
    "Object",
    "Optional",
    "Set",
    "short",
    "Short",
    "str",
    "String",
    "UByte",
    "UInt",
    "UInt8",
    "UInt16",
    "UInt32",
    "UInt64",
    "ULong",
    "UShort",
    "Unit",
    "UUID",
    "URL",
    "Vec",
    "void",
    "Void",
  ];
  const BUILTIN_TYPE_TOKENS = new Set([
    "Any",
    "AnyObject",
    "Bool",
    "Boolean",
    "byte",
    "Byte",
    "bool",
    "char",
    "Char",
    "Character",
    "Decimal",
    "double",
    "Double",
    "dynamic",
    "float",
    "Float",
    "int",
    "Int",
    "Int8",
    "Int16",
    "Int32",
    "Int64",
    "long",
    "Long",
    "Never",
    "Nothing",
    "num",
    "Number",
    "Object",
    "Optional",
    "short",
    "Short",
    "str",
    "String",
    "UByte",
    "UInt",
    "UInt8",
    "UInt16",
    "UInt32",
    "UInt64",
    "ULong",
    "UShort",
    "Unit",
    "void",
    "Void",
  ]);

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const TYPE_TOKEN_PATTERN = new RegExp(
    `\\b(?:${GLOBAL_TYPE_TOKENS.map(escapeRegExp).join("|")}|[A-Z][a-z][A-Za-z0-9_]*)\\b`,
    "g",
  );
  const DESKTOP_VIEWPORT_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
  const isDesktopViewport = () => window.matchMedia(DESKTOP_VIEWPORT_QUERY).matches;

  const toLanguageLabel = (value) => {
    const normalized = value.trim().toLowerCase();
    if (LANGUAGE_LABELS[normalized]) {
      return LANGUAGE_LABELS[normalized];
    }

    return normalized
      .split(/[-_]/)
      .filter((segment) => segment.length > 0)
      .map((segment) => segment[0].toUpperCase() + segment.slice(1))
      .join(" ");
  };

  const getLanguage = (codeElement) => {
    const dataLang = codeElement.getAttribute("data-lang");
    if (dataLang && dataLang.trim().length > 0) {
      return toLanguageLabel(dataLang);
    }

    const langClass = Array.from(codeElement.classList).find((className) =>
      className.startsWith("language-"),
    );
    if (!langClass) {
      return "Text";
    }

    const normalized = langClass.replace("language-", "").trim();
    if (normalized.length === 0) {
      return "Text";
    }

    return toLanguageLabel(normalized);
  };

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";

    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  };

  const buildToolbar = (language) => {
    const toolbar = document.createElement("div");
    toolbar.className = "code-toolbar";

    const langLabel = document.createElement("span");
    langLabel.className = "code-lang";
    langLabel.textContent = language;

    const copyButton = document.createElement("button");
    copyButton.className = "code-copy-button";
    copyButton.type = "button";
    copyButton.setAttribute("aria-label", "Copy code");
    copyButton.setAttribute("title", "Copy code");
    copyButton.innerHTML = `
      <span class="sr-only">Copy</span>
      <svg class="icon-copy" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="9" y="9" width="10" height="10" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="1.8"></rect>
        <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
      </svg>
      <svg class="icon-check" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;

    toolbar.appendChild(langLabel);
    toolbar.appendChild(copyButton);

    return { toolbar, copyButton };
  };

  const buildHeadingCopyButton = (headingId) => {
    const button = document.createElement("button");
    button.className = "heading-copy-button";
    button.type = "button";
    button.setAttribute("aria-label", "Copy heading link");
    button.setAttribute("title", "Copy heading link");
    button.innerHTML = `
      <span class="sr-only">Copy heading link</span>
      <svg class="icon-link" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M10.6 13.4a3 3 0 0 0 4.2 0l3.1-3.1a3 3 0 0 0-4.2-4.2l-1.2 1.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M13.4 10.6a3 3 0 0 0-4.2 0l-3.1 3.1a3 3 0 1 0 4.2 4.2l1.2-1.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      <svg class="icon-check" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        const url = new URL(window.location.href);
        url.hash = headingId;
        await copyToClipboard(url.toString());

        button.classList.add("is-copied");
        button.setAttribute("aria-label", "Link copied");
        button.setAttribute("title", "Link copied");

        window.setTimeout(() => {
          button.classList.remove("is-copied");
          button.setAttribute("aria-label", "Copy heading link");
          button.setAttribute("title", "Copy heading link");
        }, 1400);
      } catch (error) {
        button.classList.add("is-copy-failed");
        button.setAttribute("aria-label", "Copy failed");
        button.setAttribute("title", "Copy failed");

        window.setTimeout(() => {
          button.classList.remove("is-copy-failed");
          button.setAttribute("aria-label", "Copy heading link");
          button.setAttribute("title", "Copy heading link");
        }, 1400);
      }
    });

    return button;
  };

  const ensureHighlightContainer = (preElement) => {
    const existingContainer = preElement.closest(".highlight");
    if (existingContainer) {
      return existingContainer;
    }

    const container = document.createElement("div");
    container.className = "highlight";
    preElement.parentNode.insertBefore(container, preElement);
    container.appendChild(preElement);
    return container;
  };

  const enhanceSplitAnnotationTokens = (codeElement) => {
    if (!codeElement) {
      return;
    }

    codeElement.querySelectorAll(".token.punctuation").forEach((punctuationToken) => {
      if ((punctuationToken.textContent ?? "").trim() !== "@") {
        return;
      }

      let next = punctuationToken.nextSibling;
      while (next && next.nodeType === Node.TEXT_NODE && (next.textContent ?? "").trim() === "") {
        next = next.nextSibling;
      }

      if (!(next instanceof HTMLElement) || !next.classList.contains("token")) {
        return;
      }

      punctuationToken.classList.add("token-annotation");
      next.classList.add("token-annotation");
    });
  };

  const enhanceTypeTokens = (codeElement) => {
    if (!codeElement) {
      return;
    }

    const typePattern = new RegExp(TYPE_TOKEN_PATTERN.source, "g");
    const walker = document.createTreeWalker(codeElement, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node || !node.parentElement) {
        continue;
      }

      const tokenParent = node.parentElement.closest(".token");
      if (tokenParent) {
        const skipTokenClasses = [
          "comment",
          "prolog",
          "doctype",
          "cdata",
          "string",
          "char",
          "regex",
          "class-name",
          "token-data-type",
          "builtin-type",
          "token-builtin-type",
          "annotation",
          "token-annotation",
        ];

        const shouldSkip = skipTokenClasses.some((className) =>
          tokenParent.classList.contains(className),
        );
        if (shouldSkip) {
          continue;
        }
      }

      if (!typePattern.test(node.nodeValue ?? "")) {
        typePattern.lastIndex = 0;
        continue;
      }

      typePattern.lastIndex = 0;
      textNodes.push(node);
    }

    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue ?? "";
      if (text.length === 0) {
        return;
      }

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match = typePattern.exec(text);

      while (match) {
        const start = match.index;
        const end = start + match[0].length;
        const prevChar = start > 0 ? text[start - 1] : "";

        if (prevChar === "@") {
          if (start - 1 > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, start - 1)));
          }

          const annotationSpan = document.createElement("span");
          annotationSpan.className = "token annotation token-annotation";
          annotationSpan.textContent = `@${match[0]}`;
          fragment.appendChild(annotationSpan);
        } else {
          if (start > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, start)));
          }

          const tokenSpan = document.createElement("span");
          if (BUILTIN_TYPE_TOKENS.has(match[0])) {
            tokenSpan.className = "token builtin-type token-builtin-type";
          } else {
            tokenSpan.className = "token class-name token-data-type";
          }
          tokenSpan.textContent = match[0];
          fragment.appendChild(tokenSpan);
        }

        lastIndex = end;
        match = typePattern.exec(text);
      }

      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      typePattern.lastIndex = 0;
      textNode.parentNode.replaceChild(fragment, textNode);
    });
  };

  const runTypeEnhancementSweep = () => {
    document.querySelectorAll("pre code").forEach((codeElement) => {
      enhanceTypeTokens(codeElement);
      enhanceSplitAnnotationTokens(codeElement);
    });
  };

  const initHeadingCopyButtons = () => {
    if (!isDesktopViewport()) {
      return;
    }

    const headings = document.querySelectorAll(
      ".page-content h1[id], .page-content h2[id], .page-content h3[id], .page-content h4[id], .page-content h5[id], .page-content h6[id]",
    );

    headings.forEach((heading) => {
      if (heading.dataset.headingCopyEnhanced === "true") {
        return;
      }

      const button = buildHeadingCopyButton(heading.id);
      heading.classList.add("heading-copy-target");
      heading.appendChild(button);
      heading.dataset.headingCopyEnhanced = "true";
    });
  };

  const initFloatingToc = () => {
    if (document.querySelector(".floating-toc")) {
      return;
    }

    const article = document.querySelector(".wrapper.post article");
    const sourceToc = document.querySelector(".wrapper.post details.toc nav");
    if (!(article instanceof HTMLElement) || !(sourceToc instanceof HTMLElement)) {
      return;
    }

    const floatingToc = document.createElement("aside");
    floatingToc.className = "floating-toc";
    floatingToc.setAttribute("aria-label", "On this page");

    const tocNav = sourceToc.cloneNode(true);
    if (!(tocNav instanceof HTMLElement)) {
      return;
    }
    tocNav.removeAttribute("id");
    tocNav.classList.add("floating-toc-nav");
    floatingToc.appendChild(tocNav);
    document.body.appendChild(floatingToc);

    const tocLinks = Array.from(tocNav.querySelectorAll("a[href^='#']"));
    if (tocLinks.length === 0) {
      floatingToc.remove();
      return;
    }

    const linkByHeadingId = new Map();
    tocLinks.forEach((linkElement) => {
      if (!(linkElement instanceof HTMLAnchorElement)) {
        return;
      }

      const hash = linkElement.getAttribute("href");
      if (!hash) {
        return;
      }

      const rawId = hash.slice(1);
      const decodedId = decodeURIComponent(rawId);
      const heading =
        document.getElementById(decodedId) ||
        document.getElementById(rawId) ||
        document.getElementById(decodedId.toLowerCase());
      if (!heading) {
        return;
      }

      linkElement.classList.add("floating-toc-link");
      linkElement.dataset.targetId = heading.id;
      linkByHeadingId.set(heading.id, linkElement);
    });

    const headings = Array.from(
      new Set(
        Array.from(linkByHeadingId.keys())
          .map((headingId) => document.getElementById(headingId))
          .filter((headingElement) => headingElement instanceof HTMLElement),
      ),
    );

    if (headings.length === 0) {
      floatingToc.remove();
      return;
    }

    const sortedHeadings = headings.sort((leftHeading, rightHeading) => {
      const leftTop = leftHeading.getBoundingClientRect().top + window.scrollY;
      const rightTop = rightHeading.getBoundingClientRect().top + window.scrollY;
      return leftTop - rightTop;
    });

    let activeHeadingId = "";
    const setActiveHeading = (headingId) => {
      if (activeHeadingId === headingId) {
        return;
      }

      const previousLink = linkByHeadingId.get(activeHeadingId);
      if (previousLink) {
        previousLink.classList.remove("is-active");
      }

      activeHeadingId = headingId;
      const activeLink = linkByHeadingId.get(headingId);
      if (activeLink) {
        activeLink.classList.add("is-active");
      }
    };

    const findActiveHeadingId = () => {
      const activationOffset = 128;
      let currentId = sortedHeadings[0].id;

      sortedHeadings.forEach((headingElement) => {
        const top = headingElement.getBoundingClientRect().top;
        if (top <= activationOffset) {
          currentId = headingElement.id;
        }
      });

      const atPageBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atPageBottom) {
        return sortedHeadings[sortedHeadings.length - 1].id;
      }

      return currentId;
    };

    let isTicking = false;
    const syncTocState = () => {
      setActiveHeading(findActiveHeadingId());
      isTicking = false;
    };

    const onViewportChange = () => {
      if (isTicking) {
        return;
      }

      isTicking = true;
      window.requestAnimationFrame(syncTocState);
    };

    tocLinks.forEach((linkElement) => {
      if (!(linkElement instanceof HTMLAnchorElement)) {
        return;
      }

      linkElement.addEventListener("click", () => {
        const targetId = linkElement.dataset.targetId;
        if (!targetId) {
          return;
        }

        window.setTimeout(() => {
          setActiveHeading(targetId);
        }, 60);
      });
    });

    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange, { passive: true });
    syncTocState();
  };

  const initContextualPostNavigation = () => {
    const switcher = document.querySelector("[data-post-nav-switcher]");
    if (!(switcher instanceof HTMLElement)) {
      return;
    }

    const postsNav = switcher.querySelector("[data-post-nav-scope='posts']");
    const seriesNav = switcher.querySelector("[data-post-nav-scope='series']");
    if (!(postsNav instanceof HTMLElement) || !(seriesNav instanceof HTMLElement)) {
      return;
    }

    const currentUrl = new URL(window.location.href);
    const explicitMode = currentUrl.searchParams.get("nav");
    const useSeriesNavigation = explicitMode === "series";

    postsNav.hidden = useSeriesNavigation;
    seriesNav.hidden = !useSeriesNavigation;
  };

  const initStickyHeaderState = () => {
    const navbar = document.querySelector(".navbar");
    if (!(navbar instanceof HTMLElement)) {
      return;
    }

    let ticking = false;
    const syncHeaderState = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 1);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(syncHeaderState);
    };

    syncHeaderState();
    window.addEventListener("scroll", onScroll, { passive: true });
  };

  const initPrism = () => {
    if (!window.Prism || typeof window.Prism.highlightAllUnder !== "function") {
      return;
    }

    document.querySelectorAll("pre code").forEach((codeElement) => {
      const langClass = Array.from(codeElement.classList).find((className) =>
        className.startsWith("language-"),
      );
      if (!langClass) {
        return;
      }

      const normalizedClass = `language-${langClass.replace("language-", "").toLowerCase()}`;
      if (normalizedClass === langClass) {
        return;
      }

      codeElement.classList.remove(langClass);
      codeElement.classList.add(normalizedClass);
    });

    const autoloader = window.Prism.plugins && window.Prism.plugins.autoloader;
    if (autoloader) {
      autoloader.languages_path = "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/";
    }

    if (window.Prism.hooks && typeof window.Prism.hooks.add === "function") {
      window.Prism.hooks.add("complete", (env) => {
        if (!env || !env.element || env.element.tagName !== "CODE") {
          return;
        }

        enhanceTypeTokens(env.element);
        enhanceSplitAnnotationTokens(env.element);
        window.setTimeout(() => enhanceTypeTokens(env.element), 80);
        window.setTimeout(() => enhanceSplitAnnotationTokens(env.element), 80);
      });
    }

    window.Prism.highlightAllUnder(document);
    runTypeEnhancementSweep();
    window.setTimeout(runTypeEnhancementSweep, 120);
    window.setTimeout(runTypeEnhancementSweep, 320);
    window.setTimeout(runTypeEnhancementSweep, 800);
  };

  const initCodeBlocks = () => {
    const codeNodes = document.querySelectorAll("pre code");
    codeNodes.forEach((code) => {
      const pre = code.closest("pre");
      if (!pre) {
        return;
      }

      const block = ensureHighlightContainer(pre);
      if (!block || block.dataset.codeEnhanced === "true") {
        return;
      }

      const language = getLanguage(code);
      const codeText = code.textContent ?? "";
      const { toolbar, copyButton } = buildToolbar(language);

      copyButton.addEventListener("click", async () => {
        try {
          await copyToClipboard(codeText.replace(/\n$/, ""));

          copyButton.classList.add("is-copied");
          copyButton.setAttribute("aria-label", "Copied");
          copyButton.setAttribute("title", "Copied");

          window.setTimeout(() => {
            copyButton.classList.remove("is-copied");
            copyButton.setAttribute("aria-label", "Copy code");
            copyButton.setAttribute("title", "Copy code");
          }, 1400);
        } catch (error) {
          copyButton.classList.add("is-copy-failed");
          copyButton.setAttribute("aria-label", "Copy failed");
          copyButton.setAttribute("title", "Copy failed");

          window.setTimeout(() => {
            copyButton.classList.remove("is-copy-failed");
            copyButton.setAttribute("aria-label", "Copy code");
            copyButton.setAttribute("title", "Copy code");
          }, 1400);
        }
      });

      block.classList.add("code-enhanced");
      block.insertBefore(toolbar, pre);
      block.dataset.codeEnhanced = "true";
    });
  };

  const init = () => {
    initStickyHeaderState();
    initPrism();
    initCodeBlocks();
    initHeadingCopyButtons();
    initFloatingToc();
    initContextualPostNavigation();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
    return;
  }

  init();
})();
