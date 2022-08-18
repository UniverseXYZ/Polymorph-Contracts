# PolymorphRoot
npx hardhat verify --network goerli 0xCcA89336F67749C0A80926E6a640F8F84C0fa4e2 --constructor-args ./deployment/args/root-polymorph-args.js

# PolymorphRootTunnel
npx hardhat verify --network goerli 0x31AEB74996D261247c861d60593daBD3839Cd3A8 "0x2890bA17EfE978480615e330ecB65333b880928e" "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA" "0x7e94e8D8c85960DBDC67E080C3D48D4e0BD423a6"

# PolymorphChild
npx hardhat verify --network mumbai contractAddress --constructor-args ./deployment/args/child-polymorph-args.js

# PolymorphChildTunnel
npx hardhat verify --network mumbai contractAddress "0xCf73231F28B7331BBe3124B907840A94851f9f11" "0x7e94e8D8c85960DBDC67E080C3D48D4e0BD423a6"

# TestERC20
npx hardhat verify --network mumbai --contract contracts/polygon/TestERC20.sol:TestERC20 contractAddress