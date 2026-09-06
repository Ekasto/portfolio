# portfolio

A static website published with GitHub Pages. Everything committed to this repo is
public: the repo has to be public for Pages to serve it on the free plan, so anyone
can read both the live site and the source.

## The planning/ folder

`planning/` is gitignored and never committed. Put in it:

- Planning documents, drafts, notes, and to-do lists
- Anything that should not appear on the website or in the public repo
- Private or unfinished material of any kind

Rules:

- Write planning documents to `planning/`, not to the repo root.
- Never move a file out of `planning/` into a tracked location without asking first.
- Never copy content out of `planning/` into site files without asking first.
- Do not remove `planning/` from `.gitignore` or force-add its contents with `git add -f`.

Because `planning/` is ignored, it is not backed up by git. It lives only on this
machine.
