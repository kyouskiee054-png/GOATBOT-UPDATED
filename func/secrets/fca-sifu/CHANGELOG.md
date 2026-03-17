# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-03-14

Initial public release of **dhoner-fca** — a full rewrite/rebranding of the FCA-KEX engine.  
Developed and maintained by [NeoKEX](https://github.com/NeoKEX).

### Added

**Core**
- Login via `appState` cookie arrays (supports `name/value`, `key/value`, and cookie strings)
- Multi-persona support: `desktop` (Chrome/Edge) and `android/mobile` personas
- Real-time MQTT messaging with `listenMqtt` and `sendMessageMqtt`
- HTTP send with automatic MQTT fallback (`sendMessage`)
- MQTT auto-reconnect with exponential backoff and jitter
- MQTT watchdog timer to detect and recover from idle/stale connections
- `TokenRefreshManager` with randomized refresh intervals to avoid detectable periodicity
- `AutoReLogin` using refreshed AppState on session expiry
- AppState backup/restore to disk to survive crashes
- SQLite-backed thread and user data caching via Sequelize

**Anti-Suspension System**
- `AntiSuspension` class with circuit breaker — trips after repeated suspension signals
- Expanded suspension signal detection: 60+ patterns covering checkpoints, spam flags, session expiry, rate limits, policy violations, identity verification, and more
- Adaptive per-thread message delay that scales with session volume
- Hourly and daily volume limits with automatic warning pauses
- `checkVolumeLimit()` called before every `sendMessage` and `sendMessageMqtt` send
- Warmup mode — reduced hourly limit for fresh sessions
- Session fingerprint locking: User-Agent, Sec-Ch-Ua, locale, timezone locked per session
- `safeRetry()` with suspension-aware exponential backoff
- `batchOperations()` for safe, sequential multi-send workflows
- MQTT Sec-Ch-Ua header updated to Chrome 136 (matching default User-Agent)
- PostSafe guard on HTTP post to detect auth failures in real-time

**API Methods**
- `api.sendMessage(msg, threadID)` — HTTP send with MQTT fallback
- `api.sendMessageMqtt(msg, threadID)` — MQTT send
- `api.listenMqtt(callback)` — real-time event listener
- `api.editMessage(text, messageID)` — in-place message edit
- `api.unsendMessage(messageID, threadID)` — retract a message
- `api.forwardMessage(messageID, threadID)` — forward a message
- `api.deleteMessage(messageIDs)` — delete locally
- `api.setMessageReaction(reaction, messageID)` — react via HTTP
- `api.setMessageReactionMqtt(reaction, messageID, threadID)` — react via MQTT
- `api.pinMessage(action, threadID, messageID?)` — pin/unpin/list pins
- `api.sendTypingIndicator(isTyping, threadID)` — typing status
- `api.markAsRead/markAsReadAll/markAsSeen/markAsDelivered` — message status
- `api.getThreadInfo/getThreadList/getThreadHistory/getThreadPictures` — thread data
- `api.getMessage(messageID)` — fetch a specific message
- `api.getUserInfo/getUserInfoV2/getUserID` — user data
- `api.getFriendsList/friend/unfriend` — friends management
- `api.searchForThread(name)` — search threads by name
- `api.createNewGroup/addUserToGroup/removeUserFromGroup/changeAdminStatus` — group admin
- `api.changeGroupImage/changeThreadColor/changeThreadEmoji` — group customization
- `api.gcname/emoji/nickname/theme` — per-thread personalization
- `api.muteThread/changeArchivedStatus/deleteThread` — thread management
- `api.createPoll` — create a poll in a thread
- `api.handleMessageRequest` — accept/decline message requests
- `api.changeBlockedStatus/changeAvatar/changeBio` — account actions
- `api.comment/share/follow` — social interactions
- `api.getTheme/getThemeInfo/setThreadTheme/setThreadThemeMqtt` — Messenger themes
- `api.createAITheme(prompt)` — generate AI-powered chat themes
- `api.stickers.search/listPacks/getStorePacks/addPack/getStickersInPack/getAiStickers` — sticker API
- `api.e2ee.enable/disable/getPublicKey/setPeerKey/encrypt/decrypt` — application-layer E2EE (X25519 + HKDF + AES-256-GCM)
- `api.getHealthStatus()` — MQTT, token refresh, and rate limiter telemetry
- `api.httpGet/httpPost/httpPostFormData` — raw HTTP helpers
- `api.addExternalModule(moduleObj)` — extend the API at runtime
- `api.shareContact/resolvePhotoUrl/getAccess/logout/getAppState/getCurrentUserID`
- `api.notes/gcrule/gcmember/story/realtime/getBotInfo/getBotInitialData/getUserInfoV2` — extended APIs

**TypeScript Support**
- Full `index.d.ts` with all methods, events, options, and types exported under `declare module "dhoner-fca"`

**Production Monitoring**
- `ProductionMonitor` — request counts, error rates, response times, rate limit telemetry
- `api.getHealthStatus()` providing MQTT, token refresh, and rate limiter stats

### Fixed
- Sec-Ch-Ua MQTT header aligned with Chrome 136 User-Agent (was Chrome 131)
- `sendMessageMqtt` now calls `prepareBeforeMessage` before every send
- `sendMessage` now calls `prepareBeforeMessage` before every send
- Volume limit checks (`isDailyLimitReached`, `isHourlyLimitReached`) now apply to both send paths
- TypeScript: removed duplicate `API` interface declaration and stray closing brace
- Database path renamed from `fca_kex_database` to `dhoner_fca_database`
- Credits function updated to reference `dhoner-fca` and `github.com/NeoKEX`

---

> **Developed and maintained by [NeoKEX](https://github.com/NeoKEX)**  
> Inspired by **ws3-fca** and **@dongdev/fca-unofficial**