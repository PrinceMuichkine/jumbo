Directory structure:
└── stackblitz-labs-bolt.diy/
    ├── README.md
    ├── CONTRIBUTING.md
    ├── Dockerfile
    ├── FAQ.md
    ├── LICENSE
    ├── PROJECT.md
    ├── bindings.sh
    ├── changelog.md
    ├── docker-compose.yaml
    ├── electron-builder.yml
    ├── electron-update.yml
    ├── eslint.config.mjs
    ├── load-context.ts
    ├── notarize.cjs
    ├── package.json
    ├── pnpm-lock.yaml
    ├── pre-start.cjs
    ├── tsconfig.json
    ├── uno.config.ts
    ├── vite-electron.config.ts
    ├── vite.config.ts
    ├── worker-configuration.d.ts
    ├── wrangler.toml
    ├── .dockerignore
    ├── .editorconfig
    ├── .env.example
    ├── .env.production
    ├── .prettierignore
    ├── .prettierrc
    ├── app/
    │   ├── entry.client.tsx
    │   ├── entry.server.tsx
    │   ├── root.tsx
    │   ├── vite-env.d.ts
    │   ├── components/
    │   │   ├── @settings/
    │   │   │   ├── index.ts
    │   │   │   ├── core/
    │   │   │   │   ├── AvatarDropdown.tsx
    │   │   │   │   ├── ControlPanel.tsx
    │   │   │   │   ├── constants.ts
    │   │   │   │   └── types.ts
    │   │   │   ├── shared/
    │   │   │   │   └── components/
    │   │   │   │       ├── DraggableTabList.tsx
    │   │   │   │       ├── TabManagement.tsx
    │   │   │   │       └── TabTile.tsx
    │   │   │   ├── tabs/
    │   │   │   │   ├── connections/
    │   │   │   │   │   ├── ConnectionDiagnostics.tsx
    │   │   │   │   │   ├── ConnectionsTab.tsx
    │   │   │   │   │   ├── GithubConnection.tsx
    │   │   │   │   │   ├── NetlifyConnection.tsx
    │   │   │   │   │   ├── VercelConnection.tsx
    │   │   │   │   │   ├── components/
    │   │   │   │   │   │   ├── ConnectionForm.tsx
    │   │   │   │   │   │   ├── CreateBranchDialog.tsx
    │   │   │   │   │   │   ├── PushToGitHubDialog.tsx
    │   │   │   │   │   │   └── RepositorySelectionDialog.tsx
    │   │   │   │   │   └── types/
    │   │   │   │   │       └── GitHub.ts
    │   │   │   │   ├── data/
    │   │   │   │   │   ├── DataTab.tsx
    │   │   │   │   │   └── DataVisualization.tsx
    │   │   │   │   ├── debug/
    │   │   │   │   │   └── DebugTab.tsx
    │   │   │   │   ├── event-logs/
    │   │   │   │   │   └── EventLogsTab.tsx
    │   │   │   │   ├── features/
    │   │   │   │   │   └── FeaturesTab.tsx
    │   │   │   │   ├── notifications/
    │   │   │   │   │   └── NotificationsTab.tsx
    │   │   │   │   ├── profile/
    │   │   │   │   │   └── ProfileTab.tsx
    │   │   │   │   ├── providers/
    │   │   │   │   │   ├── cloud/
    │   │   │   │   │   │   └── CloudProvidersTab.tsx
    │   │   │   │   │   ├── local/
    │   │   │   │   │   │   ├── LocalProvidersTab.tsx
    │   │   │   │   │   │   └── OllamaModelInstaller.tsx
    │   │   │   │   │   ├── service-status/
    │   │   │   │   │   │   ├── ServiceStatusTab.tsx
    │   │   │   │   │   │   ├── base-provider.ts
    │   │   │   │   │   │   ├── provider-factory.ts
    │   │   │   │   │   │   ├── types.ts
    │   │   │   │   │   │   └── providers/
    │   │   │   │   │   │       ├── amazon-bedrock.ts
    │   │   │   │   │   │       ├── anthropic.ts
    │   │   │   │   │   │       ├── cohere.ts
    │   │   │   │   │   │       ├── deepseek.ts
    │   │   │   │   │   │       ├── google.ts
    │   │   │   │   │   │       ├── groq.ts
    │   │   │   │   │   │       ├── huggingface.ts
    │   │   │   │   │   │       ├── hyperbolic.ts
    │   │   │   │   │   │       ├── mistral.ts
    │   │   │   │   │   │       ├── openai.ts
    │   │   │   │   │   │       ├── openrouter.ts
    │   │   │   │   │   │       ├── perplexity.ts
    │   │   │   │   │   │       ├── together.ts
    │   │   │   │   │   │       └── xai.ts
    │   │   │   │   │   └── status/
    │   │   │   │   │       └── ServiceStatusTab.tsx
    │   │   │   │   ├── settings/
    │   │   │   │   │   └── SettingsTab.tsx
    │   │   │   │   ├── task-manager/
    │   │   │   │   │   └── TaskManagerTab.tsx
    │   │   │   │   └── update/
    │   │   │   │       └── UpdateTab.tsx
    │   │   │   └── utils/
    │   │   │       ├── animations.ts
    │   │   │       └── tab-helpers.ts
    │   │   ├── chat/
    │   │   │   ├── APIKeyManager.tsx
    │   │   │   ├── Artifact.tsx
    │   │   │   ├── AssistantMessage.tsx
    │   │   │   ├── BaseChat.module.scss
    │   │   │   ├── BaseChat.tsx
    │   │   │   ├── Chat.client.tsx
    │   │   │   ├── ChatAlert.tsx
    │   │   │   ├── CodeBlock.module.scss
    │   │   │   ├── CodeBlock.tsx
    │   │   │   ├── ExamplePrompts.tsx
    │   │   │   ├── FilePreview.tsx
    │   │   │   ├── GitCloneButton.tsx
    │   │   │   ├── ImportFolderButton.tsx
    │   │   │   ├── Markdown.module.scss
    │   │   │   ├── Markdown.spec.ts
    │   │   │   ├── Markdown.tsx
    │   │   │   ├── Messages.client.tsx
    │   │   │   ├── ModelSelector.tsx
    │   │   │   ├── NetlifyDeploymentLink.client.tsx
    │   │   │   ├── ProgressCompilation.tsx
    │   │   │   ├── ScreenshotStateManager.tsx
    │   │   │   ├── SendButton.client.tsx
    │   │   │   ├── SpeechRecognition.tsx
    │   │   │   ├── StarterTemplates.tsx
    │   │   │   ├── SupabaseAlert.tsx
    │   │   │   ├── SupabaseConnection.tsx
    │   │   │   ├── ThoughtBox.tsx
    │   │   │   ├── UserMessage.tsx
    │   │   │   ├── VercelDeploymentLink.client.tsx
    │   │   │   └── chatExportAndImport/
    │   │   │       ├── ExportChatButton.tsx
    │   │   │       └── ImportButtons.tsx
    │   │   ├── editor/
    │   │   │   └── codemirror/
    │   │   │       ├── BinaryContent.tsx
    │   │   │       ├── CodeMirrorEditor.tsx
    │   │   │       ├── EnvMasking.ts
    │   │   │       ├── cm-theme.ts
    │   │   │       ├── indent.ts
    │   │   │       └── languages.ts
    │   │   ├── git/
    │   │   │   └── GitUrlImport.client.tsx
    │   │   ├── header/
    │   │   │   ├── Header.tsx
    │   │   │   └── HeaderActionButtons.client.tsx
    │   │   ├── sidebar/
    │   │   │   ├── HistoryItem.tsx
    │   │   │   ├── Menu.client.tsx
    │   │   │   └── date-binning.ts
    │   │   ├── ui/
    │   │   │   ├── Badge.tsx
    │   │   │   ├── Button.tsx
    │   │   │   ├── Card.tsx
    │   │   │   ├── Checkbox.tsx
    │   │   │   ├── Collapsible.tsx
    │   │   │   ├── Dialog.tsx
    │   │   │   ├── Dropdown.tsx
    │   │   │   ├── IconButton.tsx
    │   │   │   ├── Input.tsx
    │   │   │   ├── Label.tsx
    │   │   │   ├── LoadingDots.tsx
    │   │   │   ├── LoadingOverlay.tsx
    │   │   │   ├── PanelHeader.tsx
    │   │   │   ├── PanelHeaderButton.tsx
    │   │   │   ├── Popover.tsx
    │   │   │   ├── Progress.tsx
    │   │   │   ├── ScrollArea.tsx
    │   │   │   ├── Separator.tsx
    │   │   │   ├── SettingsButton.tsx
    │   │   │   ├── Slider.tsx
    │   │   │   ├── Switch.tsx
    │   │   │   ├── Tabs.tsx
    │   │   │   ├── ThemeSwitch.tsx
    │   │   │   ├── Tooltip.tsx
    │   │   │   ├── use-toast.ts
    │   │   │   └── BackgroundRays/
    │   │   │       ├── index.tsx
    │   │   │       └── styles.module.scss
    │   │   └── workbench/
    │   │       ├── DiffView.tsx
    │   │       ├── EditorPanel.tsx
    │   │       ├── FileBreadcrumb.tsx
    │   │       ├── FileTree.tsx
    │   │       ├── PortDropdown.tsx
    │   │       ├── Preview.tsx
    │   │       ├── ScreenshotSelector.tsx
    │   │       ├── Workbench.client.tsx
    │   │       └── terminal/
    │   │           ├── Terminal.tsx
    │   │           ├── TerminalTabs.tsx
    │   │           └── theme.ts
    │   ├── lib/
    │   │   ├── crypto.ts
    │   │   ├── fetch.ts
    │   │   ├── api/
    │   │   │   ├── connection.ts
    │   │   │   ├── cookies.ts
    │   │   │   ├── debug.ts
    │   │   │   ├── features.ts
    │   │   │   ├── notifications.ts
    │   │   │   └── updates.ts
    │   │   ├── common/
    │   │   │   ├── prompt-library.ts
    │   │   │   └── prompts/
    │   │   │       ├── optimized.ts
    │   │   │       └── prompts.ts
    │   │   ├── hooks/
    │   │   │   ├── index.ts
    │   │   │   ├── useConnectionStatus.ts
    │   │   │   ├── useDataOperations.ts
    │   │   │   ├── useDebugStatus.ts
    │   │   │   ├── useEditChatDescription.ts
    │   │   │   ├── useFeatures.ts
    │   │   │   ├── useGit.ts
    │   │   │   ├── useIndexedDB.ts
    │   │   │   ├── useLocalProviders.ts
    │   │   │   ├── useMessageParser.ts
    │   │   │   ├── useNotifications.ts
    │   │   │   ├── usePromptEnhancer.ts
    │   │   │   ├── useSearchFilter.ts
    │   │   │   ├── useSettings.ts
    │   │   │   ├── useShortcuts.ts
    │   │   │   ├── useSnapScroll.ts
    │   │   │   ├── useSupabaseConnection.ts
    │   │   │   ├── useUpdateCheck.ts
    │   │   │   └── useViewport.ts
    │   │   ├── modules/
    │   │   │   └── llm/
    │   │   │       ├── base-provider.ts
    │   │   │       ├── manager.ts
    │   │   │       ├── registry.ts
    │   │   │       ├── types.ts
    │   │   │       └── providers/
    │   │   │           ├── amazon-bedrock.ts
    │   │   │           ├── anthropic.ts
    │   │   │           ├── cohere.ts
    │   │   │           ├── deepseek.ts
    │   │   │           ├── github.ts
    │   │   │           ├── google.ts
    │   │   │           ├── groq.ts
    │   │   │           ├── huggingface.ts
    │   │   │           ├── hyperbolic.ts
    │   │   │           ├── lmstudio.ts
    │   │   │           ├── mistral.ts
    │   │   │           ├── ollama.ts
    │   │   │           ├── open-router.ts
    │   │   │           ├── openai-like.ts
    │   │   │           ├── openai.ts
    │   │   │           ├── perplexity.ts
    │   │   │           ├── together.ts
    │   │   │           └── xai.ts
    │   │   ├── persistence/
    │   │   │   ├── ChatDescription.client.tsx
    │   │   │   ├── chats.ts
    │   │   │   ├── db.ts
    │   │   │   ├── index.ts
    │   │   │   ├── localStorage.ts
    │   │   │   ├── types.ts
    │   │   │   └── useChatHistory.ts
    │   │   ├── runtime/
    │   │   │   ├── action-runner.ts
    │   │   │   ├── message-parser.spec.ts
    │   │   │   ├── message-parser.ts
    │   │   │   └── __snapshots__/
    │   │   │       └── message-parser.spec.ts.snap
    │   │   ├── services/
    │   │   │   └── importExportService.ts
    │   │   ├── stores/
    │   │   │   ├── chat.ts
    │   │   │   ├── editor.ts
    │   │   │   ├── files.ts
    │   │   │   ├── logs.ts
    │   │   │   ├── netlify.ts
    │   │   │   ├── previews.ts
    │   │   │   ├── profile.ts
    │   │   │   ├── settings.ts
    │   │   │   ├── streaming.ts
    │   │   │   ├── supabase.ts
    │   │   │   ├── tabConfigurationStore.ts
    │   │   │   ├── terminal.ts
    │   │   │   ├── theme.ts
    │   │   │   ├── vercel.ts
    │   │   │   └── workbench.ts
    │   │   ├── webcontainer/
    │   │   │   ├── auth.client.ts
    │   │   │   └── index.ts
    │   │   └── .server/
    │   │       └── llm/
    │   │           ├── constants.ts
    │   │           ├── create-summary.ts
    │   │           ├── select-context.ts
    │   │           ├── stream-text.ts
    │   │           ├── switchable-stream.ts
    │   │           └── utils.ts
    │   ├── routes/
    │   │   ├── _index.tsx
    │   │   ├── api.chat.ts
    │   │   ├── api.check-env-key.ts
    │   │   ├── api.enhancer.ts
    │   │   ├── api.export-api-keys.ts
    │   │   ├── api.git-proxy.$.ts
    │   │   ├── api.health.ts
    │   │   ├── api.llmcall.ts
    │   │   ├── api.models.$provider.ts
    │   │   ├── api.models.ts
    │   │   ├── api.netlify-deploy.ts
    │   │   ├── api.supabase.query.ts
    │   │   ├── api.supabase.ts
    │   │   ├── api.supabase.variables.ts
    │   │   ├── api.system.app-info.ts
    │   │   ├── api.system.diagnostics.ts
    │   │   ├── api.system.disk-info.ts
    │   │   ├── api.system.git-info.ts
    │   │   ├── api.system.memory-info.ts
    │   │   ├── api.system.process-info.ts
    │   │   ├── api.update.ts
    │   │   ├── api.vercel-deploy.ts
    │   │   ├── chat.$id.tsx
    │   │   ├── git.tsx
    │   │   └── webcontainer.preview.$id.tsx
    │   ├── styles/
    │   │   ├── animations.scss
    │   │   ├── diff-view.css
    │   │   ├── index.scss
    │   │   ├── variables.scss
    │   │   ├── z-index.scss
    │   │   └── components/
    │   │       ├── code.scss
    │   │       ├── editor.scss
    │   │       ├── resize-handle.scss
    │   │       ├── terminal.scss
    │   │       └── toast.scss
    │   ├── types/
    │   │   ├── GitHub.ts
    │   │   ├── actions.ts
    │   │   ├── artifact.ts
    │   │   ├── context.ts
    │   │   ├── global.d.ts
    │   │   ├── model.ts
    │   │   ├── netlify.ts
    │   │   ├── supabase.ts
    │   │   ├── template.ts
    │   │   ├── terminal.ts
    │   │   ├── theme.ts
    │   │   └── vercel.ts
    │   └── utils/
    │       ├── buffer.ts
    │       ├── classNames.ts
    │       ├── constants.ts
    │       ├── debounce.ts
    │       ├── diff.spec.ts
    │       ├── diff.ts
    │       ├── easings.ts
    │       ├── fileUtils.ts
    │       ├── folderImport.ts
    │       ├── formatSize.ts
    │       ├── getLanguageFromExtension.ts
    │       ├── logger.ts
    │       ├── markdown.ts
    │       ├── mobile.ts
    │       ├── os.ts
    │       ├── path.ts
    │       ├── projectCommands.ts
    │       ├── promises.ts
    │       ├── react.ts
    │       ├── sampler.ts
    │       ├── selectStarterTemplate.ts
    │       ├── shell.ts
    │       ├── stacktrace.ts
    │       ├── stripIndent.ts
    │       ├── terminal.ts
    │       ├── types.ts
    │       └── unreachable.ts
    ├── assets/
    │   ├── entitlements.mac.plist
    │   └── icons/
    │       └── icon.icns
    ├── docs/
    │   ├── README.md
    │   ├── mkdocs.yml
    │   ├── poetry.lock
    │   ├── pyproject.toml
    │   ├── .gitignore
    │   ├── .python-version
    │   ├── docs/
    │   │   ├── CONTRIBUTING.md
    │   │   ├── FAQ.md
    │   │   └── index.md
    │   └── images/
    ├── electron/
    │   ├── main/
    │   │   ├── index.ts
    │   │   ├── tsconfig.json
    │   │   ├── vite.config.ts
    │   │   ├── ui/
    │   │   │   ├── menu.ts
    │   │   │   └── window.ts
    │   │   └── utils/
    │   │       ├── auto-update.ts
    │   │       ├── constants.ts
    │   │       ├── cookie.ts
    │   │       ├── reload.ts
    │   │       ├── serve.ts
    │   │       ├── store.ts
    │   │       └── vite-server.ts
    │   └── preload/
    │       ├── index.ts
    │       ├── tsconfig.json
    │       └── vite.config.ts
    ├── functions/
    │   └── [[path]].ts
    ├── icons/
    ├── public/
    │   └── icons/
    ├── scripts/
    │   ├── clean.js
    │   ├── update-imports.sh
    │   └── update.sh
    ├── types/
    │   └── istextorbinary.d.ts
    ├── .github/
    │   ├── ISSUE_TEMPLATE/
    │   │   ├── bug_report.yml
    │   │   ├── config.yml
    │   │   ├── epic.md
    │   │   ├── feature.md
    │   │   └── feature_request.md
    │   ├── actions/
    │   │   └── setup-and-build/
    │   │       └── action.yaml
    │   ├── scripts/
    │   │   └── generate-changelog.sh
    │   └── workflows/
    │       ├── ci.yaml
    │       ├── docker.yaml
    │       ├── docs.yaml
    │       ├── electron.yml
    │       ├── pr-release-validation.yaml
    │       ├── semantic-pr.yaml
    │       ├── stale.yml
    │       └── update-stable.yml
    └── .husky/
        └── pre-commit
