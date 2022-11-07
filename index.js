const { generateSlug } = require('random-word-slugs');
const axios = require('axios');
const core = require('@actions/core');
const exec = require('@actions/exec');
const { execSync } = require('child_process');

execSync('npm install localtunnel -g');

const API_TOKEN = core.getInput('api_token');
const API_ROOT = core.getInput('api_root');
const EXPLORER_SUBDOMAIN = core.getInput('explorer_subdomain');
const NODE_PORT = core.getInput('node_port');

if (!API_TOKEN || !API_ROOT || !EXPLORER_SUBDOMAIN || !NODE_PORT)
    return core.setFailed('Missing inputs');

const ETHERNAL_HEADERS = {
    headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
    }
};

async function createWorkspace(name, rpcServer) {
    const payload = {
        name: name,
        workspaceData: {
            chain: 'ethereum',
            networkId: 31337,
            rpcServer: rpcServer,
            public: true
        }
    }
    const workspace = (await axios.post(`${API_ROOT}/api/workspaces`, { data: payload }, ETHERNAL_HEADERS)).data;

    return workspace;
}

async function createExplorer(name, rpcServer) {
    const workspace = await createWorkspace(name, rpcServer);
    const payload = {
        workspaceId: workspace.id,
        name: name,
        rpcServer: rpcServer,
        theme: {default:{}},
        token: 'ether',
        domain: `${workspace.name}.${EXPLORER_SUBDOMAIN}`,
        slug: name,
        chainId: parseInt(workspace.networkId)
    }
    const explorer = (await axios.post(`${API_ROOT}/api/explorers`, { data: payload }, ETHERNAL_HEADERS)).data;
    return payload.domain;
}

async function main() {
    const appBaseName = `${generateSlug(2)}-${Math.floor(Math.random() * 10000)}`;
    await exec.exec('sh', [], { input: `npx localtunnel --port ${NODE_PORT} --subdomain ${appBaseName} &` });
    await setTimeout(async () => {
        const tunnelUrl = `https://${appBaseName}.loca.lt`;
        core.notice(`Tunnel running on ${tunnelUrl}`);
        const explorerUrl = await createExplorer(appBaseName, tunnelUrl);
        core.setOutput('explorer_url', explorerUrl);
        core.setOutput('workspace', appBaseName);
        process.exit();
    }, 5000);
}

main();
