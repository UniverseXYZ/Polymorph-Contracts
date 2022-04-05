# PolymorphRoot
npx hardhat verify --network goerli contractAddress --constructor-args ./deployment/args/root-polymorph-args.js

# PolymorphRootTunnel
npx hardhat verify --network goerli contractAddress "0x2890bA17EfE978480615e330ecB65333b880928e" "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA" "0x8FcE67537676879Bc5a1B86B403400E1614Bfce6"

# PolymorphChild
npx hardhat verify --network mumbai contractAddress --constructor-args ./deployment/args/child-polymorph-args.js

# PolymorphChildTunnel
npx hardhat verify --network mumbai contractAddress "0xCf73231F28B7331BBe3124B907840A94851f9f11" "0x8FcE67537676879Bc5a1B86B403400E1614Bfce6"

# TestERC20
npx hardhat verify --network mumbai --contract contracts/polygon/TestERC20.sol:TestERC20 contractAddress