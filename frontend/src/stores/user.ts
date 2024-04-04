import { defineStore } from 'pinia'
import { ethers, providers } from 'ethers'

import { useProvider } from '../../utils'

// import detectEthereumProvider from '@metamask/detect-provider';

export type Chain = '97'
// export const chainIds = config.CHAINS as Chain[]
export const DEFAULT_CHAINID = '97' as Chain

export const useUser = defineStore('user',{

    state: () => {
        return{
            wallet: '',
            shortWallet: '',
            loading: false,
            login: false,
            chainId: DEFAULT_CHAINID,
            _signer: () => null as null | providers.JsonRpcSigner,
        }
    },
    getters: {
      signer: (state) => state._signer(),
    },
    actions:{
        async environmentsetup(){
          console.log('Hey hey, How are you?')
          
          try {
            if (!(window as any).ethereum) throw new Error('Please set up MetaMask properly')  
             }
            catch (err: any){
              console.log(err)
            }

          const provider = new providers.Web3Provider(
            ((window as any).ethereum as any) || (window as any).web3
          )
          const chainId = (await provider?.getNetwork())?.chainId
          console.log('that chain Id is',chainId)
        },

        async connect(wallet: string, signer: providers.JsonRpcSigner, chainId: string) {
            console.log('Connect: ', wallet, chainId)
            this.wallet = wallet
            this.shortWallet = wallet.slice(0, 6) + '...' + wallet.slice(-4)
            this.connected = true
            this._signer = () => signer
            this.login = true
            this.chainId = chainId.toString()
          },

        async connectMetamask() {
            console.log('Connecting to metamask...')
            console.log('loading', this.loading)
            console.log('chain ID',this.chainId)

            // this.loading = true
            // await new Promise(resolve => setTimeout(resolve, 3000))
            // this.login = true
            // this.connect("abacabaabacabaabacaba", null, 97)
            // this.loading = false

            this.loading = true
            try {
              if (!(window as any).ethereum) throw new Error('Please set up MetaMask properly')
      
              const wallet = (
                await (window as any).ethereum.request?.({
                  method: 'eth_requestAccounts',
                })
              )[0] as string
              const provider = new providers.Web3Provider(
                ((window as any).ethereum as any) || (window as any).web3
              )
              const signer = provider.getSigner()
              const chainId = (await provider?.getNetwork())?.chainId

              if ((await signer.getChainId()).toString() != this.chainId) {
                this.loading = false
                this.openConnectWindow()
                return
              }
      
              await this.connect(wallet, signer, chainId.toString())
              ;((window as any).ethereum as any).once(
                'chainChanged',shortWallet
              )

            } catch (err: any) {
              console.log('error')
              console.log(err)
            }
            this.loading = false
            console.log('loading', this.loading)
          },
    }
})