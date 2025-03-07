import './App.css';
import { useState } from 'react';
import PdfUpload from './fileupload';

function App() {

  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [var1,setVar1] = useState(0) ;
  const [var2,setVar2] = useState(0) ;
  const [var3,setVar3] = useState(0) ;
  const [query,setQuery] = useState("") ;
  const [results,setResults] = useState([]);
  const [resultscame,setResultscame] = useState(0) ;
  const handleUpload = async (e) => {
    e.preventDefault() ;

    if (!selectedFiles.length) {
        alert("No files selected!");
        return;
    }

    const formData = new FormData() ;

    for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("pdfs", selectedFiles[i]); // Match "pdfs" from server.js
    }

    try {
        const response = await fetch("http://localhost:5000/upload_pdfs", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            alert("Files uploaded successfully!");
            console.log("Uploaded files:", data.files);
        } else {
            alert("Upload failed: " + data.message);
        }
        setVar1(0) ;
        setVar2(0) ;
        setVar3(0) ;
    } catch (error) {
        console.error("Error uploading files:", error);
        alert("Error uploading files.");
    }
  };

  const extractData = async (e)=>{
    try {
      setVar1(5) ;
      e.preventDefault() ;
      const response = await fetch("http://localhost:5000/run_extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: "" })
      });
      
      const result = await response.json();
      console.log("Python Output:", result);
      setVar1(1) ;
    } 
    catch (error) {
        setVar1(0) ;
        console.error("Error:", error);
    }
  }

  const cleanData = async (e)=>{
      try {
        setVar2(5) ;
        e.preventDefault() ;
        const response = await fetch("http://localhost:5000/run_clean", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: "" })
        });
        
        const result = await response.json();
        console.log("Python Output:", result);
        setVar2(1) ;
      } 
      catch (error) {
          setVar2(0) ;
          console.error("Error:", error);
      }
  }
  

  const embedData = async (e) =>{
    try {
      setVar3(5) ;
      e.preventDefault() ;
      const response = await fetch("http://localhost:5000/run_embedding", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: "" })
      });

      const result = await response.json();
      console.log("Python Output:", result);
      setVar3(1) ;
    } 
    catch (error) {
        setVar3(0) ;
        console.error("Error:", error);
    }
    
  }

  const handleQuery = async (e)=> {
    e.preventDefault() ;
    console.log(query) ;
    try{

      const response = await fetch("http://localhost:5000/query",{
        method : "POST",
        headers :{
          "Content-Type": "application/json",
        },
        body :JSON.stringify({query})
      }); 
      const result = response.json() ;
      console.log("query result is " ,result)
    }
    catch(error){
        console.error("Error > ",error);
    }
  }

  const handleresult = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/show_result", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      const result = await response.json();
      setResults(result["output"])
      setResultscame(1) ;
      // console.log(result) ;
      // console.log("The result obtained is:", result);
    } catch (e) {
      setResultscame(0) ;
      console.error("Error:", e);
    }
  }
  
  const removecache = async ()=>{
    try{
      const response = await fetch("http://localhost:5000/delete_cache",{
        method : "POST" ,
        headers :{
          "Content-Type": "application/json"
        }
        ,
        body : JSON.stringify({"paths":["outputs","uploads"]})

      });
      const result =  response.json() ;
      console.log(result) ;

    }
    catch(error){
      console.error("Error > ",error) ;
    }
  }

  return (
    <div className="App">

        <div>
          <button onClick={removecache}>
            Remove Cached files
          </button>
        </div>
        <PdfUpload selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} handleUpload={handleUpload}/>

            {selectedFiles.length > 0 && (
            <>
              <button onClick={extractData}>
                Extract
              </button>

              <button onClick={cleanData}>
                Clean the Data
              </button>

              <button onClick={embedData}>
                Embed
              </button>
              {
                (var1===5) &&(
                  <p>Extracting.....</p>
                )
              }
              {
                (var2===5)&&(
                  <p>Cleaning . . . . . </p>
                )
              }

              {
                (var3===5) && (
                  <p>Embedding ...</p>
                )
              }
              {
                (var1===1) && 
                 <p> Extracted </p>
              }
              {
                (var2===1) && 
                 <p> cleaned </p>
              }
              {
                (var3===1) &&
                <p> Embedded</p>
              }
              {
                var1 && var2 && (var3===1) && (
                  
                  <form onSubmit={handleQuery}>
                    <label> Query  : </label>
                      <textarea required
                      value = {query}
                      onChange={(e)=>{setQuery(e.target.value)}}
                      />
                    
                    <button> Submit Query</button>
                  </form>
                )
              }
              {
                <button onClick={handleresult}>show results</button>
              }
                <div >
                  <span style={{color:"yellow"}}></span>
                  {query}
                </div>
                
                {
                  (resultscame===1) && 
                
                    <p>
                      {results}
                    </p>
                }
            </>
            )}

    </div>
  );
}

export default App;
