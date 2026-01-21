import React, {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const {auth, isLoading, fs, ai, kv} = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        // console.log({companyName, jobTitle, jobDescription, file});
        if(!file) return;
        handleAnalyse({ companyName, jobTitle, jobDescription, file })
    }

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyse = async ({companyName, jobTitle, jobDescription, file} : {
        companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
        setIsProcessing(true);
        setStatusText('Uploading the file...');
        const uploadFile = await fs.upload([file]);

        if (!uploadFile) return setStatusText('Failed to upload file');
        setStatusText("Converting to image ...");

        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file) return setStatusText('Failed to convert pdf to image');
        setStatusText('Uploading the image...');

        const uploadedImage = await fs.upload([imageFile.file]);
        if (!uploadedImage) return setStatusText('Failed to upload image');

        setStatusText("Preparing data...");

        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedback: '',
        }
        await kv.set(`resume: ${uuid}`, JSON.stringify(data));

        setStatusText("Analyzing .... ")

        const feedback = await ai.feedback(
            uploadFile.path,
            prepareInstructions({jobTitle, jobDescription})
        )
        if (!feedback) return setStatusText('Failed to analyzing data...');

        const feedbackText = typeof feedback.message.content === 'string' ?
            feedback.message.content : feedback.message.content[0].text;
        data.feedback = JSON.parse(feedbackText);

        await kv.set(`resume: ${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, redirecting... ');
        console.log(data);
        navigate(`/resume/${uuid}`)
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className="main-section">
                <div className="page-header">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                       <>
                           <h2>{statusText}</h2>
                           <img src='/images/resume-scan.gif' className="w-full" alt="Resume" />
                       </>
                    ) :
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    }
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                             <div className="form-div">
                                 <label htmlFor="company-name">Company Name</label>
                                 <input type="text" placeholder="Company Name" name="company-name" id="company-name" />
                             </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" placeholder="Job Title" name="job-title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} placeholder="Job Description" name="job-description" id="job-description" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>
                            <button type="submit" className="primary-button">Analyze Resume</button>
                        </form>
                    )}
                </div>

            </section>
        </main>
    )
}
export default Upload
