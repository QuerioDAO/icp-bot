const { HttpAgent, Certificate } = require("@dfinity/agent");
const { Principal } = require("@dfinity/principal");
const { blobToHex, blobFromText, blobFromUint8Array } = require("@dfinity/candid");


async function canisterCodeHash(canister_id) {
    const agent = new HttpAgent({ host: "https://ic0.app" });
    const canisterId = Principal.fromText(canister_id);

    const path = [
        blobFromText("canister"),
        blobFromUint8Array(canisterId.toUint8Array()),
        blobFromText("module_hash"),
    ];
    const res = await agent.readState(canisterId, {
        paths: [path],
    });
    const cert = new Certificate(res, agent);
    await cert.verify();
    const module_hash = cert.lookup(path);
    return blobToHex(module_hash);
}

module.exports = {
    canisterCodeHash
};