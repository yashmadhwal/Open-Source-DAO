interface Node {
  name: string
  rpc: string
  chainId: number
  chainIdHex: string
}

export function node(name: string): Node {
  return {
    name: 'Binance Smart Chain Testnet',
    rpc: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    chainId: 97,

    chainIdHex: '0x61',
  }
}