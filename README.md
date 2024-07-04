# PagerDuty plugin for Backstage

[![Release](https://github.com/PagerDuty/backstage-plugin/actions/workflows/on_release_created.yml/badge.svg)](https://github.com/PagerDuty/backstage-plugin/actions/workflows/on_release_created.yml)
[![npm version](https://badge.fury.io/js/@pagerduty%2Fbackstage-plugin.svg)](https://badge.fury.io/js/@pagerduty%2Fbackstage-plugin)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**Bring the power of PagerDuty to Backstage!**
The PagerDuty plugin reduces the cognitive load on developers responsible for maintaining services in production. Instead of having to go to PagerDuty's console, you can now access the necessary information directly within Backstage. This includes finding active incidents or opening a new incident, reviewing recent changes made to the service, and checking who is on-call.

## Features

- **[Trigger New Incident](<https://pagerduty.github.io/backstage-plugin-docs/capabilities/#trigger-an-incident-for-a-service>)** - Easily create new incidents for your service directly from Backstage. This feature saves time and reduces the need for context switching.
- **[See Active Incidents](<https://pagerduty.github.io/backstage-plugin-docs/capabilities/#view-any-open-incidents>)** - View all active incidents for a service directly in Backstage.
- **[Check for Recent Changes](<https://pagerduty.github.io/backstage-plugin-docs/capabilities/#view-change-events-associated-to-a-service>)** - Identify recent changes that may be the root cause of potential issues with your service.
- **[Identify On-Call Personnel](<https://pagerduty.github.io/backstage-plugin-docs/capabilities/#see-and-contact-on-call-staff>)** - Quickly determine who is responsible for a failing service and resolve the incident as quickly as possible. This feature allows companies to spend more time solving problems rather than determining who should solve them.
- **Map existing PagerDuty services to Backstage entities** - Leverage PagerDuty's Advanced Configuration page to map existing PagerDuty services to Backstage entities without code changes.

## Getting Started

Find the complete project's documentation [here](https://pagerduty.github.io/backstage-plugin-docs/).

### Installation

The installation of the PagerDuty plugin for Backstage is done with *yarn* as all other plugins in Backstage. This plugin follows a modular approach which means that every individual component will be a separate package (e.g. frontend, backend, common). In this case, you are installing a **frontend plugin**.

To install this plugin run the following command from the Backstage root folder.

```bash
yarn add --cwd packages/app @pagerduty/backstage-plugin
```

### Configuration

To configure this frontend plugin follow the instructions on the `Getting Started` section of the project's documentation [here](https://pagerduty.github.io/backstage-plugin-docs/).

## Support

If you need help with this plugin, please open an issue in [GitHub](https://github.com/PagerDuty/backstage-plugin), reach out on the [Backstage Discord server](https://discord.gg/backstage-687207715902193673) or [PagerDuty's community forum](https://community.pagerduty.com).

## Contributing

If you are interested in contributing to this project, please refer to our [Contributing Guidelines](https://github.com/PagerDuty/backstage-plugin/blob/main/CONTRIBUTING.md).

<a href="https://next.ossinsight.io/widgets/official/compose-contributors?limit=30&repo_id=681249868" target="_blank" style="display: block" align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-contributors/thumbnail.png?limit=30&repo_id=681249868&image_size=auto&color_scheme=dark" width="655" height="auto">
    <img alt="Contributors of PagerDuty/backstage-plugin" src="https://next.ossinsight.io/widgets/official/compose-contributors/thumbnail.png?limit=30&repo_id=681249868&image_size=auto&color_scheme=light" width="655" height="auto">
  </picture>
</a>

<!-- Made with [OSS Insight](https://ossinsight.io/) -->
