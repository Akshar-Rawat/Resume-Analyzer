import { useState } from "react";
import React from "react";
import Navbar from "./Navbar";
import FileUploader from "./FileUploader";
import { usePuterStore } from "../store/puter";
import { useNavigate } from "react-router-dom";
import { convertPdfToImage } from "../utils/pdfToImage";
import { generateUUID } from "../utils/FormatSize";
import { prepareInstructions } from "../constants";

const Upload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState(null);
 const {auth,isLoading,fs,ai,kv}=usePuterStore()
const navigate= useNavigate()

  const handleAnalyze=async ({companyName,jobTitle,jobDescription,file}) => {
    
   setIsProcessing(true)
   setStatusText('Uploading the file.... ')

   const uploadFile=await fs.upload(file,`/resume/${file.name}`)
  if (!uploadFile) {
    return setStatusText('ERROR Failed to upload file')
  }

  setStatusText('Converting to image....')
  
  
  const imageFile=await convertPdfToImage(file)
  if (!imageFile.file) return setStatusText('ERROR Failed to convert PDF to image')
   
    setStatusText('Uploading the image...')

    const uploadedImage=await fs.upload(imageFile.file,`/images/${imageFile.file.name}`)


   if (!imageFile.file) return setStatusText('ERROR Failed to upload image')
   
    setStatusText(' Preparing data...')
  
    const uuid=generateUUID()

    const data={
      id:uuid,
      resumePath:uploadFile.path,
      imagePath:uploadedImage.path,
      companyName,jobDescription,jobTitle,
      feedback:''
    }
    await kv.set(`resume:${uuid}`,JSON.stringify(data))

    setStatusText('Analyzing....')

    const feedback=await ai.feedback(
      uploadFile.path,
      prepareInstructions({jobDescription,jobTitle})
    )
    if(!feedback) return setStatusText('ERROR Failed to analuze resume')

      const feedbackText=typeof feedback.message.content=== 'string'?
      feedback.message.content:
      feedback.message.content[0].text


      data.feedback=JSON.parse(feedbackText)
      await kv.set(`resume:${uuid}`,JSON.stringify(data))
      setStatusText('Analysis complete ,redirecting....')
      console.log(data);
      navigate(`/resume/${uuid}`)
      
    

  }
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("company-name");
    const jobTitle = formData.get("job-title");
    const jobDescription = formData.get("job-description");
    // console.log({
    //   companyName,jobDescription,jobTitle,file
    // });
    
      if (!companyName || !jobTitle || !jobDescription) {
      alert('Please fill in all fields');
      return;
    }
    
    if (!file) return; 
handleAnalyze({companyName,jobDescription,jobTitle,file})

  };

  const handleFileSelect = (file) => {
    setFile(file);
  };

  


  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img
                src="../../public/images/resume-scan.gif"
                className="w-full"
              />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input type="text" name="job-title" placeholder="Job Title" />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button " type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;
