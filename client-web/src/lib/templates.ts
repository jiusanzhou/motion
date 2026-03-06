export interface DocTemplate {
  id: string;
  name: string;
  description: string;
  generate: () => string;
}

function formatDate(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export const templates: DocTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Empty document",
    generate: () => "",
  },
  {
    id: "daily",
    name: "Daily Note",
    description: "Daily journal entry",
    generate: () => {
      const date = formatDate();
      return `---
title: "${date}"
tags: ["daily"]
---
# ${date}

## Tasks
- [ ]

## Notes

## Reflection

`;
    },
  },
  {
    id: "meeting",
    name: "Meeting Notes",
    description: "Meeting notes template",
    generate: () => {
      const date = formatDate();
      return `---
title: "Meeting Notes - ${date}"
tags: ["meeting"]
---
# Meeting Notes

**Date:** ${date}
**Attendees:**

## Agenda

1.

## Discussion

## Action Items

- [ ]

## Next Steps

`;
    },
  },
  {
    id: "project",
    name: "Project Doc",
    description: "Project documentation",
    generate: () => {
      return `---
title: "Project Name"
tags: ["project"]
summary: ""
---
# Project Name

## Overview

## Goals

## Architecture

## Tasks

- [ ]

## Timeline

## References

`;
    },
  },
];
