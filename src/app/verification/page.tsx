'use client'

import Header from '@/components/dashboard/header'
import { useState ,useEffect} from 'react'
import Notification from '@/components/Notification/Notification'
import { encodeFunctionData } from "viem";
import { useEthersSigner } from '@/signer/signer'

import { getAllPortals,getEasVerifications } from '@/goldsky/goldsky'
import { contractABI,contractAddress } from '../../../contracts'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import  { EAS, SchemaEncoder }  from "@ethereum-attestation-service/eas-sdk";
import {
  useAccount,
  useLogout,
  useSendUserOperation,
  useSmartAccountClient,
  useUser
} from "@alchemy/aa-alchemy/react";
import {
  chain,
  accountType,
  gasManagerConfig,
  accountClientOptions as opts,
} from "@/config";
import { Button } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
const statuses = { 1: 'text-green-400 bg-green-400/10', 2: 'text-rose-400 bg-rose-400/10' }


export default function Tokens() {

  const [verifications,setVerifications] = useState(new Map())
  const[gotVerifications,setGotVerifications] = useState(false)
  const user = useUser();
  const { address } = useAccount({ type: accountType });
  const [refreshData,setRefreshData] = useState(new Date().getTime())
  const [portals,setPortals] = useState([])
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
      console.log(request)
      createSuccess(hash,request);
    },
    onError: (error) => {
      createError(error);
      // [optional] Do something with the error
    },});

    const createError= (error:any)=>{
      let actionTitle = "Portal Verification"
      
  
    setDialogType(2) //Error
    setNotificationTitle(actionTitle);
    setNotificationDescription(error?.error?.data?.message ? error?.error?.data?.message: error.message )
    setShow(true)
  
  }
  
  const createSuccess = (hash:any,request:any)=>{
    
    let actionTitle ="Portal Verification"
    let description = "Portal successfully verified"   
    setDialogType(1) //Success
    setNotificationTitle(actionTitle);
    setNotificationDescription(description)
    setShow(true)
    console.log(hash)
    console.log(request)
    setGotVerifications(false)
    setRefreshData(new Date().getTime())
  
  }
    
  // NOTIFICATIONS functions
  const [notificationTitle, setNotificationTitle] = useState();
  const [notificationDescription, setNotificationDescription] = useState();
  const [dialogType, setDialogType] = useState(1);
  const [show, setShow] = useState(false);
  const close = async () => {
setShow(false);
};

useEffect(()=>{
  async function _getPortals(){
    const results = await getAllPortals()
    console.log(results)
    setPortals(results.data.newPortals)
  }
   if(address!=undefined && gotVerifications) 
      _getPortals()
 },[address,gotVerifications,refreshData])


 useEffect(()=>{
  async function _getVerifications(){
    const results = await getEasVerifications()
    console.log(results)
    
    let _verifications = new Map()
    for(const index in results.data.portalVerifieds)
    {
       
      _verifications.set(results.data.portalVerifieds[index].portalId ,results.data.portalVerifieds[index].uid)   
    }
    
    setGotVerifications(true)
    setVerifications(_verifications)

  }
   
      _getVerifications()
  },[refreshData])  

  const getStatus = (id:any)=>{
      const item = verifications.get(id)
      if(item)
        return true
      else
        return false
  }

  const verifyPortal = async(item:any)=>{
    const easContractAddress = "0x4200000000000000000000000000000000000021";
    const schemaUID = "0x83eddcecd3e1b1d71ce3423726fa2ac2ddba16eea10d6543c874840c27624518";
    const eas = new EAS(easContractAddress);

    setNotificationDescription("Verifying Portal.")
    setDialogType(3) //Information
    setNotificationTitle("Portal Verification");
    setShow(true)
    
try{
// Signer must be an ethers-like signer.
const signer =useEthersSigner(client)
await eas.connect(signer);
//console.log(signer?.toViemAccount())
console.log(client)
// Initialize SchemaEncoder with the schema string
const schemaEncoder = new SchemaEncoder("uint256 portalId,string name,address verifier");
const encodedData = schemaEncoder.encodeData([
	{ name: "portalId", value: item.portalId, type: "uint256" },
	{ name: "name", value: item.name, type: "string" },
	{ name: "verifier", value: address, type: "address" }
]);
const tx = await eas.attest({
	schema: schemaUID,
	data: {
		recipient: "0x0000000000000000000000000000000000000000",
		expirationTime: 0,
		revocable: true, // Be aware that if your schema is not revocable, this MUST be false
		data: encodedData,
	},
});
console.log(tx)
const newAttestationUID = await tx.wait();
console.log("New attestation UID:", newAttestationUID);

    const callData = encodeFunctionData({
      abi: contractABI,
      functionName: "verifyPortal",
      args: [item.portalId,newAttestationUID],
    });


    sendUserOperation({
      uo: {
        target: contractAddress,
        data: callData,
      },
    });


}catch(error)
{
  let actionTitle = "Portal Verification"
      
  
  setDialogType(2) //Error
  setNotificationTitle(actionTitle);
  setNotificationDescription(error?.error?.data?.message ? error?.error?.data?.message: error.message )
  setShow(true)
}
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
     <Header option={"Verification"}/>
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold leading-6 text-gray-900">Portal Verification</h1>

        </div>
      </header>
       <Notification
      type={dialogType}
      show={show}
      close={close}
      title={notificationTitle}
      description={notificationDescription}
    />

      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="bg-gray-900 py-10">
    <h2 className="px-4 text-base font-semibold leading-7 text-white sm:px-6 lg:px-8">Portal Verification</h2>
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
            Portal
          </th>
          <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell">
            Id
          </th>
          <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell">
            Fee
          </th>
          <th scope="col" className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20">
            Status
          </th>
          <th scope="col" className="text-center py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20">
            World ID Required
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {portals.map((item) => (
          <tr key={item.id}>
            <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
              <div className="flex items-center gap-x-4">
                <img alt="" src={item.logo} className="h-16 w-16 rounded-full bg-gray-800" />
                <div className="truncate text-sm font-medium leading-6 text-white">{item.name}</div>
              </div>
            </td>
            <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
              <div className="flex gap-x-3">
                <div className="rounded-md bg-gray-700/40 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-white/10">
                  {item.portalId}
                </div>
              </div>
            </td>
            <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
              <div className="flex gap-x-3">
                <div className="rounded-md bg-gray-700/40 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-white/10">
                  ${item.fee} usd
                </div>
              </div>
            </td>
            <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
              <div className="flex items-center justify-end gap-x-2 sm:justify-start">
              
                
              {getStatus(item.portalId) ? <div className='flex flex-row space-x-2 items-center justify-center'><span>EAS Verified</span> <span className="text-2xl text-green-500"> <CheckBadgeIcon  className="h-8 w-8 text-blue"/></span>
                 </div> :(<button type="button" onClick={()=>verifyPortal(item)} className="mt-4 bg-[#363FF9] text-[#FBFDFF] rounded-lg p-3  transition duration-500 ease-in-out hover:scale-105">Verify Portal</button>)}

              </div>
            </td>
            <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
              <div className="flex justify-center gap-x-3">
                <div className="rounded-md bg-gray-700/40 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-white/10">
                  {item.wcRequired ? "Yes":"No"}
                </div>
              </div>
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
        </div>
      </main>
    </div>
  </>
)
}
