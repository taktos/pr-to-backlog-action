import * as core from "@actions/core";
import * as github from "@actions/github";
import * as Webhooks from "@octokit/webhooks";
import axios from "axios";
import querystring from "querystring";

async function run() {
  try {
    const token = core.getInput("repo-token", { required: true });
    const host = core.getInput("backlog-host", { required: true });
    const apiKey = core.getInput("api-key", { required: true });

    if (github.context.eventName != "pull_request") {
      core.error("Event should be a pull_request");
    }
    const pullRequestPayload = github.context
      .payload as Webhooks.Webhooks.WebhookPayloadPullRequest;
    const title = pullRequestPayload.pull_request.title;

    for (const issueKey of parseIssueKey(title)) {
      const apiUrl = `https://${host}/api/v2/issues/${issueKey}/comments?apiKey=${apiKey}`;

      console.log(`apiUrl: ${apiUrl}`);

      await axios.post(
        apiUrl,
        querystring.stringify({
          content: `Pull request created: [#${pullRequestPayload.number}](${pullRequestPayload.pull_request.url})`,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
    }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

function parseIssueKey(title: string): RegExpMatchArray {
  let re = /([A-Z][A-Z0-9]+-\d+)/g;
  return title.match(re) || [];
}

run();
