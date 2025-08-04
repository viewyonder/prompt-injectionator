# Website Redesign Plan

## Objective

Redesign the GitHub Pages site for Prompt Injectionator using Astro, Tailwind CSS, and shadcn/ui.

## Goals
- Create modern, professional UI.
- Ensure compatibility with GitHub Pages using the `docs` folder for deployment.
- Tailor content to specific user cohorts: curious n00bs, beginners, intermediates, and advanced users.

## Tasks

### ✅ Phase 1: Infrastructure & Setup (COMPLETED)
- [x] Initialize Astro in `/website`
- [x] Install Tailwind CSS v4 and shadcn/ui components
- [x] Configure build to output to `/docs` folder
- [x] Set up GitHub Pages compatibility (CNAME preservation)
- [x] Create modern landing page with cohort navigation
- [x] Test build process and local development
- [x] Create GitHub issue #11
- [x] Create feature branch and PR #12

### 🔄 Phase 2: Content Pages (NEXT)
- [ ] Create `/curious` page for complete newcomers
- [ ] Create `/getting-started` page for beginners
- [ ] Create `/guide` page for intermediate users
- [ ] Create `/advanced` page for developers
- [ ] Add navigation between pages

### 📋 Phase 3: Content Migration
- [ ] Migrate existing README content
- [ ] Add architecture diagrams (Mermaid support)
- [ ] Create interactive examples
- [ ] Add installation instructions

### 🚀 Phase 4: Polish & Enhancement
- [ ] SEO optimization
- [ ] Performance testing
- [ ] Mobile responsiveness validation
- [ ] Add search functionality
- [ ] Analytics integration

## Collaboration
- Track progress via GitHub Issues and Projects.
- Collaborate using this document for updates and notes.

## Next Steps

### Ready to Deploy Phase 1
1. **Review PR #12**: Check the pull request at https://github.com/viewyonder/prompt-injectionator/pull/12
2. **Merge to Main**: Once approved, merge the PR to deploy the new site
3. **Verify Deployment**: Check https://promptinjectionator.com to see the updated site
4. **Close Issue #11**: The GitHub issue will be automatically closed when merged

### Development Workflow
- **Source**: Edit files in `/website/` directory
- **Build**: Run `cd website && npm run build` to generate static site in `/docs/`
- **Deploy**: Push to `main` branch to trigger GitHub Pages deployment
