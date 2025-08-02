# Workflow High Level

I'm trying to establish a workflow that helps solo productivity and prepares for inviting others to join the team.

I want to avoid bloated tools or busy work, so that means using what's available in Github by default -- projects, issues, PRs, branches etc.

I am ready to create the first implementation of a backend, GeminiBackend, so I'll use this as the guinea pig :)

## Step 1: Set Up a GitHub Project Board

Purpose: Use a GitHub Project board to track the GeminiBackend feature and related tasks, ensuring visibility and organization without excessive overhead.

How to Set It Up:

- Create a new project in your Prompt Injectionator repo: Go to the “Projects” tab and select “New Project” (choose the new GitHub Projects, not the legacy “Projects (classic)”).
- Use a Kanban board view with columns: Backlog, To Do, In Progress, Code Review, and Done. This mirrors the development lifecycle for your feature.
- Add a brief project description (e.g., “Tracking development of GeminiBackend and related features for Prompt Injectionator”).
- Link the project to your Prompt Injectionator repo to automatically pull in issues and PRs.


> Best Practice: Keep the board lean. For a solo or small project, avoid adding too many custom fields (e.g., priority, effort) to prevent maintenance overhead.

## Step 2: Create an Issue for GeminiBackend

Purpose: Issues define tasks and provide a central place for discussion and documentation.

How to Create the Issue:

- Go to the “Issues” tab in your repo and click “New Issue.”
- Title: “Add GeminiBackend for testing prompt injections with Gemini LLM.”
- Description: Use a template (if you don’t have one, create a simple one in the repo’s .github/ISSUE_TEMPLATE folder) to include:
- Objective: Implement a backend to integrate Gemini as an LLM for testing prompt injections.
- Tasks:
    - Set up API calls to Gemini (via xAI’s API, see https://x.ai/api for details).
    - Create test cases for prompt injection scenarios.
    - Update README with usage instructions.
    - Add unit tests for GeminiBackend.
- Acceptance Criteria: Define what “done” looks like, e.g., “GeminiBackend successfully processes 10 test prompts and logs results.”
- Labels: Add labels like feature, gemini-backend, priority:medium for categorization.
- Milestone: Create a milestone (e.g., “v0.2.0 - GeminiBackend Integration”) to group this issue with related tasks.

Assign the issue to yourself (or a collaborator) and add it to the To Do column of your project board.

> Best Practice: Break down large features into smaller issues if needed (e.g., separate issues for “API setup,” “test cases,” and “documentation”). For GeminiBackend, one issue may suffice if it’s a focused feature.

## Step 3: Create a Branch for Development

Purpose: Branches isolate feature development, keeping the main branch stable.
How to Create the Branch:

Name the branch descriptively: feature/gemini-backend or gemini-backend-integration.
Create the branch locally:
bashgit checkout -b feature/gemini-backend
Or, if using GitHub’s UI, create it when opening a PR later.
Work on the branch, making small, logical commits:

- Commit 1: “Add Gemini API client setup.”
- Commit 2: “Implement prompt injection test logic.”
- Commit 3: “Add unit tests for GeminiBackend.”
- Commit 4: “Update README with GeminiBackend usage.”

Push the branch to GitHub:
```bash
git push origin feature/gemini-backend
```

> Best Practice: Keep branches focused on one feature or fix to simplify PR reviews. For GeminiBackend, ensure commits are granular to make debugging and reviewing easier.

## Step 4: Open a Pull Request

Purpose: PRs facilitate code review, testing, and merging into the main branch.
How to Create the PR:

- Go to the “Pull Requests” tab and click “New Pull Request,” selecting feature/gemini-backend as the source branch and main as the target.
- Title: “Add GeminiBackend for prompt injection testing.”
- Description: Reference the issue (e.g., “Closes #123”) and summarize changes:
    - Added Gemini API integration.
    - Implemented test cases for prompt injections.
    - Updated documentation and tests.
- Link the PR to the project board (it should auto-add if the board is linked to the repo) and move it to the Code Review column.
- Add reviewers (if collaborating) or self-review for solo projects. Check for:
    - Code quality (e.g., adherence to style guides).
    - Test coverage (e.g., unit tests for GeminiBackend).
    - Documentation updates.

Enable GitHub Actions (if set up) to run tests or linters automatically on the PR.

> Best Practice: Use the PR description to explain how GeminiBackend integrates with the existing codebase and how it handles prompt injections. For example, note if it uses xAI’s API and any specific error handling.

## Step 5: Automate and Monitor the Project Board

Purpose: Automations reduce manual updates, keeping you focused on coding.
How to Set Up Automations:

In the project board, enable built-in automations:

- Move issues to Done when closed.
- Move PRs to In Progress when marked “ready for review.”
- Move PRs to Done when merged.

Use GitHub Actions for additional automation (e.g., assign issues with gemini-backend label to the project board):

```yaml
yamlname: Auto-Assign Issues to Project
on:
  issues:
    types: [labeled]
jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/add-to-project@v0.4.0
        with:
          project-url: https://github.com/users/<your-username>/projects/<project-number>
          github-token: ${{ secrets.GITHUB_TOKEN }}
          labeled: gemini-backend
```

Set up a .github/workflows/ci.yml to run tests on PRs:

```yaml
yamlname: CI
on:
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest tests/
```

> Best Practice: Automate repetitive tasks like moving cards or running tests to avoid “busy work.” For GeminiBackend, ensure tests cover prompt injection scenarios and API edge cases.

## Step 6: Merge and Clean Up

Purpose: Keep the repo and project board clean after completing the feature.

How to Merge and Clean Up:

- Once the PR passes tests and review, merge it into main using a merge commit or squash-and-merge for a cleaner history.
- Delete the feature/gemini-backend branch (GitHub prompts this after merging).
- The linked issue should auto-close (if referenced with “Closes #123”), and the project board will move it to Done.
- Archive completed items in the project board to keep it uncluttered.

> Best Practice: Regularly review the board (e.g., weekly) to archive stale items or re-prioritize tasks. For GeminiBackend, verify the feature works in production (e.g., test it with sample prompts) before archiving.

## Specific Recommendations for GeminiBackend

For the GeminiBackend feature, here’s how to tailor the workflow:

### Issue Breakdown: 

If GeminiBackend is complex, create separate issues for:

- “Set up Gemini API client” (focus on authentication and basic calls to https://x.ai/api).
- “Implement prompt injection test logic” (e.g., craft prompts to test Gemini’s vulnerability to injections).
- “Write unit tests for GeminiBackend” (e.g., mock API responses to test edge cases).
- “Update documentation” (e.g., add a section in the README on how to configure GeminiBackend).

### Branching Strategy: 

Use a single branch (feature/gemini-backend) for simplicity, but if collaborating or working on multiple sub-tasks, consider sub-branches (e.g., feature/gemini-backend-api, feature/gemini-backend-tests) and merge them into the main feature branch before the PR.

### Testing Focus: 

Since GeminiBackend tests prompt injections, ensure your tests cover:

- Valid prompts (e.g., expected Gemini responses).
- Malicious prompts (e.g., attempts to bypass Gemini’s safety mechanisms).
- Error cases (e.g., API rate limits, invalid credentials).
- Use a testing framework Jest and mock Gemini API calls to avoid hitting live endpoints during tests.

### Documentation: 

Update the repo’s README with:

- How to set up GeminiBackend (e.g., API key setup for xAI’s API).
- Example usage (e.g., python -m prompt_injectionator --backend gemini --prompt "malicious input").
- Limitations (e.g., Gemini’s availability via xAI’s API, see https://x.ai/api for details).

### Project Board: 

Add a custom field for “Feature Area” with values like “Backend,” “Testing,” “Docs” to categorize GeminiBackend tasks. This helps filter tasks if your repo grows.

## General Best Practices for Prompt Injectionator

To make GitHub Projects, Issues, PRs, and Branches work seamlessly for your repo:

### Standardize Naming:

- Branches: Use prefixes like feature/, bugfix/, docs/ (e.g., feature/gemini-backend).
- Issues: Use descriptive titles and consistent labels (e.g., feature, bug, gemini-backend).
- PRs: Reference issues (e.g., “Closes #123”) and summarize changes clearly.

### Keep Issues Focused:

Each issue should represent a single, actionable task. For GeminiBackend, avoid lumping API setup and testing into one issue if they’re complex.

### Use Labels Strategically:

- Create labels like gemini-backend, prompt-testing, api-integration to filter issues and PRs on the project board.
- Use color-coded labels for clarity (e.g., green for features, red for bugs).


### Automate Where Possible:

- Use GitHub Actions to auto-assign issues, run tests, or lint code.
- Set up project board automations to move cards based on status changes.

### Maintain a Clean Repo:

- Delete merged branches to avoid clutter.
- Archive completed project board items weekly.
- Use a .gitignore to exclude sensitive files (e.g., API keys for Gemini).

### Showcase for Portfolio:

A well-organized project board, clear issues, and clean PRs for GeminiBackend can impress hiring managers. Ensure your README explains the project’s purpose (e.g., “Prompt Injectionator tests LLM vulnerabilities”) and highlights GeminiBackend as a key feature.

## Avoiding Busy Work
To prevent wasting time on ticket management for Prompt Injectionator:

- Limit Board Complexity: Stick to 4–5 columns (e.g., Backlog, To Do, In Progress, Code Review, Done) and avoid excessive custom fields.
- Batch Updates: Spend 5–10 minutes daily updating the project board instead of tweaking it constantly.
- Automate Repetitive Tasks: Use GitHub Actions to handle issue assignment, PR checks, and board updates.
- Focus on Code: Prioritize writing GeminiBackend code and tests over perfecting the project board’s aesthetics.
- Evaluate Necessity: For a solo project, consider using issues alone (with labels like gemini-backend) instead of a full project board if the feature is straightforward.

## Example Workflow for GeminiBackend

Here’s how the process might look for GeminiBackend:

### Issue Created:

- Title: “Add GeminiBackend for prompt injection testing.”
- Labels: feature, gemini-backend.
- Added to project board’s To Do column.

### Branch Created:

- git checkout -b feature/gemini-backend.
- Code: API client setup, test logic, unit tests, README updates.

### PR Opened:

- Title: “Add GeminiBackend for prompt injection testing.”
- Description: “Implements Gemini API integration, adds test cases, updates README. Closes #123.”
- Moves to Code Review on the project board.

### Tests Run:

GitHub Action runs Jest to validate GeminiBackend functionality.

### Merge and Cleanup:

- Merge PR, delete branch, issue auto-closes, card moves to Done.
- Archive the card after verification.

## Potential Challenges and Solutions

Challenge: Overwhelmed by issue management for GeminiBackend.

Solution: Break the feature into smaller issues (e.g., API setup, testing, docs) and tackle one at a time.


Challenge: Gemini API integration fails due to rate limits or errors.

Solution: Mock API responses in tests (e.g., using unittest.mock) and document error handling in the README.


Challenge: Project board becomes cluttered.

Solution: Archive completed items weekly and limit active tasks to 5–10 to maintain focus.