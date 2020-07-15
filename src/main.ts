import * as core from "@actions/core";
import * as github from "@actions/github";
import Webhooks from "@octokit/webhooks";
import axios from "axios";
import querystring from "querystring";

async function run() {
  try {
    const host = core.getInput("backlog-host", { required: true });
    const apiKey = core.getInput("api-key", { required: true });

    if (github.context.eventName != "pull_request") {
      core.error("Event should be a pull_request");
    }
    const pullRequestPayload = github.context
      .payload as Webhooks.WebhookPayloadPullRequest;
    const title = pullRequestPayload.pull_request.title;

    let payload;
    switch (pullRequestPayload.action) {
      case "opened":
        payload = {
          content: `Pull request [#${pullRequestPayload.number}](${pullRequestPayload.pull_request.html_url}) created by ${pullRequestPayload.sender.login}: ${title}`,
        };
        break;
      case "closed":
        if (pullRequestPayload.pull_request.merged) {
          payload = {
            statusId: 3,
            content: `Pull request [#${pullRequestPayload.number}](${pullRequestPayload.pull_request.html_url}) merged and closed by ${pullRequestPayload.sender.login}: ${title}`,
          };
        } else {
          payload = {
            content: `Pull request [#${pullRequestPayload.number}](${pullRequestPayload.pull_request.html_url}) closed by ${pullRequestPayload.sender.login}: ${title}`,
          };
        }
        break;
      default:
        console.log(`Unsupported action: ${pullRequestPayload.action}`);
        return;
    }

    for (const issueKey of parseIssueKey(title)) {
      const apiUrl = `https://${host}/api/v2/issues/${issueKey}?apiKey=${apiKey}`;
      console.log(apiUrl);
      await axios.patch(apiUrl, querystring.stringify(payload), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
    }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

function parseIssueKey(title: string): RegExpMatchArray {
  let re = /([A-Z][A-Z0-9_]+-\d+)/g;
  return title.match(re) || [];
}

run();
