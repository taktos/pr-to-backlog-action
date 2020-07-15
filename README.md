# Backlog Pull Request action

This action add comment to Backlog issues when pull request opend or closed.

## Inputs

### `backlog-host`

**Required** The host of your backlog workspace.

### `api-key`

**Required** The api key of your backlog account.

## Example usage

```
- name: Backlog pull request
  uses: actions/backlog-action@v0.1.0
  with:
    backlog-host: // workspace.backlog.com
    api-key: ${{ secrets.BACKLOG_API_KEY }}
```

