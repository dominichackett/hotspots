import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { useMemo } from 'react'
import type { Account, Chain, Client, Transport } from 'viem'
import { type Config, useConnectorClient } from 'wagmi'

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new BrowserProvider(transport, network)
  const signer = new JsonRpcSigner(provider, account.address)
  return signer
}

/** Hook to convert a Viem Client to an ethers.js Signer. */
export const useEthersSigner = (_client:any)=> {
 // const { data: client } = useConnectorClient<Config>({ chainId })
   return clientToSigner(_client)
 //return useMemo(() => (client ? clientToSigner(client) : undefined), [client])
}