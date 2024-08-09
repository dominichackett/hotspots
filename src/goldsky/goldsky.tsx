export const getPortals = async(owner:string)=>
    {  
         
     

         const response = await fetch("/api/getportals", {
            method: "POST",
            body: JSON.stringify({
              owner:owner.toLowerCase()
            }),
            headers: {
              "Content-Type": "application/json"
            }
          });
    
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
    
          const responseData = await response.json();
         
        
         
     
    
     
      
     
         return responseData
       
    }
    export const getAllPortals = async()=>
      {  
           
       
  
           const response = await fetch("/api/getallportals", {
              method: "POST",
              
              headers: {
                "Content-Type": "application/json"
              }
            });
      
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
      
            const responseData = await response.json();
           
          
           
       
      
       
        
       
           return responseData
         
      } 
    
export const getPortalById = async(portalId:string)=>
      {  
           
       
  
           const response = await fetch("/api/getportalbyid", {
              method: "POST",
              body: JSON.stringify({
                portalId:portalId
              }),
              headers: {
                "Content-Type": "application/json"
              }
            });
      
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
      
            const responseData = await response.json();
           
          
           
       
      
       
        
       
           return responseData
         
      }


export const getSubscriptions = async(portalId:string)=>
        {  
             
         
    
             const response = await fetch("/api/getsubscriptions", {
                method: "POST",
                body: JSON.stringify({
                  portalId:portalId
                  
                }),
                headers: {
                  "Content-Type": "application/json"
                }
              });
        
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
        
              const responseData = await response.json();
             
            
             
         
        
         
          
         
             return responseData
           
        }


 export const getTokens = async()=>
          {  
               
           
      
               const response = await fetch("/api/gettokens", {
                  method: "POST",
                  
                  headers: {
                    "Content-Type": "application/json"
                  }
                });
          
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
          
                const responseData = await response.json();
               
              
               
           
          
           
            
           
               return responseData
             
          }
        
          export const getDonations= async(portalId:string)=>
            {  
                 
             
        
                 const response = await fetch("/api/getdonations", {
                    method: "POST",
                    body: JSON.stringify({
                      portalId:portalId
                    }),
                    headers: {
                      "Content-Type": "application/json"
                    }
                  });
            
                  if (!response.ok) {
                    throw new Error('Network response was not ok');
                  }
            
                  const responseData = await response.json();
                 
                
                 
             
            
             
              
             
                 return responseData
               
            }


 export const getEasVerified = async(portalId:string)=>
              {  
                   
               
          
                   const response = await fetch("/api/geteasverified", {
                      method: "POST",
                      body: JSON.stringify({
                        portalId:portalId
                        
                      }),
                      headers: {
                        "Content-Type": "application/json"
                      }
                    });
              
                    if (!response.ok) {
                      throw new Error('Network response was not ok');
                    }
              
                    const responseData = await response.json();
                   
                  
                   
               
              
               
                
               
                   return responseData
                 
              }
              

              export const getEasVerifications= async()=>
                {  
                     
                 
            
                     const response = await fetch("/api/geteasverifications", {
                        method: "POST",
                        
                        headers: {
                          "Content-Type": "application/json"
                        }
                      });
                
                      if (!response.ok) {
                        throw new Error('Network response was not ok');
                      }
                
                      const responseData = await response.json();
                     
                    
                     
                 
                
                 
                  
                 
                     return responseData
                   
                }
                            