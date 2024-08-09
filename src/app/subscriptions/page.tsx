'use client'
import Header from '@/components/dashboard/header'
import { getPortals,getSubscriptions,getTokens } from '@/goldsky/goldsky'
import { useState ,useEffect} from 'react'
import { formatUnits } from 'viem'

import {
  useAccount,
  useLogout,
  useSendUserOperation,
  useSmartAccountClient,
  useUser,
} from "@alchemy/aa-alchemy/react";
import {
  chain,
  accountType,
  gasManagerConfig,
  accountClientOptions as opts,
} from "@/config";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
const statuses = { Completed: 'text-green-400 bg-green-400/10', Error: 'text-rose-400 bg-rose-400/10' }

export default function Subscriptions() {
  const [Subscriptions,setSubscriptions] = useState([])
  const [portals,setPortals] = useState([])
  
  const [portalId,setPortalId] = useState()
  const [tokens,setTokens] = useState(new Map())
  const [gotTokens,setGotTokens] = useState(false)

  const [refreshData,setRefreshData] = useState(new Date().getTime())
  const { address } = useAccount({ type: accountType });

  useEffect(()=>{
    async function _getTokens(){
      const results = await getTokens()
      console.log(results)
      setTokens(results.data.approvedTokens)
      
      let _tokens = new Map()
      for(const index in results.data.approvedTokens)
      {
         
        _tokens.set(results.data.approvedTokens[index].contractAddress ,results.data.approvedTokens[index].decimals)   
      }
      
      setGotTokens(true)
      setTokens(_tokens)

    }
     
        _getTokens()
    },[])  

    useEffect(()=>{
      async function getPortal(){
         const results = await getPortals(address) 
         console.log(results)
            setPortals(results.data.newPortals)
      
      }
      if(address && gotTokens)
           getPortal()
     
    },[address,gotTokens])


    
    useEffect(()=>{
      async function _Subscriptions(){
         const results = await getSubscriptions(portalId) 
         console.log(results)
            setSubscriptions(results.data.portalSubscriptions)
      }
  
      if(portalId)
           _Subscriptions()
     
    },[portalId])

    const _getSubscriptions = async (event:any)=>{
      setPortalId(event.target.value)     
    }
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
      <div className="min-h-full">
       <Header option={"Subscriptions"}/>
        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold leading-6 text-gray-900">Subsciptions</h1>
            <div className="w-full mt-2">
              <div className="flex items-center ">
              <select onChange={_getSubscriptions} 
              id="portals"
            className="w-[50%] rounded-md border border-stroke bg-[#353444] py-3 px-6 text-base font-medium text-body-color outline-none transition-all focus:bg-[#454457] focus:shadow-input"
            >
            <option>Select Portal</option>
  {portals.map((portal) => (
    <option key={portal.portalId} value={portal.portalId}>
      {portal.name}
    </option>
  ))}
</select>
                
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">    <div className="bg-gray-900 py-10">
      <h2 className="px-4 text-base font-semibold leading-7 text-white sm:px-6 lg:px-8">Subscriptions</h2>
      <table className="mt-6 w-full whitespace-nowrap text-left">
        <colgroup>
          <col className="w-full sm:w-4/12" />
          <col className="lg:w-4/12" />
          <col className="lg:w-2/12" />
          <col className="lg:w-1/12" />
          <col className="lg:w-1/12" />
        </colgroup>
        <thead className="border-b border-white/10 text-sm leading-6 text-white">
          <tr>
            <th scope="col" className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8">
              Token
            </th>
            <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell">
              Amount
            </th>
            <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell">
              Subscriber
            </th>
           
            <th scope="col" className="hidden py-2 pl-0 pr-4  font-semibold sm:table-cell sm:pr-6 lg:pr-8">
              Subscribed at
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {Subscriptions.map((item) => (
            <tr key={item.commit}>
              <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                <div className="flex items-center gap-x-4">
                  <img alt="" src="/images/cryptoicon.png" className="h-8 w-8 rounded-full bg-gray-800" />
                  <div className="truncate text-sm font-medium leading-6 text-white">{item.symbol}</div>
                </div>
              </td>
              
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="font-mono text-sm leading-6 text-gray-400">{ parseFloat(formatUnits(BigInt(item.amount),tokens.get(item.token))).toFixed(5)
} </div>
                  
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="font-mono text-sm leading-6 text-gray-400">{ item.subscriber}
</div>
                  
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-8 text-sm leading-6 text-gray-400 md:table-cell lg:pr-20">
                { Date(parseInt(item.datepaid) * 1000).toLocaleString()
                }
              </td>
             
            </tr>
          ))}
        </tbody>
      </table>
    </div></div>
        </main>
      </div>
    </>
  )
}
