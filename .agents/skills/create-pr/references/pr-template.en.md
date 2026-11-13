# English PR template

Write the title and body in English. Preserve the repository's title convention when present. Lead with the concrete problem and resulting behavior. Scale detail to the change; omit optional sections that add no useful information. Replace all guidance below with verified facts before submission.

```markdown
## Summary

Describe the problem and the resulting behavior in one or two sentences.

## Changes

- Describe a change that helps a reviewer understand the solution.

## Validation

- State the checks actually run and their results.
- State relevant checks not run and why, when applicable.

## Related issues

Link confirmed related issues. Use a closing keyword only when this PR resolves the issue.

## Screenshots

Include available before/after screenshots for visual changes when useful.

## Risks and follow-up

Describe material limitations, compatibility effects, or follow-up work when applicable.
```

`Summary` and `Validation` form the minimum body unless the repository requires another structure. Keep `Changes` when the summary alone is insufficient. Include the other sections only when relevant. Never claim tests passed without execution evidence or invent issue links or screenshots.
