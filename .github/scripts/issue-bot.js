// .github/issue-bot.js
const { Octokit } = require("@octokit/core");
const github = require("@actions/github");

// Get context from GitHub Actions
const token = process.env.GITHUB_TOKEN;
const payloadPath = process.env.GITHUB_EVENT_PATH;
const fs = require("fs");

if (!token || !payloadPath) {
  console.error("Missing GITHUB_TOKEN or GITHUB_EVENT_PATH");
  process.exit(1);
}

const octokit = new Octokit({ auth: token });
const context = github.context;
const event = JSON.parse(fs.readFileSync(payloadPath, "utf8"));

const issue = event.issue;
const comment = event.comment;
const repo = event.repository;

if (!comment || !comment.user) {
  console.error("Error: 'comment' or 'comment.user' is undefined. Event payload:", JSON.stringify(event, null, 2));
  process.exit(1);
}

const commenter = comment.user.login;
const commentBody = comment.body.trim();

const ownersPath = process.env.OWNERS_PATH || "OWNERS";
let codeOwners = [];
try {
  const ownersContent = fs.readFileSync(ownersPath, "utf8");
  codeOwners = ownersContent
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"))
    .flatMap(line => {
      // Support lines like '* @user1 @user2'
      const parts = line.split(/\s+/).slice(1);
      return parts.map(u => u.replace(/^@/, ""));
    });
} catch (e) {
  // If OWNERS file is missing or unreadable, treat as no code owners
  codeOwners = [];
}

const isPR = !!event.pull_request;
const target = isPR ? event.pull_request : event.issue;
const author = target.user.login;

function isCodeOwner(username) {
  return codeOwners.includes(username);
}

function isAuthorOrCodeOwner(username) {
  return username === author || isCodeOwner(username);
}

if (!target) {
  process.exit(0); // Only run on issues or PRs
}

async function hasWriteAccess(username) {
  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/collaborators/{username}/permission', {
      owner: repo.owner.login,
      repo: repo.name,
      username,
    });
    return ['admin', 'write', 'maintain'].includes(data.permission);
  } catch {
    return false;
  }
}

async function addLabel(label) {
  try {
    await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/labels', {
      owner: repo.owner.login,
      repo: repo.name,
      issue_number: target.number,
      labels: [label],
    });
  } catch {}
}

async function removeLabel(label) {
  try {
    await octokit.request('DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}', {
      owner: repo.owner.login,
      repo: repo.name,
      issue_number: target.number,
      name: label,
    });
  } catch {}
}

async function assignUser(username) {
  await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/assignees', {
    owner: repo.owner.login,
    repo: repo.name,
    issue_number: target.number,
    assignees: [username],
  });
}

async function unassignUser(username) {
  await octokit.request('DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees', {
    owner: repo.owner.login,
    repo: repo.name,
    issue_number: target.number,
    assignees: [username],
  });
}

async function closeIssue() {
  await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
    owner: repo.owner.login,
    repo: repo.name,
    issue_number: target.number,
    state: 'closed',
  });
}

async function reopenIssue() {
  await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
    owner: repo.owner.login,
    repo: repo.name,
    issue_number: target.number,
    state: 'open',
  });
}

async function mentionUser(username) {
  await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
    owner: repo.owner.login,
    repo: repo.name,
    issue_number: target.number,
    body: `@${username}`,
  });
}

async function addLgtmLabel() {
  await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/labels', {
    owner: repo.owner.login,
    repo: repo.name,
    issue_number: target.number,
    labels: ['lgtm'],
  });
}

function helpText() {
  return `
**Available Commands:**
- \`/assign\`: Assign the issue to yourself.
- \`/unassign\`: Unassign yourself from the issue.
- \`/help wanted\`: Add the "help-wanted" label.
- \`/close\`: Close the issue.
- \`/reopen\`: Reopen the issue if closed.
- \`/priority set <level>\`: Set priority label (critical, high, medium, low).
- \`/assign-to <username>\`: Assign the issue to the specified user.
- \`/help\`: Show this help message.
- \`/cc\`: Mention yourself in a comment for notifications.
  `.trim();
}

async function postComment(body) {
  await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
    owner: repo.owner.login,
    repo: repo.name,
    issue_number: target.number,
    body,
  });
}

async function main() {
  const commands = commentBody.split('\n').map(line => line.trim()).filter(Boolean);

  for (const command of commands) {
    try {
      if (/^\/assign$/i.test(command)) {
        if (await hasWriteAccess(commenter)) {
          await assignUser(commenter);
        }
      } else if (/^\/unassign$/i.test(command)) {
        if (await hasWriteAccess(commenter)) {
          await unassignUser(commenter);
        }
      } else if (/^\/help wanted$/i.test(command)) {
        await addLabel('help-wanted');
      } else if (/^\/close$/i.test(command)) {
        if (isAuthorOrCodeOwner(commenter)) {
          await closeIssue();
        }
      } else if (/^\/reopen$/i.test(command)) {
        if (isAuthorOrCodeOwner(commenter)) {
          await reopenIssue();
        }
      } else if (/^\/priority set (critical|high|medium|low)$/i.test(command)) {
        const level = command.match(/^\/priority set (critical|high|medium|low)$/i)[1].toLowerCase();
        const labels = target.labels.map(l => typeof l === "string" ? l : l.name);
        for (const l of labels) {
          if (/^priority: (critical|high|medium|low)$/i.test(l)) {
            await removeLabel(l);
          }
        }
        await addLabel(`priority: ${level}`);
      } else if (/^\/assign-to @?([a-zA-Z0-9-]+)$/i.test(command)) {
        const username = command.match(/^\/assign-to @?([a-zA-Z0-9-]+)$/i)[1];
        if (await hasWriteAccess(commenter)) {
          await assignUser(username);
        }
      } else if (/^\/help$/i.test(command)) {
        await postComment(helpText());
      } else if (/^\/cc$/i.test(command)) {
        await mentionUser(commenter);
      } else if (/^\/lgtm$/i.test(command)) {
        if (isPR && isCodeOwner(commenter)) {
          await addLgtmLabel();
        }
      }
    } catch (error) {
      // Silently ignore errors
    }
  }
}

main();