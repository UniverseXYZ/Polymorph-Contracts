# PolymorphRoot
npx hardhat run deployment/root-polymorph-deploy.js --network goerli

# PolymorphRootTunnel
npx hardhat run deployment/root-tunnel-deploy.js --network goerli

# TestERC20 (Needed for morphing a gene on Polygon)
npx hardhat run deployment/test-erc20-deploy.js --network mumbai

# PolymorphChild
npx hardhat run deployment/child-polymorph-deploy.js --network mumbai

# PolymorphChildTunnel
npx hardhat run deployment/child-tunnel-deploy.js --network mumbai