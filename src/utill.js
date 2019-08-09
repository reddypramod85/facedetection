const dataURItoBuffer = async dataURL => {
  console.log("Entered dataURItoBuffer");
  const buff = await new Buffer(
    dataURL.replace(/^data:image\/(png|gif|jpeg);base64,/, ""),
    "base64"
  );
  console.log("buff", buff);
  return buff;
};

/*   const getPersonList = async (uri_getPersons,personGroupName,subscriptionKey) => {

    await fetch(uri_getPersons, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": subscriptionKey
      }
    });
    } 
    
    export { dataURItoBuffer, getPersonList }; */

export { dataURItoBuffer };
