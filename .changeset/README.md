# Changesets

This repo uses [Changesets](https://github.com/changesets/changesets) to manage versions, changelogs and npm releases.

When a pull request changes something that should be released, run `pnpm changeset` and commit the generated markdown file. Merging changesets to `main` makes the `Release` workflow open or update a "Version Packages" pull request; merging that pull request publishes to npm with [trusted publishing](https://docs.npmjs.com/trusted-publishers).
