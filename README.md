# Github Action for Ethernal

[Ethernal](https://www.tryethernal.com) is an open source block explorer for EVM-based chains. You can use it with your local chains (the Hardhat network for example), or for chains deployed on remote servers.

By adding this plugin in your Github Actions workflow, you can generate an explorer connected to your CI node that will process all your blocks, transactions, contracts, etc..., and display it nicely.

More details + demo [here](https://tryethernal.com/github-actions)

## Usage

Add a Github secret in your repo containing your Ethernal API token.
You'll find your token [here](https://app.tryethernal.com/settings?tab=account) ("Settings" > "Account").

Add this step in your workflow:
```yaml
- name: Setup Ethernal Explorer
  uses: tryethernal/ethernal-action@v0.0.15
  id: ethernal
  with:
    api_token: ${{ secrets.ETHERNAL_API_TOKEN }}
```

This will generate two outputs `explorer_url` and `workspace` that you can access in the next steps:
```yaml
- name: Show Ethernal Output
  run: |
    echo "Explorer: ${{ steps.ethernal.outputs.explorer_url }}"
    echo "Workspace: ${{ steps.ethernal.outputs.workspace }}"

```

Then you can start your node & your scripts with the env variables `ETHERNAL_API_TOKEN` to authenticate yourself, and `ETHERNAL_WORKSPACE` set to the previously created workspace.
It's important that you start the node AFTER you create the explorer, as you'll need to provide the workspace name to synchronize blocks & transactions.
```yaml
- name: Run scripts
  env:
    ETHERNAL_API_TOKEN: ${{ secrets.ETHERNAL_API_TOKEN }}
    ETHERNAL_WORKSPACE: ${{ steps.ethernal.outputs.workspace }}
  run: |
  npx hardhat node --hostname 0.0.0.0 --port 8545 &
  npx hardhat run --network localhost scripts/deploy.ts
  npx hardhat run --network localhost scripts/tests.ts
```