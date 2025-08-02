# Workflow with WARP

## 1. Issue Management

# View issue details
gh issue view 1  # View MCP Integration issue

# Create new issues with templates
gh issue create --title "Feature: Add new attack vector" --body "Description..."

# Add labels and assign
gh issue edit 1 --add-label "enhancement" --assignee viewyonder

# Close completed issues
gh issue close 1 --comment "Completed MCP integration"

## 2. Project Board Management

# View project details
gh project view 3

# Add issues to project
gh project item-add 3 --url https://github.com/viewyonder/prompt-injectionator/issues/1

# Move items between columns
gh project item-edit --id <item-id> --field-id <field-id> --single-select-option-id <option-id>

## 3. Development Workflow Integration

# Create branch for issue
git checkout -b feature/mcp-integration
gh issue develop 1 --checkout  # Links branch to issue

# Create PR when ready
gh pr create --title "Implement MCP Integration" --body "Closes #1"

# Review PRs
gh pr list
gh pr view 1
gh pr review 1 --approve

## 4. Quick Status Checks

# See what's assigned to you
gh issue list --assignee @me

# Check PR status
gh pr status

# View project status
gh project view 3

## Recommended Organization

Use Labels for Categorization:
•  enhancement - New features
•  bug - Bug fixes  
•  integration - External integrations
•  priority:high/medium/low

2. Milestone Planning:
```bash
   gh milestone create "v1.0 Release" --due-date 2025-03-01
   gh issue edit 1 --milestone "v1.0 Release"
```

3. Templates for Consistency:
•  Issue templates for bugs/features
•  PR templates with checklists
