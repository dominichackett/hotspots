'use client'

import Header from '@/components/dashboard/header'
import AddToken from '@/components/AddToken/AddToken'
import { getTokens } from '@/goldsky/goldsky'
import { useState ,useEffect} from 'react'
import Notification from '@/components/Notification/Notification'
import { contractABI,contractAddress } from '../../../contracts'
import { encodeFunctionData ,isAddress} from "viem";

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


export default function Tokens() {
    const [openAddToken,setOpenAddToken] = useState(false)
    const [tokens,setTokens] = useState([])
    const [refreshData,setRefreshData] = useState(new Date().getTime())
    const { address } = useAccount({ type: accountType });
 // [!region sending-user-op]
  // use config values to initialize our smart account client
  const { client } = useSmartAccountClient({
    type: accountType,
    gasManagerConfig,
    opts,
  });

  // provide the useSendUserOperation with a client to send a UO
  // this hook provides us with a status, error, and a result
  const {
    sendUserOperation,
    sendUserOperationResult,
    isSendingUserOperation,
    error: isSendUserOperationError,
  } = useSendUserOperation({ client, waitForTxn: true ,
    onSuccess: ({ hash, request }) => {
      // [optional] Do something with the hash and request
      addSuccess(hash,request);
    },
    onError: (error) => {
      addError(error);
      // [optional] Do something with the error
    },});

  // NOTIFICATIONS functions
  const [notificationTitle, setNotificationTitle] = useState();
  const [notificationDescription, setNotificationDescription] = useState();
  const [dialogType, setDialogType] = useState(1);
  const [show, setShow] = useState(false);
  const close = async () => {
setShow(false);
};


const addError= (error:any)=>{
  setDialogType(2) //Error
  setNotificationTitle("Add Token");
  setNotificationDescription(error?.error?.data?.message ? error?.error?.data?.message: error.message )
  setShow(true)

}

const addSuccess = (hash:any,request:any)=>{
  setDialogType(1) //Success
  setNotificationTitle("Add Token");
  setNotificationDescription("Token added successfully." )
  setShow(true)
  console.log(hash)
  console.log(request)
  setRefreshData(new Date().getTime())

}

  const addToken = async(name:string,symbol:string,tokenAddress:string,pricefeedid:string,decimals:number)=>{

    setOpenAddToken(false)
    if(!name || name=="")
     {
      setDialogType(2) //Error
      setNotificationTitle("Add");
      setNotificationDescription("Please enter token name.")
      setShow(true)
      return
  
     }

     
    if(!symbol || symbol=="")
      {
       setDialogType(2) //Error
       setNotificationTitle("Add Token");
       setNotificationDescription("Please enter token symbol.")
       setShow(true)
       return
   
      }

     if(!decimals || decimals <0)
     {
      setDialogType(2) //Error
      setNotificationTitle("Add Token");
      setNotificationDescription("Please enter zero or greater for the decimals.")
      setShow(true)
      return
  
     } 


     if(!pricefeedid || pricefeedid==undefined)
      {
       setDialogType(2) //Error
       setNotificationTitle("Add Token");
       setNotificationDescription("Please enter a price feed id")
       setShow(true)
       return
   
      } 

      if(!tokenAddress || !isAddress(tokenAddress))
        {
         setDialogType(2) //Error
         setNotificationTitle("Add Token");
         setNotificationDescription("Please enter token contract address.")
         setShow(true)
         return
     
        }
    try{
    const callData = encodeFunctionData({
      abi: contractABI,
      functionName: "approveToken",
      args: [tokenAddress,pricefeedid,name,symbol,decimals],
    });


    sendUserOperation({
      uo: {
        target: contractAddress,
        data: callData,
      },
    });

  }catch(error)
  {
     setDialogType(2) //Error
     setNotificationTitle("Add Token");
     setNotificationDescription(error?.error?.data?.message ? error?.error?.data?.message: error.message )
     setShow(true)
   return
  }
    
   } 

  
  
     const closeAddToken = ()=>{
      setOpenAddToken(false)
     }


     useEffect(()=>{
      async function _getTokens(){
        const results = await getTokens(address)
        console.log(results)
        setTokens(results.data.approvedTokens
        )
      }
       if(address!=undefined)
          _getTokens()
     },[address,refreshData])
  
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
       <Header option={"Tokens"}/>
        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold leading-6 text-gray-900">Approved Payment Tokens</h1>
            <button onClick={()=>setOpenAddToken(true)} type="button" className="mt-4 bg-[#363FF9] text-[#FBFDFF] rounded-lg p-3  transition duration-500 ease-in-out hover:scale-105" >Add Token</button>
            <AddToken open={openAddToken} setOpen={closeAddToken} addToken={addToken}/>
            <Notification
        type={dialogType}
        show={show}
        close={close}
        title={notificationTitle}
        description={notificationDescription}
      />

          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">    <div className="bg-gray-900 py-10">
      <h2 className="px-4 text-base font-semibold leading-7 text-white sm:px-6 lg:px-8">Approved Payment Tokens</h2>
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
              Name
            </th>
            <th scope="col" className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20">
              Decimals
            </th>
            <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20">
              Address
            </th>
            
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {tokens.map((item) => (
            <tr key={item.contractAddress}>
              <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                <div className="flex items-center gap-x-4">
                  <img alt="" src="/images/cryptoicon.png" className="h-8 w-8 rounded-full bg-gray-800" />
                  <div className="truncate text-sm font-medium leading-6 text-white">{item.symbol}</div>
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="font-mono text-sm leading-6 text-gray-400">{item.name}</div>
                  
                </div>
              </td>
             
              <td className="hidden py-4 pl-0 pr-8 text-sm leading-6 text-gray-400 md:table-cell lg:pr-20">
                {item.decimals}
              </td>
              <td className="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                {item.contractAddress}
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
